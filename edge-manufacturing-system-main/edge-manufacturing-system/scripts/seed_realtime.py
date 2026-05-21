#!/usr/bin/env python3
"""
MANGO Edge — Full Stack Real-time Seeder
=========================================
Mengisi data ke seluruh stack secara bersamaan:
1. InfluxDB  → OEE metrics, machine_status, axis_position, spindle, machine_timer
2. PostgreSQL → oee_history, production_logs, alarm_events, machine_configs, operators, connection_logs
3. Redis     → Machine state (agar OEE Calculator Go bisa jalan)
4. MQTT      → Publish data real-time agar Collector Go menangkap & menulis ke InfluxDB/Grafana

Jalankan:  python scripts/seed_realtime.py
"""

import json
import math
import random
import time
import sys
from datetime import datetime, timedelta, timezone

# ── Dependencies ───────────────────────────────────────────────────────────────
try:
    import psycopg2
    import redis
    import paho.mqtt.client as mqtt
    from influxdb_client import InfluxDBClient, Point, WritePrecision
    from influxdb_client.client.write_api import SYNCHRONOUS
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Install with: pip install psycopg2-binary redis paho-mqtt influxdb-client")
    sys.exit(1)

# ── Configuration ──────────────────────────────────────────────────────────────
INFLUX_URL    = "http://localhost:8086"
INFLUX_TOKEN  = "cnc-edge-super-secret-token"
INFLUX_ORG    = "cnc-factory"
INFLUX_BUCKET = "cnc_data"

PG_DSN = "host=127.0.0.1 port=5432 dbname=cnc_alarms user=cnc_edge password=cnc_pg_secret"
# If local PG connection fails (e.g. Laragon PG conflicts), set USE_DOCKER_EXEC=True
USE_DOCKER_EXEC = False

REDIS_HOST = "localhost"
REDIS_PORT = 6379

MQTT_BROKER = "localhost"
MQTT_PORT   = 1883

# ── Machine definitions ───────────────────────────────────────────────────────
MACHINES = [
    {"id": "ntx1000",       "name": "DMG Mori NTX 1000",  "type": "dmg_mori",  "protocol": "focas",     "location": "Line A - Bay 1"},
    {"id": "makino_01",     "name": "Makino D500",         "type": "makino",    "protocol": "mt_connect","location": "Line A - Bay 2"},
    {"id": "haas_vf2",      "name": "Haas VF-2SS",         "type": "haas",      "protocol": "focas",     "location": "Line B - Bay 1"},
    {"id": "simulator_dmg", "name": "Simulator DMG",       "type": "dmg_mori",  "protocol": "simulator", "location": "Virtual Lab"},
]

OPERATORS = [
    {"id": "OP001", "name": "Budi Santoso",    "department": "CNC Milling",  "shift": 1},
    {"id": "OP002", "name": "Rina Wulandari",  "department": "CNC Turning",  "shift": 1},
    {"id": "OP003", "name": "Ahmad Fauzi",     "department": "CNC Milling",  "shift": 2},
    {"id": "OP004", "name": "Dewi Lestari",    "department": "CNC Turning",  "shift": 2},
    {"id": "OP005", "name": "Joko Widodo",     "department": "Quality",      "shift": 3},
]

WORK_ORDERS = ["WO-2026-0501", "WO-2026-0502", "WO-2026-0503", "WO-2026-0504"]
PART_NUMBERS = ["FLANGE-A01", "SHAFT-B02", "GEAR-C03", "HOUSING-D04"]


