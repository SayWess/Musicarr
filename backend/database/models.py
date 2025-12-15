from sqlalchemy import Column, String, Boolean, ForeignKey, Enum, DateTime, UniqueConstraint, func
from sqlalchemy.orm import relationship, declared_attr
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from enum import Enum as PyEnum
from utils.constants import MEDIA_STORAGE_PATH 


# Download State Enum
class DownloadState(str, PyEnum):
    IDLE = "IDLE"
    DOWNLOADING = "DOWNLOADING"
    DOWNLOADED = "DOWNLOADED"
    ERROR = "ERROR"

# Download Format Enum (Audio/Video)
class DownloadFormat(str, PyEnum):
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"

class DownloadQuality(int, PyEnum):
    q_best = 0
    q_2160p = 2160
    q_1440p = 1440
    q_1080p = 1080
    q_720p = 720
    q_480p = 480
    q_360p = 360

# Uploader Model
class Uploader(Base):
    __tablename__ = "uploaders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(String, unique=True, nullable=True)  # External ID (e.g., YouTube ID)
    name = Column(String, nullable=False)
    url = Column(String, nullable=True)  # Uploader URL (e.g., YouTube channel URL)
    channel_id = Column(String, unique=True, nullable=False)  # Uploader ID (e.g., YouTube channel ID)
    channel_url = Column(String, nullable=False)

    # Relationships with Videos and Playlists
    videos = relationship("Video", back_populates="uploader")
    playlists = relationship("Playlist", back_populates="uploader")

# Abstract Base Class for common fields
class Item(Base):
    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # Internal DB UUID
    source_id = Column(String, unique=True, nullable=False)  # External ID (e.g., YouTube ID)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    thumbnail = Column(String, nullable=True)
    upload_date = Column(String, nullable=True)
    folder = Column(String, default=MEDIA_STORAGE_PATH)  # Default storage folder
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Date de création automatique

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

# Playlist Model with Default Download Settings
class Playlist(Item):
    __tablename__ = "playlists"

    check_every_day = Column(Boolean, default=False)
    last_published = Column(String, nullable=True)

    # Default Download Settings for the Playlist
    default_format = Column(Enum(DownloadFormat), default=DownloadFormat.AUDIO)  # VIDEO or AUDIO
    default_quality = Column(Enum(DownloadQuality), nullable=True, default=DownloadQuality.q_best)  # e.g., "1080p", "720p", "best"
    default_subtitles = Column(Boolean, default=False)  # Whether to download subtitles

    download_path = Column(String, nullable=False, server_default="") # server_default to avoid issues when updating existing rows

    # ForeignKey to Uploader
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("uploaders.id"), nullable=True)
    uploader = relationship("Uploader", back_populates="playlists")

    videos = relationship("PlaylistVideo", back_populates="playlist", cascade="all, delete-orphan")

# Video Model
class Video(Item):
    __tablename__ = "videos"

    duration = Column(String, nullable=True)
    available = Column(Boolean, default=True)  # Whether the video is available for download

    # ForeignKey to Uploader
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("uploaders.id"), nullable=True)
    uploader = relationship("Uploader", back_populates="videos")

    playlists = relationship("PlaylistVideo", back_populates="video")

# Association Table (Playlist ↔ Video) with Per-Video Settings & Custom Titles
class PlaylistVideo(Base):
    __tablename__ = "playlist_videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id"), nullable=False)

    state = Column(Enum(DownloadState), default=DownloadState.IDLE)

    # Per-video settings (if None, fall back to playlist defaults)
    format = Column(Enum(DownloadFormat), nullable=True)  # VIDEO or AUDIO
    quality = Column(Enum(DownloadQuality), nullable=True)  # e.g., "1080p", "720p", "best"
    subtitles = Column(Boolean, nullable=True)  # Whether to download subtitles

    # Custom title & download location per playlist
    custom_title = Column(String, nullable=True)  # Allows renaming per playlist
    custom_folder = Column(String, nullable=True)  # Allows different storage locations
    custom_download_path = Column(String, nullable=True) # Custom path format per video

    playlist = relationship("Playlist", back_populates="videos", passive_deletes=True)
    video = relationship("Video", back_populates="playlists")

# RootFolder Model for Download Folders
class RootFolder(Base):
    __tablename__ = "root_folders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    path = Column(String, unique=True, nullable=False)  # Root path for downloads
    is_default = Column(Boolean, default=False)  # Whether this is the default path

    @declared_attr
    def __table_args__(cls):
        return (UniqueConstraint('path', name='uq_root_folders'),)

class GlobalPreferences(Base):
    __tablename__ = "global_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    update_playlist_title = Column(Boolean, default=True)
    update_playlist_uploader = Column(Boolean, default=False)
    update_playlist_description = Column(Boolean, default=True)
    update_playlist_thumbnail = Column(Boolean, default=True)

    update_video_title = Column(Boolean, default=True)
    update_video_uploader = Column(Boolean, default=False)
    update_video_description = Column(Boolean, default=True)
    update_video_thumbnail = Column(Boolean, default=True)
