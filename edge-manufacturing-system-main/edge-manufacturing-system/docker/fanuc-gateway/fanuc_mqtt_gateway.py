import os
import time
import json
import datetime
import paho.mqtt.client as mqtt
from pyfanuc import pyfanuc

# ==========================================
# KONFIGURASI DARI ENVIRONMENT VARIABLES
# ==========================================
MACHINE_IP = os.environ.get('MACHINE_IP', '192.168.1.3')
MACHINE_ID = os.environ.get('MACHINE_ID', 'fanuc_01')
MACHINE_TYPE = os.environ.get('MACHINE_TYPE', 'fanuc')

MQTT_BROKER = os.environ.get('MQTT_BROKER', 'emqx')
MQTT_PORT = int(os.environ.get('MQTT_PORT', 1883))
MQTT_USER = os.environ.get('MQTT_USER', 'edge_service')
MQTT_PASS = os.environ.get('MQTT_PASS', 'edge_secret_2024')

# Topik Edge Manufacturing System
TOPIC_STATUS = f"cnc/{MACHINE_TYPE}/{MACHINE_ID}/status"
TOPIC_AXIS = f"cnc/{MACHINE_TYPE}/{MACHINE_ID}/axis"
TOPIC_SPINDLE = f"cnc/{MACHINE_TYPE}/{MACHINE_ID}/spindle"

print(f"=== FANUC MQTT GATEWAY ===")
print(f"Target CNC: {MACHINE_IP} (ID: {MACHINE_ID})")
print(f"MQTT Broker: {MQTT_BROKER}:{MQTT_PORT}")
print("==========================")

# ==========================================
# SETUP MQTT CLIENT
# ==========================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[MQTT] Berhasil terhubung ke Broker {MQTT_BROKER}!")
    else:
        print(f"[MQTT] Gagal terhubung ke broker, kode: {rc}")

client = mqtt.Client(client_id=f"pyfanuc_gateway_{MACHINE_ID}")
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.on_connect = on_connect

try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()
except Exception as e:
    print(f"[ERROR] Tidak dapat menghubungi MQTT broker: {e}")
    exit(1)

# ==========================================
# MAIN LOOP MENGAMBIL DATA FANUC
# ==========================================
conn = pyfanuc(MACHINE_IP)
print(f"[FANUC] Mencoba terhubung ke {MACHINE_IP}...")

# Retry loop untuk Fanuc agar docker tidak langsung mati jika mesin mati
while True:
    try:
        if conn.connect():
            print(f"[FANUC] Berhasil terhubung ke mesin {MACHINE_IP}!")
            if hasattr(conn, 'sysinfo'):
                print(f"[FANUC] Info Mesin: {conn.sysinfo}")
            break
        else:
            print(f"[FANUC] Gagal connect. Menunggu mesin CNC {MACHINE_IP} menyala (retry dalam 5 detik)...")
            time.sleep(5)
    except Exception as e:
        print(f"[FANUC] Timeout/Error ke {MACHINE_IP}. Pastikan mesin menyala. Retry 5 detik... ({e})")
        time.sleep(5)

try:
    while True:
        timestamp = datetime.datetime.utcnow().isoformat() + "Z"
        
        # 1. AMBIL STATUS MESIN
        st = conn.statinfo()
        if st is not None:
            status_payload = {
                "machine_id": MACHINE_ID,
                "timestamp": timestamp,
                "run_status": st.get('run', 0),
                "auto_mode": st.get('aut', 0),
                "emergency": st.get('emegency', 0),
                "alarm": st.get('alarm', 0),
                "warning": 0,
                "motion": st.get('motion', 0),
                "edit": st.get('edit', 0),
                "mstb": st.get('mstb', 0),
                "battery": 0
            }
            client.publish(TOPIC_STATUS, json.dumps(status_payload), qos=1)
        
        # 2. AMBIL DATA AXIS (Koordinat & Feedrate)
        axes = conn.readaxes(conn.ABS | conn.REL)
        feedrate = conn.readactfeed()
        if axes is not None:
            abs_axes = axes.get('ABS', [0.0, 0.0, 0.0])
            rel_axes = axes.get('REL', [0.0, 0.0, 0.0])
            
            while len(abs_axes) < 3: abs_axes.append(0.0)
            while len(rel_axes) < 3: rel_axes.append(0.0)

            axis_payload = {
                "machine_id": MACHINE_ID,
                "timestamp": timestamp,
                "abs_x": abs_axes[0] if abs_axes[0] is not None else 0.0,
                "abs_y": abs_axes[1] if abs_axes[1] is not None else 0.0,
                "abs_z": abs_axes[2] if abs_axes[2] is not None else 0.0,
                "rel_x": rel_axes[0] if rel_axes[0] is not None else 0.0,
                "rel_y": rel_axes[1] if rel_axes[1] is not None else 0.0,
                "rel_z": rel_axes[2] if rel_axes[2] is not None else 0.0,
                "feedrate": feedrate if feedrate is not None else 0.0,
                "feedrate_override": 100
            }
            client.publish(TOPIC_AXIS, json.dumps(axis_payload), qos=0)

        # 3. AMBIL DATA SPINDLE
        spindle_speed = conn.readactspindlespeed()
        if spindle_speed is not None:
            spindle_payload = {
                "machine_id": MACHINE_ID,
                "timestamp": timestamp,
                "speed_actual": spindle_speed,
                "speed_command": spindle_speed,
                "load_percent": 0.0,
                "override": 100
            }
            client.publish(TOPIC_SPINDLE, json.dumps(spindle_payload), qos=0)

        time.sleep(1.0) # Tarik data setiap 1 detik

except KeyboardInterrupt:
    print("\n[INFO] Gateway dihentikan oleh pengguna.")
except Exception as e:
    print(f"[ERROR] Terjadi kesalahan: {e}")
finally:
    conn.disconnect()
    client.loop_stop()
    client.disconnect()
    print("[INFO] Koneksi ditutup.")
