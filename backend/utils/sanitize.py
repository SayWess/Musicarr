import os
import re
from urllib.parse import unquote

VALID_FOLDER_REGEX = re.compile(r"^[a-zA-Z0-9 _-]+$")

def sanitize_title(title: str) -> str:
    # Remove characters not allowed in file names
    sanitized = re.sub(r'[<>:"\\|?*\x00-\x1F]', "", title)
    # Replace slashes with dashes
    sanitized = sanitized.replace("/", "-")
    return sanitized

def is_valid_folder_name(name: str) -> bool:
    sanitized_title = unquote(name)
    return bool(VALID_FOLDER_REGEX.match(sanitized_title)) and len(sanitized_title) > 0 and len(sanitized_title) <= 100

def is_valid_folder_path(path: str) -> bool:
    """
    Check if the given path is a valid folder path.
    """
    if not path or not isinstance(path, str):
        return False
    
    # Normalize and unquote the path
    normalized_path = os.path.normpath(unquote(path)).strip("/")
    components = normalized_path.split(os.sep)

    for component in components:
        if not is_valid_folder_name(component):
            return False
        
    return True