def seed_postgres():
    """Seed PostgreSQL with machine configs, operators, production logs, OEE history."""
    print("\n[1/4] Seeding PostgreSQL...")
    conn = psycopg2.connect(PG_DSN)
    cur = conn.cursor()

    # ── Machine configs ────────────────────────────────────────────────────────
    for m in MACHINES:
        cur.execute("""
            INSERT INTO machine_configs (id, name, machine_type, protocol, location, enabled)
            VALUES (%s, %s, %s, %s, %s, true)
            ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, machine_type=EXCLUDED.machine_type,
            protocol=EXCLUDED.protocol, location=EXCLUDED.location, enabled=true, updated_at=NOW()
        """, (m["id"], m["name"], m["type"], m["protocol"], m["location"]))
    print(f"  ✓ {len(MACHINES)} machine configs upserted")

    # ── Operators ──────────────────────────────────────────────────────────────
    for op in OPERATORS:
        cur.execute("""
            INSERT INTO operators (id, name, department, default_shift)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, department=EXCLUDED.department
        """, (op["id"], op["name"], op["department"], op["shift"]))
    print(f"  ✓ {len(OPERATORS)} operators upserted")

    # ── OEE History (7 hari ke belakang) ───────────────────────────────────────
    now = datetime.now(timezone.utc)
    oee_count = 0
    for day_offset in range(7, 0, -1):
        ts = now - timedelta(days=day_offset)
        for m in MACHINES:
            avail = round(random.uniform(80, 98), 2)
            perf  = round(random.uniform(75, 95), 2)
            qual  = round(random.uniform(92, 100), 2)
            oee_val = round((avail/100)*(perf/100)*(qual/100)*100, 2)
            planned = 480.0
            operating = round(planned * avail / 100, 2)
            cutting = round(operating * perf / 100, 2)
            alarms = random.randint(0, 5)

            cur.execute("""
                INSERT INTO oee_history (machine_id, machine_name, period, calculated_at,
                    availability, performance, quality, oee, planned_time, operating_time, cutting_time, alarm_count)
                VALUES (%s, %s, 'daily', %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (m["id"], m["name"], ts, avail, perf, qual, oee_val, planned, operating, cutting, alarms))
            oee_count += 1
    print(f"  ✓ {oee_count} OEE history records inserted")

    # ── Production Logs (7 hari) ───────────────────────────────────────────────
    prod_count = 0
    for day_offset in range(7, 0, -1):
        ts = now - timedelta(days=day_offset)
        for i, m in enumerate(MACHINES):
            op = OPERATORS[i % len(OPERATORS)]
            wo = WORK_ORDERS[i % len(WORK_ORDERS)]
            pn = PART_NUMBERS[i % len(PART_NUMBERS)]
            qty_ok = random.randint(80, 200)
            qty_ng = random.randint(0, 8)
            cycle_time = round(random.uniform(25, 90), 3)
            op_time = round(random.uniform(300, 460), 2)
            dt_min = round(random.uniform(5, 40), 2)
            avail = round(op_time / 480 * 100, 2)
            perf = round(random.uniform(75, 95), 2)
            qual = round(qty_ok / (qty_ok + qty_ng) * 100, 2) if (qty_ok + qty_ng) > 0 else 100
            oee_val = round((avail/100)*(perf/100)*(qual/100)*100, 2)

            cur.execute("""
                INSERT INTO production_logs (machine_id, machine_name, work_order, part_number, shift,
                    operator_id, qty_ok, qty_ng, cycle_time_actual, operating_time_min, downtime_min,
                    downtime_category, oee, availability, performance, quality, timestamp)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (m["id"], m["name"], wo, pn, op["shift"], op["id"],
                  qty_ok, qty_ng, cycle_time, op_time, dt_min,
                  random.choice(["mechanical","electrical","material","setup"]),
                  oee_val, avail, perf, qual, ts))
            prod_count += 1
    print(f"  ✓ {prod_count} production log records inserted")

    # ── Alarm Events (recent) ─────────────────────────────────────────────────
    alarm_msgs = [
        (1001, "Servo Alarm: X-axis overload", "critical", "servo"),
        (2001, "Spindle overheat detected", "warning", "overheat"),
        (3001, "Tool breakage sensor triggered", "critical", "system"),
        (4001, "Coolant level low", "info", "system"),
        (5001, "Hydraulic pressure warning", "warning", "system"),
    ]
    alarm_count = 0
    for day_offset in range(3, 0, -1):
        for m in MACHINES[:3]:
            code, msg, sev, typ = random.choice(alarm_msgs)
            ts = now - timedelta(days=day_offset, hours=random.randint(0, 8))
            resolved = ts + timedelta(minutes=random.randint(5, 60)) if random.random() > 0.3 else None
            cur.execute("""
                INSERT INTO alarm_events (machine_id, machine_name, timestamp, resolved_at, code, message, severity, type)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (m["id"], m["name"], ts, resolved, code, msg, sev, typ))
            alarm_count += 1
    print(f"  ✓ {alarm_count} alarm events inserted")

    # ── Connection Logs ────────────────────────────────────────────────────────
    cl_count = 0
    for m in MACHINES:
        for h in range(24, 0, -1):
            ts = now - timedelta(hours=h)
            cur.execute("""
                INSERT INTO connection_logs (machine_id, machine_name, protocol, event_type, is_simulator, latency_ms, message, occurred_at)
                VALUES (%s,%s,%s,'connected',%s,%s,'Successfully connected',%s)
            """, (m["id"], m["name"], m["protocol"], m["protocol"]=="simulator", random.randint(5, 120), ts))
            cl_count += 1
    print(f"  ✓ {cl_count} connection log records inserted")

    conn.commit()
    cur.close()
    conn.close()
    print("  ✓ PostgreSQL seeding complete!")


def seed_influxdb():
    """Seed InfluxDB with historical OEE metrics, axis, spindle, status, timer data."""
    print("\n[2/4] Seeding InfluxDB...")
    client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    now = datetime.now(timezone.utc)
    points = []

    # ── OEE Metrics (every hour for 24h) ───────────────────────────────────────
    for h in range(24, 0, -1):
        ts = now - timedelta(hours=h)
        for m in MACHINES:
            avail = round(random.uniform(78, 98), 2)
            perf  = round(random.uniform(72, 96), 2)
            qual  = round(random.uniform(90, 100), 2)
            oee   = round((avail/100)*(perf/100)*(qual/100)*100, 2)
            p = Point("oee_metrics") \
                .tag("machine_id", m["id"]) \
                .tag("machine_name", m["name"]) \
                .tag("period", "hourly") \
                .field("availability", avail) \
                .field("performance", perf) \
                .field("quality", qual) \
                .field("oee", oee) \
                .field("planned_time_min", 60.0) \
                .field("operating_time_min", round(60*avail/100, 2)) \
                .field("cutting_time_min", round(60*avail/100*perf/10000, 2)) \
                .field("alarm_count", random.randint(0, 2)) \
                .time(ts, WritePrecision.S)
            points.append(p)

    # ── Machine Status, Axis, Spindle, Timer (every 30s for last 2h) ──────────
    for s in range(240, 0, -1):  # 240 * 30s = 2 hours
        ts = now - timedelta(seconds=s * 30)
        t = s * 0.1
        for m in MACHINES:
            # Status
            points.append(
                Point("machine_status")
                .tag("machine_id", m["id"]).tag("machine_name", m["name"])
                .field("run_status", 2).field("is_running", 1)
                .field("alarm", 0).field("emergency", 0)
                .field("program_name", "O5555")
                .time(ts, WritePrecision.S)
            )
            # Axis
            points.append(
                Point("axis_position")
                .tag("machine_id", m["id"])
                .field("abs_x", round(150 + 50*math.sin(t), 3))
                .field("abs_y", round(75 + 30*math.cos(t*0.7), 3))
                .field("abs_z", round(-20 + 10*math.sin(t*1.3), 3))
                .time(ts, WritePrecision.S)
            )
            # Spindle
            base_rpm = {"ntx1000": 4000, "makino_01": 6000, "haas_vf2": 3500, "simulator_dmg": 4500}
            rpm = base_rpm.get(m["id"], 4000) + random.uniform(-200, 200)
            points.append(
                Point("spindle")
                .tag("machine_id", m["id"])
                .field("speed_actual", round(rpm, 1))
                .field("speed_command", base_rpm.get(m["id"], 4000))
                .field("load_percent", round(random.uniform(30, 80), 1))
                .field("override", 100)
                .time(ts, WritePrecision.S)
            )
            # Timer
            op_min = 240 - (s // 2)
            cut_min = int(op_min * 0.78)
            points.append(
                Point("machine_timer")
                .tag("machine_id", m["id"])
                .field("operating_time_sec", float(op_min * 60))
                .field("cutting_time_sec", float(cut_min * 60))
                .field("cycle_time_sec", 300.0)
                .time(ts, WritePrecision.S)
            )

    # Write in batches
    batch_size = 500
    for i in range(0, len(points), batch_size):
        write_api.write(bucket=INFLUX_BUCKET, record=points[i:i+batch_size])
    print(f"  ✓ {len(points)} InfluxDB points written (OEE, status, axis, spindle, timer)")
    client.close()


def seed_redis():
    """Seed Redis with current machine states so OEE Calculator can work."""
    print("\n[3/4] Seeding Redis...")
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    now = datetime.now(timezone.utc).isoformat()

    for m in MACHINES:
        op_min = random.randint(200, 400)
        cut_min = int(op_min * 0.8)
        state = {
            "machine_id": m["id"],
            "machine_name": m["name"],
            "online": True,
            "last_seen": now,
            "status": {
                "machine_id": m["id"], "run_status": 2, "is_running": True,
                "alarm": 0, "emergency": 0, "program_name": "O5555",
            },
            "axis": {
                "machine_id": m["id"],
                "abs_x": round(random.uniform(100, 200), 3),
                "abs_y": round(random.uniform(50, 100), 3),
                "abs_z": round(random.uniform(-30, -10), 3),
            },
            "timer": {
                "machine_id": m["id"],
                "operating_time_min": op_min, "operating_time_msec": 0,
                "cutting_time_min": cut_min, "cutting_time_msec": 0,
                "cycle_time_min": 5, "cycle_time_msec": 0,
            },
            "active_alarm": None,
        }
        r.set(f"cnc:state:{m['id']}", json.dumps(state), ex=300)
    print(f"  ✓ {len(MACHINES)} machine states set in Redis")


def start_realtime_mqtt():
    """Start publishing real-time MQTT data so Go Edge collector picks it up live."""
    print("\n[4/4] Starting real-time MQTT publisher (Ctrl+C to stop)...")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, client_id="mango_seeder")
    client.username_pw_set("edge_service", "edge_secret_2024")

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    except Exception as e:
        print(f"  ⚠ MQTT not available ({e}), skipping real-time feed.")
        return

    client.loop_start()
    step = 0
    print("  ✓ Connected to MQTT. Publishing every 3 seconds...")
    print("    Press Ctrl+C to stop the real-time feed.\n")

    try:
        while True:
            t = step * 0.1
            for m in MACHINES:
                mid = m["id"]
                mtype = m["type"]

                # Status
                status = {"run_status": 2, "auto_mode": 1, "emergency": 0,
                          "alarm": 0, "motion": 1, "program_name": "O5555", "battery": 0}
                client.publish(f"cnc/{mtype}/{mid}/status", json.dumps(status), qos=1)

                # Axis
                axis = {
                    "abs_x": round(150 + 50*math.sin(t + hash(mid)%10), 3),
                    "abs_y": round(75 + 30*math.cos(t*0.7 + hash(mid)%5), 3),
                    "abs_z": round(-20 + 10*math.sin(t*1.3 + hash(mid)%7), 3),
                    "feedrate": round(800 + 400*math.sin(t*0.3), 1),
                    "feedrate_override": 100,
                }
                client.publish(f"cnc/{mtype}/{mid}/axis", json.dumps(axis), qos=0)

                # Spindle
                base_rpm = {"ntx1000": 4000, "makino_01": 6000, "haas_vf2": 3500, "simulator_dmg": 4500}
                spindle = {
                    "speed_actual": round(base_rpm.get(mid, 4000) + random.uniform(-100, 100), 1),
                    "speed_command": base_rpm.get(mid, 4000),
                    "load_percent": round(random.uniform(30, 75), 1),
                    "override": 100,
                }
                client.publish(f"cnc/{mtype}/{mid}/spindle", json.dumps(spindle), qos=0)

                # Timer
                timer = {
                    "operating_time_min": 240 + step * 2,
                    "operating_time_msec": 0,
                    "cutting_time_min": int((240 + step * 2) * 0.8),
                    "cutting_time_msec": 0,
                    "cycle_time_min": 5,
                    "cycle_time_msec": 0,
                }
                client.publish(f"cnc/{mtype}/{mid}/timer", json.dumps(timer), qos=1)

            # Also publish simulator topic
            sim_data = {
                "leitwert": round(random.uniform(0.85, 1.15), 4),
                "laenge_ist": min(int((step * 1.5) % 1001), 1000),
                "laenge_soll": 1000,
                "laenge_prozent": round(min((step * 1.5) % 1001, 1000) / 10, 2),
                "achsen": {
                    "ABS": {"X": round(150+50*math.sin(t),3), "Y": round(75+30*math.cos(t*0.7),3), "Z": round(-20+10*math.sin(t*1.3),3)},
                    "REL": {"X": round(50*math.sin(t),3), "Y": round(30*math.cos(t*0.7),3), "Z": round(10*math.sin(t*1.3),3)},
                },
                "programm_O5555": f"N{step%9999:04d} G01 X150 Y75 Z-20 F500",
            }
            client.publish("fanuc/cnc/data", json.dumps(sim_data), qos=1)

            print(f"  [Step {step:5d}] Published data for {len(MACHINES)} machines", end="\r")
            step += 1
            time.sleep(3)

    except KeyboardInterrupt:
        print("\n\n  ✓ Real-time feed stopped.")
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    print("=" * 60)
    print("  MANGO Edge — Full Stack Real-time Seeder")
    print("=" * 60)

    seed_postgres()
    seed_influxdb()
    seed_redis()

    print("\n" + "=" * 60)
    print("  ✅ Historical seeding complete!")
    print("  Data tersedia di: PostgreSQL, InfluxDB, Redis")
    print("  Grafana OEE gauge & charts akan langsung terisi.")
    print("=" * 60)

    answer = input("\nMulai real-time MQTT publisher? (y/n): ").strip().lower()
    if answer == "y":
        start_realtime_mqtt()
    else:
        print("Done. Jalankan kembali dengan flag --realtime untuk MQTT live feed.")
