FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# Semgrep requires git and some build tools potentially
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install Trivy
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee /usr/share/keyrings/trivy.gpg > /dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | tee /etc/apt/sources.list.d/trivy.list && \
    apt-get update && \
    apt-get install -y trivy

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install semgrep

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run commands
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
