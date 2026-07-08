import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const outputDir = path.dirname(__filename);
const projectRoot = path.resolve(outputDir, "..", "..");
const previewDir = path.join(projectRoot, "docs", "asset-previews");
const xlsxPath = path.join(outputDir, "asset_visual_table_with_images.xlsx");
const previewPath = path.join(outputDir, "asset_visual_table_preview.png");

async function imageDataUrl(relativePreviewPath) {
  const filePath = path.join(projectRoot, relativePreviewPath);
  const bytes = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function fitSize(width, height, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    widthPx: Math.max(1, Math.round(width * scale)),
    heightPx: Math.max(1, Math.round(height * scale)),
  };
}

async function getImageSize(relativePreviewPath) {
  const filePath = path.join(projectRoot, relativePreviewPath);
  const bytes = await fs.readFile(filePath);
  if (bytes[0] === 0x89 && bytes[1] === 0x50) {
    return {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) break;
      const marker = bytes[offset + 1];
      const length = bytes.readUInt16BE(offset + 2);
      if (
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3
      ) {
        return {
          height: bytes.readUInt16BE(offset + 5),
          width: bytes.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }
  return { width: 120, height: 90 };
}

async function addImage(sheet, row, col, relativePreviewPath, maxWidth, maxHeight) {
  const dataUrl = await imageDataUrl(relativePreviewPath);
  const natural = await getImageSize(relativePreviewPath);
  const size = fitSize(natural.width, natural.height, maxWidth, maxHeight);
  sheet.images.add({
    dataUrl,
    anchor: {
      from: { row, col },
      extent: size,
      rowOffsetPx: 8,
      colOffsetPx: 8,
    },
  });
}

const sourceRows = [
  ["主角主视频", "docs/asset-previews/rebel-main-frame.png", "MP4", "810 x 1440, 6s", "原站 canvas 中主角约 304 x 845", "public/images/ananta/rebel-main.mp4", "主视觉视频，建议新素材使用竖版 MP4"],
  ["主角缩略视频", "docs/asset-previews/rebel-thumb-frame.png", "MP4", "100 x 100, 5s", "原站顶部/横向栏缩略视频 24 x 24", "public/images/ananta/rebel-thumb.mp4", "用于 look 导航或缩略入口"],
  ["后排视频 Siren", "docs/asset-previews/ghost-the-siren-frame.png", "MP4", "100 x 100, 5s", "当前模板后排视频按原尺寸 100 x 100 显示", "public/images/ananta/ghost-the-siren.mp4", "后排动态人物视频"],
  ["后排视频 Kiddo", "docs/asset-previews/ghost-the-kiddo-frame.png", "MP4", "100 x 100, 5s", "当前模板后排视频按原尺寸 100 x 100 显示", "public/images/ananta/ghost-the-kiddo.mp4", "后排动态人物视频"],
  ["后排视频 Warrior", "docs/asset-previews/ghost-the-warrior-frame.png", "MP4", "100 x 100, 5s", "当前模板后排视频按原尺寸 100 x 100 显示", "public/images/ananta/ghost-the-warrior.mp4", "后排动态人物视频"],
  ["后排视频 Domina", "docs/asset-previews/ghost-the-domina-frame.png", "MP4", "100 x 100, 5s", "当前模板后排视频按原尺寸 100 x 100 显示", "public/images/ananta/ghost-the-domina.mp4", "后排动态人物视频"],
  ["Look 图片原始尺寸 Rebel", "docs/asset-previews/look-the-rebel-preview.jpg", "PNG", "1024 x 1820", "主角 fallback；右上缩略容器 24 x 24", "public/images/ananta/look-the-rebel.png", "人物静态图"],
  ["Look 图片 Kiddo", "docs/asset-previews/look-the-kiddo-preview.jpg", "PNG", "1024 x 1820", "右上缩略容器 24 x 24，顶部裁切", "public/images/ananta/look-the-kiddo.png", "人物静态图"],
  ["Look 图片 Warrior", "docs/asset-previews/look-the-warrior-preview.jpg", "PNG", "1024 x 1820", "右上缩略容器 24 x 24，顶部裁切", "public/images/ananta/look-the-warrior.png", "人物静态图"],
  ["Look 图片 Siren", "docs/asset-previews/look-the-siren-preview.jpg", "PNG", "1024 x 1820", "当前作为隐藏 fallback 使用", "public/images/ananta/look-the-siren.png", "人物静态图"],
  ["Look 图片 Domina", "docs/asset-previews/look-the-domina-preview.jpg", "PNG", "1024 x 1820", "当前作为隐藏 fallback 使用", "public/images/ananta/look-the-domina.png", "人物静态图"],
  ["时间轴桌面图", "docs/asset-previews/rebel-timeline-desktop-preview.jpg", "JPG", "480 x 96", "原站桌面显示约 175.4 x 24", "public/images/ananta/rebel-timeline-desktop.jpg", "视频时间轴胶片图"],
  ["时间轴移动图", "docs/asset-previews/rebel-timeline-mobile-preview.jpg", "JPG", "1562 x 116", "当前组件未单独启用", "public/images/ananta/rebel-timeline-mobile.jpg", "移动端时间轴备用图"],
  ["商品缩略图 Nikita", "docs/asset-previews/product-nikita-thumb-preview.jpg", "JPG", "40 x 60", "原站/模板商品栏显示 24 x 24", "public/images/ananta/product-nikita-thumb.jpg", "底部商品栏缩略图"],
  ["商品缩略图 Beatrix", "docs/asset-previews/product-beatrix-thumb-preview.jpg", "JPG", "40 x 60", "原站/模板商品栏显示 24 x 24", "public/images/ananta/product-beatrix-thumb.jpg", "底部商品栏缩略图"],
  ["商品详情图 Nikita", "docs/asset-previews/product-nikita-body-black-preview.jpg", "JPG", "2000 x 3000", "当前首屏不显示；用于后续商品详情", "public/images/ananta/product-nikita-body-black.jpg", "商品详情扩展素材"],
  ["商品详情图 Beatrix", "docs/asset-previews/product-beatrix-coat-preview.jpg", "JPG", "2000 x 3000", "当前首屏不显示；用于后续商品详情", "public/images/ananta/product-beatrix-coat.jpg", "商品详情扩展素材"],
];

const ratioRows = [
  ["左侧远景人物", "docs/asset-previews/original-left-far-crop.jpg", "Canvas 截图裁切", "截图测量", "78 x 348，相对主角高度 41%", "", "最远、最淡，靠左边缘"],
  ["左侧中景人物", "docs/asset-previews/original-left-mid-crop.jpg", "Canvas 截图裁切", "截图测量", "181 x 534，相对主角高度 63%", "", "后排中景人物"],
  ["主角人物", "docs/asset-previews/original-main-crop.jpg", "Canvas 截图裁切", "截图测量", "304 x 845，相对主角高度 100%", "", "主视觉人物"],
  ["右侧中景人物", "docs/asset-previews/original-right-mid-crop.jpg", "Canvas 截图裁切", "截图测量", "177 x 485，相对主角高度 57%", "", "后排中景人物"],
  ["右侧远景人物", "docs/asset-previews/original-right-far-crop.jpg", "Canvas 截图裁切", "截图测量", "99 x 272，相对主角高度 32%", "", "最远、最淡，靠右边缘"],
  ["时间轴在原站中的显示", "docs/asset-previews/original-timeline-crop.jpg", "截图裁切", "截图测量", "175.4 x 24", "", "左侧信息区下方"],
  ["商品栏在原站中的显示", "docs/asset-previews/original-product-bar-crop.jpg", "截图裁切", "截图测量", "626.7 x 28", "", "左下角固定栏"],
  ["右上 Look 导航", "docs/asset-previews/original-look-nav-crop.jpg", "截图裁切", "截图测量", "视频缩略图 24 x 24", "", "右上角 look 切换栏"],
];

const workbook = Workbook.create();

async function buildSheet(name, rows) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;

  sheet.getRange("A1:G1").values = [["名称", "例图", "格式", "源文件尺寸", "原站/模板显示尺寸", "当前文件路径", "说明"]];
  sheet.getRangeByIndexes(1, 0, rows.length, 7).values = rows.map((row) => [
    row[0],
    "",
    row[2],
    row[3],
    row[4],
    row[5],
    row[6],
  ]);

  sheet.getRange("A1:G1").format = {
    fill: "#111111",
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
  sheet.getRangeByIndexes(0, 0, rows.length + 1, 7).format = {
    font: { name: "Microsoft YaHei", size: 10 },
    wrapText: true,
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: "#D9D9D9" },
  };

  sheet.getRange("A:A").format.columnWidthPx = 170;
  sheet.getRange("B:B").format.columnWidthPx = 150;
  sheet.getRange("C:C").format.columnWidthPx = 110;
  sheet.getRange("D:D").format.columnWidthPx = 150;
  sheet.getRange("E:E").format.columnWidthPx = 230;
  sheet.getRange("F:F").format.columnWidthPx = 280;
  sheet.getRange("G:G").format.columnWidthPx = 240;
  sheet.getRange("1:1").format.rowHeightPx = 34;

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    sheet.getRange(`${rowNumber}:${rowNumber}`).format.rowHeightPx = 112;
    await addImage(sheet, index + 1, 1, rows[index][1], 128, 96);
  }

  sheet.freezePanes.freezeRows(1);
  return sheet;
}

await buildSheet("源素材清单", sourceRows);
await buildSheet("原站1920比例", ratioRows);

const firstSheet = workbook.worksheets.getItem("源素材清单");
firstSheet.getRange("A1").values = [["名称"]];

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "源素材清单",
  range: "A1:G8",
  scale: 1,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(xlsxPath);
console.log(JSON.stringify({ xlsxPath, previewPath }, null, 2));
