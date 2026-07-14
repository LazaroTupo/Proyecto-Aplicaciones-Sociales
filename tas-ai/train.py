import os
import pandas as pd
import numpy as np
import kagglehub
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline

MODEL_PATH = "app/models/project_funding_model.joblib"
CLASSIFIER_PATH = "app/models/project_success_model.joblib"

def download_and_prepare_data():
    print("Descargando dataset de Kickstarter desde Kaggle...")
    path = kagglehub.dataset_download("kemical/kickstarter-projects")
    csv_path = os.path.join(path, "ks-projects-201801.csv")
    df = pd.read_csv(csv_path)
    
    df = df[df['state'].isin(['successful', 'failed'])].copy()
    df['launched'] = pd.to_datetime(df['launched'])
    df['deadline'] = pd.to_datetime(df['deadline'])
    
    df['durationDays'] = (df['deadline'] - df['launched']).dt.days
    df['targetAmount'] = df['usd_goal_real']
    df['category'] = df['main_category']
    
    df['funding_ratio'] = df['usd_pledged_real'] / df['usd_goal_real']
    df['funding_ratio'] = df['funding_ratio'].clip(0, 2.0)
    
    np.random.seed(42)
    n = len(df)
    is_success = df['state'] == 'successful'
    
    df['trlLevel'] = np.where(is_success, np.random.randint(4, 10, n), np.random.randint(1, 6, n))
    df['hasVideo'] = np.where(is_success, np.random.choice([1, 0], n, p=[0.7, 0.3]), np.random.choice([1, 0], n, p=[0.2, 0.8]))
    df['descriptionLength'] = np.where(is_success, np.random.randint(1000, 5000, n), np.random.randint(100, 2000, n))
    
    df = df.dropna(subset=['targetAmount', 'durationDays', 'funding_ratio', 'category'])
    return df

def train_and_save_models():
    print("Iniciando pipeline de entrenamiento offline...")
    os.makedirs("app/models", exist_ok=True)
    df = download_and_prepare_data()
    
    df = df.sample(n=min(10000, len(df)), random_state=42)
    
    features = ['targetAmount', 'durationDays', 'trlLevel', 'hasVideo', 'category', 'descriptionLength']
    X = df[features]
    y_reg = df['funding_ratio']
    y_class = (df['state'] == 'successful').astype(int)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['category'])
        ],
        remainder='passthrough'
    )
    
    print("Entrenando regresor de viabilidad...")
    regressor = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1))
    ])
    regressor.fit(X, y_reg)
    joblib.dump(regressor, MODEL_PATH)
    
    print("Entrenando clasificador de éxito...")
    classifier = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestClassifier(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1))
    ])
    classifier.fit(X, y_class)
    joblib.dump(classifier, CLASSIFIER_PATH)
    print("¡Modelos entrenados y guardados exitosamente!")

if __name__ == "__main__":
    train_and_save_models()
