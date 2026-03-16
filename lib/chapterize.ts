import { parse } from "node-html-parser";

export type Chapter = {
  title: string;
  html: string;
};

const WORD_RE = /\b\w+\b/g;

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, " ");
}

function wordCount(input: string): number {
  return stripTags(input).match(WORD_RE)?.length ?? 0;
}

function chunkByWordCount(contentHtml: string, maxWords: number): Chapter[] {
  const paragraphBlocks = contentHtml
    .split(/<\/p>/i)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (block.toLowerCase().endsWith("</p>") ? block : `${block}</p>`));

  const chapters: Chapter[] = [];
  let current: string[] = [];
  let currentWords = 0;
  let index = 1;

  for (const block of paragraphBlocks) {
    const wc = wordCount(block);
    if (current.length > 0 && currentWords + wc > maxWords) {
      chapters.push({ title: `Chapter ${index}`, html: current.join("\n") });
      index += 1;
      current = [];
      currentWords = 0;
    }
    current.push(block);
    currentWords += wc;
  }

  if (current.length > 0) {
    chapters.push({ title: `Chapter ${index}`, html: current.join("\n") });
  }

  return chapters;
}

export function chapterize(contentHtml: string): Chapter[] {
  const root = parse(contentHtml);
  const allNodes = root.querySelectorAll("h1, h2, h3, p, ul, ol, blockquote, pre");

  const chapters: Chapter[] = [];
  let currentTitle = "Chapter 1";
  let currentParts: string[] = [];
  let hasHeadings = false;

  for (const node of allNodes) {
    const tag = node.tagName.toLowerCase();
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      hasHeadings = true;
      if (currentParts.length > 0) {
        chapters.push({ title: currentTitle, html: currentParts.join("\n") });
        currentParts = [];
      }
      currentTitle = node.textContent.trim() || currentTitle;
    } else {
      currentParts.push(node.toString());
    }
  }

  if (currentParts.length > 0) {
    chapters.push({ title: currentTitle, html: currentParts.join("\n") });
  }

  const filtered = chapters.filter((chapter) => wordCount(chapter.html) > 25);
  if (hasHeadings && filtered.length > 0) {
    return filtered;
  }

  return chunkByWordCount(contentHtml, 1200);
}
