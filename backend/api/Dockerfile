# Etapa 1: Construcción (Builder)
FROM golang:1.26-alpine AS builder

WORKDIR /app
RUN --mount=type=secret,id=network_ca,target=/run/secrets/network_ca \
    if [ -f /run/secrets/network_ca ]; then export SSL_CERT_FILE=/run/secrets/network_ca; fi; \
    apk add --no-cache git gcc musl-dev && go install github.com/air-verse/air@latest

# Instalar dependencias
COPY go.mod go.sum* ./
RUN --mount=type=secret,id=network_ca,target=/run/secrets/network_ca \
    if [ -f /run/secrets/network_ca ]; then export SSL_CERT_FILE=/run/secrets/network_ca; fi; \
    go mod download

# Copiar el código y compilar
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o api_gateway .

# Etapa 2: Producción (Ligera)
FROM alpine:3.19

WORKDIR /app

# Agregar certificados para llamadas HTTPS
RUN --mount=type=secret,id=network_ca,target=/run/secrets/network_ca \
    if [ -f /run/secrets/network_ca ]; then export SSL_CERT_FILE=/run/secrets/network_ca; fi; \
    apk --no-cache add ca-certificates tzdata

# Copiar el binario compilado desde la etapa anterior
COPY --from=builder /app/api_gateway .

EXPOSE 8080

CMD ["./api_gateway"]
