"""Unit tests for the cyclical-encoding helpers in nn_weather_predictor.

These tests don't touch trained joblib files — they verify the feature
builder maps the calendar onto a circle correctly. The training pipeline
itself is too heavy to exercise in CI; correctness there relies on the
single shared helper tested here being called from both training and
inference paths.
"""
import math

from models.nn_weather_predictor import _cyclical, _doy, FEATURE_NAMES


class TestDayOfYear:
    def test_jan1_is_doy_1(self):
        assert _doy(2025, 1, 1) == 1

    def test_dec31_non_leap_is_doy_365(self):
        assert _doy(2025, 12, 31) == 365

    def test_dec31_leap_is_doy_366(self):
        assert _doy(2024, 12, 31) == 366

    def test_accepts_float_inputs(self):
        # CSV-loaded values come through parse_float as floats; the helper
        # must accept them without raising.
        assert _doy(2025.0, 6.0, 15.0) == 166


class TestCyclical:
    def test_jan1_and_dec31_are_close(self):
        # The whole point of cyclical encoding: adjacent days across the
        # year boundary should be neighbours in feature space, not opposites.
        s1, c1 = _cyclical(2025, 1, 1)
        s2, c2 = _cyclical(2025, 12, 31)
        distance = math.hypot(s1 - s2, c1 - c2)
        assert distance < 0.1

    def test_summer_and_winter_solstices_are_far(self):
        # Australian winter (Jun 21) vs summer (Dec 21) should sit on
        # roughly opposite sides of the unit circle.
        s_jun, c_jun = _cyclical(2025, 6, 21)
        s_dec, c_dec = _cyclical(2025, 12, 21)
        distance = math.hypot(s_jun - s_dec, c_jun - c_dec)
        assert distance > 1.8  # max possible is 2.0 (diametrically opposite)

    def test_on_unit_circle(self):
        # Any (sin, cos) pair should land on the unit circle within float
        # precision — a sanity check on the angle math.
        s, c = _cyclical(2025, 7, 4)
        assert abs(s * s + c * c - 1.0) < 1e-6

    def test_invalid_date_raises(self):
        # Feb 30 doesn't exist — the helper should propagate ValueError
        # so the training loop can skip the row.
        try:
            _cyclical(2025, 2, 30)
        except ValueError:
            return
        assert False, "expected ValueError for Feb 30"


class TestFeatureNames:
    def test_has_seven_features(self):
        assert len(FEATURE_NAMES) == 7

    def test_cyclical_features_last(self):
        # Position matters: the order here is the column order in the
        # feature vector and must match both training (load_data) and
        # inference (predict, predict_one).
        assert FEATURE_NAMES[-2:] == ['sin_doy', 'cos_doy']
