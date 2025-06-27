import os


DEVELOPMENT = os.getenv("DEVELOPMENT", "false").lower() == "true"
MNT_PATH = "/Media" if not DEVELOPMENT else "Media"
