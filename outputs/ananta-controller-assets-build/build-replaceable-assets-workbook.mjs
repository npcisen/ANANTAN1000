import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = process.env.PROJECT_ROOT
  ? path.resolve(process.env.PROJECT_ROOT)
  : path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs", "ananta-controller-assets");
const outputPath = path.join(outputDir, "ANANTA_CONTROLLER_REPLACEABLE_ASSETS.xlsx");
const previewPath = path.join(outputDir, "ANANTA_CONTROLLER_REPLACEABLE_ASSETS_preview.png");

function extensionToMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function imageDataUrl(relativePath) {
  if (!relativePath) return "";
  const absolutePath = path.join(root, relativePath);
  const bytes = await fs.readFile(absolutePath);
  return `data:${extensionToMime(absolutePath)};base64,${Buffer.from(bytes).toString("base64")}`;
}

function absPublic(rel) {
  if (!rel) return "";
  return path.join(root, rel.replace(/^\//, "public/"));
}

async function readFileBufferIfExists(file) {
  try {
    return await fs.readFile(file);
  } catch {
    return null;
  }
}

function readImageSize(buffer) {
  if (!buffer) return null;
  if (buffer.length > 24 && buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 9) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + length;
    }
  }

  return null;
}

function readMp4Meta(buffer) {
  if (!buffer) return null;
  const meta = { width: null, height: null, duration: null };

  function walk(start, end) {
    let offset = start;
    while (offset + 8 <= end) {
      let size = buffer.readUInt32BE(offset);
      const type = buffer.toString("ascii", offset + 4, offset + 8);
      let header = 8;

      if (size === 1 && offset + 16 <= end) {
        size = Number(buffer.readBigUInt64BE(offset + 8));
        header = 16;
      }

      if (size < header || offset + size > end) break;

      const payload = offset + header;
      const boxEnd = offset + size;

      if (type === "mvhd") {
        const version = buffer[payload];
        if (version === 0 && payload + 20 <= boxEnd) {
          const timescale = buffer.readUInt32BE(payload + 12);
          const duration = buffer.readUInt32BE(payload + 16);
          if (timescale > 0) meta.duration = duration / timescale;
        } else if (version === 1 && payload + 32 <= boxEnd) {
          const timescale = buffer.readUInt32BE(payload + 20);
          const duration = Number(buffer.readBigUInt64BE(payload + 24));
          if (timescale > 0) meta.duration = duration / timescale;
        }
      }

      if (type === "tkhd") {
        const version = buffer[payload];
        const wh = version === 1 ? payload + 88 : payload + 76;
        if (wh + 8 <= boxEnd) {
          const width = buffer.readUInt32BE(wh) / 65536;
          const height = buffer.readUInt32BE(wh + 4) / 65536;
          if (width > 0 && height > 0 && (!meta.width || width * height > meta.width * meta.height)) {
            meta.width = Math.round(width);
            meta.height = Math.round(height);
          }
        }
      }

      if (["moov", "trak", "mdia", "minf", "stbl", "edts"].includes(type)) {
        walk(payload, boxEnd);
      }

      offset = boxEnd;
    }
  }

  walk(0, buffer.length);
  return meta;
}

async function fileMeta(publicPath) {
  if (!publicPath) {
    return { format: "svg/default", dimensions: "84 x 10", duration: "" };
  }

  const file = absPublic(publicPath);
  const ext = path.extname(publicPath).slice(1).toLowerCase();
  const buffer = await readFileBufferIfExists(file);

  if (["png", "jpg", "jpeg"].includes(ext)) {
    const size = readImageSize(buffer);
    return {
      format: ext === "jpeg" ? "jpg" : ext,
      dimensions: size ? `${size.width} x ${size.height}` : "",
      duration: "",
    };
  }

  if (["mp4", "webm", "mov"].includes(ext)) {
    const meta = readMp4Meta(buffer);
    return {
      format: ext,
      dimensions: meta?.width && meta?.height ? `${meta.width} x ${meta.height}` : "",
      duration: meta?.duration ? `${meta.duration.toFixed(2)}s` : "",
    };
  }

  return { format: ext, dimensions: "", duration: "" };
}

