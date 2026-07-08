import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type JsonValue =
  | boolean
  | null
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

type PublishManifestEntry = {
  name: string;
  source: string;
  type: string;
};

const publishedAssetPrefix = "ananta-upload://";
const publishedDirectory = path.join(process.cwd(), "public", "images", "ananta", "published");
const publishedConfigPath = path.join(publishedDirectory, "editor-state.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseManifest(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is PublishManifestEntry => {
      if (!isRecord(entry)) {
        return false;
      }

      return (
        typeof entry.name === "string" &&
        typeof entry.source === "string" &&
        typeof entry.type === "string" &&
        entry.source.startsWith(publishedAssetPrefix)
      );
    });
  } catch {
    return [];
  }
}

function sanitizeNamePart(value: string) {
  return value
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "asset";
}

function safeExtension(name: string, type: string) {
  const extension = path.extname(name).toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(extension)) {
    return extension;
  }

  if (type.includes("mp4")) {
    return ".mp4";
  }
  if (type.includes("png")) {
    return ".png";
  }
  if (type.includes("jpeg") || type.includes("jpg")) {
    return ".jpg";
  }
  if (type.includes("webp")) {
    return ".webp";
  }

  return ".bin";
}

function rewritePublishedSources(value: JsonValue, replacements: Record<string, string>): JsonValue {
  if (typeof value === "string") {
    return replacements[value] ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewritePublishedSources(item, replacements));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewritePublishedSources(item, replacements)]),
    ) as JsonValue;
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const editorValue = formData.get("editor");
    if (typeof editorValue !== "string") {
      return NextResponse.json({ message: "缺少编辑器数据。" }, { status: 400 });
    }

    const editor = JSON.parse(editorValue) as JsonValue;
    const manifest = parseManifest(formData.get("manifest"));
    const replacements: Record<string, string> = {};
    const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);

    await mkdir(publishedDirectory, { recursive: true });

    for (const entry of manifest) {
      const id = entry.source.slice(publishedAssetPrefix.length);
      const file = formData.get(`upload:${id}`);
      if (!(file instanceof Blob)) {
        return NextResponse.json(
          { message: `缺少 ${entry.name} 对应的上传文件，请重新上传。` },
          { status: 400 },
        );
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const extension = safeExtension(entry.name, entry.type || file.type);
      const filename = `${stamp}-${id.slice(0, 8)}-${sanitizeNamePart(entry.name)}${extension}`;
      await writeFile(path.join(publishedDirectory, filename), bytes);
      replacements[entry.source] = `/images/ananta/published/${filename}`;
    }

    const publishedEditor = rewritePublishedSources(editor, replacements);
    const payload = {
      editor: publishedEditor,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(publishedConfigPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    return NextResponse.json({
      editor: publishedEditor,
      savedAssets: Object.values(replacements),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "发布失败。",
      },
      { status: 500 },
    );
  }
}
