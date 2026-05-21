#!/usr/bin/env python3
"""
CNC Machine Data Simulator — DMG Mori NTX 1000 (MANGO Edge)
============================================================
Merk      : DMG Mori
Tipe      : NTX 1000 (5-Axis CNC Turning & Milling)
Protokol  : MQTT over TCP (paho-mqtt)
Site      : POLMAN_BANDUNG_EDGE

Topics yang dipublikasikan:
  fanuc/cnc/data                              -> handleSimulator (raw axis data)
  polman/edge/{SITE_ID}/{MACHINE_ID}/status   -> handleStatus
  polman/edge/{SITE_ID}/{MACHINE_ID}/timer    -> handleTimer
  polman/edge/{SITE_ID}/{MACHINE_ID}/axis     -> handleAxis
  polman/edge/{SITE_ID}/{MACHINE_ID}/alarm    -> handleAlarm (occasional)
"""

import json
import math
import os
import random
import time

import paho.mqtt.client as mqtt
try:
    from paho.mqtt.client import CallbackAPIVersion
    MQTT_V2 = True
except ImportError:
    MQTT_V2 = False

# ── MQTT Configuration ─────────────────────────────────────────────────────────
MQTT_BROKER    = os.getenv("MQTT_BROKER",   "localhost")
MQTT_PORT      = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME  = os.getenv("MQTT_USERNAME", "edge_service")
MQTT_PASSWORD  = os.getenv("MQTT_PASSWORD", "edge_secret_2026")
MQTT_CLIENT_ID = "simulator_cnc_dmgmori_ntx1000"

# ── Machine Identity ───────────────────────────────────────────────────────────
MACHINE_BRAND   = "DMG Mori"
MACHINE_MODEL   = "NTX 1000"
MACHINE_TYPE    = "5-Axis CNC Turning & Milling"
MACHINE_PROTO   = "MQTT / TCP"

SITE_ID    = os.getenv("SITE_ID",    "POLMAN_BANDUNG_EDGE")
MACHINE_ID = os.getenv("MACHINE_ID", "MCH-01")

# ── MQTT Topics ────────────────────────────────────────────────────────────────
BASE_TOPIC  = f"polman/edge/{SITE_ID}/{MACHINE_ID}"
FANUC_TOPIC = "fanuc/cnc/data"

# ── Simulation Parameters ──────────────────────────────────────────────────────
PUBLISH_INTERVAL = int(os.getenv("PUBLISH_INTERVAL", "2"))   # seconds per step
LAENGE_SOLL      = 1000                                        # target cut length

# ── OEE Simulation: production counters ───────────────────────────────────────
_qty_ok = 0
_qty_ng = 0


# ─────────────────────────────────────────────────────────────────────────────
# Payload generators
# ─────────────────────────────────────────────────────────────────────────────

def generate_fanuc_data(step: int) -> dict:
    """Raw Fanuc-style axis payload (legacy: handleSimulator)."""
    t = step * 0.1
    abs_x = round(150.0 + 50.0 * math.sin(t), 3)
    abs_y = round(75.0  + 30.0 * math.cos(t * 0.7), 3)
    abs_z = round(-20.0 + 10.0 * math.sin(t * 1.3), 3)

    laenge_ist     = min(int((step * 1.5) % (LAENGE_SOLL + 1)), LAENGE_SOLL)
    laenge_prozent = round((laenge_ist / LAENGE_SOLL) * 100, 2)
    leitwert       = round(random.uniform(0.85, 1.15), 4)

    return {
        "leitwert":       leitwert,
        "laenge_ist":     laenge_ist,
        "laenge_soll":    LAENGE_SOLL,
        "laenge_prozent": laenge_prozent,
        "achsen": {
            "ABS": {"X": abs_x, "Y": abs_y, "Z": abs_z},
            "REL": {
                "X": round(abs_x - 150.0, 3),
                "Y": round(abs_y - 75.0, 3),
                "Z": round(abs_z + 20.0, 3),
            },
        },
        "programm_O5555": f"N{step % 9999:04d} G01 X{abs_x} Y{abs_y} Z{abs_z} F500",
    }


