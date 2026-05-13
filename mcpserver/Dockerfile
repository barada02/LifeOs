# ──────────────────────────────────────────────
# Life OS MCP Server — Cloud Run Dockerfile
# ──────────────────────────────────────────────

# Use a slim Python image
FROM python:3.12-slim

# Prevent .pyc files and enable unbuffered logs (important for Cloud Run)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (layer cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .


# Expose the port (informational — Cloud Run uses $PORT)
EXPOSE 8080

# Run the MCP server in SSE mode
CMD ["python", "mcp_server.py"]
