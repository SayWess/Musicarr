import os


DEVELOPMENT = os.getenv("DEVELOPMENT", "false").lower() == "true"
MEDIA_STORAGE_PATH = "/Media" if not DEVELOPMENT else "Media"
METADATA_STORAGE_PATH = "/app/metadata" if not DEVELOPMENT else "metadata"