def generate_status(step: int) -> dict:
    """Machine status payload (handleStatus)."""
    has_alarm = (step % 60 == 59)
    return {
        "run_status":   2,          # 2 = STaRT (running)
        "auto_mode":    1,
        "emergency":    0,
        "alarm":        1 if has_alarm else 0,
        "motion":       1,
        "program_name": "O5555",
        "machine_id":   MACHINE_ID,
        "brand":        MACHINE_BRAND,
        "model":        MACHINE_MODEL,
        "protocol":     MACHINE_PROTO,
    }


def generate_timer(step: int) -> dict:
    """Timer payload (handleTimer)."""
    operating_min = round(step * (PUBLISH_INTERVAL / 60.0), 2)
    cutting_min   = round(operating_min * 0.8, 2)
    return {
        "operating_time_min":  operating_min,
        "operating_time_msec": 0,
        "cutting_time_min":    cutting_min,
        "cutting_time_msec":   0,
        "cycle_time_min":      5,
        "cycle_time_msec":     0,
    }


def generate_axis(step: int) -> dict:
    """Axis data payload (handleAxis)."""
    t = step * 0.1
    return {
        "machine_id": MACHINE_ID,
        "axes": {
            "X": {"abs": round(150.0 + 50.0 * math.sin(t), 3), "feed": 500},
            "Y": {"abs": round(75.0  + 30.0 * math.cos(t * 0.7), 3), "feed": 300},
            "Z": {"abs": round(-20.0 + 10.0 * math.sin(t * 1.3), 3), "feed": 200},
        },
        "spindle_speed": random.randint(1800, 2200),
        "feed_rate":     500,
    }


def generate_alarm() -> dict:
    """Alarm payload (handleAlarm) — published occasionally."""
    return {
        "machine_id": MACHINE_ID,
        "code":       random.choice([1001, 1002, 2001]),
        "message":    random.choice([
            "Tool wear limit exceeded",
            "Spindle load high",
            "Coolant pressure low",
        ]),
        "severity":   random.choice(["warning", "error"]),
        "type":       "system",
        "axis":       "",
    }


def generate_production(step: int, is_active: bool) -> dict:
    """
    Aggregated production payload — dikirim setiap 30 step (~1 menit).
    Format ini cocok dengan production log collector Edge untuk dikirim ke MANGO.
    """
    global _qty_ok, _qty_ng
    operating_min = round(step * (PUBLISH_INTERVAL / 60.0), 2)

    if is_active:
        # Simulasi: setiap 30 step = 1 siklus produksi
        cycle_ok = random.randint(1, 3)
        cycle_ng = 1 if random.random() < 0.05 else 0  # 5% defect rate
        _qty_ok += cycle_ok
        _qty_ng += cycle_ng

    total = _qty_ok + _qty_ng
    quality = round((_qty_ok / total * 100) if total > 0 else 100.0, 2)
    availability = round(min((operating_min / (step * PUBLISH_INTERVAL / 60.0 + 0.001)) * 100, 100.0), 2) if step > 0 else 100.0
    performance  = round(random.uniform(75.0, 95.0), 2)
    oee          = round(availability * performance * quality / 10000.0, 2)

    return {
        "machine_id":          MACHINE_ID,
        "work_order":          os.getenv("WORK_ORDER", "WO-SIM-001"),
        "part_number":         "SHAFT-NTX-001",
        "shift":               1,
        "operator_id":         "SIM_OPERATOR",
        "qty_ok":              _qty_ok,
        "qty_ng":              _qty_ng,
        "cycle_time_actual":   5.0,
        "operating_time_min":  operating_min,
        "downtime_min":        0.0,
        "downtime_category":   "",
        "oee":                 oee,
        "availability":        availability,
        "performance":         performance,
        "quality":             quality,
    }


# ─────────────────────────────────────────────────────────────────────────────
# MQTT callbacks
# ─────────────────────────────────────────────────────────────────────────────

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"[SIM] Connected to MQTT broker {MQTT_BROKER}:{MQTT_PORT}")
        print(f"[SIM]   Site     : {SITE_ID}")
        print(f"[SIM]   Machine  : {MACHINE_ID} ({MACHINE_BRAND} {MACHINE_MODEL})")
        print(f"[SIM]   Protocol : {MACHINE_PROTO}")
        print(f"[SIM]   Topics   : {BASE_TOPIC}/*")
    else:
        print(f"[SIM] Connection refused (rc={rc})")


def on_disconnect(client, userdata, disconnect_flags, reason_code=None, properties=None):
    code = reason_code if reason_code is not None else disconnect_flags
    print(f"[SIM] Disconnected (code={code}) — waiting for auto-reconnect...")


