"""
Marathon Day Suitability Algorithm
===================================
Accepts four weather inputs, derives the diurnal temperature range,
and returns either a numeric score (0-100) or a colour bucket.

Bucket boundaries (applied to the float score):
  RED    ->  score <= 40         (poor / dangerous)
  ORANGE ->  40 < score <= 70    (marginal)
  GREEN  ->  score > 70          (suitable)

Weights:
  Max Temperature : 37%
  UV Index        : 23%
  Rainfall        : 18%
  Min Temperature : 12%
  Temp Range      : 10%  (derived from max - min, no extra input needed)

All public functions raise ValueError on NaN, None, non-numeric input, or
values outside plausible physical ranges. Callers (e.g. the API layer) are
expected to sanitise or catch these errors at the boundary.
"""

import math


def _score_max_temp(t):
    """
    Maximum air temperature is the strongest single predictor of marathon
    performance and safety, hence the highest weight (37%).

    Research basis:
      - Ely et al. (2007, Medicine & Science in Sports & Exercise) found a
        linear decline in finishing times above ~13 C, with the steepest
        drop-off above 20 C across all ability levels.
      - El Helou et al. (2012, PLOS ONE) analysed 1.8 million race results
        and identified 5-15 C as the range producing the fastest times.
      - World Athletics / WMA flag system: Green flag < 10 C, Yellow 10-18 C,
        Red 18-23 C, Black > 28 C (race may be cancelled at organisers' discretion).

    Scoring rationale:
      < 0  C  -> 15   Ice on roads, extreme cold injury risk; not zero because
                      some elite cold-weather events are held at these temps
                      with precautions.
      0-5  C  -> 40   Cold but runnable with full gear; slow finishing times
                      expected; hypothermia risk for slower runners.
      5-8  C  -> 70   Cool, approaching optimal; minor cold-start discomfort.
      8-12 C  -> 100  Optimal window. Consistent with world record
                      conditions (London, Berlin, Boston fast years).
      12-15 C -> 90   Still very good; slight performance decline begins.
      15-18 C -> 78   Warm; WMA yellow-flag zone starts here; hydration matters.
      18-22 C -> 60   Noticeable heat impact; recommended pace reduction of
                      ~5-10% per degree above 15 C (Ely et al.).
      22-25 C -> 38   WMA red-flag zone; heat illness risk elevated.
      25-28 C -> 20   Serious risk; most recreational runners should not race.
      28-32 C -> 8    WMA black-flag zone; race cancellation territory.
      > 32 C  -> 0    Dangerous; consistent with documented heat-stroke
                      incidents at races held above this threshold.
    """
    if t < 0:   return 15
    if t < 5:   return 40
    if t < 8:   return 70
    if t < 12:  return 100
    if t < 15:  return 90
    if t < 18:  return 78
    if t < 22:  return 60
    if t < 25:  return 38
    if t < 28:  return 20
    if t < 32:  return 8
    return 0


def _score_min_temp(t):
    """
    Minimum temperature reflects overnight/pre-dawn conditions and serves as
    a proxy for race-start temperature (most marathons begin at 6-8 AM).
    Weighted at 12% -- important context but secondary to the peak heat.

    Research basis:
      - Cheuvront & Haymes (2001, International Journal of Sport Nutrition)
        note that pre-exercise thermoregulatory state significantly affects
        endurance capacity; a warm overnight minimum means the body starts
        the race already thermally stressed.
      - Roberts (2010, Current Sports Medicine Reports): starting temperature
        above 18 C substantially increases the risk of failing to finish,
        particularly when combined with high humidity.
      - Below 0 C, ice formation on roads creates acute injury risk independent
        of the runner's physiological response (British Athletics guidance).

    Scoring rationale:
      < -5 C  -> 10   Severe frost; ice and hypothermia risk at the start line.
      -5-0 C  -> 30   Below freezing; full cold-weather kit required; road
                      surfaces may be icy.
      0-5  C  -> 65   Cool start; manageable with appropriate layering.
      5-10 C  -> 95   Very good start temperature; body warms up naturally.
      10-15 C -> 100  Optimal; comfortable at the gun and throughout early km.
      15-18 C -> 80   Warm start; hydration strategy needed from km 1.
      18-22 C -> 55   Hot start; body is already under heat stress at gun.
      > 22 C  -> 25   Very hot overnight; race-day heat will compound rapidly.
    """
    if t < -5:  return 10
    if t < 0:   return 30
    if t < 5:   return 65
    if t < 10:  return 95
    if t < 15:  return 100
    if t < 18:  return 80
    if t < 22:  return 55
    return 25


