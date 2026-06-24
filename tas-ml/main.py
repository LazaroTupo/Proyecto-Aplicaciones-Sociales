from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(
    title="TAS ML Analytics Service",
    description="Microservicio de Inteligencia Artificial para predicciones de éxito de proyectos.",
    version="1.0.0"
)

# Variable global para mantener el modelo cargado en memoria RAM
MODEL_PATH = "project_funding_model.pkl"
rf_model = None

@app.on_event("startup")
def load_model():
    global rf_model
    if os.path.exists(MODEL_PATH):
        rf_model = joblib.load(MODEL_PATH)
        print("Modelo Random Forest cargado exitosamente.")
    else:
        print(f"ADVERTENCIA: No se encontró el modelo en '{MODEL_PATH}'. Debes ejecutar train_model.py primero.")

# Esquema de datos que NestJS nos enviará
class ProjectData(BaseModel):
    # Inputs para el modelo Predictivo
    targetBudget: float
    durationMonths: int
    trlLevel: int
    teamSize: int
    hasPatents: bool
    supervisorExperience: int
    
    # Inputs adicionales para los Índices Heurísticos de Confianza
    hasTechnicalDoc: bool = False
    hasMarketStudy: bool = False
    hasVideoPitch: bool = False

# Esquema de respuesta
class AnalyticsResponse(BaseModel):
    projectedFundingRatio: float
    feasibilityIndex: float
    transparencyIndex: float

@app.post("/analyze", response_model=AnalyticsResponse)
def analyze_project(project: ProjectData):
    # 1. CÁLCULO PREDICTIVO (Machine Learning)
    projected_ratio = 0.0
    
    if rf_model is not None:
        # Mapear los datos de NestJS a las variables que el modelo XGBoost/RF espera
        # Recordemos que el modelo se entrenó con 'duration_days', no meses.
        duration_days = project.durationMonths * 30
        
        # Crear un DataFrame con una sola fila
        input_df = pd.DataFrame([{
            'usd_goal_real': project.targetBudget,
            'duration_days': duration_days,
            'trlLevel': project.trlLevel,
            'teamSize': project.teamSize,
            'hasPatents': 1 if project.hasPatents else 0,
            'supervisorExperience': project.supervisorExperience
        }])
        
        # Predecir (retorna un arreglo, tomamos el primer elemento)
        prediction = rf_model.predict(input_df)[0]
        # Redondear a 4 decimales (ej: 1.1523 -> 115.23%)
        projected_ratio = round(float(prediction), 4)
    else:
        # Si el modelo aún no ha sido entrenado, devolvemos un error 503
        raise HTTPException(status_code=503, detail="El modelo de ML aún no ha sido entrenado. Ejecute train_model.py")

    # 2. CÁLCULO HEURÍSTICO: Índice de Viabilidad Técnica (0 a 100)
    # TRL pesa 40%, Supervisor pesa 30%, Tamaño de equipo pesa 30%
    trl_score = (min(project.trlLevel, 9) / 9) * 40
    supervisor_score = (min(project.supervisorExperience, 10) / 10) * 30
    
    # Un equipo de 2 a 5 personas es óptimo. Uno solo o demasiados es riesgoso.
    if 2 <= project.teamSize <= 5:
        team_score = 30
    elif project.teamSize == 1:
        team_score = 10
    else:
        team_score = 20
        
    feasibility_index = round(trl_score + supervisor_score + team_score, 2)

    # 3. CÁLCULO HEURÍSTICO: Índice de Transparencia (0 a 100)
    transparency_index = 0.0
    if project.hasVideoPitch:
        transparency_index += 40.0
    if project.hasTechnicalDoc:
        transparency_index += 30.0
    if project.hasMarketStudy:
        transparency_index += 30.0

    return AnalyticsResponse(
        projectedFundingRatio=projected_ratio,
        feasibilityIndex=feasibility_index,
        transparencyIndex=transparency_index
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": rf_model is not None}
