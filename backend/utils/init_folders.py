import os
from utils.constants import MNT_PATH


def init_folders():
    """
    Initialize the necessary folders for the application.
    """
    folders = [
        MNT_PATH,
    ]

    for folder in folders:
        os.makedirs(folder, exist_ok=True)
