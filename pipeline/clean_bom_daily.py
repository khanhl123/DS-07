from __future__ import annotations

import argparse
import csv
import re
import sys
from collections import defaultdict
from contextlib import ExitStack
from dataclasses import dataclass
from datetime import date
from pathlib import Path


STANDARDIZED_HEADER = [
    "metric_code",
    "product_code",
    "station_number",
    "display_station_name",
    "raw_station_name",
    "date",
    "value",
    "unit",
    "quality_flag",
    "is_provisional",
    "period_days",
    "is_daily_strict",
    "source_data_file",
]

STATIONS_MASTER_HEADER = [
    "station_number",
    "display_station_name",
    "state",
    "latitude",
    "longitude",
    "elevation_m",
    "year_opened",
    "year_closed",
]

STATION_ALIASES_HEADER = [
    "station_number",
    "metric_code",
    "alias_source",
    "alias_value",
]

METADATA_CONFLICTS_HEADER = [
    "station_number",
    "field_name",
    "selected_metric_code",
    "selected_value",
    "conflicting_metric_code",
    "conflicting_value",
    "selected_source_note_file",
    "conflicting_source_note_file",
]

COVERAGE_SUMMARY_HEADER = [
    "metric_code",
    "station_number",
    "display_station_name",
    "total_rows",
    "observed_rows",
    "strict_rows",
    "first_date",
    "last_date",
    "y_count",
    "n_count",
    "blank_value_rows",
    "non_one_period_rows",
]

DATA_ISSUES_HEADER = [
    "issue_type",
    "metric_code",
    "station_number",
    "raw_station_name",
    "source_path",
    "line_number",
    "date",
    "field_name",
    "offending_value",
    "detail",
]

NOTE_FIELDS = {
    "station_number": "Bureau of Meteorology station number",
    "station_name": "Station name",
    "year_opened": "Year site opened",
    "year_closed": "Year site closed",
    "latitude": "Latitude (decimal degrees, south negative)",
    "longitude": "Longitude (decimal degrees, east positive)",
    "elevation_m": "Height of station above mean sea level (metres)",
    "state": "State",
}

METADATA_PRECEDENCE = {
    "rainfall": 0,
    "max_temp": 1,
    "min_temp": 2,
    "uv": 3,
}

PLAUSIBLE_RANGES = {
    "rainfall": (0.0, 608.0),
    "uv": (0.1, 36.6),
    "max_temp": (-5.0, 47.9),
    "min_temp": (-12.5, 31.2),
}

FATAL_ISSUE_TYPES = {
    "schema_mismatch",
    "duplicate_key_violation",
    "bad_date",
    "unparseable_numeric",
    "invalid_period_days",
    "unexpected_quality_flag",
}


@dataclass(frozen=True)
class MetricConfig:
    metric_code: str
    root_name: str
    product_code: str
    unit: str
    expected_header: tuple[str, ...]
    value_field: str
    period_field: str | None
    quality_field: str | None


