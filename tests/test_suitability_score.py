import math
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from models.suitability_score_model import (
    get_suitability_colour,
    get_suitability_score,
)


# ---------------------------------------------------------------------------
# Invalid input rejection — the previously-broken NaN case is the headline.
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "field, bad_kwargs",
    [
        ("max_temp_c", {"max_temp_c": float("nan")}),
        ("min_temp_c", {"min_temp_c": float("nan")}),
        ("uv_index", {"uv_index": float("nan")}),
        ("rainfall_mm", {"rainfall_mm": float("nan")}),
    ],
)
def test_nan_inputs_raise(field, bad_kwargs):
    base = {"max_temp_c": 20.0, "min_temp_c": 10.0, "uv_index": 5.0, "rainfall_mm": 0.0}
    base.update(bad_kwargs)
    with pytest.raises(ValueError, match=field):
        get_suitability_colour(**base)


@pytest.mark.parametrize("bad", [float("inf"), float("-inf")])
def test_infinite_inputs_raise(bad):
    with pytest.raises(ValueError):
        get_suitability_score(bad, 10.0, 5.0, 0.0)


def test_none_input_raises():
    with pytest.raises(ValueError, match="max_temp_c"):
        get_suitability_colour(None, 10.0, 5.0, 0.0)


def test_non_numeric_input_raises():
    with pytest.raises(ValueError, match="uv_index"):
        get_suitability_colour(20.0, 10.0, "high", 0.0)


def test_min_greater_than_max_raises():
    with pytest.raises(ValueError, match="cannot exceed"):
        get_suitability_colour(10.0, 15.0, 5.0, 0.0)


def test_negative_uv_raises():
    with pytest.raises(ValueError, match="uv_index"):
        get_suitability_colour(20.0, 10.0, -0.5, 0.0)


def test_negative_rainfall_raises():
    with pytest.raises(ValueError, match="rainfall_mm"):
        get_suitability_colour(20.0, 10.0, 5.0, -0.1)


def test_max_temp_too_high_raises():
    with pytest.raises(ValueError, match="max_temp_c"):
        get_suitability_colour(99.0, 10.0, 5.0, 0.0)


def test_min_temp_too_low_raises():
    with pytest.raises(ValueError, match="min_temp_c"):
        get_suitability_colour(10.0, -99.0, 5.0, 0.0)


def test_uv_too_high_raises():
    with pytest.raises(ValueError, match="uv_index"):
        get_suitability_colour(20.0, 10.0, 21.0, 0.0)


# ---------------------------------------------------------------------------
# Boundary inputs that should be accepted
# ---------------------------------------------------------------------------

def test_boundary_temps_accepted():
    # max == 60 (allowed) but min must be <= max
    score = get_suitability_score(60.0, 60.0, 0.0, 0.0)
    assert 0.0 <= score <= 100.0


def test_zero_rainfall_accepted():
    assert get_suitability_score(11.0, 8.0, 3.0, 0.0) > 0


def test_extreme_rainfall_accepted():
    # No upper bound on rainfall; just check it doesn't raise
    score = get_suitability_score(11.0, 8.0, 3.0, 500.0)
    assert 0.0 <= score <= 100.0


def test_uv_zero_accepted():
    score = get_suitability_score(11.0, 8.0, 0.0, 0.0)
    assert 0.0 <= score <= 100.0


# ---------------------------------------------------------------------------
# Score function behaviour
# ---------------------------------------------------------------------------

def test_score_returns_float_in_range():
    score = get_suitability_score(11.0, 8.0, 3.0, 0.5)
    assert isinstance(score, float)
    assert 0.0 <= score <= 100.0
    assert not math.isnan(score)


def test_optimal_day_is_green():
    # Berlin/London-style fast marathon day
    assert get_suitability_colour(11.0, 8.0, 3.0, 0.5) == "GREEN"


def test_extreme_day_is_red():
    # 35 C max, 25 C min, UV 11, 5 mm rain -- multiple extreme factors
    assert get_suitability_colour(35.0, 25.0, 11.0, 5.0) == "RED"


def test_huge_diurnal_range_penalised():
    ideal = get_suitability_score(11.0, 8.0, 3.0, 0.5)
    swingy = get_suitability_score(12.0, -10.0, 2.0, 0.0)
    assert swingy < ideal


def test_extreme_rainfall_drives_score_down():
    dry = get_suitability_score(11.0, 8.0, 3.0, 0.0)
    soaked = get_suitability_score(11.0, 8.0, 3.0, 35.0)
    assert soaked < dry


# ---------------------------------------------------------------------------
# Score-to-colour mapping is internally consistent
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "inputs",
    [
        (11.0, 8.0, 3.0, 0.5),
        (22.0, 16.0, 7.0, 1.0),
        (28.0, 20.0, 9.0, 0.0),
        (10.0, 7.0, 2.0, 0.5),
        (12.0, -10.0, 2.0, 0.0),
        (8.0, 5.0, 1.0, 15.0),
    ],
)
def test_score_bucket_consistent(inputs):
    score = get_suitability_score(*inputs)
    colour = get_suitability_colour(*inputs)
    if score <= 40:
        assert colour == "RED"
    elif score <= 70:
        assert colour == "ORANGE"
    else:
        assert colour == "GREEN"
