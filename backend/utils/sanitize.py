import re

def sanitize_title(title: str) -> str:
    # Remove characters not allowed in file names
    sanitized = re.sub(r'[<>:"\\|?*\x00-\x1F]', "", title)
    # Replace slashes with dashes
    sanitized = sanitized.replace("/", "-")
    return sanitized