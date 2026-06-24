import os
import pandas as pd
import numpy as np
import kagglehub
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def download_and_load_data():
    print("Verificando/Descargando dataset de Kickstarter...")
    # kagglehub descarga el dataset y lo guarda en caché local automáticamente.
    # Si ya existe en caché, no lo vuelve a descargar.
    path = kagglehub.dataset_download("kemical/kickstarter-projects")
    print(f"Dataset disponible en: {path}")
    
    # Normalmente el archivo más reciente es ks-projects-201801.csv
    csv_path = os.path.join(path, "ks-projects-201801.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"No se encontró el archivo CSV en {csv_path}")
        
    print("Cargando dataset en memoria...")
    df = pd.read_csv(csv_path)
    return df

def preprocess_and_add_synthetic_data(df):
    print("Limpiando datos reales...")
    # Filtrar solo proyectos exitosos y fallidos (quitar cancelados, suspendidos, etc.)
    df = df[df['state'].isin(['successful', 'failed'])].copy()
    
    # Calcular duración de la campaña en días
    df['launched'] = pd.to_datetime(df['launched'])
    df['deadline'] = pd.to_datetime(df['deadline'])
    df['duration_days'] = (df['deadline'] - df['launched']).dt.days
    
    # Calcular variable objetivo: projectedFundingRatio (recaudación real / meta real)
    # Lo limitamos a un máximo de 2.0 (200%) para que los valores atípicos (outliers)
    # extremos no rompan el entrenamiento del modelo.
    df['funding_ratio'] = df['usd_pledged_real'] / df['usd_goal_real']
    df['funding_ratio'] = df['funding_ratio'].clip(0, 2.0)
    
    print("Inyectando data sintética académica en memoria (Random Seed 42)...")
    np.random.seed(42)
    n = len(df)
    
    # Lógica Sintética: Los proyectos exitosos en la vida real recibirán, en promedio,
    # mejores atributos académicos para que el modelo aprenda esa correlación lógica.
    is_success = df['state'] == 'successful'
    
    # 1. TRL Level (1 a 9)
    df['trlLevel'] = np.where(is_success, 
                              np.random.randint(4, 10, n),  # Exitosos tienden a tener prototipos funcionales
                              np.random.randint(1, 6, n))   # Fallidos se quedan en ideas
                              
    # 2. Tamaño del equipo (1 a 10)
    df['teamSize'] = np.where(is_success,
                              np.random.randint(2, 6, n),   # Equipos equilibrados (2 a 5)
                              np.random.randint(1, 3, n))   # Normalmente personas solas (1 a 2)
                              
    # 3. Patentes (Booleanos convertidos a 1/0)
    df['hasPatents'] = np.where(is_success,
                                np.random.choice([1, 0], n, p=[0.3, 0.7]), # 30% de exitosos tienen patentes
                                np.random.choice([1, 0], n, p=[0.05, 0.95])) # Solo 5% de fallidos
                                
    # 4. Experiencia del Asesor/Supervisor (0 a 20 años)
    df['supervisorExperience'] = np.where(is_success,
                                          np.random.randint(2, 15, n),
                                          np.random.randint(0, 5, n))
    
    # Limpiar posibles nulos que vengan de la tabla original
    df = df.dropna(subset=['usd_goal_real', 'duration_days', 'funding_ratio'])
    
    return df

def train_model():
    # 1. Cargar datos
    df = download_and_load_data()
    
    # 2. Preprocesar y añadir columnas al vuelo
    df = preprocess_and_add_synthetic_data(df)
    
    # 3. Definir Características (Features) y Objetivo (Target)
    features = [
        'usd_goal_real',       # Presupuesto meta en USD (Real)
        'duration_days',       # Duración en días (Real)
        'trlLevel',            # Nivel TRL (Sintético)
        'teamSize',            # Tamaño del equipo (Sintético)
        'hasPatents',          # Tiene Patentes (Sintético)
        'supervisorExperience' # Años de exp del supervisor (Sintético)
    ]
    
    X = df[features]
    y = df['funding_ratio'] # Objetivo: Porcentaje de recaudación
    
    print(f"Dataset listo. Total de muestras: {len(X)}")
    
    # Dividir en entrenamiento (80%) y prueba (20%)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Entrenando Random Forest Regressor... (esto puede tardar unos minutos)")
    # Usamos n_estimators=50 y max_depth=10 para no sobrecargar la CPU local al inicio
    model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    print("Entrenamiento finalizado. Evaluando modelo...")
    predictions = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print("-" * 30)
    print(f"Resultados de la Evaluación:")
    print(f"Error Absoluto Medio (MAE): {mae:.4f} (Se equivoca en {mae*100:.1f}% al predecir la recaudación)")
    print(f"R2 Score: {r2:.4f}")
    print("-" * 30)
    
    # Guardar el modelo entrenado
    model_filename = 'project_funding_model.pkl'
    joblib.dump(model, model_filename)
    print(f"Modelo guardado exitosamente como '{model_filename}' en el directorio actual.")
    print("Este archivo .pkl ya puede ser consumido por un microservicio en Flask/FastAPI o desde NestJS.")

if __name__ == "__main__":
    train_model()
