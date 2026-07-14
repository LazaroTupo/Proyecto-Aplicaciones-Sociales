from pydantic import BaseModel, Field

class ProjectFeatures(BaseModel):
    targetAmount: float = Field(..., gt=0, description="Monto meta a recaudar en USD")
    durationDays: int = Field(..., gt=0, le=365, description="Duración de la campaña en días")
    trlLevel: int = Field(..., ge=1, le=9, description="Nivel de madurez tecnológica (1-9)")
    hasVideo: bool = Field(..., description="¿El proyecto cuenta con un video pitch?")
    category: str = Field(..., description="Categoría del proyecto (ej. Technology, Art, etc.)")
    descriptionLength: int = Field(..., ge=10, description="Longitud de la descripción en caracteres")

class PredictionResponse(BaseModel):
    successProbability: float = Field(..., description="Probabilidad de éxito de 0 a 100")
    feasibilityIndex: float = Field(..., description="Índice de viabilidad del 1 al 10")
    transparencyIndex: float = Field(..., description="Índice de transparencia del 1 al 10")
    recommendations: list[str] = Field(..., description="Lista de sugerencias generadas por la IA")
