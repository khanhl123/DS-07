"""Unit tests for the marathon-weather API.

These tests cover the pure helpers in main.py. They deliberately do not
touch the database — DB integration tests can go in a separate file
once a fixture or test database is wired up.

Run from repo root:
    python -m pytest pipeline/api/test_main.py -v
"""
import os
import importlib.util
import sys

import pytest


def _load_helpers():
    """Import just the helpers from main.py without triggering the DB engine.

    main.py reads DATABASE_URL at module import time, so set a placeholder
    and let SQLAlchemy lazily defer the real connect to first query.
    """
    os.environ.setdefault("DATABASE_URL", "postgresql://user:pass@example/db")
    os.environ.pop("CORS_ORIGINS", None)
    os.environ.pop("RENDER", None)
    spec = importlib.util.spec_from_file_location(
        "pipeline.api.main",
        os.path.join(os.path.dirname(__file__), "main.py"),
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


main = _load_helpers()


class TestSolarToUv:
    def test_returns_none_for_none(self):
        assert main.solar_to_uv(None) is None

    def test_summer_high_solar(self):
        # 28 MJ/m² is a typical AU summer day → ~UV 13
        assert main.solar_to_uv(28) == 13

    def test_winter_low_solar(self):
        # 8 MJ/m² is a typical AU winter day → ~UV 4
        assert main.solar_to_uv(8) == 4

    def test_clips_at_14(self):
        assert main.solar_to_uv(100) == 14

    def test_clips_at_0(self):
        assert main.solar_to_uv(-5) == 0


class TestRound1:
    def test_returns_none_for_none(self):
        assert main._round1(None) is None

    def test_rounds_to_one_decimal(self):
        assert main._round1(12.345) == 12.3
        assert main._round1(12.36) == 12.4

    def test_accepts_int(self):
        assert main._round1(12) == 12.0


class TestMarathonVerdict:
    def test_returns_none_when_any_input_is_none(self):
        assert main._marathon_verdict(None, 10, 5, 0) is None
        assert main._marathon_verdict(20, None, 5, 0) is None
        assert main._marathon_verdict(20, 10, None, 0) is None
        assert main._marathon_verdict(20, 10, 5, None) is None

    def test_returns_none_when_model_validation_fails(self):
        # min > max — the model raises ValueError, which the helper swallows
        assert main._marathon_verdict(10, 15, 5, 0) is None

    def test_returns_none_on_negative_rainfall(self):
        # Defensive: bad DB data shouldn't bubble a 500 to the dashboard
        assert main._marathon_verdict(20, 10, 5, -1) is None

    def test_optimal_day_returns_green_dict(self):
        verdict = main._marathon_verdict(11.0, 8.0, 3, 0.5)
        assert verdict is not None
        assert verdict["colour"] == "GREEN"
        assert 70 < verdict["score"] <= 100

    def test_extreme_day_returns_red_dict(self):
        verdict = main._marathon_verdict(35.0, 25.0, 11, 5.0)
        assert verdict["colour"] == "RED"
        assert 0 <= verdict["score"] <= 40

    def test_score_rounded_to_one_decimal(self):
        verdict = main._marathon_verdict(11.0, 8.0, 3, 0.5)
        # round(x, 1) means at most one digit after the decimal point
        assert verdict["score"] == round(verdict["score"], 1)


class TestRowToDaily:
    class _FakeRow:
        def __init__(self, observation_date, max_temp, min_temp, rainfall_mm, solar_exposure_mj):
            self.observation_date = observation_date
            self.max_temp = max_temp
            self.min_temp = min_temp
            self.rainfall_mm = rainfall_mm
            self.solar_exposure_mj = solar_exposure_mj

    def test_includes_marathon_verdict_when_data_complete(self):
        from datetime import date
        row = self._FakeRow(date(2024, 4, 15), 20.0, 12.0, 0.5, 10.0)
        out = main._row_to_daily(row)
        assert "marathonVerdict" in out
        assert out["marathonVerdict"] is not None
        assert out["marathonVerdict"]["colour"] in ("RED", "ORANGE", "GREEN")

    def test_verdict_is_none_when_temps_missing(self):
        from datetime import date
        row = self._FakeRow(date(2024, 4, 15), None, None, 0.5, 10.0)
        out = main._row_to_daily(row)
        assert out["marathonVerdict"] is None

    def test_other_fields_preserved(self):
        from datetime import date
        row = self._FakeRow(date(2024, 4, 15), 20.0, 12.0, 0.5, 10.0)
        out = main._row_to_daily(row)
        assert out["day"] == 15
        assert out["date"] == "2024-04-15"
        assert out["maxTemp"] == 20.0
        assert out["minTemp"] == 12.0


class TestResolveCorsOrigins:
    def setup_method(self):
        # Each test gets a clean env
        os.environ.pop("CORS_ORIGINS", None)
        os.environ.pop("RENDER", None)

    def test_explicit_env_var_is_used(self):
        os.environ["CORS_ORIGINS"] = "https://a.example.com,https://b.example.com"
        assert main._resolve_cors_origins() == [
            "https://a.example.com",
            "https://b.example.com",
        ]

    def test_strips_whitespace_and_empty_entries(self):
        os.environ["CORS_ORIGINS"] = "  https://a.example.com , , https://b.example.com  "
        assert main._resolve_cors_origins() == [
            "https://a.example.com",
            "https://b.example.com",
        ]

    def test_dev_fallback_when_unset_locally(self, capsys):
        origins = main._resolve_cors_origins()
        assert "http://localhost:5173" in origins
        assert "http://127.0.0.1:5173" in origins
        # Warning should go to stderr so the default isn't invisible
        assert "CORS_ORIGINS unset" in capsys.readouterr().err

    def test_raises_on_render_without_env(self):
        os.environ["RENDER"] = "true"
        with pytest.raises(RuntimeError, match="CORS_ORIGINS must be set"):
            main._resolve_cors_origins()
