import html
import re
import uuid
from datetime import UTC, datetime
from pathlib import Path

from ebooklib import epub

from .schemas import Chapter, ExtractedArticle


def _slugify(value: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return clean or "article"


def build_epub(article: ExtractedArticle, chapters: list[Chapter], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)

    book = epub.EpubBook()
    book_id = str(uuid.uuid4())
    book.set_identifier(book_id)
    book.set_title(article.title)
    book.set_language("en")
    if article.author:
        book.add_author(article.author)
    else:
        book.add_author("Unknown")

    css = epub.EpubItem(
        uid="style_main",
        file_name="styles/main.css",
        media_type="text/css",
        content="""
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }
h1, h2, h3 { line-height: 1.3; margin-top: 1.2em; }
p { margin: 0.7em 0; }
""".strip(),
    )
    book.add_item(css)

    epub_chapters = []
    for idx, chapter in enumerate(chapters, start=1):
        chapter_file = f"chap_{idx:03d}.xhtml"
        chapter_item = epub.EpubHtml(title=chapter.title, file_name=chapter_file, lang="en")
        chapter_item.content = (
            f"<h1>{html.escape(chapter.title)}</h1>\n"
            f"{chapter.html}\n"
            "<p><em>Source:</em> "
            f'<a href="{html.escape(article.url)}">{html.escape(article.url)}</a></p>'
        )
        chapter_item.add_item(css)
        book.add_item(chapter_item)
        epub_chapters.append(chapter_item)

    book.toc = tuple(epub_chapters)
    book.spine = ["nav", *epub_chapters]
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    ts = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
    output_name = f"{_slugify(article.title)}-{ts}.epub"
    output_path = output_dir / output_name
    epub.write_epub(str(output_path), book, {})
    return output_path
