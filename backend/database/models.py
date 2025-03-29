from sqlalchemy import Column, String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship, declared_attr
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from enum import Enum as PyEnum

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

# Uploader Model
class Uploader(Base):
    __tablename__ = "uploaders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id = Column(String, unique=True, nullable=False)  # External ID (e.g., YouTube ID)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)

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
    folder = Column(String, nullable=False)  # Default storage folder

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
    default_quality = Column(String, nullable=True, default="best")  # e.g., "1080p", "720p", "best"
    default_subtitles = Column(Boolean, default=False)  # Whether to download subtitles

    # ForeignKey to Uploader
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("uploaders.id"), nullable=True)
    uploader = relationship("Uploader", back_populates="playlists")

    videos = relationship("PlaylistVideo", back_populates="playlist")

# Video Model
class Video(Item):
    __tablename__ = "videos"

    duration = Column(String, nullable=True)

    # ForeignKey to Uploader
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("uploaders.id"), nullable=True)
    uploader = relationship("Uploader", back_populates="videos")

    playlists = relationship("PlaylistVideo", back_populates="video")

# Association Table (Playlist ↔ Video) with Per-Video Settings & Custom Titles
class PlaylistVideo(Base):
    __tablename__ = "playlist_videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id"), nullable=False)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id"), nullable=False)

    state = Column(Enum(DownloadState), default=DownloadState.IDLE)

    # Per-video settings (if None, fall back to playlist defaults)
    format = Column(Enum(DownloadFormat), nullable=True)  # VIDEO or AUDIO
    quality = Column(String, nullable=True)  # e.g., "1080p", "720p", "best"
    subtitles = Column(Boolean, nullable=True)  # Whether to download subtitles

    # Custom title & download location per playlist
    custom_title = Column(String, nullable=True)  # Allows renaming per playlist
    custom_folder = Column(String, nullable=True)  # Allows different storage locations

    playlist = relationship("Playlist", back_populates="videos")
    video = relationship("Video", back_populates="playlists")
