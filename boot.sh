#!/bin/bash

# Este script iniciará todos los componentes del ecosistema ImpulsaTec
# y los detendrá de forma segura cuando presiones Ctrl+C.

# Atrapa la señal de interrupción (Ctrl+C) para matar todos los procesos en segundo plano
trap 'echo -e "\n🛑 Deteniendo todos los servicios..."; kill 0' SIGINT

echo "🚀 Iniciando el Ecosistema de ImpulsaTec..."
echo "=================================================="

# 1. Iniciar Docker (Postgres y Manticore)
echo "📦 1. Iniciando Bases de Datos (Docker Compose)..."
docker compose down
docker compose up -d

# Esperar unos segundos para asegurar que Postgres está listo
echo "⏳ Esperando a que las bases de datos estén listas..."
sleep 4

# 2. Iniciar Microservicio IA (Python/FastAPI)
echo "🧠 2. Iniciando Microservicio de Inteligencia Artificial (FastAPI)..."
cd tas-ai
# Asumimos que "uv" está instalado tal como se configuró
uv run uvicorn main:app --host 0.0.0.0 --port 8000 &
cd ..

# 3. Iniciar Backend Principal (NestJS)
echo "⚙️ 3. Iniciando Backend Principal (NestJS)..."
cd tas-back
npm run start:dev &
cd ..

# 4. Iniciar Frontend (Next.js)
echo "🎨 4. Iniciando Frontend (Next.js en el puerto 3001)..."
cd tas-front
PORT=3001 npm run dev &
cd ..

echo "=================================================="
echo "✅ ¡Todo el ecosistema está en marcha!"
echo "   - Frontend (Next.js): http://localhost:3001"
echo "   - Backend (NestJS): http://localhost:3000"
echo "   - IA (FastAPI): http://localhost:8000"
echo ""
echo "⚠️ Mantén esta terminal abierta. Presiona [Ctrl+C] para detener y apagar todo."
echo "=================================================="

# Esperar indefinidamente a que los procesos de fondo terminen (o hasta presionar Ctrl+C)
wait
