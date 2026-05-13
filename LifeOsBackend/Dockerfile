# ──────────────────────────────────────────────────────────
# Life OS FastAPI Backend — Cloud Run Dockerfile
# ──────────────────────────────────────────────────────────

# Use a slim Python 3.12 base image
FROM python:3.12-slim

# Prevent .pyc bytecode and enable real-time log output
# (critical for Cloud Run log streaming)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first so this layer is cached
# unless requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Cloud Run injects PORT automatically; default to 8000
ENV PORT=8000

EXPOSE 8000

# Start uvicorn on all interfaces, reading PORT from env
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
