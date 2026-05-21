import argparse
import csv
import json
import os
import sys

ATTRIBUTE_CONFIG = {
    'max_temp': {
        'target_col': 'Maximum temperature (Degree C)',
        'default_data_dirs': ['consolidated_data_base/max temp', 'consolidated_data_base/max temp 2'],
        'default_model': 'nn_max_temp_model.joblib',
        'default_norm': 'nn_max_temp_norm.json',
        'default_meta': 'nn_max_temp_metadata.json',
        'label': 'maximum temperature',
        'unit': '°C',
    },
    'min_temp': {
        'target_col': 'Minimum temperature (Degree C)',
        'default_data_dirs': ['consolidated_data_base/min temp', 'consolidated_data_base/min temp 2'],
        'default_model': 'nn_min_temp_model.joblib',
        'default_norm': 'nn_min_temp_norm.json',
        'default_meta': 'nn_min_temp_metadata.json',
        'label': 'minimum temperature',
        'unit': '°C',
    },
    'rainfall': {
        'target_col': 'Rainfall amount (millimetres)',
        'default_data_dirs': ['consolidated_data_base/rainfall', 'consolidated_data_base/rainfall 2'],
        'default_model': 'nn_rainfall_model.joblib',
        'default_norm': 'nn_rainfall_norm.json',
        'default_meta': 'nn_rainfall_metadata.json',
        'label': 'rainfall amount',
        'unit': 'mm',
    },
    'uv': {
        'target_col': 'Daily global solar exposure (MJ/m*m)',
        'default_data_dirs': ['consolidated_data_base/UV', 'consolidated_data_base/UV 2'],
        'default_model': 'nn_uv_model.joblib',
        'default_norm': 'nn_uv_norm.json',
        'default_meta': 'nn_uv_metadata.json',
        'label': 'daily global solar exposure',
        'unit': 'MJ/m*m',
    },
}


def parse_float(value):
    if value is None:
        return None
    value = str(value).strip()
    if value == '':
        return None
    try:
        return float(value)
    except ValueError:
        return None


