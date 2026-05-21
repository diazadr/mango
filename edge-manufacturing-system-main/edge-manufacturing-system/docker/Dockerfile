# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM golang:alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o cnc-edge ./cmd/edge

# ── Stage 2: Runtime (templates + tzdata for admin UI) ──────────────────────
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app
COPY --from=builder /build/cnc-edge /app/cnc-edge
COPY templates /app/templates

ENV TZ=Asia/Jakarta

EXPOSE 8080

ENTRYPOINT ["/app/cnc-edge"]
