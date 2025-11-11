import os
from utils.constants import MEDIA_STORAGE_PATH, METADATA_STORAGE_PATH


def init_folders():
    """
    Initialize the necessary folders for the application.
    """
    folders = [
        MEDIA_STORAGE_PATH + "/downloads",
        METADATA_STORAGE_PATH + "/avatars"
    ]

    for folder in folders:
        os.makedirs(folder, exist_ok=True)
