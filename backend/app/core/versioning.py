def tag_version(snapshot, version: str):
    snapshot["version"] = version
    return snapshot