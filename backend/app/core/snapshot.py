import json
import os
from datetime import datetime

SNAPSHOT_DIR = "storage/snapshots"

def create_snapshot(data: dict):
    os.makedirs(SNAPSHOT_DIR, exist_ok=True)

    timestamp = datetime.utcnow().isoformat()
    filename = f"{SNAPSHOT_DIR}/snapshot_{timestamp}.json"

    with open(filename, "w") as f:
        json.dump({"timestamp": timestamp, "data": data}, f, indent=2)

    return filename