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
    def test_returns_none_when_max_temp_missing(self):
        # max_temp is the only mandatory input; the model can't anchor a
        # marathon-suitability score without it.
        assert main._marathon_verdict(None, 10, 5, 0) is None

    def test_partial_when_only_max_temp_missing_among_others(self):
        # With max present and at least one other component, the model
        # renormalises and returns a partial verdict.
        v = main._marathon_verdict(20.0, None, 5.0, 0.5)
        assert v is not None
        assert v["confidence"] == "partial"

    def test_partial_when_rainfall_missing(self):
        # The dominant real-world case: temp + UV but no rainfall.
        v = main._marathon_verdict(20.0, 10.0, 5.0, None)
        assert v["confidence"] == "partial"
        assert v["colour"] in ("RED", "ORANGE", "GREEN")

    def test_full_when_all_inputs_present(self):
        v = main._marathon_verdict(11.0, 8.0, 3, 0.5)
        assert v["confidence"] == "full"

    def test_returns_none_when_only_max_present(self):
        # max_temp alone is 37% < 50% threshold -> insufficient signal.
        assert main._marathon_verdict(20.0, None, None, None) is None

    def test_inverted_min_max_returns_partial_not_none(self):
        # Previously this returned None (model raised on min > max). Now the
        # partial path drops min_temp + temp_range and scores the rest.
        v = main._marathon_verdict(10, 15, 5, 0)
        assert v is not None
        assert v["confidence"] == "partial"

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

    def test_verdict_includes_confidence_field(self):
        v = main._marathon_verdict(11.0, 8.0, 3, 0.5)
        assert "confidence" in v


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


class TestStationPredicted:
    """Endpoint test for /predicted — mocks predict_one so no real NN load."""

    def setup_method(self):
        from fastapi.testclient import TestClient
        self.client = TestClient(main.app)

    def _fake_predict(self, attribute, lat, lng, year, month, day):
        # Deterministic per-attribute values so we can assert response shape.
        return {
            "max_temp": 22.0,
            "min_temp": 12.0,
            "uv": 10.0,   # solar MJ → ~UV 5
            "rainfall": 0.5,
        }[attribute]

    def test_returns_one_row_per_day(self, monkeypatch):
        monkeypatch.setattr(main, "predict_one", self._fake_predict)
        # April has 30 days
        resp = self.client.get(
            "/api/stations/66062/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 4,
                    "lat": -33.87, "lng": 151.21},
        )
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == 30
        assert body[0]["day"] == 1
        assert body[-1]["day"] == 30

    def test_row_shape_and_predicted_flag(self, monkeypatch):
        monkeypatch.setattr(main, "predict_one", self._fake_predict)
        resp = self.client.get(
            "/api/stations/66062/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 6,
                    "lat": -33.87, "lng": 151.21},
        )
        row = resp.json()[0]
        assert row["isPredicted"] is True
        assert row["date"] == f"{main.PREDICTED_MAX_YEAR:04d}-06-01"
        assert row["maxTemp"] == 22.0
        assert row["minTemp"] == 12.0
        assert row["rainfall"] == 0.5
        # solar 10 MJ * 0.45 = 4.5 → round() uses banker's rounding → 4
        assert row["uvIndex"] == 4
        assert row["marathonVerdict"] is not None

    def test_negative_rainfall_clamped_to_zero(self, monkeypatch):
        def negative_rain(attribute, *_args, **_kwargs):
            return {"max_temp": 20.0, "min_temp": 10.0, "uv": 8.0, "rainfall": -3.0}[attribute]
        monkeypatch.setattr(main, "predict_one", negative_rain)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 1,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.json()[0]["rainfall"] == 0.0

    def test_invalid_month_returns_400(self, monkeypatch):
        monkeypatch.setattr(main, "predict_one", self._fake_predict)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 13,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.status_code == 400

    def test_year_beyond_cap_returns_400(self, monkeypatch):
        monkeypatch.setattr(main, "predict_one", self._fake_predict)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MAX_YEAR + 1, "month": 1,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.status_code == 400

    def test_year_below_min_returns_400(self, monkeypatch):
        monkeypatch.setattr(main, "predict_one", self._fake_predict)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MIN_YEAR - 1, "month": 1,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.status_code == 400

    def test_missing_model_returns_503(self, monkeypatch):
        def missing(*_args, **_kwargs):
            raise FileNotFoundError("nn_max_temp_model.joblib not found")
        monkeypatch.setattr(main, "predict_one", missing)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 1,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.status_code == 503

    def test_os_error_returns_503(self, monkeypatch):
        def io_fail(*_args, **_kwargs):
            raise OSError("disk read failure")
        monkeypatch.setattr(main, "predict_one", io_fail)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 1,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.status_code == 503

    def test_unexpected_error_returns_503(self, monkeypatch):
        def boom(*_args, **_kwargs):
            raise RuntimeError("sklearn version mismatch")
        monkeypatch.setattr(main, "predict_one", boom)
        resp = self.client.get(
            "/api/stations/1/predicted",
            params={"year": main.PREDICTED_MAX_YEAR, "month": 1,
                    "lat": 0.0, "lng": 0.0},
        )
        assert resp.status_code == 503


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
