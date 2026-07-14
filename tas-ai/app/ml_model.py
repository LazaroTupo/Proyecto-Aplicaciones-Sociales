import os
import pandas as pd
import joblib
from .schemas import ProjectFeatures, PredictionResponse
from fastapi import HTTPException

MODEL_PATH = "app/models/project_funding_model.joblib"
CLASSIFIER_PATH = "app/models/project_success_model.joblib"

def load_models():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(CLASSIFIER_PATH):
        raise HTTPException(
            status_code=503,
            detail="Los modelos de Machine Learning no están entrenados. Ejecuta 'train.py' primero."
        )
    return joblib.load(MODEL_PATH), joblib.load(CLASSIFIER_PATH)

def generate_recommendations(features: ProjectFeatures) -> list[str]:
    recs = []
    if features.targetAmount > 50000 and features.trlLevel < 4:
        recs.append("Tu meta de recaudación es muy alta para un nivel TRL tan bajo (idea/concepto). Considera validarlo más.")
    if not features.hasVideo:
        recs.append("Los proyectos con un video explicativo (Pitch) tienen un 60% más de probabilidades de ser financiados.")
    if features.descriptionLength < 500:
        recs.append("La descripción de tu proyecto es muy corta. Detalla más el impacto y uso de fondos.")
    if features.durationDays > 120:
        recs.append("Las campañas muy largas tienden a perder el impulso. Te sugerimos reducir la duración a entre 30 y 60 días.")
    
    if not recs:
        recs.append("¡Tu proyecto tiene una configuración excelente! Sigue trabajando en la difusión.")
    return recs

def predict_project(features: ProjectFeatures) -> PredictionResponse:
    regressor, classifier = load_models()
    
    input_data = pd.DataFrame([features.model_dump()])
    input_data['hasVideo'] = input_data['hasVideo'].astype(int)
    
    proba = classifier.predict_proba(input_data)[0][1] * 100
    ratio = regressor.predict(input_data)[0]
    
    feasibility = max(1.0, min(10.0, ratio * 5))
    transparency = 5.0
    if features.hasVideo: transparency += 3.0
    if features.descriptionLength > 1000: transparency += 2.0
    transparency = min(10.0, transparency)
    
    return PredictionResponse(
        successProbability=round(proba, 2),
        feasibilityIndex=round(feasibility, 2),
        transparencyIndex=round(transparency, 2),
        recommendations=generate_recommendations(features)
    )
