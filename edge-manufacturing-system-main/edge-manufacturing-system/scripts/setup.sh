#!/usr/bin/env bash
# =============================================================================
#  CNC Edge System — Setup Script
#  Jalankan satu kali sebelum `docker compose up`
# =============================================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   CNC Edge System — Setup                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# ── 1. Cek dependensi ────────────────────────────────────────────────────────
info "Memeriksa dependensi..."
for cmd in docker docker-compose mosquitto_passwd; do
  if ! command -v "$cmd" &>/dev/null; then
    # docker-compose bisa juga docker compose (v2)
    if [[ "$cmd" == "docker-compose" ]] && docker compose version &>/dev/null; then
      continue
    fi
    warn "$cmd tidak ditemukan. Lanjutkan dengan cara manual jika perlu."
  else
    success "$cmd tersedia"
  fi
done

# ── 2. Buat direktori yang diperlukan ────────────────────────────────────────
info "Membuat struktur direktori..."
mkdir -p docker/mosquitto/{config,data,log}
mkdir -p docker/grafana/{provisioning/{datasources,dashboards},dashboards}
success "Direktori siap"

# ── 3. Generate Mosquitto password file ─────────────────────────────────────
info "Membuat file password Mosquitto..."

PASSWD_FILE="docker/mosquitto/config/passwd"

if command -v mosquitto_passwd &>/dev/null; then
  # Hapus file lama
  rm -f "$PASSWD_FILE"
  mosquitto_passwd -b -c "$PASSWD_FILE" edge_service   "edge_secret_2024"
  mosquitto_passwd -b    "$PASSWD_FILE" cnc_simulator   "sim_secret_2024"
  mosquitto_passwd -b    "$PASSWD_FILE" grafana_reader  "grafana_secret_2024"
  mosquitto_passwd -b    "$PASSWD_FILE" dmg_mori        "dmg_secret_2024"
  mosquitto_passwd -b    "$PASSWD_FILE" makino          "makino_secret_2024"
  success "Password file dibuat: $PASSWD_FILE"
else
  # Fallback: buat via Docker container jika mosquitto_passwd tidak ada
  warn "mosquitto_passwd tidak ada di host, menggunakan Docker container..."
  docker run --rm -v "$(pwd)/docker/mosquitto/config:/mosquitto/config" \
    eclipse-mosquitto:2.0 sh -c "
      mosquitto_passwd -b -c /mosquitto/config/passwd edge_service  edge_secret_2024
      mosquitto_passwd -b    /mosquitto/config/passwd cnc_simulator  sim_secret_2024
      mosquitto_passwd -b    /mosquitto/config/passwd grafana_reader grafana_secret_2024
      mosquitto_passwd -b    /mosquitto/config/passwd dmg_mori       dmg_secret_2024
      mosquitto_passwd -b    /mosquitto/config/passwd makino         makino_secret_2024
    "
  success "Password file dibuat via Docker"
fi

# ── 4. Set permissions Mosquitto ─────────────────────────────────────────────
chmod 0700 docker/mosquitto/data docker/mosquitto/log
chmod 0600 docker/mosquitto/config/passwd 2>/dev/null || true
success "Permissions set"

# ── 5. Tampilkan ringkasan kredensial ─────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Kredensial Default (ubah di production)      ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ MQTT Broker                                               ║"
echo "║   edge_service   : edge_secret_2024                      ║"
echo "║   cnc_simulator  : sim_secret_2024                        ║"
echo "║   grafana_reader : grafana_secret_2024                    ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ InfluxDB                                                  ║"
echo "║   URL    : http://localhost:8086                          ║"
echo "║   User   : admin / admin_secret_2024                     ║"
echo "║   Token  : cnc-edge-super-secret-token                   ║"
echo "║   Org    : cnc-factory   Bucket: cnc_data                ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ PostgreSQL                                                ║"
echo "║   User   : cnc_edge / cnc_pg_secret                      ║"
echo "║   DB     : cnc_alarms                                    ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ Grafana                                                   ║"
echo "║   URL    : http://localhost:3000                          ║"
echo "║   User   : admin / grafana_secret_2024                   ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║ API Edge                                                  ║"
echo "║   URL    : http://localhost:8080/api/v1                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ── 6. Petunjuk langkah berikutnya ───────────────────────────────────────────
echo -e "${GREEN}Setup selesai!${NC} Langkah selanjutnya:"
echo ""
echo "  # Jalankan semua service (tanpa simulator):"
echo "  docker compose up -d"
echo ""
echo "  # Jalankan dengan simulator Python (dev mode):"
echo "  docker compose --profile dev up -d"
echo ""
echo "  # Cek status semua container:"
echo "  docker compose ps"
echo ""
echo "  # Lihat log edge service:"
echo "  docker compose logs -f edge"
echo ""
echo "  # Test MQTT manual:"
echo '  mosquitto_sub -h localhost -u edge_service -P edge_secret_2024 -t "cnc/#" -v'
echo ""
