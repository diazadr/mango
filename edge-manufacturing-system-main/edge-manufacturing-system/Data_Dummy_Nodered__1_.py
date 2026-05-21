#!/usr/bin/env python3
"""
[DEPRECATED] Gunakan simulator_cnc_mori_ntx1000.py untuk versi terbaru.

CNC Machine Data Simulator — MANGO Edge Manufacturing System
Merk     : DMG Mori
Model    : NTX 1000 (5-Axis CNC Turning & Milling)
Protokol : MQTT / TCP (paho-mqtt)

Topics published:
  fanuc/cnc/data                              -> handleSimulator (raw Fanuc data)
  polman/edge/{SITE_ID}/{MACHINE_ID}/status   -> handleStatus
  polman/edge/{SITE_ID}/{MACHINE_ID}/timer    -> handleTimer
  polman/edge/{SITE_ID}/{MACHINE_ID}/axis     -> handleAxis
  polman/edge/{SITE_ID}/{MACHINE_ID}/alarm    -> handleAlarm (occasional)
"""

import json
import time
import random
import math
import os

import paho.mqtt.client as mqtt

# ── MQTT Configuration (override dengan environment variables) ─────────────────
MQTT_BROKER   = os.getenv("MQTT_BROKER",   "localhost")
MQTT_PORT     = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "edge_service")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "edge_secret_2026")
MQTT_CLIENT_ID = "cnc_simulator_python"

# ── Site / Machine Configuration ───────────────────────────────────────────────
SITE_ID    = os.getenv("SITE_ID",    "POLMAN_BANDUNG_EDGE")
MACHINE_ID = os.getenv("MACHINE_ID", "MCH-01")

# ── Topic helpers ──────────────────────────────────────────────────────────────
BASE_TOPIC     = f"polman/edge/{SITE_ID}/{MACHINE_ID}"
FANUC_TOPIC    = "fanuc/cnc/data"

# ── Simulation Parameters ──────────────────────────────────────────────────────
PUBLISH_INTERVAL = int(os.getenv("PUBLISH_INTERVAL", "2"))   # seconds
LAENGE_SOLL      = 1000                                        # target length


def generate_fanuc_data(step: int) -> dict:
    """Generate simulated Fanuc CNC payload (legacy format for handleSimulator)."""
    t = step * 0.1

    abs_x = round(150.0 + 50.0 * math.sin(t), 3)
    abs_y = round(75.0 + 30.0 * math.cos(t * 0.7), 3)
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
            "REL": {"X": round(abs_x - 150.0, 3),
                    "Y": round(abs_y - 75.0, 3),
                    "Z": round(abs_z + 20.0, 3)},
        },
        "programm_O5555": f"N{step % 9999:04d} G01 X{abs_x} Y{abs_y} Z{abs_z} F500",
    }


def generate_status(step: int) -> dict:
    """Machine status payload — format yang diterima handleStatus."""
    # Sesekali simulasikan alarm (setiap 60 langkah)
    has_alarm = (step % 60 == 59)
    return {
        "run_status":   2,          # 2 = STaRT (running)
        "auto_mode":    1,
        "emergency":    0,
        "alarm":        1 if has_alarm else 0,
        "motion":       1,
        "program_name": "O5555",
        "machine_id":   MACHINE_ID,
    }


def generate_timer(step: int) -> dict:
    """Timer payload — format yang diterima handleTimer."""
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
    """Axis payload — format yang diterima handleAxis."""
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


def generate_alarm(step: int) -> dict:
    """Alarm payload — hanya dikirim sesekali."""
    return {
        "machine_id":  MACHINE_ID,
        "code":        random.choice([1001, 1002, 2001]),
        "message":     random.choice([
            "Tool wear limit exceeded",
            "Spindle load high",
            "Coolant pressure low",
        ]),
        "severity":    random.choice(["warning", "error"]),
        "type":        "system",
        "axis":        "",
    }


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[SIMULATOR] Connected to MQTT broker {MQTT_BROKER}:{MQTT_PORT}")
        print(f"[SIMULATOR]   Site    : {SITE_ID}")
        print(f"[SIMULATOR]   Machine : {MACHINE_ID} (DMG Mori NTX 1000)")
        print(f"[SIMULATOR]   Base    : {BASE_TOPIC}")
    else:
        print(f"[SIMULATOR] Connection failed (rc={rc})")


def on_disconnect(client, userdata, rc):
    print(f"[SIMULATOR] Disconnected (rc={rc}) — waiting for auto-reconnect...")


def main():
    print("=" * 65)
    print("  MANGO Edge CNC Machine Simulator")
    print("  Merk / Brand : DMG Mori")
    print("  Model        : NTX 1000 (5-Axis CNC Turning & Milling)")
    print("  Protokol     : MQTT / TCP")
    print(f"  Broker       : {MQTT_BROKER}:{MQTT_PORT}")
    print(f"  Site ID      : {SITE_ID}")
    print(f"  Machine ID   : {MACHINE_ID}")
    print(f"  Interval     : {PUBLISH_INTERVAL}s / step")
    print("=" * 65)

    client = mqtt.Client(client_id=MQTT_CLIENT_ID)
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect    = on_connect
    client.on_disconnect = on_disconnect

    # Retry connection loop
    while True:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            client.loop_start()
            break
        except Exception as exc:
            print(f"[SIMULATOR] Waiting for MQTT broker... ({exc})")
            time.sleep(3)

    step = 0
    try:
        while True:
            ctx = {"qos": 1, "retain": False}

            # 1. Fanuc legacy topic (→ handleSimulator)
            fanuc_data = generate_fanuc_data(step)
            client.publish(FANUC_TOPIC, json.dumps(fanuc_data), **ctx)

            # 2. Status (→ handleStatus)  — topic: polman/edge/{site}/{machine}/status
            client.publish(f"{BASE_TOPIC}/status", json.dumps(generate_status(step)), **ctx)

            # 3. Timer (→ handleTimer)    — topic: polman/edge/{site}/{machine}/timer
            client.publish(f"{BASE_TOPIC}/timer", json.dumps(generate_timer(step)), **ctx)

            # 4. Axis (→ handleAxis)      — topic: polman/edge/{site}/{machine}/axis
            client.publish(f"{BASE_TOPIC}/axis", json.dumps(generate_axis(step)), **ctx)

            # 5. Alarm (-> handleAlarm)   — sesekali setiap 60 step
            if step % 60 == 59:
                alarm = generate_alarm(step)
                client.publish(f"{BASE_TOPIC}/alarm", json.dumps(alarm), **ctx)
                print(f"[SIMULATOR] ALARM | {alarm['message']}")

            print(
                f"[SIMULATOR] Step {step:5d} | "
                f"X={fanuc_data['achsen']['ABS']['X']:8.3f} "
                f"Y={fanuc_data['achsen']['ABS']['Y']:8.3f} "
                f"Z={fanuc_data['achsen']['ABS']['Z']:8.3f} | "
                f"Progress: {fanuc_data['laenge_prozent']:6.2f}%"
            )

            step += 1
            time.sleep(PUBLISH_INTERVAL)

    except KeyboardInterrupt:
        print("\n[SIMULATOR] Shutting down by user request.")
    finally:
        client.loop_stop()
        client.disconnect()
        print("[SIMULATOR] Disconnected.")


if __name__ == "__main__":
    main()