def _score_temp_range(r):
    """
    Diurnal temperature range (max - min) is a derived variable that captures
    condition stability across the full duration of the race. It is orthogonal
    to the individual max/min scores -- two days can have identical max and min
    scores but very different volatility profiles.
    Weighted at 10% as a supplementary stability signal.

    Research basis:
      - A marathon takes 2-6+ hours. A runner who starts in 5 C gear and
        finishes in 27 C heat faces compounding physiological stress that
        neither the max nor min score alone captures (Maughan & Shirreffs,
        2004, Journal of Sports Sciences).
      - Large diurnal swings are also associated with frontal weather systems,
        which correlate with wind gusts and unpredictable conditions
        (Australian Bureau of Meteorology climate notes).
      - Tight ranges in the optimal thermal zone are a feature of the most
        celebrated fast-marathon cities: Berlin typically sees a 6-9 C
        diurnal range on race day; London 5-8 C.

    Scoring rationale:
      0-4  C  -> 85   Very stable but near-zero swing often indicates heavy
                      cloud or fog rather than perfect conditions.
      4-8  C  -> 100  Ideal; conditions feel consistent from start to finish.
      8-12 C  -> 82   Good; minor clothing adjustment may be needed mid-race.
      12-16 C -> 60   Moderate volatility; start layers will feel wrong by
                      halfway.
      16-20 C -> 35   Large swing; runners must manage gear and hydration
                      across very different thermal environments.
      20-25 C -> 15   Very large swing; cold start + dangerous finish, or
                      vice versa.
      > 25 C  -> 5    Extreme volatility; conditions at start and finish are
                      effectively different races.
    """
    r = max(0.0, r)
    if r < 4:   return 85
    if r < 8:   return 100
    if r < 12:  return 82
    if r < 16:  return 60
    if r < 20:  return 35
    if r < 25:  return 15
    return 5


def _score_uv(u):
    """
    UV index represents solar radiation exposure. Unlike shorter workouts,
    marathon runners are exposed for 3-6 hours, making cumulative UV dose
    substantially higher than for most other sports. Weighted at 23%.

    Research basis:
      - World Health Organization UV Index classification (WHO, 2002):
        0-2 Low, 3-5 Moderate, 6-7 High, 8-10 Very High, 11+ Extreme.
      - Ambros-Rudolph et al. (2006, British Journal of Dermatology) found
        marathon runners accumulate significant UV damage even on overcast
        days; clear high-UV days present a meaningful health risk over a
        4-6 hr race.
      - Beyond skin damage, high solar radiation contributes to core
        temperature rise through radiant heat load, compounding the effect
        of air temperature (Periard et al., 2011, Sports Medicine).

    Scoring rationale:
      0-2   -> 100  Low UV; negligible radiant heat load; ideal.
      3-5   -> 78   Moderate; manageable with sunscreen and a cap;
                    used in most spring marathon conditions.
      6-7   -> 52   High; noticeable radiant heat contribution over 4+ hrs;
                    sun protection mandatory.
      8-10  -> 22   Very High; WHO recommends avoiding prolonged outdoor
                    activity; real risk over a full marathon duration.
      11+   -> 0    Extreme; WHO advises staying indoors during peak hours;
                    incompatible with safe marathon running.
    """
    if u <= 2:  return 100
    if u <= 5:  return 78
    if u <= 7:  return 52
    if u <= 10: return 22
    return 0


def _score_rainfall(r):
    """
    Rainfall affects runners through three mechanisms: road surface grip,
    thermoregulation (cooling vs. hypothermia), and visibility/comfort.
    Weighted at 18%.

    Research basis:
      - Vihma (2010, International Journal of Biometeorology): light rain
        (0.5-2 mm/day equivalent) provides a mild evaporative cooling
        benefit, slightly improving thermal comfort in warm conditions.
      - Above ~10 mm/day, waterlogged shoes increase blister risk and
        add weight; wet road surfaces materially increase fall risk
        (UK Athletics event safety guidelines).
      - Above 20 mm/day, hypothermia risk rises significantly for runners
        who slow down in the latter stages; combined with wind, this
        becomes dangerous (British Athletics Medical Committee guidance).
      - Extreme rainfall (>30 mm) is typically accompanied by severe
        weather that would prompt race cancellation regardless of other
        conditions.

    Scoring rationale:
      0 mm      -> 100  Dry; optimal grip and thermoregulation.
      0-1 mm    -> 92   Trace rain; slight cooling benefit; negligible risk.
      1-2.5 mm  -> 80   Light rain; cooling benefit begins; surface still safe.
      2.5-5 mm  -> 65   Moderate; wet shoes and slight grip reduction.
      5-10 mm   -> 42   Heavy-ish; significant grip risk; blister risk rises.
      10-20 mm  -> 20   Heavy rain; hypothermia risk for slower finishers;
                        UK Athletics would consider amber/red weather warning.
      20-30 mm  -> 8    Very heavy; dangerous conditions; race organisers
                        would typically issue safety warnings.
      > 30 mm   -> 2    Extreme; race-stopping conditions; retained above zero
                        only because covered/urban courses may still be viable
                        in theory.
    """
    if r == 0:   return 100
    if r <= 1:   return 92
    if r <= 2.5: return 80
    if r <= 5:   return 65
    if r <= 10:  return 42
    if r <= 20:  return 20
    if r <= 30:  return 8
    return 2


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

