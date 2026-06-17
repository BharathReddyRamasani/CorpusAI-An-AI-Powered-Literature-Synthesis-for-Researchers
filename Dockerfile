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

# Create storage directories
RUN mkdir -p /app/backend/uploads /app/backend/reports /app/backend/chroma_db

# Expose Hugging Face Port
EXPOSE 7860

# Run uvicorn (working directory is /app/backend)
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
