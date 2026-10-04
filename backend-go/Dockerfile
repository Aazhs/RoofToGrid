# Multi-stage Docker build for RoofToGrid Go Backend (Runs on Free Tier Render)
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod ./
RUN go mod download

# Copy source and build static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# Minimal scratch/alpine runtime container (<15MB image)
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/server /app/server

ENV PORT=4000
EXPOSE 4000

USER nobody:nobody

ENTRYPOINT ["/app/server"]
