FROM golang:1.21-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app ./cmd/game-service

FROM alpine:3.18

RUN apk --no-cache add ca-certificates tzdata

RUN addgroup -g 1000 -S appuser && \
    adduser -u 1000 -S appuser -G appuser

WORKDIR /app

COPY --from=builder /build/app .
COPY --from=builder /build/config ./config

RUN mkdir -p logs && chown -R appuser:appuser /app

USER appuser

EXPOSE 8083

CMD ["./app"]