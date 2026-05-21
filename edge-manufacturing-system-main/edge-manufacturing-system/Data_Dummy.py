
#!/usr/bin/env python3
import json
import paho.mqtt.client as mqtt
import time
import random

# --- Konfigurasi MQTT (sama seperti skrip asli) ---
MQTT_BROKER = "localhost"  # Ganti jika broker MQTT Anda ada di alamat lain
MQTT_PORT = 1883
MQTT_TOPIC = "fanuc/cnc/data"

# --- Fungsi untuk koneksi dan publish MQTT (sama seperti skrip asli) ---
def publish_data(payload):
    """Membuat koneksi ke broker MQTT dan mengirimkan data."""
    client = mqtt.Client(client_id="fanuc_simulator", protocol=mqtt.MQTTv311)
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.publish(MQTT_TOPIC, payload)
        print(f"-> Data simulasi berhasil dikirim ke topik '{MQTT_TOPIC}'")
    except Exception as e:
        print(f"Gagal mengirim data ke MQTT: {e}")
    finally:
        client.disconnect()

# --- Program Utama (Simulator) ---
print("Memulai simulator data FANUC...")
print("Tekan CTRL+C untuk berhenti.")

try:
    while True:
        # Siapkan dictionary untuk menampung semua data simulasi
        fanuc_data = {}

        # 1. Simulasikan data "leitwert"
        # Menghasilkan angka acak antara 5.0 dan 15.0
        fanuc_data['leitwert'] = round(random.uniform(5.0, 15.0), 1)

        # 2. Simulasikan data "laenge"
        laenge_soll = 1000
        # Menghasilkan angka acak antara 0 dan 1000
        laenge_ist = random.randint(0, 1000)
        if laenge_soll != 0:
            prozent = round((laenge_ist / laenge_soll) * 100, 1)
        else:
            prozent = 0
            
        fanuc_data['laenge_ist'] = laenge_ist
        fanuc_data['laenge_soll'] = laenge_soll
        fanuc_data['laenge_prozent'] = prozent

        # 3. Simulasikan data "achsen"
        # Menghasilkan posisi acak untuk setiap sumbu
        fanuc_data['achsen'] = {
            'ABS': {
                'X': round(random.uniform(-500.0, 500.0), 4),
                'Y': round(random.uniform(-300.0, 300.0), 4),
                'Z': round(random.uniform(-200.0, 200.0), 4)
            },
            'REL': {
                'X': round(random.uniform(-10.0, 10.0), 4),
                'Y': round(random.uniform(-10.0, 10.0), 4),
                'Z': round(random.uniform(-10.0, 10.0), 4)
            }
        }
        
        # 4. Simulasikan data "programm_O5555"
        fanuc_data['programm_O5555'] = (
            "O5555 (TEST PROGRAM)\n"
            "N10 G90 G54 G00 X100. Y50.\n"
            "N20 S1500 M03\n"
            "N30 G01 Z-10. F200.\n"
            "N40 G01 X-100.\n"
            "N90 M30\n"
            "%"
        )

        # Ubah dictionary menjadi string JSON
        json_payload = json.dumps(fanuc_data, indent=2)
        
        # Tampilkan data yang akan dikirim di terminal
        print("\nMengirim data:")
        print(json_payload)
        
        # Kirim data melalui MQTT
        publish_data(json_payload)
        
        # Tunggu 3 detik sebelum mengirim data berikutnya
        time.sleep(3)

except KeyboardInterrupt:
    print("\nSimulator dihentikan.")




