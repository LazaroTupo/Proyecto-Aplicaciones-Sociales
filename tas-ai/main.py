from fastapi import FastAPI
from app.schemas import ProjectFeatures, PredictionResponse
from app.ml_model import predict_project, load_models

app = FastAPI(
    title="ImpulsaTec AI Microservice",
    description="Servicio de predicción de éxito para proyectos de crowdfunding universitario usando Random Forest",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    # Asegura que los modelos se entrenen y carguen al levantar el servidor
    load_models()

@app.post("/api/predict", response_model=PredictionResponse)
def evaluate_project(features: ProjectFeatures):
    """
    Evalúa las características de un proyecto y retorna una predicción 
    de probabilidad de éxito, viabilidad y recomendaciones.
    """
    return predict_project(features)
