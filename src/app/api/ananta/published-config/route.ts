import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const publishedConfigPath = path.join(
  process.cwd(),
  "public",
  "images",
  "ananta",
  "published",
  "editor-state.json",
);

export async function GET() {
  try {
    const content = await readFile(publishedConfigPath, "utf8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ message: "还没有已发布的 Ananta 版本。" }, { status: 404 });
  }
}
