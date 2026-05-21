#!/usr/bin/env python3
"""
MANGO Edge — PostgreSQL Seeder via Docker Exec
Digunakan ketika port 5432 konflik dengan PostgreSQL Laragon.
"""
import subprocess
import random
from datetime import datetime, timedelta, timezone

MACHINES = [
    ("ntx1000",       "DMG Mori NTX 1000",  "dmg_mori",  "focas",      "Line A - Bay 1"),
    ("makino_01",     "Makino D500",         "makino",    "mt_connect", "Line A - Bay 2"),
    ("haas_vf2",      "Haas VF-2SS",         "haas",      "focas",      "Line B - Bay 1"),
    ("simulator_dmg", "Simulator DMG",       "dmg_mori",  "simulator",  "Virtual Lab"),
]
OPERATORS = [
    ("OP001", "Budi Santoso",   "CNC Milling", 1),
    ("OP002", "Rina Wulandari", "CNC Turning", 1),
    ("OP003", "Ahmad Fauzi",    "CNC Milling", 2),
    ("OP004", "Dewi Lestari",   "CNC Turning", 2),
    ("OP005", "Joko Widodo",    "Quality",     3),
]
WORK_ORDERS = ["WO-2026-0501", "WO-2026-0502", "WO-2026-0503", "WO-2026-0504"]
PART_NUMBERS = ["FLANGE-A01", "SHAFT-B02", "GEAR-C03", "HOUSING-D04"]

def run_sql(sql: str):
    """Execute SQL inside cnc_postgres container."""
    result = subprocess.run(
        ["docker", "exec", "-i", "cnc_postgres", "psql", "-U", "cnc_edge", "-d", "cnc_alarms", "-c", sql],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        print(f"  ✗ SQL Error: {result.stderr.strip()}")
    return result

def main():
    now = datetime.now(timezone.utc)
    print("=" * 60)
    print("  PostgreSQL Seeder (via docker exec)")
    print("=" * 60)

    # Machine configs
    for mid, name, mtype, proto, loc in MACHINES:
        run_sql(f"""
            INSERT INTO machine_configs (id, name, machine_type, protocol, location, enabled)
            VALUES ('{mid}','{name}','{mtype}','{proto}','{loc}', true)
            ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, machine_type=EXCLUDED.machine_type,
            protocol=EXCLUDED.protocol, location=EXCLUDED.location, enabled=true, updated_at=NOW()
        """)
    print(f"  ✓ {len(MACHINES)} machine configs upserted")

    # Operators
    for oid, name, dept, shift in OPERATORS:
        run_sql(f"""
            INSERT INTO operators (id, name, department, default_shift)
            VALUES ('{oid}','{name}','{dept}',{shift})
            ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, department=EXCLUDED.department
        """)
    print(f"  ✓ {len(OPERATORS)} operators upserted")

    # OEE History
    count = 0
    for day in range(7, 0, -1):
        ts = (now - timedelta(days=day)).strftime("%Y-%m-%d %H:%M:%S+00")
        for mid, name, *_ in MACHINES:
            a = round(random.uniform(80,98),2); p = round(random.uniform(75,95),2)
            q = round(random.uniform(92,100),2); o = round((a/100)*(p/100)*(q/100)*100,2)
            pt = 480; ot = round(pt*a/100,2); ct = round(ot*p/100,2)
            ac = random.randint(0,5)
            run_sql(f"""
                INSERT INTO oee_history (machine_id,machine_name,period,calculated_at,availability,performance,quality,oee,planned_time,operating_time,cutting_time,alarm_count)
                VALUES ('{mid}','{name}','daily','{ts}',{a},{p},{q},{o},{pt},{ot},{ct},{ac})
            """)
            count += 1
    print(f"  ✓ {count} OEE history records")

    # Production Logs
    count = 0
    for day in range(7, 0, -1):
        ts = (now - timedelta(days=day)).strftime("%Y-%m-%d %H:%M:%S+00")
        for i, (mid, name, *_) in enumerate(MACHINES):
            oid = OPERATORS[i % len(OPERATORS)][0]
            shift = OPERATORS[i % len(OPERATORS)][3]
            wo = WORK_ORDERS[i % len(WORK_ORDERS)]
            pn = PART_NUMBERS[i % len(PART_NUMBERS)]
            qok = random.randint(80,200); qng = random.randint(0,8)
            cyc = round(random.uniform(25,90),3); otm = round(random.uniform(300,460),2)
            dtm = round(random.uniform(5,40),2)
            av = round(otm/480*100,2); pf = round(random.uniform(75,95),2)
            ql = round(qok/(qok+qng)*100,2) if (qok+qng)>0 else 100
            ov = round((av/100)*(pf/100)*(ql/100)*100,2)
            cat = random.choice(["mechanical","electrical","material","setup"])
            run_sql(f"""
                INSERT INTO production_logs (machine_id,machine_name,work_order,part_number,shift,operator_id,qty_ok,qty_ng,cycle_time_actual,operating_time_min,downtime_min,downtime_category,oee,availability,performance,quality,timestamp)
                VALUES ('{mid}','{name}','{wo}','{pn}',{shift},'{oid}',{qok},{qng},{cyc},{otm},{dtm},'{cat}',{ov},{av},{pf},{ql},'{ts}')
            """)
            count += 1
    print(f"  ✓ {count} production log records")

    # Alarms
    alarm_list = [
        (1001,"Servo Alarm: X-axis overload","critical","servo"),
        (2001,"Spindle overheat detected","warning","overheat"),
        (3001,"Tool breakage sensor triggered","critical","system"),
    ]
    count = 0
    for day in range(3, 0, -1):
        for mid, name, *_ in MACHINES[:3]:
            code, msg, sev, typ = random.choice(alarm_list)
            ts = (now - timedelta(days=day, hours=random.randint(0,8))).strftime("%Y-%m-%d %H:%M:%S+00")
            res = (datetime.strptime(ts,"%Y-%m-%d %H:%M:%S+00") + timedelta(minutes=random.randint(5,60))).strftime("%Y-%m-%d %H:%M:%S+00") if random.random()>0.3 else "NULL"
            res_val = f"'{res}'" if res != "NULL" else "NULL"
            run_sql(f"""
                INSERT INTO alarm_events (machine_id,machine_name,timestamp,resolved_at,code,message,severity,type)
                VALUES ('{mid}','{name}','{ts}',{res_val},{code},'{msg}','{sev}','{typ}')
            """)
            count += 1
    print(f"  ✓ {count} alarm events")

    # Connection Logs
    count = 0
    for mid, name, _, proto, _ in MACHINES:
        is_sim = "true" if proto=="simulator" else "false"
        for h in range(24, 0, -1):
            ts = (now - timedelta(hours=h)).strftime("%Y-%m-%d %H:%M:%S+00")
            lat = random.randint(5,120)
            run_sql(f"""
                INSERT INTO connection_logs (machine_id,machine_name,protocol,event_type,is_simulator,latency_ms,message,occurred_at)
                VALUES ('{mid}','{name}','{proto}','connected',{is_sim},{lat},'Successfully connected','{ts}')
            """)
            count += 1
    print(f"  ✓ {count} connection logs")

    print("\n✅ PostgreSQL seeding complete!")

if __name__ == "__main__":
    main()
