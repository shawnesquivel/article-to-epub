import epub from "epub-gen-memory";
import slugify from "slugify";

import type { Chapter } from "./chapterize";
import type { ExtractedArticle } from "./extract";

type BuildResult = {
  bytes: Uint8Array;
  filename: string;
};

function sanitizeChapterHtml(chapterHtml: string): string {
  return chapterHtml.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export async function buildEpub(article: ExtractedArticle, chapters: Chapter[]): Promise<BuildResult> {
  const css = `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; }
h1, h2, h3 { line-height: 1.3; margin-top: 1.1em; }
p { margin: 0.75em 0; }
a { color: #0b65d8; text-decoration: none; }
`.trim();

  const content = chapters.map((chapter) => ({
    title: chapter.title,
    content: `${sanitizeChapterHtml(chapter.html)}<p><em>Source:</em> <a href="${article.url}">${article.url}</a></p>`,
  }));

  const buffer = await epub(
    {
      title: article.title,
      author: article.author || "Unknown",
      description: `Generated from ${article.url}`,
      lang: "en",
      css,
      version: 3,
      prependChapterTitles: true,
    },
    content
  );

  const safeBase = slugify(article.title, { lower: true, strict: true }) || "article";
  const filename = `${safeBase}.epub`;
  return { bytes: new Uint8Array(buffer), filename };
}