METRICS = (
    MetricConfig(
        metric_code="rainfall",
        root_name="data rainfall",
        product_code="IDCJAC0009",
        unit="mm",
        expected_header=(
            "Product code",
            "Bureau of Meteorology station number",
            "Year",
            "Month",
            "Day",
            "Rainfall amount (millimetres)",
            "Period over which rainfall was measured (days)",
            "Quality",
        ),
        value_field="Rainfall amount (millimetres)",
        period_field="Period over which rainfall was measured (days)",
        quality_field="Quality",
    ),
    MetricConfig(
        metric_code="max_temp",
        root_name="data max temp",
        product_code="IDCJAC0010",
        unit="degC",
        expected_header=(
            "Product code",
            "Bureau of Meteorology station number",
            "Year",
            "Month",
            "Day",
            "Maximum temperature (Degree C)",
            "Days of accumulation of maximum temperature",
            "Quality",
        ),
        value_field="Maximum temperature (Degree C)",
        period_field="Days of accumulation of maximum temperature",
        quality_field="Quality",
    ),
    MetricConfig(
        metric_code="min_temp",
        root_name="data min temp",
        product_code="IDCJAC0011",
        unit="degC",
        expected_header=(
            "Product code",
            "Bureau of Meteorology station number",
            "Year",
            "Month",
            "Day",
            "Minimum temperature (Degree C)",
            "Days of accumulation of minimum temperature",
            "Quality",
        ),
        value_field="Minimum temperature (Degree C)",
        period_field="Days of accumulation of minimum temperature",
        quality_field="Quality",
    ),
    MetricConfig(
        metric_code="uv",
        root_name="data UV",
        product_code="IDCJAC0016",
        unit="MJ_m2",
        expected_header=(
            "Product code",
            "Bureau of Meteorology station number",
            "Year",
            "Month",
            "Day",
            "Daily global solar exposure (MJ/m*m)",
        ),
        value_field="Daily global solar exposure (MJ/m*m)",
        period_field=None,
        quality_field=None,
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Clean BOM daily weather files into derived CSV outputs."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="Repository root containing raw data directories.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output directory for cleaned artifacts. Defaults to <root>/cleaned.",
    )
    return parser.parse_args()


def relative_posix(path: Path, root: Path) -> str:
    return path.resolve().relative_to(root.resolve()).as_posix()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig", errors="replace")


def parse_note_field(text: str, label: str) -> str:
    pattern = rf"^{re.escape(label)}:\s*(.*)$"
    match = re.search(pattern, text, flags=re.MULTILINE)
    return match.group(1).strip() if match else ""


def normalize_station_number(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if not digits:
        return value.strip()
    return digits.zfill(6)[-6:]


def normalize_station_name(value: str) -> str:
    collapsed = re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
    return re.sub(r"\s+", " ", collapsed)


def normalize_compare_value(field_name: str, value: str) -> str:
    stripped = value.strip()
    if field_name in {"display_station_name", "station_name"}:
        return normalize_station_name(stripped)
    if field_name == "state":
        return stripped.upper()
    if field_name in {"latitude", "longitude", "elevation_m"}:
        try:
            return format(float(stripped), ".10g")
        except ValueError:
            return stripped
    if field_name in {"year_opened", "year_closed"}:
        try:
            return str(int(stripped))
        except ValueError:
            return stripped
    return stripped


def truthy_string(value: bool) -> str:
    return "true" if value else "false"


def parse_float_string(value: str) -> tuple[str, float | None]:
    stripped = value.strip()
    if not stripped:
        return "", None
    return stripped, float(stripped)


def parse_int_string(value: str) -> tuple[str, int | None]:
    stripped = value.strip()
    if not stripped:
        return "", None
    return str(int(stripped)), int(stripped)


def add_issue(
    issues: list[dict[str, str]],
    *,
    issue_type: str,
    metric_code: str = "",
    station_number: str = "",
    raw_station_name: str = "",
    source_path: str = "",
    line_number: str = "",
    date_value: str = "",
    field_name: str = "",
    offending_value: str = "",
    detail: str = "",
) -> None:
    issues.append(
        {
            "issue_type": issue_type,
            "metric_code": metric_code,
            "station_number": station_number,
            "raw_station_name": raw_station_name,
            "source_path": source_path,
            "line_number": line_number,
            "date": date_value,
            "field_name": field_name,
            "offending_value": offending_value,
            "detail": detail,
        }
    )


def extract_note_records(root: Path) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for config in METRICS:
        metric_root = root / config.root_name
        for note_path in sorted(metric_root.rglob("*_Note.txt")):
            text = read_text(note_path)
            records.append(
                {
                    "metric_code": config.metric_code,
                    "station_number": normalize_station_number(
                        parse_note_field(text, NOTE_FIELDS["station_number"])
                    ),
                    "station_name": parse_note_field(text, NOTE_FIELDS["station_name"]),
                    "folder_name": note_path.parent.name,
                    "state": parse_note_field(text, NOTE_FIELDS["state"]),
                    "latitude": parse_note_field(text, NOTE_FIELDS["latitude"]),
                    "longitude": parse_note_field(text, NOTE_FIELDS["longitude"]),
                    "elevation_m": parse_note_field(text, NOTE_FIELDS["elevation_m"]),
                    "year_opened": parse_note_field(text, NOTE_FIELDS["year_opened"]),
                    "year_closed": parse_note_field(text, NOTE_FIELDS["year_closed"]),
                    "source_note_file": relative_posix(note_path, root),
                }
            )
    return records


def choose_station_metadata(
    note_records: list[dict[str, str]],
) -> tuple[list[dict[str, str]], list[dict[str, str]], list[dict[str, str]], dict[str, dict[str, str]]]:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for record in note_records:
        grouped[record["station_number"]].append(record)

    stations_master: list[dict[str, str]] = []
    station_aliases: list[dict[str, str]] = []
    metadata_conflicts: list[dict[str, str]] = []
    selected_by_station: dict[str, dict[str, str]] = {}
    alias_rows_seen: set[tuple[str, str, str, str]] = set()

    for station_number in sorted(grouped):
        records = sorted(
            grouped[station_number],
            key=lambda item: (
                METADATA_PRECEDENCE[item["metric_code"]],
                item["source_note_file"],
            ),
        )
        selected = records[0]
        selected_by_station[station_number] = selected
        display_station_name = selected["station_name"] or selected["folder_name"]

        stations_master.append(
            {
                "station_number": station_number,
                "display_station_name": display_station_name,
                "state": selected["state"],
                "latitude": selected["latitude"],
                "longitude": selected["longitude"],
                "elevation_m": selected["elevation_m"],
                "year_opened": selected["year_opened"],
                "year_closed": selected["year_closed"],
            }
        )

        for record in records:
            for alias_source, alias_value in (
                ("folder_name", record["folder_name"]),
                ("note_name", record["station_name"]),
            ):
                alias_value = alias_value.strip()
                if not alias_value:
                    continue
                alias_key = (
                    station_number,
                    record["metric_code"],
                    alias_source,
                    alias_value,
                )
                if alias_key in alias_rows_seen:
                    continue
                alias_rows_seen.add(alias_key)
                station_aliases.append(
                    {
                        "station_number": station_number,
                        "metric_code": record["metric_code"],
                        "alias_source": alias_source,
                        "alias_value": alias_value,
                    }
                )

        selected_values = {
            "station_name": display_station_name,
            "state": selected["state"],
            "latitude": selected["latitude"],
            "longitude": selected["longitude"],
            "elevation_m": selected["elevation_m"],
            "year_opened": selected["year_opened"],
            "year_closed": selected["year_closed"],
        }
        for field_name, selected_value in selected_values.items():
            selected_compare = normalize_compare_value(field_name, selected_value)
            for record in records[1:]:
                candidate_value = (
                    record["station_name"] if field_name == "station_name" else record[field_name]
                )
                if normalize_compare_value(field_name, candidate_value) == selected_compare:
                    continue
                metadata_conflicts.append(
                    {
                        "station_number": station_number,
                        "field_name": "display_station_name"
                        if field_name == "station_name"
                        else field_name,
                        "selected_metric_code": selected["metric_code"],
                        "selected_value": selected_value,
                        "conflicting_metric_code": record["metric_code"],
                        "conflicting_value": candidate_value,
                        "selected_source_note_file": selected["source_note_file"],
                        "conflicting_source_note_file": record["source_note_file"],
                    }
                )

    return stations_master, station_aliases, metadata_conflicts, selected_by_station


def build_station_name_issues(
    station_aliases: list[dict[str, str]],
    issues: list[dict[str, str]],
) -> None:
    aliases_by_station: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    raw_aliases_by_station: dict[str, set[str]] = defaultdict(set)

    for row in station_aliases:
        station_number = row["station_number"]
        alias_value = row["alias_value"]
        aliases_by_station[station_number][normalize_station_name(alias_value)].add(alias_value)
        raw_aliases_by_station[station_number].add(alias_value)

    for station_number, normalized_aliases in sorted(aliases_by_station.items()):
        if len(normalized_aliases) <= 1:
            continue
        aliases = sorted(raw_aliases_by_station[station_number])
        add_issue(
            issues,
            issue_type="station_name_mismatch",
            station_number=station_number,
            detail="Aliases disagree after normalization: " + " | ".join(aliases),
        )


def create_output_writers(output_dir: Path) -> tuple[ExitStack, dict[tuple[str, str], csv.DictWriter]]:
    stack = ExitStack()
    writers: dict[tuple[str, str], csv.DictWriter] = {}

    for relative_dir in ("full", "observed", "strict", "metadata", "reports"):
        (output_dir / relative_dir).mkdir(parents=True, exist_ok=True)

    for metric in (config.metric_code for config in METRICS):
        for layer, file_name in (
            ("full", f"{metric}_full.csv"),
            ("observed", f"{metric}_observed.csv"),
            ("strict", f"{metric}_strict_daily.csv"),
        ):
            handle = stack.enter_context(
                (output_dir / layer / file_name).open("w", encoding="utf-8", newline="")
            )
            writer = csv.DictWriter(handle, fieldnames=STANDARDIZED_HEADER)
            writer.writeheader()
            writers[(metric, layer)] = writer

    return stack, writers


def write_csv(path: Path, header: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)


def scan_data(
    root: Path,
    output_dir: Path,
    selected_by_station: dict[str, dict[str, str]],
    issues: list[dict[str, str]],
) -> dict[tuple[str, str], dict[str, str | int]]:
    coverage: dict[tuple[str, str], dict[str, str | int]] = {}
    seen_station_files: dict[str, set[str]] = defaultdict(set)

    stack, writers = create_output_writers(output_dir)
    with stack:
        for config in METRICS:
            metric_root = root / config.root_name
            for data_path in sorted(metric_root.rglob("*_Data.csv")):
                raw_station_name = data_path.parent.name
                source_data_file = relative_posix(data_path, root)
                filename_match = re.search(r"_(\d{6})_1800_Data\.csv$", data_path.name)
                filename_station_number = filename_match.group(1) if filename_match else ""

                if filename_station_number:
                    if filename_station_number in seen_station_files[config.metric_code]:
                        add_issue(
                            issues,
                            issue_type="duplicate_station_file",
                            metric_code=config.metric_code,
                            station_number=filename_station_number,
                            raw_station_name=raw_station_name,
                            source_path=source_data_file,
                            detail="Multiple data files share the same metric and station number.",
                        )
                    seen_station_files[config.metric_code].add(filename_station_number)

                with data_path.open("r", encoding="utf-8-sig", newline="") as handle:
                    reader = csv.DictReader(handle)
                    actual_header = tuple(reader.fieldnames or ())
                    if actual_header != config.expected_header:
                        add_issue(
                            issues,
                            issue_type="schema_mismatch",
                            metric_code=config.metric_code,
                            raw_station_name=raw_station_name,
                            source_path=source_data_file,
                            field_name="header",
                            offending_value=" | ".join(actual_header),
                            detail="Expected header: " + " | ".join(config.expected_header),
                        )
                        continue

                    local_seen_dates: set[str] = set()
                    for line_number, row in enumerate(reader, start=2):
                        product_code = row["Product code"].strip() or config.product_code
                        if product_code != config.product_code:
                            add_issue(
                                issues,
                                issue_type="product_code_mismatch",
                                metric_code=config.metric_code,
                                raw_station_name=raw_station_name,
                                source_path=source_data_file,
                                line_number=str(line_number),
                                field_name="Product code",
                                offending_value=product_code,
                                detail=f"Expected {config.product_code}.",
                            )

                        row_station_number = normalize_station_number(
                            row["Bureau of Meteorology station number"]
                        )
                        station_number = row_station_number or filename_station_number
                        if (
                            filename_station_number
                            and row_station_number
                            and row_station_number != filename_station_number
                        ):
                            add_issue(
                                issues,
                                issue_type="station_number_mismatch",
                                metric_code=config.metric_code,
                                station_number=row_station_number,
                                raw_station_name=raw_station_name,
                                source_path=source_data_file,
                                line_number=str(line_number),
                                field_name="Bureau of Meteorology station number",
                                offending_value=row_station_number,
                                detail=f"Filename station number is {filename_station_number}.",
                            )

                        selected_metadata = selected_by_station.get(station_number, {})
                        display_station_name = (
                            selected_metadata.get("station_name")
                            or selected_metadata.get("folder_name")
                            or raw_station_name
                        )

                        year_raw = row["Year"].strip()
                        month_raw = row["Month"].strip()
                        day_raw = row["Day"].strip()
                        date_string = ""
                        if year_raw and month_raw and day_raw:
                            try:
                                row_date = date(int(year_raw), int(month_raw), int(day_raw))
                                date_string = row_date.isoformat()
                            except ValueError:
                                add_issue(
                                    issues,
                                    issue_type="bad_date",
                                    metric_code=config.metric_code,
                                    station_number=station_number,
                                    raw_station_name=raw_station_name,
                                    source_path=source_data_file,
                                    line_number=str(line_number),
                                    field_name="date",
                                    offending_value=f"{year_raw}-{month_raw}-{day_raw}",
                                    detail="Unable to build a valid ISO date from Year/Month/Day.",
                                )

                        if date_string:
                            if date_string in local_seen_dates:
                                add_issue(
                                    issues,
                                    issue_type="duplicate_key_violation",
                                    metric_code=config.metric_code,
                                    station_number=station_number,
                                    raw_station_name=raw_station_name,
                                    source_path=source_data_file,
                                    line_number=str(line_number),
                                    date_value=date_string,
                                    detail="Duplicate station/date row within the same raw file.",
                                )
                                continue
                            local_seen_dates.add(date_string)

                        raw_value = row[config.value_field].strip()
                        value_string = ""
                        numeric_value: float | None = None
                        if raw_value:
                            try:
                                value_string, numeric_value = parse_float_string(raw_value)
                            except ValueError:
                                add_issue(
                                    issues,
                                    issue_type="unparseable_numeric",
                                    metric_code=config.metric_code,
                                    station_number=station_number,
                                    raw_station_name=raw_station_name,
                                    source_path=source_data_file,
                                    line_number=str(line_number),
                                    date_value=date_string,
                                    field_name="value",
                                    offending_value=raw_value,
                                    detail=f"Could not parse {config.value_field}.",
                                )

                        period_string = ""
                        if config.period_field:
                            raw_period = row[config.period_field].strip()
                            if raw_period:
                                try:
                                    period_string, _ = parse_int_string(raw_period)
                                except ValueError:
                                    add_issue(
                                        issues,
                                        issue_type="invalid_period_days",
                                        metric_code=config.metric_code,
                                        station_number=station_number,
                                        raw_station_name=raw_station_name,
                                        source_path=source_data_file,
                                        line_number=str(line_number),
                                        date_value=date_string,
                                        field_name="period_days",
                                        offending_value=raw_period,
                                        detail=f"Could not parse {config.period_field}.",
                                    )

                        quality_flag = ""
                        if config.quality_field:
                            quality_flag = row[config.quality_field].strip()
                            if quality_flag not in {"", "Y", "N"}:
                                add_issue(
                                    issues,
                                    issue_type="unexpected_quality_flag",
                                    metric_code=config.metric_code,
                                    station_number=station_number,
                                    raw_station_name=raw_station_name,
                                    source_path=source_data_file,
                                    line_number=str(line_number),
                                    date_value=date_string,
                                    field_name="quality_flag",
                                    offending_value=quality_flag,
                                    detail="Quality flag must be Y, N, or blank.",
                                )
                                quality_flag = ""

                        if numeric_value is not None:
                            min_value, max_value = PLAUSIBLE_RANGES[config.metric_code]
                            if numeric_value < min_value or numeric_value > max_value:
                                add_issue(
                                    issues,
                                    issue_type="value_out_of_range",
                                    metric_code=config.metric_code,
                                    station_number=station_number,
                                    raw_station_name=raw_station_name,
                                    source_path=source_data_file,
                                    line_number=str(line_number),
                                    date_value=date_string,
                                    field_name="value",
                                    offending_value=value_string,
                                    detail=f"Expected {min_value} <= value <= {max_value}.",
                                )

                        is_provisional = quality_flag == "N"
                        is_daily_strict = bool(value_string) and (
                            config.metric_code == "uv" or period_string in {"", "1"}
                        )
                        observed_row = bool(value_string) and bool(date_string)

                        standardized_row = {
                            "metric_code": config.metric_code,
                            "product_code": product_code,
                            "station_number": station_number,
                            "display_station_name": display_station_name,
                            "raw_station_name": raw_station_name,
                            "date": date_string,
                            "value": value_string,
                            "unit": config.unit,
                            "quality_flag": quality_flag,
                            "is_provisional": truthy_string(is_provisional),
                            "period_days": period_string,
                            "is_daily_strict": truthy_string(is_daily_strict),
                            "source_data_file": source_data_file,
                        }

                        writers[(config.metric_code, "full")].writerow(standardized_row)
                        if observed_row:
                            writers[(config.metric_code, "observed")].writerow(standardized_row)
                        if observed_row and is_daily_strict:
                            writers[(config.metric_code, "strict")].writerow(standardized_row)

                        coverage_key = (config.metric_code, station_number)
                        if coverage_key not in coverage:
                            coverage[coverage_key] = {
                                "metric_code": config.metric_code,
                                "station_number": station_number,
                                "display_station_name": display_station_name,
                                "total_rows": 0,
                                "observed_rows": 0,
                                "strict_rows": 0,
                                "first_date": "",
                                "last_date": "",
                                "y_count": 0,
                                "n_count": 0,
                                "blank_value_rows": 0,
                                "non_one_period_rows": 0,
                            }

                        entry = coverage[coverage_key]
                        entry["total_rows"] += 1
                        if observed_row:
                            entry["observed_rows"] += 1
                        if observed_row and is_daily_strict:
                            entry["strict_rows"] += 1
                        if quality_flag == "Y":
                            entry["y_count"] += 1
                        elif quality_flag == "N":
                            entry["n_count"] += 1
                        if not value_string:
                            entry["blank_value_rows"] += 1
                        if period_string and period_string != "1":
                            entry["non_one_period_rows"] += 1
                        if date_string:
                            if not entry["first_date"] or date_string < entry["first_date"]:
                                entry["first_date"] = date_string
                            if not entry["last_date"] or date_string > entry["last_date"]:
                                entry["last_date"] = date_string

    return coverage


def write_reports(
    output_dir: Path,
    stations_master: list[dict[str, str]],
    station_aliases: list[dict[str, str]],
    metadata_conflicts: list[dict[str, str]],
    coverage: dict[tuple[str, str], dict[str, str | int]],
    issues: list[dict[str, str]],
) -> None:
    write_csv(output_dir / "metadata" / "stations_master.csv", STATIONS_MASTER_HEADER, stations_master)
    write_csv(output_dir / "metadata" / "station_aliases.csv", STATION_ALIASES_HEADER, station_aliases)
    write_csv(
        output_dir / "reports" / "metadata_conflicts.csv",
        METADATA_CONFLICTS_HEADER,
        metadata_conflicts,
    )

    coverage_rows = [
        {key: str(value) for key, value in row.items()}
        for _, row in sorted(coverage.items(), key=lambda item: item[0])
    ]
    write_csv(
        output_dir / "reports" / "coverage_summary.csv",
        COVERAGE_SUMMARY_HEADER,
        coverage_rows,
    )

    sorted_issues = sorted(
        issues,
        key=lambda row: (
            row["issue_type"],
            row["metric_code"],
            row["station_number"],
            row["source_path"],
            int(row["line_number"]) if row["line_number"].isdigit() else -1,
        ),
    )
    write_csv(output_dir / "reports" / "data_issues.csv", DATA_ISSUES_HEADER, sorted_issues)


def count_raw_files(root: Path, suffix: str) -> int:
    return sum(1 for _ in root.rglob(suffix))


def main() -> int:
    args = parse_args()
    root = args.root.resolve()
    output_dir = args.output.resolve() if args.output else root / "cleaned"

    note_records = extract_note_records(root)
    stations_master, station_aliases, metadata_conflicts, selected_by_station = choose_station_metadata(
        note_records
    )

    issues: list[dict[str, str]] = []
    build_station_name_issues(station_aliases, issues)
    coverage = scan_data(root, output_dir, selected_by_station, issues)
    write_reports(
        output_dir,
        stations_master,
        station_aliases,
        metadata_conflicts,
        coverage,
        issues,
    )

    raw_note_count = count_raw_files(root, "*_Note.txt")
    raw_data_count = count_raw_files(root, "*_Data.csv")
    fatal_issue_count = sum(1 for issue in issues if issue["issue_type"] in FATAL_ISSUE_TYPES)

    print(f"Raw note files scanned: {raw_note_count}")
    print(f"Raw data files scanned: {raw_data_count}")
    print(f"Stations in master table: {len(stations_master)}")
    print(f"Station alias rows: {len(station_aliases)}")
    print(f"Metadata conflicts: {len(metadata_conflicts)}")
    print(f"Coverage summary rows: {len(coverage)}")
    print(f"Data issues: {len(issues)}")
    print(f"Fatal issues: {fatal_issue_count}")
    print(f"Cleaned output root: {relative_posix(output_dir, root)}")

    return 1 if fatal_issue_count else 0


if __name__ == "__main__":
    sys.exit(main())