_TEMP_RANGE = (-50.0, 60.0)
_UV_RANGE = (0.0, 20.0)


def _coerce_finite(value, name):
    if value is None:
        raise ValueError(f"{name} must not be None")
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} must be numeric, got {value!r}") from exc
    if math.isnan(result) or math.isinf(result):
        raise ValueError(f"{name} must be finite, got {value!r}")
    return result


def _validate_inputs(max_temp_c, min_temp_c, uv_index, rainfall_mm):
    max_t = _coerce_finite(max_temp_c, "max_temp_c")
    min_t = _coerce_finite(min_temp_c, "min_temp_c")
    uv = _coerce_finite(uv_index, "uv_index")
    rain = _coerce_finite(rainfall_mm, "rainfall_mm")

    if not _TEMP_RANGE[0] <= max_t <= _TEMP_RANGE[1]:
        raise ValueError(f"max_temp_c outside plausible range {_TEMP_RANGE}: {max_t}")
    if not _TEMP_RANGE[0] <= min_t <= _TEMP_RANGE[1]:
        raise ValueError(f"min_temp_c outside plausible range {_TEMP_RANGE}: {min_t}")
    if min_t > max_t:
        raise ValueError(f"min_temp_c ({min_t}) cannot exceed max_temp_c ({max_t})")
    if not _UV_RANGE[0] <= uv <= _UV_RANGE[1]:
        raise ValueError(f"uv_index outside plausible range {_UV_RANGE}: {uv}")
    if rain < 0.0:
        raise ValueError(f"rainfall_mm cannot be negative: {rain}")

    return max_t, min_t, uv, rain


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_suitability_score(max_temp_c, min_temp_c, uv_index, rainfall_mm):
    """
    Returns a float in [0, 100] representing marathon suitability.

    Higher is better. The score is a weighted sum of five sub-scores:
    max temperature (37%), UV index (23%), rainfall (18%),
    min temperature (12%), and diurnal temperature range (10%).

    Parameters
    ----------
    max_temp_c  : float  - Max temperature in degrees Celsius
    min_temp_c  : float  - Min temperature in degrees Celsius
    uv_index    : float  - Daily UV index (0-14+ on the WHO scale)
    rainfall_mm : float  - Daily rainfall in millimetres (>= 0)

    Raises
    ------
    ValueError
        If any input is None, NaN, infinite, non-numeric, or outside its
        plausible physical range. Also raised if min_temp_c > max_temp_c.
    """
    max_t, min_t, uv, rain = _validate_inputs(
        max_temp_c, min_temp_c, uv_index, rainfall_mm
    )
    return (
        _score_max_temp(max_t)             * 0.37 +
        _score_min_temp(min_t)             * 0.12 +
        _score_temp_range(max_t - min_t)   * 0.10 +
        _score_uv(uv)                      * 0.23 +
        _score_rainfall(rain)              * 0.18
    )


def get_suitability_colour(max_temp_c, min_temp_c, uv_index, rainfall_mm):
    """
    Returns 'RED', 'ORANGE', or 'GREEN' based on marathon suitability.

    See get_suitability_score for parameter and exception semantics.
    """
    score = get_suitability_score(max_temp_c, min_temp_c, uv_index, rainfall_mm)
    if score <= 40:
        return "RED"
    if score <= 70:
        return "ORANGE"
    return "GREEN"


# ---------------------------------------------------------------------------
# Example usage
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    examples = [
        (11.0,  8.0, 3,  0.5),   # ideal day
        (22.0, 16.0, 7,  1.0),   # warm, high UV
        (28.0, 20.0, 9,  0.0),   # hot, dangerous
        (10.0,  7.0, 2,  0.5),   # great conditions
        (12.0,-10.0, 2,  0.0),   # fine temps but huge range
        (8.0,   5.0, 1, 15.0),   # cold and very wet
    ]

    print(f"\n{'MaxT':>6} {'MinT':>6} {'UV':>4} {'Rain':>6}  Colour")
    print("-" * 36)
    for max_t, min_t, uv, rain in examples:
        colour = get_suitability_colour(max_t, min_t, uv, rain)
        print(f"{max_t:>5.1f}C {min_t:>5.1f}C {uv:>4} {rain:>5.1f}mm  {colour}")
