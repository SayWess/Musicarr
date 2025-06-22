import shutil
from urllib.parse import unquote
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.models import RootFolder  # make sure this import is correct
from database.database import get_db  # your FastAPI DB session dependency
import os
from utils.sanitize import is_valid_folder_name, is_valid_folder_path

router = APIRouter()

DEVELOPMENT = os.getenv("DEVELOPMENT", "false").lower() == "true"
MNT_PATH = "/Media" if not DEVELOPMENT else "Media"

# Schemas

class PathItem(BaseModel):
    path: str
    default: bool  # "default" or "custom"

class NewPathRequest(BaseModel):
    path: str

class DefaultPathRequest(BaseModel):
    path: str

# Helpers

def list_folders(base_path: str) -> list[str]:
    print(f"Listing folders in: {base_path}")
    if not is_valid_folder_path(base_path):
        return []
    
    if not os.path.exists(base_path):
        os.makedirs(base_path)

    return [
        os.path.join(base_path, f).replace("\\", "/")
        for f in os.listdir(base_path)
        if os.path.isdir(os.path.join(base_path, f))
    ]

# Routes

@router.get("/", response_model=list[PathItem])
async def get_paths(db: AsyncSession = Depends(get_db)):
    if not os.path.exists(MNT_PATH):
        os.makedirs(MNT_PATH)
        
    db_paths = await db.execute(select(RootFolder).order_by(RootFolder.path))
    db_paths = db_paths.scalars().all()
    result = []

    for db_path in db_paths:
        default = True if db_path and db_path.is_default else False
        if not os.path.exists(db_path.path):
            # If the path doesn't exist, remove it from the DB
            await db.delete(db_path)
            await db.commit()
        else:
            result.append(PathItem(path=db_path.path, default=default))

    return result

@router.post("/")
async def add_path(req: NewPathRequest, db: AsyncSession = Depends(get_db)):
    normalized_path = os.path.normpath(unquote(req.path)).strip("/")
    if not is_valid_folder_path(req.path):
        return {"error": "Invalid path format"}

    full_path = os.path.join(MNT_PATH, normalized_path)
    print(f"Adding path: {full_path}")

    # Create the directory if it doesn't exist
    if not os.path.exists(full_path):
        print(f"Creating directory: {full_path}")
        os.makedirs(full_path)

    # Add to DB if not already tracked
    existing = await db.execute(select(RootFolder).filter_by(path=full_path))
    existing = existing.scalars().first()
    if existing:
        return {"error": "Path already exists in the database"}

    db.add(RootFolder(path=full_path))
    await db.commit()
    return {"success": True, "path": full_path}


@router.put("/default")
async def set_default(req: DefaultPathRequest, db: AsyncSession = Depends(get_db)):
    full_path = req.path

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Path does not exist")

    # Unset previous default
    result = await db.execute(select(RootFolder).where(RootFolder.is_default == True))
    previous_default = result.scalars().first()
    if previous_default:
        previous_default.is_default = False
        await db.commit()

    # Set new default
    root_folder = await db.execute(select(RootFolder).filter_by(path=full_path))
    root_folder = root_folder.scalars().first()

    if not root_folder:
        root_folder = RootFolder(path=full_path, is_default=True)
        db.add(root_folder)
    else:
        root_folder.is_default = True

    await db.commit()
    return {"message": "Default path updated"}

@router.delete("/")
async def delete_root_folder(
    path: str = Query(...),
    delete_files: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    # Fetch the folder from DB
    result = await db.execute(select(RootFolder).where(RootFolder.path == path))
    db_path = result.scalars().first()

    if not db_path:
        raise HTTPException(status_code=404, detail="Root folder not found in the database")

    # Optionally delete the folder and its contents
    if delete_files:
        print(f"Deleting folder from disk: {path}")
        if os.path.exists(path) and os.path.isdir(path) and not os.path.islink(path) and path.startswith(MNT_PATH):
            try:
                shutil.rmtree(path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to delete folder from disk: {e}")

    # Remove from DB
    await db.delete(db_path)
    await db.commit()

    return {"detail": f"Root folder '{path}' deleted"}

@router.get("/mounts", response_model=list[str])
async def get_mnt_folders(path: str = Query("", description="Relative subpath under /mnt")):
    """
    Get list of folders in the /mnt directory or its subfolders.
    """
    relative_path = os.path.normpath(unquote(path)).strip("/")
    if relative_path == ".":
        relative_path = ""

    # Prevent path traversal outside /mnt
    if relative_path != "" and not all(is_valid_folder_name(subfolder) for subfolder in relative_path.split(os.sep)):
        raise HTTPException(status_code=400, detail="Invalid path")

    print(f"Received path: {relative_path}")
    abs_path = os.path.join(MNT_PATH, relative_path)
    
    print(f"Listing folders in: {abs_path}")
    if not abs_path.startswith(MNT_PATH) or not os.path.isdir(abs_path):
        raise HTTPException(status_code=404, detail="Path does not exist or is not a directory")

    try:
        return list_folders(abs_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
