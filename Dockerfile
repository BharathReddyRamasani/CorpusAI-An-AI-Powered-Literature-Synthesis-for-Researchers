# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend and Serve
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from Stage 1 into the backend folder
COPY --from=frontend-builder /app/frontend/dist ./backend/frontend_dist

# Configure persistent storage for Hugging Face Spaces (mounted at /data)
ENV DATABASE_URL="sqlite+aiosqlite:////data/research_assistant.db" \
    CHROMA_PERSIST_DIR="/data/chroma_db" \
    UPLOAD_DIR="/data/uploads" \
    REPORTS_DIR="/data/reports" \
    LOG_FILE="/data/logs/app.log"

# Create storage directories and set permissions (fallback if persistent storage is off)
RUN mkdir -p /data/uploads /data/reports /data/chroma_db /data/logs && \
    chmod -R 777 /data

# Expose Hugging Face Port
EXPOSE 7860

# Run uvicorn (working directory is /app/backend)
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
