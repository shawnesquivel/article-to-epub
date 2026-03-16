# Tooling Research (V1 Focus)

## Goal
Input URL -> clean article extraction -> chapter organization -> EPUB download in web UI.

## Strong Candidates

### Article Extraction
- **Python: `trafilatura`**  
  Widely used, actively maintained, strong text quality on messy pages, metadata support.
- **TypeScript: `@mozilla/readability` (+ `jsdom`)**  
  Very popular and stable, but requires more assembly and often more fallback logic.
- **TypeScript: `@postlight/parser` / `@extractus/article-extractor`**  
  Useful options, but extraction consistency varies by site class.

### EPUB Generation
- **Python: `EbookLib`**  
  Mature and practical for custom chapter control. Strong fit for V1 where EPUB structure is core.
- **Validation: `epubcheck`**  
  Official conformance checker. Should be in CI once V1 is stable.
- **TypeScript: `epub-gen-memory`**  
  Good TS option; usable if we later want a pure Node stack.

## Recommended V1 Stack
- **Backend core:** Python (`FastAPI` + `trafilatura` + `EbookLib`)
- **UI:** simple web page served by FastAPI (minimal modern style)
- **Optional V1.1 quality gate:** run `epubcheck` on generated files

Reason: fastest path to dependable EPUB output without reinventing parsing or packaging.

## Modular Architecture
- `extractor`: URL fetching + readability extraction + metadata
- `chapterizer`: split content into chapter units (headings first, length fallback)
- `epub_builder`: package metadata/chapters/css into EPUB
- `api`: endpoint orchestration, validation, error handling, download route
- `ui`: single form + status + download action

## V2 Placeholder (Not Implemented)
- image harvesting from source article
- compression/resizing profile per device
- file sidecar folder structure for traceability

## Risks / Hard Parts
- Sites with heavy JS rendering, paywalls, or anti-bot protection
- Chapterization quality when articles have weak structure
- EPUB compatibility variance across readers without strict validation

## Mitigations
- Add fallback extractor chain (playwright render pass -> readability)
- Add chapter quality heuristics and optional LLM cleanup later
- Add `epubcheck` validation and regression sample set
