from dataclasses import dataclass


@dataclass(slots=True)
class ExtractedArticle:
    url: str
    title: str
    author: str | None
    markdown: str


@dataclass(slots=True)
class Chapter:
    title: str
    html: str
