# Article to EPUB (Next.js)

Single Next.js app (frontend + backend API) that takes an article URL and returns an EPUB download.

## Current Scope
- URL input in web UI
- article extraction (static blogs/articles)
- chapter splitting
- EPUB generation in memory
- direct download in browser
- no persistent generated files

## App Structure
- `app/page.tsx` - UI and download flow
- `app/api/convert/route.ts` - conversion API endpoint
- `lib/extract.ts` - article extraction
- `lib/chapterize.ts` - chapter logic
- `lib/epub.ts` - EPUB builder

The previous Python prototype is kept under `python_backend/` for reference.

## Local Development
```bash
cd /Users/shawnesquivel/GitHub/article-to-epub
npm install
npm run dev
```

Open:
- http://localhost:3000

## Production Build
```bash
npm run build
npm run start
```

## API
- `POST /api/convert`
  - body: `{ "url": "https://..." }`
  - returns: EPUB binary (`application/epub+zip`)

## File Lifetime Behavior
- The frontend uses an object URL for the generated Blob.
- On each new conversion, the previous object URL is revoked.
- Net effect: generated file disappears when user converts another article.

## Timeout Notes (Measured)
Benchmark against:
- `https://darioamodei.com/essay/machines-of-loving-grace`

Measured in production mode:
- first run: ~0.32s
- warm runs: ~0.13s to ~0.15s

This is well below typical serverless timeout limits for static article inputs.