const records = [
  {
    name: "顶部 ANANTA Logo",
    usage: "品牌标识",
    endpoint: "desktop+mobile",
    controllerField: "logoImage",
    currentPath: "",
    previewPath: "docs/asset-previews/ananta-logo-default.svg",
    notes: "当前为内联 SVG；替换建议使用透明 PNG/SVG，保持 84:10 宽高比例；移动端显示高度约 11rem。",
  },
  {
    name: "主人物视频",
    usage: "中心人物动态视频",
    endpoint: "desktop+mobile",
    controllerField: "mainVideo",
    currentPath: "/images/ananta/rebel-main.mp4",
    previewPath: "docs/asset-previews/rebel-main-frame.png",
    notes: "绿幕/纯色背景视频，由 canvas 抠像；建议竖版 9:16，当前 810x1440。",
  },
  {
    name: "主人物 fallback 图片",
    usage: "中心人物静态备用图",
    endpoint: "desktop+mobile",
    controllerField: "mainFallback",
    currentPath: "/images/ananta/look-the-rebel.png",
    previewPath: "docs/asset-previews/look-the-rebel-preview.jpg",
    notes: "视频不可播放或需要静态替代时使用；建议透明 PNG，1024x1820。",
  },
  {
    name: "桌面走马灯图",
    usage: "视频进度条胶片图",
    endpoint: "desktop",
    controllerField: "timelineDesktop",
    currentPath: "/images/ananta/rebel-timeline-desktop.jpg",
    previewPath: "docs/asset-previews/rebel-timeline-desktop-preview.jpg",
    notes: "仅桌面断点使用；原站比例 480x96。",
  },
  {
    name: "移动端走马灯图",
    usage: "移动端视频进度条胶片图",
    endpoint: "mobile",
    controllerField: "timelineMobile",
    currentPath: "/images/ananta/rebel-timeline-mobile.jpg",
    previewPath: "docs/asset-previews/rebel-timeline-mobile-preview.jpg",
    notes: "仅移动端断点使用；原站比例 1562x116。",
  },
  {
    name: "LOOK 缩略图 1 图片",
    usage: "LOOK 导航静态图",
    endpoint: "fallback/mobile-reference",
    controllerField: "thumb.0.src",
    currentPath: "/images/ananta/look-the-kiddo.png",
    previewPath: "docs/asset-previews/look-the-kiddo-preview.jpg",
    notes: "用于第 1 个 LOOK 静态图；建议透明 PNG，1024x1820。",
  },
  {
    name: "LOOK 缩略图 1 视频",
    usage: "LOOK 导航动态图",
    endpoint: "desktop+mobile",
    controllerField: "thumb.0.video",
    currentPath: "/images/ananta/ghost-the-kiddo.mp4",
    previewPath: "docs/asset-previews/ghost-the-kiddo-frame.png",
    notes: "用于第 1 个 LOOK 动态缩略图；当前同时复用于后排人物。",
  },
  {
    name: "LOOK 缩略图 2 图片",
    usage: "当前 LOOK 静态图",
    endpoint: "fallback/mobile-reference",
    controllerField: "thumb.1.src",
    currentPath: "/images/ananta/look-the-rebel.png",
    previewPath: "docs/asset-previews/look-the-rebel-preview.jpg",
    notes: "用于当前 LOOK 静态图；建议透明 PNG，1024x1820。",
  },
  {
    name: "LOOK 缩略图 2 视频",
    usage: "当前 LOOK 动态缩略图",
    endpoint: "desktop+mobile",
    controllerField: "thumb.1.video",
    currentPath: "/images/ananta/rebel-thumb.mp4",
    previewPath: "docs/asset-previews/rebel-thumb-frame.png",
    notes: "用于当前 LOOK 动态缩略图；建议方形视频。",
  },
  {
    name: "LOOK 缩略图 3 图片",
    usage: "LOOK 导航静态图",
    endpoint: "fallback/mobile-reference",
    controllerField: "thumb.2.src",
    currentPath: "/images/ananta/look-the-warrior.png",
    previewPath: "docs/asset-previews/look-the-warrior-preview.jpg",
    notes: "用于第 3 个 LOOK 静态图；建议透明 PNG，1024x1820。",
  },
  {
    name: "LOOK 缩略图 3 视频",
    usage: "LOOK 导航动态图",
    endpoint: "desktop+mobile",
    controllerField: "thumb.2.video",
    currentPath: "/images/ananta/ghost-the-warrior.mp4",
    previewPath: "docs/asset-previews/ghost-the-warrior-frame.png",
    notes: "用于第 3 个 LOOK 动态缩略图；当前同时复用于后排人物。",
  },
  {
    name: "后排人物 1 视频",
    usage: "左侧远景人物",
    endpoint: "desktop-only-hidden-on-mobile",
    controllerField: "ghostSirenVideo",
    currentPath: "/images/ananta/ghost-the-siren.mp4",
    previewPath: "docs/asset-previews/ghost-the-siren-frame.png",
    notes: "后排人物远景层；移动端当前隐藏。",
  },
  {
    name: "后排人物 2 视频",
    usage: "左侧中景人物",
    endpoint: "desktop+mobile",
    controllerField: "ghostKiddoVideo",
    currentPath: "/images/ananta/ghost-the-kiddo.mp4",
    previewPath: "docs/asset-previews/ghost-the-kiddo-frame.png",
    notes: "后排人物中景层；移动端保留但更淡。",
  },
  {
    name: "后排人物 3 视频",
    usage: "右侧中景人物",
    endpoint: "desktop+mobile",
    controllerField: "ghostWarriorVideo",
    currentPath: "/images/ananta/ghost-the-warrior.mp4",
    previewPath: "docs/asset-previews/ghost-the-warrior-frame.png",
    notes: "后排人物中景层；移动端保留但更淡。",
  },
  {
    name: "后排人物 4 视频",
    usage: "右侧远景人物",
    endpoint: "desktop-only-hidden-on-mobile",
    controllerField: "ghostDominaVideo",
    currentPath: "/images/ananta/ghost-the-domina.mp4",
    previewPath: "docs/asset-previews/ghost-the-domina-frame.png",
    notes: "后排人物远景层；移动端当前隐藏。",
  },
  {
    name: "商品 1 缩略图",
    usage: "底部商品栏图片",
    endpoint: "desktop+mobile",
    controllerField: "product.0.image",
    currentPath: "/images/ananta/product-nikita-thumb.jpg",
    previewPath: "docs/asset-previews/product-nikita-thumb-preview.jpg",
    notes: "商品栏缩略图；当前 40x60，显示时裁进 24x24/移动端商品卡。",
  },
  {
    name: "商品 2 缩略图",
    usage: "底部商品栏图片",
    endpoint: "desktop+mobile",
    controllerField: "product.1.image",
    currentPath: "/images/ananta/product-beatrix-thumb.jpg",
    previewPath: "docs/asset-previews/product-beatrix-thumb-preview.jpg",
    notes: "商品栏缩略图；当前 40x60，显示时裁进 24x24/移动端商品卡。",
  },
];
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("可替换素材清单");
sheet.showGridLines = false;

