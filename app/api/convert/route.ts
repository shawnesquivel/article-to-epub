import { NextRequest, NextResponse } from "next/server";

import { chapterize } from "@/lib/chapterize";
import { buildEpub } from "@/lib/epub";
import { extractArticle } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

type RequestBody = { url?: string };

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  try {
    const article = await extractArticle(url);
    const chapters = chapterize(article.contentHtml);
    if (chapters.length === 0) {
      return NextResponse.json({ error: "Could not create chapters from content." }, { status: 422 });
    }

    const epub = await buildEpub(article, chapters);
    return new NextResponse(Buffer.from(epub.bytes), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${epub.filename}"`,
        "X-Chapter-Count": String(chapters.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to convert article.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