def load_data(root_dirs, target_column):
    X = []
    y = []
    files_used = []
    if isinstance(root_dirs, str):
        root_dirs = [root_dirs]
    for root_dir in root_dirs:
        for dirpath, _, filenames in os.walk(root_dir):
            for filename in filenames:
                if not filename.lower().endswith('.csv'):
                    continue
                file_path = os.path.join(dirpath, filename)
                valid_rows = 0
                with open(file_path, newline='', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    try:
                        header = next(reader)
                    except StopIteration:
                        continue
                    if 'Year' not in header or 'Month' not in header or 'Day' not in header:
                        continue
                    if 'latitude' not in header or 'longitude' not in header:
                        continue
                    if target_column not in header:
                        continue
                    year_idx = header.index('Year')
                    month_idx = header.index('Month')
                    day_idx = header.index('Day')
                    lat_idx = header.index('latitude')
                    lon_idx = header.index('longitude')
                    target_idx = header.index(target_column)
                    for row in reader:
                        if len(row) <= max(year_idx, month_idx, day_idx, lat_idx, lon_idx, target_idx):
                            continue
                        year = parse_float(row[year_idx])
                        month = parse_float(row[month_idx])
                        day = parse_float(row[day_idx])
                        latitude = parse_float(row[lat_idx])
                        longitude = parse_float(row[lon_idx])
                        target_value = parse_float(row[target_idx])
                        if None in (year, month, day, latitude, longitude, target_value):
                            continue
                        X.append([latitude, longitude, day, month, year])
                        y.append(target_value)
                        valid_rows += 1
                if valid_rows > 0:
                    files_used.append({'file': file_path, 'rows': valid_rows})
    return X, y, files_used


def build_model(hidden_layers=(128, 64, 32), max_iter=300, batch_size=32, learning_rate=0.001):
    from sklearn.neural_network import MLPRegressor
    return MLPRegressor(
        hidden_layer_sizes=hidden_layers,
        activation='relu',
        solver='adam',
        learning_rate_init=learning_rate,
        max_iter=max_iter,
        batch_size=batch_size,
        random_state=42,
    )


def get_default_paths(attribute, output_dir):
    config = ATTRIBUTE_CONFIG[attribute]
    return (
        os.path.join(output_dir, config['default_model']),
        os.path.join(output_dir, config['default_norm']),
        os.path.join(output_dir, config['default_meta']),
    )


def prepare_data_dirs(attribute, data_dir, data_dirs, base_data_dir=None):
    config = ATTRIBUTE_CONFIG[attribute]
    if data_dirs:
        dirs = data_dirs
    elif data_dir:
        dirs = [data_dir]
    else:
        dirs = config['default_data_dirs']
    if base_data_dir:
        dirs = [os.path.join(base_data_dir, d) if not os.path.isabs(d) else d for d in dirs]
    return dirs


def train_single(attribute, data_dir, data_dirs, model_file, norm_file, metadata_file, args):
    try:
        import numpy as np
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import mean_squared_error, mean_absolute_error
        import joblib
    except ImportError as exc:
        print('Missing dependency:', exc)
        print('Install with: pip install numpy scikit-learn joblib')
        sys.exit(1)

    config = ATTRIBUTE_CONFIG[attribute]
    data_dirs = prepare_data_dirs(attribute, data_dir, data_dirs, getattr(args, 'base_data_dir', None))

    if not model_file:
        model_file, norm_file, metadata_file = get_default_paths(attribute, args.output_dir)
    else:
        model_file = model_file if os.path.isabs(model_file) else os.path.join(args.output_dir, model_file)
        norm_file = norm_file if norm_file and os.path.isabs(norm_file) else os.path.join(args.output_dir, norm_file)
        metadata_file = metadata_file if metadata_file and os.path.isabs(metadata_file) else os.path.join(args.output_dir, metadata_file)

    os.makedirs(args.output_dir, exist_ok=True)
    target_column = getattr(args, 'target_column', None) or config['target_col']
    X, y, files_used = load_data(data_dirs, target_column)
    if not X:
        print('No training data found in', data_dirs)
        sys.exit(1)

    print(f"Training {attribute} on {len(files_used)} file(s) from {', '.join(data_dirs)}")
    for file_info in files_used:
        print(f" - {file_info['file']}: {file_info['rows']} rows")

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.float32)
    mean = X.mean(axis=0)
    std = X.std(axis=0)
    std[std == 0] = 1.0
    X_norm = (X - mean) / std
    X_train, X_val, y_train, y_val = train_test_split(X_norm, y, test_size=0.2, random_state=42)

    if args.epochs <= 1:
        print('Warning: training with --epochs 1 may not converge. Use a larger value like 100 or 300.')

    model = build_model(hidden_layers=tuple(args.hidden_layers), max_iter=args.epochs, batch_size=args.batch_size, learning_rate=args.learning_rate)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_val)
    mse = mean_squared_error(y_val, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_val, y_pred)
    print(f'Validation RMSE: {rmse:.4f}, MAE: {mae:.4f}')

    joblib.dump(model, model_file)
    with open(norm_file, 'w', encoding='utf-8') as f:
        json.dump({'mean': mean.tolist(), 'std': std.tolist()}, f)
    metadata = {
        'attribute': attribute,
        'target_column': target_column,
        'data_dir': data_dir,
        'trained_files': files_used,
        'total_training_examples': int(X.shape[0]),
        'hidden_layers': args.hidden_layers,
        'epochs': args.epochs,
        'batch_size': args.batch_size,
        'learning_rate': args.learning_rate,
    }
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print('Saved model to', model_file)
    print('Saved normalization to', norm_file)
    print('Saved training metadata to', metadata_file)


def train_all(args):
    for attribute in ATTRIBUTE_CONFIG:
        print('\n' + '=' * 80)
        print(f"Training model for {attribute}")
        print('=' * 80)
        data_dirs = None
        if args.data_dirs:
            data_dirs = [os.path.join(args.base_data_dir, d) if not os.path.isabs(d) else d for d in args.data_dirs]
        train_single(
            attribute=attribute,
            data_dir=None,
            data_dirs=data_dirs,
            model_file=None,
            norm_file=None,
            metadata_file=None,
            args=args,
        )


def predict(args):
    try:
        import numpy as np
        import joblib
    except ImportError as exc:
        print('Missing dependency:', exc)
        print('Install with: pip install numpy scikit-learn joblib')
        sys.exit(1)

    config = ATTRIBUTE_CONFIG[args.attribute]
    if args.model_file is None or args.norm_file is None:
        default_model, default_norm, _ = get_default_paths(args.attribute, args.output_dir)
        args.model_file = args.model_file or default_model
        args.norm_file = args.norm_file or default_norm

    with open(args.norm_file, 'r', encoding='utf-8') as f:
        norm = json.load(f)
    X_input = np.array([[args.latitude, args.longitude, args.day, args.month, args.year]], dtype=np.float32)
    mean = np.array(norm['mean'], dtype=np.float32)
    std = np.array(norm['std'], dtype=np.float32)
    X_norm = (X_input - mean) / std
    model = joblib.load(args.model_file)
    prediction = model.predict(X_norm)
    print(f"Predicted {config['label']}: {prediction[0]:.2f} {config['unit']}")


