# Usamos una imagen oficial de Python ligera
FROM python:3.12-slim

# Directorio de trabajo en el contenedor
WORKDIR /app

# Instalar uv para gestionar dependencias rápidamente
RUN pip install uv

# Copiar el archivo de requerimientos
COPY requirements.txt .

# Instalar las dependencias usando uv
RUN uv pip install --system -r requirements.txt

# Copiar el código fuente
COPY . .

# Exponer el puerto donde correrá FastAPI
EXPOSE 8000

# Comando para ejecutar la aplicación en producción (usando múltiples workers)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
