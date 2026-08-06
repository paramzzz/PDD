FROM python:3.11-slim

WORKDIR /app

# Copy backend application files
COPY clear-path-backend/clear-path-backend/ /app/

# Install production Python dependencies
RUN pip install --no-cache-dir fastapi uvicorn pydantic pymysql python-multipart

# Expose backend service port
EXPOSE 8000

# Environment defaults
ENV PYTHONUNBUFFERED=1
ENV CLEARPATH_SECRET_KEY="clearpath_enterprise_secret_2026_key"

# Production container startup
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
