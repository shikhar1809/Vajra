FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for Semgrep and Trivy
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    gnupg \
    lsb-release \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Trivy
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee /usr/share/keyrings/trivy.gpg > /dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | tee /etc/apt/sources.list.d/trivy.list && \
    apt-get update && \
    apt-get install -y trivy

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Semgrep
RUN pip install semgrep

# Create data directory for DuckDB
RUN mkdir -p /app/data

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
