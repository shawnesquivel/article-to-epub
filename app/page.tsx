"use client";

import { FormEvent, useState } from "react";

type UiState = "idle" | "loading" | "success" | "error";

function Spinner() {
  return (
    <svg className="inline-block h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<UiState>("idle");
  const [message, setMessage] = useState("");
  const [downloadHref, setDownloadHref] = useState("");
  const [downloadName, setDownloadName] = useState("article.epub");
  const [chapterCount, setChapterCount] = useState<number | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);

  const resetDownload = () => {
    if (downloadHref) URL.revokeObjectURL(downloadHref);
    setDownloadHref("");
    setDownloadName("article.epub");
    setChapterCount(null);
    setArticleTitle("");
    setElapsed(null);
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetDownload();
    setStatus("loading");
    setMessage("");

    const t0 = performance.now();
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const json = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error || `Conversion failed (${response.status}).`);
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const contentDisposition = response.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] || "article.epub";
      const chapters = Number(response.headers.get("X-Chapter-Count") || "0");
      const inferredTitle = (() => {
        try {
          return new URL(url).hostname.replace(/^www\./, "");
        } catch {
          return "Article";
        }
      })();

      setDownloadHref(fileUrl);
      setDownloadName(filename);
      setArticleTitle(inferredTitle);
      setChapterCount(Number.isNaN(chapters) ? null : chapters);
      setElapsed(Math.round(performance.now() - t0));
      setStatus("success");
      setMessage("EPUB ready.");
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Unexpected conversion error.";
      setStatus("error");
      setMessage(errMessage);
    }
  }

  return (
    <div className="min-h-svh flex flex-col">
      {/* Top nav bar */}
      <header className="border-b border-neutral-200 px-6 h-14 flex items-center shrink-0">
        <span className="text-[15px] font-semibold tracking-tight text-neutral-900">Article to EPUB</span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-6 pt-16 pb-24">
        <div className="w-full max-w-xl">
          {/* Page heading */}
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Convert</h1>
          <p className="mt-1 text-sm text-neutral-500">Paste an article URL and get a downloadable EPUB.</p>

          {/* How it works */}
          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                <svg className="h-[18px] w-[18px] text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Paste URL</p>
                <p className="text-xs text-neutral-400">Any static article</p>
              </div>
            </div>

            <svg className="h-4 w-4 shrink-0 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                <svg className="h-4.5 w-4.5 text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">Get EPUB</p>
                <p className="text-xs text-neutral-400">Ready for Apple Books</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 border-t border-neutral-200" />

          {/* Form */}
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-neutral-700">
                Article URL
              </label>
              <input
                id="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://darioamodei.com/essay/machines-of-loving-grace"
                className="mt-1.5 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" && <Spinner />}
              {status === "loading" ? "Converting..." : "Create EPUB"}
            </button>
          </form>

          {/* Error */}
          {status === "error" && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}

          {/* Success result */}
          {status === "success" && downloadHref && (
            <div className="mt-6 rounded-md border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{downloadName}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {articleTitle}
                    {typeof chapterCount === "number" && chapterCount > 0 && <> &middot; {chapterCount} chapters</>}
                    {typeof elapsed === "number" && <> &middot; {(elapsed / 1000).toFixed(1)}s</>}
                  </p>
                </div>
                <a
                  href={downloadHref}
                  download={downloadName}
                  className="shrink-0 rounded-md bg-violet-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                >
                  Download
                </a>
              </div>
              <p className="mt-3 text-xs text-neutral-400">File is cleared when you convert another article.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
