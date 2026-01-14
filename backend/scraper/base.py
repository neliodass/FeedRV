from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ScrapedContent:
    text: str
    images: list[str]
    metadata: dict


class ContentScraper(ABC):
    @abstractmethod
    async def can_handle(self, url: str) -> bool:
        pass

    @abstractmethod
    async def scrape(self, url: str) -> ScrapedContent:
        pass
