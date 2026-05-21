# =============================================================================
#  CNC Edge System — Makefile
# =============================================================================

.PHONY: setup up down dev logs build test clean help

# ── Setup & Infrastructure ───────────────────────────────────────────────────

setup:          ## Persiapkan direktori dan password Mosquitto
	@bash scripts/setup.sh

up:             ## Jalankan semua service (production mode)
	docker compose up -d
	@echo ""
	@echo "Service berjalan:"
	@echo "  Grafana   → http://localhost:3000"
	@echo "  InfluxDB  → http://localhost:8086"
	@echo "  API Edge  → http://localhost:8080/api/v1"
	@echo "  MQTT      → localhost:1883"

dev:            ## Jalankan dengan simulator Python
	docker compose --profile dev up -d

down:           ## Hentikan semua service
	docker compose down

restart:        ## Restart edge service saja
	docker compose restart edge

logs:           ## Tampilkan log edge service (live)
	docker compose logs -f edge

logs-all:       ## Tampilkan semua log
	docker compose logs -f

# ── Build ────────────────────────────────────────────────────────────────────

build:          ## Build binary Golang lokal
	go build -o bin/cnc-edge ./cmd/edge

build-docker:   ## Build Docker image
	docker compose build edge

run-local:      ## Jalankan edge service lokal (tanpa Docker)
	go run ./cmd/edge

# ── Testing ──────────────────────────────────────────────────────────────────

test:           ## Jalankan unit test
	go test ./... -v

test-mqtt:      ## Subscribe semua topic CNC (debugging)
	mosquitto_sub -h localhost \
	  -u edge_service -P edge_secret_2024 \
	  -t "cnc/#" -t "fanuc/#" -v

pub-test-alarm: ## Publish test alarm ke broker
	mosquitto_pub -h localhost \
	  -u edge_service -P edge_secret_2024 \
	  -t "cnc/dmg/ntx1000/alarm" -q 2 \
	  -m '{"code":1001,"message":"SERVO ALARM: X AXIS","severity":"critical","type":"servo","axis":"X"}'

pub-test-status: ## Publish test status ke broker
	mosquitto_pub -h localhost \
	  -u edge_service -P edge_secret_2024 \
	  -t "cnc/dmg/ntx1000/status" -q 1 \
	  -m '{"run_status":2,"auto_mode":1,"emergency":0,"alarm":0,"motion":1,"program_name":"O5555"}'

health:         ## Cek health semua service
	@echo "=== Edge API ===" && curl -sf http://localhost:8080/api/v1/health | python3 -m json.tool
	@echo "=== InfluxDB ===" && curl -sf http://localhost:8086/ping && echo " OK"
	@echo "=== Grafana ===" && curl -sf http://localhost:3000/api/health | python3 -m json.tool

api-machines:   ## Lihat semua state mesin
	curl -sf http://localhost:8080/api/v1/machines | python3 -m json.tool

api-alarms:     ## Lihat active alarms
	curl -sf http://localhost:8080/api/v1/alarms | python3 -m json.tool

api-summary:    ## Lihat factory summary
	curl -sf http://localhost:8080/api/v1/summary | python3 -m json.tool

# ── Cleanup ──────────────────────────────────────────────────────────────────

clean:          ## Hapus binary lokal
	rm -rf bin/

clean-all:      ## Hapus semua data Docker (HATI-HATI: data hilang)
	docker compose down -v
	@echo "Semua volume Docker dihapus."

# ── Help ─────────────────────────────────────────────────────────────────────

help:           ## Tampilkan daftar perintah ini
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
