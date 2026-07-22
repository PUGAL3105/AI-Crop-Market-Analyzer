"""
One-time fix: Clear orphaned historical_prices rows and re-seed
from the CSV, mapping market names to current DB market IDs.
"""
import sqlite3
import csv
import uuid
import os
from datetime import datetime

DB_PATH = "agripredict.db"
CSV_PATH = "ml/data/historical_prices.csv"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# 1. Load current market name -> id map from DB
cursor.execute("SELECT id, name FROM markets")
market_map = {name: mid for mid, name in cursor.fetchall()}
print(f"Found {len(market_map)} markets in DB:")
for name in market_map:
    print(f"  {name}")

# 2. Delete all existing historical_prices (orphaned)
print("\nDeleting all existing historical_prices rows...")
cursor.execute("DELETE FROM historical_prices")
conn.commit()
print(f"Deleted rows.")

# 3. Check CSV exists
if not os.path.exists(CSV_PATH):
    print(f"ERROR: CSV not found at {CSV_PATH}")
    conn.close()
    exit(1)

# 4. Read CSV and insert with correct market_ids
print(f"\nReading from {CSV_PATH}...")
records = []
skipped = 0

with open(CSV_PATH, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        market_name = row.get("market", "").strip()
        m_id = market_map.get(market_name)
        if not m_id:
            skipped += 1
            continue
        records.append((
            str(uuid.uuid4()),          # id
            row.get("crop", "").strip(), # crop_name
            m_id,                        # market_id
            float(row.get("price_per_kg", 0)),  # price_per_kg
            row.get("date", "").strip()  # record_date
        ))

print(f"Prepared {len(records)} records. Skipped {skipped} (unknown market names).")

# 5. Bulk insert in chunks
CHUNK = 5000
print("Inserting records...")
for i in range(0, len(records), CHUNK):
    chunk = records[i:i+CHUNK]
    cursor.executemany(
        "INSERT INTO historical_prices (id, crop_name, market_id, price_per_kg, record_date) VALUES (?,?,?,?,?)",
        chunk
    )
    conn.commit()
    print(f"  Inserted {min(i+CHUNK, len(records))}/{len(records)}...")

# 6. Verify
cursor.execute("SELECT crop_name, COUNT(*) FROM historical_prices GROUP BY crop_name")
counts = cursor.fetchall()
print("\nFinal record counts by crop:")
for crop, count in counts:
    print(f"  {crop}: {count}")

cursor.execute("SELECT COUNT(*) FROM historical_prices WHERE market_id IN (SELECT id FROM markets)")
linked = cursor.fetchone()[0]
cursor.execute("SELECT COUNT(*) FROM historical_prices")
total = cursor.fetchone()[0]
print(f"\nTotal: {total} | Properly linked: {linked}")

conn.close()
print("\nDone! Restart the backend server to apply.")
