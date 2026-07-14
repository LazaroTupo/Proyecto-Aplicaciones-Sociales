from app.schemas import ProjectFeatures
from app.ml_model import predict_project

features = ProjectFeatures(
    targetAmount=60000,
    durationDays=45,
    trlLevel=4,
    hasVideo=True,
    category="Technology",
    descriptionLength=1500
)

print("Iniciando prueba de predicción (Kaggle + Nuevas Variables)...")
res = predict_project(features)
print("\n--- Resultado de la Predicción ---")
print(res.model_dump_json(indent=2))
