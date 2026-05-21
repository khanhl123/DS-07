# Known Issues in NN Weather Models

The four neural-network predictors shipped in this directory
(`nn_max_temp_model.joblib`, `nn_min_temp_model.joblib`,
`nn_rainfall_model.joblib`, `nn_uv_model.joblib`) were trained with the
methodology in `nn_weather_predictor.py`. Two methodological bugs in that
training code are known and unfixed in the shipped artifacts.

## Bug 1 — Data leakage in normalization

`train_single()` fits the normalization scaler (mean / std) on the full
dataset before calling `train_test_split`. Validation-set statistics
therefore leak into the training-time normalization, biasing the reported
RMSE / MAE on the held-out set downward. The reported metrics in
`nn_*_metadata.json` are not a reliable estimate of out-of-distribution
performance.

**Fix path**: split train/val first, fit the scaler on the training partition
only, then transform the validation partition with the train-fitted scaler.
Persist train-only `mean` / `std` to `nn_*_norm.json`.

## Bug 2 — No cyclical encoding of day-of-year

Each example's feature vector is `[latitude, longitude, day, month, year]`.
Because `month` and `day` are passed as raw integers, the model sees
31 December and 1 January as far apart (`month=12, day=31` vs
`month=1, day=1`) when they are calendar neighbours. Predictions near the
year boundary do not respect the seasonal cycle.

**Fix path**: add `sin(2π · doy / 365)` and `cos(2π · doy / 365)` as two
extra features (`doy` = day-of-year, 1..366). Adjacent days across the
year boundary become close in feature space. This expands the input from
five to seven features, so models trained without the change cannot be
reused — a full retrain is required.

## Status

Both fixes were prototyped on `main` in commit `72c88c3` ("Phase A2"). The
commit was reverted to ship Feature A faster with the existing artifacts.
Re-apply that commit (or an equivalent) and retrain when revisiting model
quality.
