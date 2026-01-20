from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ScrapedContent:
    text: str
    title: Optional[str] = None
    author: Optional[str] = None
    thumbnail: Optional[str] = None
    extra_metadata: dict = field(default_factory=dict)


class ContentScraper(ABC):
    @abstractmethod
    async def can_handle(self, url: str) -> bool:
        pass

    @abstractmethod
    async def scrape(self, url: str) -> ScrapedContent:
        pass
