import { extract } from "@extractus/article-extractor";

export type ExtractedArticle = {
  title: string;
  author: string;
  url: string;
  contentHtml: string;
};

export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const article = await extract(url, { contentLengthThreshold: 200 }, { signal: AbortSignal.timeout(20_000) });
  if (!article?.content) {
    throw new Error("Could not extract article content from URL.");
  }

  return {
    title: (article.title || "Untitled Article").trim(),
    author: (article.author || "Unknown").trim(),
    url: article.url || url,
    contentHtml: article.content.trim(),
  };
}
