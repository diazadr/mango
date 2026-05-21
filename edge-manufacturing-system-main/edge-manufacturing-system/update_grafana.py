import json

with open('docker/grafana/dashboards/cnc-overview.json', 'r') as f:
    data = json.load(f)

# Shift existing panels down
for p in data['panels']:
    p['gridPos']['y'] += 10

new_panels = [
    {
      "id": 101,
      "title": "Aktual Produksi Hari Ini (pcs)",
      "type": "stat",
      "gridPos": { "x": 0, "y": 0, "w": 4, "h": 4 },
      "datasource": { "type": "influxdb", "uid": "InfluxDB-CNC" },
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] }, "colorMode": "value", "graphMode": "none" },
      "targets": [{
          "query": "from(bucket: \"cnc_data\")\n  |> range(start: today())\n  |> filter(fn: (r) => r._measurement == \"production\")\n  |> filter(fn: (r) => r._field == \"qty_ok\")\n  |> last()",
          "refId": "A"
      }]
    },
    {
      "id": 102,
      "title": "Target Produksi (pcs)",
      "type": "stat",
      "gridPos": { "x": 4, "y": 0, "w": 4, "h": 4 },
      "datasource": { "type": "influxdb", "uid": "InfluxDB-CNC" },
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] }, "colorMode": "value", "graphMode": "none" },
      "targets": [{
          "query": "from(bucket: \"cnc_data\")\n  |> range(start: today())\n  |> filter(fn: (r) => r._measurement == \"production\")\n  |> filter(fn: (r) => r._field == \"target_qty\")\n  |> last()",
          "refId": "A"
      }]
    },
    {
      "id": 103,
      "title": "Cycle Time Rata-rata (detik)",
      "type": "stat",
      "gridPos": { "x": 8, "y": 0, "w": 4, "h": 4 },
      "datasource": { "type": "influxdb", "uid": "InfluxDB-CNC" },
      "fieldConfig": { "defaults": { "unit": "s" } },
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
      "targets": [{
          "query": "from(bucket: \"cnc_data\")\n  |> range(start: today())\n  |> filter(fn: (r) => r._measurement == \"production\")\n  |> filter(fn: (r) => r._field == \"cycle_time\")\n  |> aggregateWindow(every: 1h, fn: mean)\n  |> last()",
          "refId": "A"
      }]
    },
    {
      "id": 104,
      "title": "MACHINE INFORMATION ROW",
      "type": "text",
      "gridPos": { "x": 0, "y": 4, "w": 24, "h": 6 },
      "options": {
          "mode": "markdown",
          "content": "# Machine ID: NTX-1000\n## Operator: Budi (Shift 1)\n**Program:** O1001.nc | **Tool:** T01 | **Feedrate:** 1200 mm/min | **Spindle:** 4000 RPM\n**X:** 102.500 | **Y:** 0.000 | **Z:** 45.120"
      }
    }
]

data['panels'] = new_panels + data['panels']

with open('docker/grafana/dashboards/cnc-overview.json', 'w') as f:
    json.dump(data, f, indent=2)

print('Dashboard updated successfully.')
