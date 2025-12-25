# Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy source files
COPY . .

# Generate go.sum and download dependencies
RUN go mod tidy
RUN go mod download

# Build the binary
RUN go build -o shield-engine .

# Run Stage
FROM alpine:latest

WORKDIR /root/
COPY --from=builder /app/shield-engine .

EXPOSE 8080
CMD ["./shield-engine"]
