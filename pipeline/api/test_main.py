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
