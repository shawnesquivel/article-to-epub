import re
from collections.abc import Iterable

import markdown as md

from .schemas import Chapter

WORD_RE = re.compile(r"\b\w+\b")


def _word_count(text: str) -> int:
    return len(WORD_RE.findall(text))


def _markdown_to_html(markdown_text: str) -> str:
    return md.markdown(markdown_text, extensions=["extra", "sane_lists"])


def _chunk_without_headings(markdown_text: str, max_words: int = 1200) -> Iterable[Chapter]:
    paragraphs = [p.strip() for p in markdown_text.split("\n\n") if p.strip()]

    chapter_index = 1
    current: list[str] = []
    current_words = 0

    for para in paragraphs:
        para_words = _word_count(para)
        if current and current_words + para_words > max_words:
            joined = "\n\n".join(current)
            yield Chapter(title=f"Chapter {chapter_index}", html=_markdown_to_html(joined))
            chapter_index += 1
            current = []
            current_words = 0

        current.append(para)
        current_words += para_words

    if current:
        joined = "\n\n".join(current)
        yield Chapter(title=f"Chapter {chapter_index}", html=_markdown_to_html(joined))


def chapterize(markdown_text: str) -> list[Chapter]:
    lines = markdown_text.splitlines()
    chapter_map: list[dict[str, str | list[str]]] = []

    current_title = "Chapter 1"
    current_lines: list[str] = []
    heading_found = False

    for line in lines:
        heading_match = re.match(r"^(#{1,3})\s+(.+?)\s*$", line.strip())
        if heading_match:
            heading_found = True
            if current_lines:
                chapter_map.append({"title": current_title, "content": current_lines[:]})
                current_lines = []
            current_title = heading_match.group(2)
        else:
            current_lines.append(line)

    if current_lines:
        chapter_map.append({"title": current_title, "content": current_lines[:]})

    if not heading_found:
        return list(_chunk_without_headings(markdown_text))

    chapters: list[Chapter] = []
    for chapter in chapter_map:
        title = str(chapter["title"]).strip() or "Chapter"
        body_markdown = "\n".join(chapter["content"]).strip()
        if not body_markdown:
            continue
        chapters.append(Chapter(title=title, html=_markdown_to_html(body_markdown)))

    if not chapters:
        return list(_chunk_without_headings(markdown_text))

    return chapters
