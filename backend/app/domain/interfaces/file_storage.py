from abc import ABC, abstractmethod


class IFileStorage(ABC):
    @abstractmethod
    async def save_file(self, content: bytes, filename: str) -> str:
        """Saves file content and returns stored relative or absolute file path."""
        pass

    @abstractmethod
    async def read_file(self, file_path: str) -> bytes:
        """Reads file bytes from storage."""
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """Deletes file from storage."""
        pass
