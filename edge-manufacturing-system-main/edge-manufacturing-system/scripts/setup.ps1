# Setup script for Windows
New-Item -ItemType Directory -Force -Path "docker/mosquitto/config"
New-Item -ItemType Directory -Force -Path "docker/mosquitto/data"
New-Item -ItemType Directory -Force -Path "docker/mosquitto/log"
New-Item -ItemType Directory -Force -Path "docker/grafana/provisioning/datasources"
New-Item -ItemType Directory -Force -Path "docker/grafana/provisioning/dashboards"
New-Item -ItemType Directory -Force -Path "docker/grafana/dashboards"

docker run --rm -v "${PWD}/docker/mosquitto/config:/mosquitto/config" eclipse-mosquitto:2.0 sh -c "mosquitto_passwd -b -c /mosquitto/config/passwd edge_service edge_secret_2024 && mosquitto_passwd -b /mosquitto/config/passwd cnc_simulator sim_secret_2024 && mosquitto_passwd -b /mosquitto/config/passwd grafana_reader grafana_secret_2024 && mosquitto_passwd -b /mosquitto/config/passwd dmg_mori dmg_secret_2024 && mosquitto_passwd -b /mosquitto/config/passwd makino makino_secret_2024"

docker compose --profile dev up -d --build