def predict_one(attribute, latitude, longitude, year, month, day, output_dir='models'):
    """Programmatic single-day prediction for API use.

    Loads model + norm from default paths in ``output_dir`` and returns a
    float prediction. Raises FileNotFoundError if the model artifact is
    missing.

    NOTE: uses the 5-feature input [lat, lon, day, month, year] to match the
    models shipped on disk. Known limitations of these models (data leakage
    in training, no cyclical encoding) are documented in
    ``models/KNOWN_ISSUES.md``.
    """
    import numpy as np
    import joblib
    model_file, norm_file, _ = get_default_paths(attribute, output_dir)
    with open(norm_file, 'r', encoding='utf-8') as f:
        norm = json.load(f)
    X = np.array([[latitude, longitude, day, month, year]], dtype=np.float32)
    mean = np.array(norm['mean'], dtype=np.float32)
    std = np.array(norm['std'], dtype=np.float32)
    X_norm = (X - mean) / std
    model = joblib.load(model_file)
    return float(model.predict(X_norm)[0])


def main():
    parser = argparse.ArgumentParser(description='Train or predict weather attributes using latitude, longitude, day, month, year.')
    subparsers = parser.add_subparsers(dest='command', required=True)

    train_parser = subparsers.add_parser('train', help='Train a single attribute model')
    train_parser.add_argument('--attribute', choices=ATTRIBUTE_CONFIG.keys(), default='max_temp', help='Weather attribute to train')
    train_parser.add_argument('--data-dir', default=None, help='Root folder with CSV files for the selected attribute')
    train_parser.add_argument('--data-dirs', nargs='+', default=None, help='List of root folders to combine for training')
    train_parser.add_argument('--output-dir', default='models', help='Directory to save model, normalization, and metadata files')
    train_parser.add_argument('--model-file', default=None, help='Output model file name or path')
    train_parser.add_argument('--norm-file', default=None, help='Output normalization params file name or path')
    train_parser.add_argument('--metadata-file', default=None, help='Output training metadata file name or path')
    train_parser.add_argument('--target-column', default=None, help='Explicit target column name to use instead of the default for the selected attribute')
    train_parser.add_argument('--epochs', type=int, default=300, help='Maximum iterations for MLP training')
    train_parser.add_argument('--batch-size', type=int, default=32, help='Batch size for MLP training')
    train_parser.add_argument('--learning-rate', type=float, default=0.001, help='Learning rate for MLP')
    train_parser.add_argument('--hidden-layers', type=int, nargs='+', default=[128, 64, 32], help='Hidden layer sizes for MLP')

    train_all_parser = subparsers.add_parser('train-all', help='Train all four attribute models using default folders')
    train_all_parser.add_argument('--base-data-dir', default='.', help='Base directory containing the consolidated_data folder')
    train_all_parser.add_argument('--output-dir', default='models', help='Directory to save all models, normalization, and metadata files')
    train_all_parser.add_argument('--epochs', type=int, default=300, help='Maximum iterations for MLP training')
    train_all_parser.add_argument('--batch-size', type=int, default=32, help='Batch size for MLP training')
    train_all_parser.add_argument('--learning-rate', type=float, default=0.001, help='Learning rate for MLP')
    train_all_parser.add_argument('--hidden-layers', type=int, nargs='+', default=[128, 64, 32], help='Hidden layer sizes for MLP')
    train_all_parser.add_argument('--data-dirs', nargs='+', default=None, help='Optional list of root folders to use for all attributes')

    predict_parser = subparsers.add_parser('predict', help='Predict a value for the selected attribute')
    predict_parser.add_argument('--attribute', choices=ATTRIBUTE_CONFIG.keys(), default='max_temp', help='Weather attribute to predict')
    predict_parser.add_argument('--model-file', default=None, help='Saved model file')
    predict_parser.add_argument('--norm-file', default=None, help='Saved normalization file')
    predict_parser.add_argument('--output-dir', default='models', help='Directory containing saved models and normalization files')
    predict_parser.add_argument('--year', type=int, required=True)
    predict_parser.add_argument('--month', type=int, required=True)
    predict_parser.add_argument('--day', type=int, required=True)
    predict_parser.add_argument('--latitude', type=float, required=True)
    predict_parser.add_argument('--longitude', type=float, required=True)

    args = parser.parse_args()
    if args.command == 'train':
        train_single(
            attribute=args.attribute,
            data_dir=args.data_dir,
            data_dirs=args.data_dirs,
            model_file=args.model_file,
            norm_file=args.norm_file,
            metadata_file=args.metadata_file,
            args=args,
        )
    elif args.command == 'train-all':
        train_all(args)
    else:
        predict(args)


if __name__ == '__main__':
    main()
