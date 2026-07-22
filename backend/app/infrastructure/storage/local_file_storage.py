import os
import uuid
import aiofiles
from app.core.config import settings
from app.domain.exceptions.answer_script import FileStorageException
from app.domain.interfaces.file_storage import IFileStorage


class LocalFileStorage(IFileStorage):
    """Local disk file storage adapter."""

    def __init__(self, upload_dir: str = settings.UPLOAD_DIR):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, content: bytes, filename: str) -> str:
        try:
            ext = os.path.splitext(filename)[1].lower()
            unique_filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(self.upload_dir, unique_filename)

            async with aiofiles.open(file_path, "wb") as f:
                await f.write(content)

            return file_path
        except Exception as e:
            raise FileStorageException(str(e))

    async def read_file(self, file_path: str) -> bytes:
        try:
            if not os.path.exists(file_path):
                raise FileStorageException(f"File not found at path: {file_path}")
            async with aiofiles.open(file_path, "rb") as f:
                return await f.read()
        except Exception as e:
            raise FileStorageException(str(e))

    async def delete_file(self, file_path: str) -> bool:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            raise FileStorageException(str(e))
