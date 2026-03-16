import json

import trafilatura

from .schemas import ExtractedArticle


class ArticleExtractionError(Exception):
    pass


def fetch_article(url: str) -> ExtractedArticle:
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        raise ArticleExtractionError("Failed to fetch article URL.")

    markdown = trafilatura.extract(
        downloaded,
        url=url,
        output_format="markdown",
        include_comments=False,
        include_tables=False,
        favor_precision=True,
    )
    if not markdown:
        raise ArticleExtractionError("Failed to extract readable article content.")

    metadata_json = trafilatura.extract(
        downloaded,
        url=url,
        output_format="json",
        with_metadata=True,
        include_comments=False,
        include_tables=False,
        favor_precision=True,
    )

    title = "Untitled Article"
    author = None
    if metadata_json:
        try:
            metadata = json.loads(metadata_json)
            title = metadata.get("title") or title
            author = metadata.get("author")
        except json.JSONDecodeError:
            pass

    return ExtractedArticle(
        url=url,
        title=title.strip(),
        author=author.strip() if isinstance(author, str) else None,
        markdown=markdown.strip(),
    )