# ─────────────────────────────────────────────────────────────────────────────
# Main loop
# ─────────────────────────────────────────────────────────────────────────────

def main():
    banner = "=" * 65
    print(banner)
    print(f"  MANGO Edge CNC Simulator")
    print(f"  Merk / Brand : {MACHINE_BRAND}")
    print(f"  Model        : {MACHINE_MODEL}")
    print(f"  Tipe         : {MACHINE_TYPE}")
    print(f"  Protokol     : {MACHINE_PROTO}")
    print(f"  Broker       : {MQTT_BROKER}:{MQTT_PORT}")
    print(f"  Site ID      : {SITE_ID}")
    print(f"  Machine ID   : {MACHINE_ID}")
    print(f"  Interval     : {PUBLISH_INTERVAL}s / step")
    print(banner)

    try:
        if MQTT_V2:
            client = mqtt.Client(
                client_id=MQTT_CLIENT_ID,
                callback_api_version=CallbackAPIVersion.VERSION2,
            )
        else:
            client = mqtt.Client(client_id=MQTT_CLIENT_ID)
    except (TypeError, NameError):
        # paho < 2.0 fallback
        client = mqtt.Client(client_id=MQTT_CLIENT_ID)

    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect    = on_connect
    client.on_disconnect = on_disconnect
    client.reconnect_delay_set(min_delay=2, max_delay=30)

    # Retry until broker is available
    while True:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            client.loop_start()
            break
        except Exception as exc:
            print(f"[SIM] Waiting for MQTT broker... ({exc})")
            time.sleep(3)

    step = 0
    try:
        while True:
            qos_opts = {"qos": 1, "retain": False}

            # 1. Fanuc legacy topic
            fanuc_data = generate_fanuc_data(step)
            client.publish(FANUC_TOPIC, json.dumps(fanuc_data), **qos_opts)

            # 2. Machine status
            client.publish(f"{BASE_TOPIC}/status", json.dumps(generate_status(step)), **qos_opts)

            # 3. Timer / uptime
            client.publish(f"{BASE_TOPIC}/timer", json.dumps(generate_timer(step)), **qos_opts)

            # 4. Axis positions
            client.publish(f"{BASE_TOPIC}/axis", json.dumps(generate_axis(step)), **qos_opts)

            # 5. Production log (setiap 30 step ~ 1 menit)
            if step > 0 and step % 30 == 0:
                is_active = False
                try:
                    import urllib.request
                    req = urllib.request.Request(f"http://edge_core:8080/api/v1/operator/current/{MACHINE_ID}")
                    with urllib.request.urlopen(req, timeout=2) as response:
                        res_data = json.loads(response.read().decode())
                        if res_data.get("data") is not None:
                            is_active = True
                except Exception as e:
                    pass # ignore if edge core is down

                prod = generate_production(step, is_active)
                client.publish(f"{BASE_TOPIC}/production", json.dumps(prod), **qos_opts)
                active_str = "ACTIVE" if is_active else "IDLE"
                print(
                    f"[SIM] PRODUCTION | {active_str} | QTY_OK={prod['qty_ok']:4d} "
                    f"QTY_NG={prod['qty_ng']:3d} "
                    f"OEE={prod['oee']:5.1f}% "
                    f"Avail={prod['availability']:5.1f}% "
                    f"Perf={prod['performance']:5.1f}%"
                )

            # 6. Alarm (sesekali setiap 60 step)
            if step % 60 == 59:
                alarm = generate_alarm()
                client.publish(f"{BASE_TOPIC}/alarm", json.dumps(alarm), **qos_opts)
                print(f"[SIM] ALARM      | [{alarm['severity'].upper()}] {alarm['message']}")

            # Periodic step log
            pos = fanuc_data["achsen"]["ABS"]
            print(
                f"[SIM] Step {step:5d} | "
                f"X={pos['X']:8.3f} Y={pos['Y']:8.3f} Z={pos['Z']:8.3f} | "
                f"Progress={fanuc_data['laenge_prozent']:6.2f}%"
            )

            step += 1
            time.sleep(PUBLISH_INTERVAL)

    except KeyboardInterrupt:
        print("\n[SIM] Shutting down by user request.")
    finally:
        client.loop_stop()
        client.disconnect()
        print("[SIM] Disconnected.")


if __name__ == "__main__":
    main()