const columns = [
  "名称",
  "用途",
  "端类型",
  "控制器字段",
  "格式",
  "尺寸",
  "视频时长",
  "当前文件路径",
  "示例图",
  "建议/备注",
];

sheet.getRange("A1:J1").merge();
sheet.getRange("A1").values = [["Ananta 页面可替换素材清单"]];
sheet.getRange("A2:J2").values = [columns];

const matrix = await Promise.all(
  records.map(async (record) => {
    const meta = await fileMeta(record.currentPath);

    return [
      record.name,
      record.usage,
      record.endpoint,
      record.controllerField,
      meta.format,
      meta.dimensions,
      meta.duration,
      record.currentPath ? `public${record.currentPath}` : "inline SVG default",
      "",
      record.notes,
    ];
  }),
);

sheet.getRangeByIndexes(2, 0, matrix.length, columns.length).values = matrix;

sheet.getRange("A1:J1").format = {
  fill: "#0A0A0A",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
sheet.getRange("A2:J2").format = {
  fill: "#E6E6E6",
  font: { bold: true, color: "#0A0A0A" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: "#CFCFCF" },
};
sheet.getRangeByIndexes(2, 0, matrix.length, columns.length).format = {
  fill: "#FFFFFF",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#E2E2E2" },
};

const widths = [22, 24, 22, 22, 10, 16, 14, 42, 24, 46];
widths.forEach((width, index) => {
  sheet.getRangeByIndexes(0, index, matrix.length + 2, 1).format.columnWidth = width;
});
sheet.getRange("A1:J1").format.rowHeight = 28;
sheet.getRange("A2:J2").format.rowHeight = 24;

for (let rowIndex = 0; rowIndex < records.length; rowIndex += 1) {
  const sheetRow = rowIndex + 2;
  sheet.getRangeByIndexes(sheetRow, 0, 1, columns.length).format.rowHeightPx = 112;
  const preview = records[rowIndex].previewPath;
  if (!preview) continue;
  const dataUrl = await imageDataUrl(preview);
  sheet.images.add({
    dataUrl,
    anchor: {
      from: { row: sheetRow, col: 8, rowOffsetPx: 8, colOffsetPx: 8 },
      extent: { widthPx: 130, heightPx: 92 },
    },
  });
}

sheet.freezePanes.freezeRows(2);

const notes = workbook.worksheets.add("字段说明");
notes.showGridLines = false;
notes.getRange("A1:D1").merge();
notes.getRange("A1").values = [["使用说明"]];
notes.getRange("A2:D8").values = [
  ["字段", "说明", "如何使用", "备注"],
  ["控制器字段", "对应页面控制器里的素材目标", "在 ?controller=1 的下拉框中选择同名项，或调用 window.anantaPageController.setAsset(field, path)", "例如 mainVideo、timelineMobile、logoImage"],
  ["端类型", "desktop / mobile / desktop+mobile 标记", "替换素材时按端类型准备不同资源", "移动端走马灯素材已经单独区分"],
  ["尺寸", "当前素材原始尺寸", "尽量保持同尺寸或同比例替换", "视频行同时给出时长"],
  ["示例图", "已经嵌入在表格中的预览", "用于快速确认素材位置", "视频使用首帧预览"],
  ["文件路径", "当前项目内的真实文件路径", "长期替换建议把素材放到 public/images/... 后填 /images/...", "上传文件只适合临时预览"],
  ["Logo", "原 ANANTA 是内联 SVG", "现在可通过 logoImage 替换", "建议保持 84:10 宽高比例"],
];
notes.getRange("A1:D1").format = {
  fill: "#0A0A0A",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "center",
};
notes.getRange("A2:D2").format = {
  fill: "#E6E6E6",
  font: { bold: true },
  borders: { preset: "all", style: "thin", color: "#CFCFCF" },
};
notes.getRange("A3:D8").format = {
  wrapText: true,
  verticalAlignment: "top",
  borders: { preset: "all", style: "thin", color: "#E2E2E2" },
};
[18, 34, 56, 34].forEach((width, index) => {
  notes.getRangeByIndexes(0, index, 8, 1).format.columnWidth = width;
});
notes.getRange("A1:D1").format.rowHeight = 28;
notes.getRange("A3:D8").format.rowHeight = 52;

await fs.mkdir(outputDir, { recursive: true });
const render = await workbook.render({
  sheetName: "可替换素材清单",
  range: "A1:J12",
  scale: 1,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await render.arrayBuffer()));

const inspect = await workbook.inspect({
  kind: "table",
  range: "可替换素材清单!A1:J8",
  include: "values",
  tableMaxRows: 8,
  tableMaxCols: 10,
  maxChars: 4000,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);
