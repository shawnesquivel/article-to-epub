import secrets
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, HttpUrl

from .chapterizer import chapterize
from .epub_builder import build_epub
from .extractor import ArticleExtractionError, fetch_article

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(title="Article to EPUB")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

generated_files: dict[str, Path] = {}


class CreateEpubRequest(BaseModel):
    url: HttpUrl


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    page = STATIC_DIR / "index.html"
    return page.read_text(encoding="utf-8")


@app.post("/api/epub")
def create_epub(payload: CreateEpubRequest) -> dict[str, str | int]:
    try:
        article = fetch_article(str(payload.url))
        chapters = chapterize(article.markdown)
        if not chapters:
            raise HTTPException(status_code=422, detail="No chapter content could be created.")
        epub_path = build_epub(article, chapters, OUTPUT_DIR)
    except ArticleExtractionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"EPUB generation failed: {exc}") from exc

    file_id = secrets.token_urlsafe(12)
    generated_files[file_id] = epub_path
    return {
        "fileId": file_id,
        "title": article.title,
        "chapters": len(chapters),
        "downloadUrl": f"/api/download/{file_id}",
    }


@app.get("/api/download/{file_id}")
def download_epub(file_id: str) -> FileResponse:
    epub_path = generated_files.get(file_id)
    if not epub_path or not epub_path.exists():
        raise HTTPException(status_code=404, detail="File not found or expired.")
    return FileResponse(epub_path, media_type="application/epub+zip", filename=epub_path.name)
