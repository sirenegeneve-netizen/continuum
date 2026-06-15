import json
import glob

def list_snapshots():
    return sorted(glob.glob("storage/snapshots/*.json"))

def load_latest_snapshot():
    files = list_snapshots()
    if not files:
        return None

    with open(files[-1], "r") as f:
        return json.load(f)