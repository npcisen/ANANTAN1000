"use client";

import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type CharacterId = "rebel" | "siren" | "kiddo" | "warrior" | "domina";

const initialProgress = 148 / 360;
const characterOrder: CharacterId[] = ["siren", "kiddo", "rebel", "warrior", "domina"];
const rearSlotClasses = [
  "ananta-ghost-a",
  "ananta-ghost-b",
  "ananta-ghost-c",
  "ananta-ghost-d",
];

const characterCopy: Record<
  CharacterId,
  { lookNumber: string; title: string }
> = {
  domina: {
    lookNumber: "05 / 11",
    title: "The Domina",
  },
  kiddo: {
    lookNumber: "02 / 11",
    title: "The Kiddo",
  },
  rebel: {
    lookNumber: "03 / 11",
    title: "The Rebel",
  },
  siren: {
    lookNumber: "01 / 11",
    title: "The Siren",
  },
  warrior: {
    lookNumber: "04 / 11",
    title: "The Warrior",
  },
};

const lookThumbnails: LookThumb[] = [
  {
    id: "kiddo",
    label: "THE KIDDO",
    src: "/images/ananta/look-the-kiddo.png",
    video: "/images/ananta/ghost-the-kiddo.mp4",
  },
  {
    id: "rebel",
    label: "THE REBEL",
    src: "/images/ananta/look-the-rebel.png",
    video: "/images/ananta/rebel-thumb.mp4",
    current: true,
  },
  {
    id: "warrior",
    label: "THE WARRIOR",
    src: "/images/ananta/look-the-warrior.png",
    video: "/images/ananta/ghost-the-warrior.mp4",
  },
];

const products = [
  {
    title: "NIKITA BODY black",
    image: "/images/ananta/product-nikita-thumb.jpg",
  },
  {
    title: "BEATRIX COAT",
    image: "/images/ananta/product-beatrix-thumb.jpg",
  },
];

type LookThumb = {
  current?: boolean;
  href?: string;
  id?: CharacterId;
  label: string;
  src: string;
  video: string;
};

type ProductItem = {
  image: string;
  title: string;
  titleScale?: number;
};

type TimelineLookImage = {
  desktop: string;
  mobile: string;
  label: string;
};

type ChatCardData = {
  avatar: string;
  name: string;
  dialog: string;
};

type PageAssets = {
  ghostDominaVideo: string;
  ghostKiddoVideo: string;
  ghostSirenVideo: string;
  ghostWarriorVideo: string;
  logoImage: string;
  mainFallback: string;
  mainVideo: string;
  timelineDesktop: string;
  timelineMobile: string;
  bgDesktop: string;
  bgMobile: string;
};

type PageText = {
  bodyLabel: string;
  bodyValue: string;
  cartLabel: string;
  cartSuffix: string;
  coatLabel: string;
  coatValue: string;
  footerEmail: string;
  footerInstagram: string;
  footerManifesto: string;
  footerShipping: string;
  footerSizeGuide: string;
  footerTerms: string;
  headerAll: string;
  headerAllSuffix: string;
  headerMenu: string;
  headerStories: string;
  headerStoriesSuffix: string;
  lookKicker: string;
  lookNavLabel: string;
  lookNavSuffix: string;
  lookTitle: string;
  productsButtonLabel: string;
  productView: string;
  productsClose: string;
  productsOpen: string;
  sizeLabel: string;
  sizeValue: string;
};

type TextScale = Partial<Record<keyof PageText, number>>;

type HiddenSections = {
  details: boolean;
  figure: boolean;
  footer: boolean;
  ghosts: boolean;
  header: boolean;
  lookInfo: boolean;
  lookNav: boolean;
  products: boolean;
  timeline: boolean;
};

type EditorState = {
  assets: PageAssets;
  characterText: Record<CharacterId, CharacterText>;
  fontFamily: string;
  hidden: HiddenSections;
  products: ProductItem[];
  text: PageText;
  textScale: TextScale;
  logoScale: number;
  thumbs: LookThumb[];
  chatCards: Record<CharacterId, ChatCardData>;
  chatDialogScale: number;
  timelineLookImages: TimelineLookImage[];
};

type CharacterMedia = {
  fallback: string;
  id: CharacterId;
  label: string;
  source: string;
  title: string;
};

type CharacterText = {
  lookNumber: string;
  title: string;
};

type AssetKey = keyof PageAssets | `thumb.${number}.src` | `thumb.${number}.video` | `product.${number}.image`;
type TextKey = keyof PageText;
type HiddenKey = keyof HiddenSections;
type CharacterTextField = keyof CharacterText;
type LookThumbField = "href" | "id" | "label" | "src" | "video";
type ControllerFeedback = {
  message: string;
  tone: "info" | "success" | "warning";
};

const defaultFontFamily =
  '"Eurostile Ananta", "Helvetica Neue", Arial, sans-serif';

const defaultEditorState: EditorState = {
  assets: {
    ghostDominaVideo: "/images/ananta/ghost-the-domina.mp4",
    ghostKiddoVideo: "/images/ananta/ghost-the-kiddo.mp4",
    ghostSirenVideo: "/images/ananta/ghost-the-siren.mp4",
    ghostWarriorVideo: "/images/ananta/ghost-the-warrior.mp4",
    logoImage: "",
    mainFallback: "/images/ananta/look-the-rebel.png",
    mainVideo: "/images/ananta/rebel-main.mp4",
    timelineDesktop: "/images/ananta/rebel-timeline-desktop.jpg",
    timelineMobile: "/images/ananta/rebel-timeline-mobile.jpg",
    bgDesktop: "",
    bgMobile: "",
  },
  characterText: characterCopy,
  fontFamily: defaultFontFamily,
  hidden: {
    details: false,
    figure: false,
    footer: false,
    ghosts: false,
    header: false,
    lookInfo: false,
    lookNav: false,
    products: false,
    timeline: false,
  },
  products,
  text: {
    bodyLabel: "Body",
    bodyValue: "S",
    cartLabel: "Cart",
    cartSuffix: "00",
    coatLabel: "Coat",
    coatValue: "S",
    footerEmail: "hello@anantaparis.com",
    footerInstagram: "Instagram",
    footerManifesto:
      "Born on the road, made for the city. Technical, protective and unapologetically feminine, our pieces give women the confidence to move freely. A call to carve your own path, with no compromise and no concession.",
    footerShipping: "Shipping policy",
    footerSizeGuide: "Size Guide",
    footerTerms: "Terms of service",
    headerAll: "All",
    headerAllSuffix: "27",
    headerMenu: "Menu",
    headerStories: "Stories",
    headerStoriesSuffix: "04",
    lookKicker: "03 / 11",
    lookNavLabel: "Look",
    lookNavSuffix: "03/11",
    lookTitle: "The Rebel",
    productsButtonLabel: "2 Products",
    productView: "View",
    productsClose: "Close",
    productsOpen: "View",
    sizeLabel: "Size",
    sizeValue: "178cm",
  },
  textScale: {},
  thumbs: lookThumbnails,
  logoScale: 1,
  chatCards: {rebel:{avatar:"",name:"SEYMOUR",dialog:"充满破坏与创造欲的灵魂画师。"},siren:{avatar:"",name:"VIVIEN",dialog:"优雅与危险并存。"},kiddo:{avatar:"",name:"LUNA",dialog:"永远年轻。"},warrior:{avatar:"",name:"RAVEN",dialog:"战场是我的舞台。"},domina:{avatar:"",name:"SAGE",dialog:"掌控一切的感觉。"}},
  chatDialogScale: 1,
  timelineLookImages: [{desktop:"/images/ananta/rebel-timeline-desktop.jpg",mobile:"/images/ananta/rebel-timeline-mobile.jpg",label:"Rebel"},{desktop:"/images/ananta/rebel-timeline-desktop.jpg",mobile:"/images/ananta/rebel-timeline-mobile.jpg",label:"Siren"},{desktop:"/images/ananta/rebel-timeline-desktop.jpg",mobile:"/images/ananta/rebel-timeline-mobile.jpg",label:"Kiddo"},{desktop:"/images/ananta/rebel-timeline-desktop.jpg",mobile:"/images/ananta/rebel-timeline-mobile.jpg",label:"Warrior"},{desktop:"/images/ananta/rebel-timeline-desktop.jpg",mobile:"/images/ananta/rebel-timeline-mobile.jpg",label:"Domina"}],
};

const baseAssetOptions: Array<{ key: AssetKey; label: string }> = [
  { key: "logoImage", label: "顶部 ANANTA Logo" },
  { key: "mainVideo", label: "主人物视频" },
  { key: "mainFallback", label: "主人物备用图" },
  { key: "timelineDesktop", label: "桌面端时间轴图片" },
  { key: "timelineMobile", label: "移动端时间轴图片" },
  { key: "ghostSirenVideo", label: "后排人物 1 视频" },
  { key: "ghostKiddoVideo", label: "后排人物 2 视频" },
  { key: "ghostWarriorVideo", label: "后排人物 3 视频" },
  { key: "ghostDominaVideo", label: "后排人物 4 视频" },
  { key: "bgDesktop", label: "桌面端背景图" },
  { key: "bgMobile", label: "移动端背景图" },
];


const ghostAssetKeyByCharacter: Partial<Record<CharacterId, AssetKey>> = {
  domina: "ghostDominaVideo",
  kiddo: "ghostKiddoVideo",
  siren: "ghostSirenVideo",
  warrior: "ghostWarriorVideo",
};

const textFields: Array<{ key: TextKey; label: string; multiline?: boolean }> = [
  { key: "lookKicker", label: "LOOK 编号" },
  { key: "lookTitle", label: "主标题" },
  { key: "lookNavLabel", label: "右上 LOOK 标签" },
  { key: "lookNavSuffix", label: "右上 LOOK 编号" },
  { key: "headerMenu", label: "菜单文字" },
  { key: "headerAll", label: "All 文字" },
  { key: "headerAllSuffix", label: "All 数字" },
  { key: "headerStories", label: "Stories 文字" },
  { key: "headerStoriesSuffix", label: "Stories 数字" },
  { key: "cartLabel", label: "购物车文字" },
  { key: "cartSuffix", label: "购物车数字" },
  { key: "sizeLabel", label: "尺码标签" },
  { key: "sizeValue", label: "尺码数值" },
  { key: "coatLabel", label: "外套标签" },
  { key: "coatValue", label: "外套数值" },
  { key: "bodyLabel", label: "身体标签" },
  { key: "bodyValue", label: "身体数值" },
  { key: "productsButtonLabel", label: "左下按钮文字" },
  { key: "productView", label: "产品查看文字" },
  { key: "productsOpen", label: "产品展开文字" },
  { key: "productsClose", label: "产品收起文字" },
  { key: "footerManifesto", label: "底部宣言", multiline: true },
];

const hiddenOptions: Array<{ key: HiddenKey; label: string }> = [
  { key: "header", label: "顶部导航" },
  { key: "lookNav", label: "右上 LOOK 导航" },
  { key: "lookInfo", label: "标题信息" },
  { key: "timeline", label: "时间轴进度" },
  { key: "details", label: "Size / Coat / Body 信息" },
  { key: "figure", label: "人物视频区域" },
  { key: "ghosts", label: "后排人物" },
  { key: "products", label: "左下按钮 / 产品区" },
  { key: "footer", label: "底部区域" },
];

const thumbCharacterOptions: Array<{ label: string; value: "" | CharacterId }> = [
  { label: "仅作为链接", value: "" },
  { label: "The Siren", value: "siren" },
  { label: "The Kiddo", value: "kiddo" },
  { label: "The Rebel", value: "rebel" },
  { label: "The Warrior", value: "warrior" },
  { label: "The Domina", value: "domina" },
];

const scrambleGlyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const mobileMediaQuery = "(max-width: 900px)";
const editorStorageKey = "ananta-controller-editor-v1";
const publishedConfigEndpoint = "/api/ananta/published-config";
const publishEndpoint = "/api/ananta/publish";
const uploadDbName = "ananta-controller-uploads";
const uploadStoreName = "uploads";
const uploadedAssetPrefix = "ananta-upload://";

type AnantaPageController = {
  addLookThumb: (thumb?: Partial<LookThumb>) => void;
  closeMenu: () => void;
  closeProducts: () => void;
  describe: () => Record<string, unknown>;
  getState: () => Record<string, unknown>;
  hideSection: (section: HiddenKey) => void;
  openMenu: () => void;
  openProducts: () => void;
  pause: () => void;
  play: () => void;
  resetEditor: () => void;
  removeLookThumb: (index: number) => void;
  selectCharacter: (character: CharacterId) => void;
  setAngle: (degrees: number) => void;
  setAsset: (key: AssetKey, source: string) => void;
  setFont: (fontFamily: string) => void;
  setLookThumb: (index: number, patch: Partial<LookThumb>) => void;
  setProgress: (progress: number) => void;
  setText: (key: TextKey, value: string) => void;
  showSection: (section: HiddenKey) => void;
  toggleMenu: () => void;
  toggleProducts: () => void;
  toggleSection: (section: HiddenKey) => void;
};

declare global {
  interface Window {
    anantaPageController?: AnantaPageController;
  }
}

type StoredUpload = {
  blob: Blob;
  id: string;
  name: string;
  type: string;
  updatedAt: number;
};

type VideoCodecCheck = {
  message: string;
  ok: boolean;
};

type PublishUploadManifestEntry = {
  name: string;
  source: string;
  type: string;
};

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

function clampTextScale(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(2, Math.max(0.5, value));
}

function normalizeLookNumber(value: string) {
  return value
    .replace(/^Look\s+/i, "")
    .replace(/\s*\/\s*/g, " / ")
    .trim();
}

function textScaleStyle(textScale: TextScale, key: TextKey): CSSProperties {
  return {
    "--ananta-text-scale": String(clampTextScale(textScale[key] ?? 1)),
  } as CSSProperties;
}

function isUploadedAssetSource(source: string) {
  return source.startsWith(uploadedAssetPrefix);
}

function openUploadDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(uploadDbName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(uploadStoreName)) {
        database.createObjectStore(uploadStoreName, { keyPath: "id" });
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function saveUploadToDb(file: File) {
  const database = await openUploadDb();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const record: StoredUpload = {
    blob: file,
    id,
    name: file.name,
    type: file.type,
    updatedAt: Date.now(),
  };

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(uploadStoreName, "readwrite");
    transaction.objectStore(uploadStoreName).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();

  return `${uploadedAssetPrefix}${id}`;
}

async function readUploadFromDb(source: string) {
  if (!isUploadedAssetSource(source)) {
    return null;
  }

  const id = source.slice(uploadedAssetPrefix.length);
  const database = await openUploadDb();
  const record = await new Promise<StoredUpload | null>((resolve, reject) => {
    const transaction = database.transaction(uploadStoreName, "readonly");
    const request = transaction.objectStore(uploadStoreName).get(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as StoredUpload | undefined) ?? null);
  });
  database.close();

  return record;
}

async function clearUploadDb() {
  const database = await openUploadDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(uploadStoreName, "readwrite");
    transaction.objectStore(uploadStoreName).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

function bytesInclude(bytes: Uint8Array, token: string) {
  const needle = Array.from(token, (char) => char.charCodeAt(0));
  if (needle.length === 0 || bytes.length < needle.length) {
    return false;
  }

  for (let index = 0; index <= bytes.length - needle.length; index += 1) {
    let matched = true;
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (bytes[index + offset] !== needle[offset]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return true;
    }
  }

  return false;
}

async function readFileBytes(file: File, start: number, end: number) {
  return new Uint8Array(await file.slice(start, end).arrayBuffer());
}

async function checkVideoCodec(file: File): Promise<VideoCodecCheck> {
  if (!file.type.startsWith("video/") && !file.name.toLowerCase().endsWith(".mp4")) {
    return { message: "", ok: true };
  }

  const windowSize = Math.min(file.size, 512 * 1024);
  const head = await readFileBytes(file, 0, windowSize);
  const tail =
    file.size > windowSize
      ? await readFileBytes(file, Math.max(0, file.size - windowSize), file.size)
      : head;
  const hasToken = (token: string) => bytesInclude(head, token) || bytesInclude(tail, token);

  if (hasToken("mp4v")) {
    return {
      message:
        "这个 MP4 是 mp4v / MPEG-4 Visual 编码，浏览器在这里不稳定。请重新导出为 H.264 MP4（avc1）后再上传。",
      ok: false,
    };
  }

  if (hasToken("avc1") || hasToken("avcC")) {
    return { message: "", ok: true };
  }

  if (hasToken("hvc1") || hasToken("hev1")) {
    return {
      message:
        "这个 MP4 看起来像 HEVC/H.265，浏览器支持不稳定。建议使用 H.264 MP4（avc1）。",
      ok: true,
    };
  }

  return {
    message:
      "暂时无法确认这个 MP4 是 H.264。如果不播放，请重新导出为 H.264 MP4（avc1）后再上传。",
    ok: true,
  };
}

async function fetchPublishedEditorState() {
  const response = await fetch(publishedConfigEndpoint, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("已发布版本读取失败。");
  }

  const payload = (await response.json()) as { editor?: Partial<EditorState> };
  return payload.editor ? mergeEditorState(payload.editor) : null;
}

async function publishEditorState(editor: EditorState) {
  const sources = collectUploadedAssetSources(editor);
  const formData = new FormData();
  const manifest: PublishUploadManifestEntry[] = [];

  for (const source of sources) {
    const upload = await readUploadFromDb(source);
    if (!upload) {
      throw new Error("有一个已上传素材在浏览器本地存储中丢失了。请重新上传后再发布。");
    }

    const id = source.slice(uploadedAssetPrefix.length);
    const file = new File([upload.blob], upload.name || `${id}.bin`, {
      type: upload.type || upload.blob.type || "application/octet-stream",
    });
    manifest.push({
      name: upload.name || file.name,
      source,
      type: upload.type || file.type,
    });
    formData.append(`upload:${id}`, file);
  }

  formData.append("editor", JSON.stringify(editor));
  formData.append("manifest", JSON.stringify(manifest));

  const response = await fetch(publishEndpoint, {
    body: formData,
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as {
    editor?: Partial<EditorState>;
    message?: string;
  } | null;

  if (!response.ok || !payload?.editor) {
    throw new Error(payload?.message || "发布失败，请再试一次。");
  }

  return mergeEditorState(payload.editor);
}

function collectUploadedAssetSources(editor: EditorState) {
  const sources = [
    ...Object.values(editor.assets),
    ...editor.thumbs.flatMap((thumb) => [thumb.src, thumb.video]),
    ...editor.products.map((product) => product.image),
    ...editor.timelineLookImages.flatMap((item) => [item.desktop, item.mobile]),
    ...Object.values(editor.chatCards).map((card) => card.avatar),
  ];

  return Array.from(new Set(sources.filter(isUploadedAssetSource)));
}

function resolveUploadedSource(source: string, uploads: Record<string, string>) {
  if (!isUploadedAssetSource(source)) {
    return source;
  }

  return uploads[source] ?? "";
}

function resolveUploadedEditorSources(
  editor: EditorState,
  uploads: Record<string, string>,
): EditorState {
  return {
    ...editor,
    assets: Object.fromEntries(
      Object.entries(editor.assets).map(([key, source]) => [
        key,
        resolveUploadedSource(source, uploads),
      ]),
    ) as PageAssets,
    products: editor.products.map((product) => ({
      ...product,
      image: resolveUploadedSource(product.image, uploads),
    })),
    thumbs: editor.thumbs.map((thumb) => ({
      ...thumb,
      src: resolveUploadedSource(thumb.src, uploads),
      video: resolveUploadedSource(thumb.video, uploads),
    })),
    timelineLookImages: editor.timelineLookImages.map((item) => ({
      ...item,
      desktop: resolveUploadedSource(item.desktop, uploads),
      mobile: resolveUploadedSource(item.mobile, uploads),
    })),
    chatCards: Object.fromEntries(
      Object.entries(editor.chatCards).map(([key, card]) => [
        key,
        { ...card, avatar: resolveUploadedSource(card.avatar, uploads) },
      ]),
    ) as Record<CharacterId, ChatCardData>,
  };
}

function mergeEditorState(saved: Partial<EditorState>): EditorState {
  const mergedText = {
    ...defaultEditorState.text,
    ...saved.text,
  };
  mergedText.lookKicker = normalizeLookNumber(mergedText.lookKicker);
  const migratedCharacterText = saved.characterText ?? {
    ...defaultEditorState.characterText,
    rebel: {
      lookNumber: normalizeLookNumber(mergedText.lookKicker) || characterCopy.rebel.lookNumber,
      title: mergedText.lookTitle || characterCopy.rebel.title,
    },
  };

  return {
    ...defaultEditorState,
    ...saved,
    assets: {
      ...defaultEditorState.assets,
      ...saved.assets,
    },
    characterText: {
      ...defaultEditorState.characterText,
      ...migratedCharacterText,
    },
    hidden: {
      ...defaultEditorState.hidden,
      ...saved.hidden,
    },
    products: saved.products ?? defaultEditorState.products,
    text: mergedText,
    textScale: {
      ...defaultEditorState.textScale,
      ...saved.textScale,
    },
    thumbs: saved.thumbs ?? defaultEditorState.thumbs,
  };
}

function createLookThumb(index: number, thumb: Partial<LookThumb> = {}): LookThumb {
  return {
    href: thumb.href ?? "#",
    id: thumb.id,
    label: thumb.label ?? `LINK ${index + 1}`,
    src: thumb.src ?? "/images/ananta/look-the-rebel.png",
    video: thumb.video ?? "",
  };
}

function getAssetOptions(editor: EditorState): Array<{ key: AssetKey; label: string }> {
  return [
    ...baseAssetOptions,
    ...editor.thumbs.flatMap((_, index) => [
      {
        key: `thumb.${index}.src` as AssetKey,
        label: `LOOK 缩略项 ${index + 1} 图片`,
      },
      {
        key: `thumb.${index}.video` as AssetKey,
        label: `LOOK 缩略项 ${index + 1} 视频`,
      },
    ]),
    ...editor.products.map((_, index) => ({
      key: `product.${index}.image` as AssetKey,
      label: `产品 ${index + 1} 图片`,
    })),
  ];
}

function updateAssetState(state: EditorState, key: AssetKey, source: string): EditorState {
  if (key.startsWith("thumb.")) {
    const [, indexText, field] = key.split(".");
    const index = Number(indexText);

    if (!Number.isInteger(index) || (field !== "src" && field !== "video")) {
      return state;
    }

    return {
      ...state,
      thumbs: state.thumbs.map((thumb, thumbIndex) =>
        thumbIndex === index ? { ...thumb, [field]: source } : thumb,
      ),
    };
  }

  if (key.startsWith("product.")) {
    const [, indexText, field] = key.split(".");
    const index = Number(indexText);

    if (!Number.isInteger(index) || field !== "image") {
      return state;
    }

    return {
      ...state,
      products: state.products.map((product, productIndex) =>
        productIndex === index ? { ...product, image: source } : product,
      ),
    };
  }

  return {
    ...state,
    assets: {
      ...state.assets,
      [key]: source,
    },
  };
}

function getCharacterMedia(editor: EditorState): Record<CharacterId, CharacterMedia> {
  return {
    domina: {
      fallback: "/images/ananta/look-the-domina.png",
      id: "domina",
      label: "THE DOMINA",
      source: editor.assets.ghostDominaVideo,
      title: editor.characterText.domina.title,
    },
    kiddo: {
      fallback: editor.thumbs[0]?.src ?? "/images/ananta/look-the-kiddo.png",
      id: "kiddo",
      label: editor.thumbs[0]?.label ?? "THE KIDDO",
      source: editor.assets.ghostKiddoVideo,
      title: editor.characterText.kiddo.title,
    },
    rebel: {
      fallback: editor.assets.mainFallback,
      id: "rebel",
      label: editor.thumbs[1]?.label ?? "THE REBEL",
      source: editor.assets.mainVideo,
      title: editor.characterText.rebel.title,
    },
    siren: {
      fallback: "/images/ananta/look-the-siren.png",
      id: "siren",
      label: "THE SIREN",
      source: editor.assets.ghostSirenVideo,
      title: editor.characterText.siren.title,
    },
    warrior: {
      fallback: editor.thumbs[2]?.src ?? "/images/ananta/look-the-warrior.png",
      id: "warrior",
      label: editor.thumbs[2]?.label ?? "THE WARRIOR",
      source: editor.assets.ghostWarriorVideo,
      title: editor.characterText.warrior.title,
    },
  };
}

function subscribeMobileMedia(callback: () => void) {
  const media = window.matchMedia(mobileMediaQuery);
  media.addEventListener("change", callback);

  return () => media.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(mobileMediaQuery).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function useIsMobileBreakpoint() {
  return useSyncExternalStore(
    subscribeMobileMedia,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );
}

function ScrambleText({ children }: { children: string }) {
  const [text, setText] = useState(children);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    setText(children);
  }, [children]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.clearInterval(frameRef.current);
      }
    };
  }, []);

  const run = useCallback(() => {
    if (frameRef.current !== null) {
      window.clearInterval(frameRef.current);
    }

    let frame = 0;
    const total = 9;

    frameRef.current = window.setInterval(() => {
      frame += 1;
      const settled = frame / total;

      setText(
        children
          .split("")
          .map((char, index) => {
            if (char === " ") {
              return char;
            }

            if (index / Math.max(children.length - 1, 1) < settled) {
              return char;
            }

            return scrambleGlyphs[
              Math.floor(Math.random() * scrambleGlyphs.length)
            ];
          })
          .join(""),
      );

      if (frame >= total) {
        if (frameRef.current !== null) {
          window.clearInterval(frameRef.current);
          frameRef.current = null;
        }
        setText(children);
      }
    }, 28);
  }, [children]);

  return (
    <span
      className="ananta-scramble"
      onFocus={run}
      onMouseEnter={run}
      onMouseOver={run}
      onPointerEnter={run}
    >
      {text}
    </span>
  );
}

function AnantaLogo({ source }: { source: string }) {
  if (source) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt="ANANTA"
        className="ananta-logo"
        draggable={false}
        src={source}
      />
    );
  }

  return (
    <svg
      aria-label="ANANTA"
      className="ananta-logo"
      fill="none"
      viewBox="0 0 84 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M11.88 4.66c1.9-.42 3.34-1.68 3.24-3.17C15.02 0 12.52 0 12.52 0H4.58L0 9.99l7.77-.07c3.96.12 5.82-2.4 5.85-3.68.02-1.28-1.74-1.58-1.74-1.58ZM9.5 6.8c-.25.76-1.3 1.01-1.8 1.04l-2.68.06.93-2.08s2.38-.02 2.72.02c.35.03 1.08.2.83.96Zm1.3-3.92c-.23.67-.8.98-1.66 1.03-.86.05-2.3.05-2.3.05l.86-1.94s2.12 0 2.38.04c.26.04.96.16.73.82Zm10.38-.64 6.85.01L29.05.01H18.12l-4.6 9.97h10.96l1.02-2.22h-6.87l.92-2h6.34l.93-2.05H20.5l.68-1.47Zm61.13.01L83.33.01H72.4l-4.6 9.97h10.96l1.02-2.22h-6.87l.92-2h6.35l.92-2.05h-6.32l.68-1.47 6.85.01ZM39.59 6.7l-3.04-.81s-1.17 1.85-3.03 1.85c0 0-1.64.29-1.98-.79a.57.57 0 0 1-.03-.13c-.1-1.02 1.03-3.66 3.06-4.35 1.87-.66 2.98.12 2.9 1.14l3.75-.57S41.66.2 37.58.05c-4.09-.15-7.18 1.26-8.91 3.9-1.73 2.64-1.3 4.65.23 5.43 1.53.77 4.06.63 4.98.5.9-.12 3.31-.28 5.7-3.18ZM47.58.01l-9.56 9.97h4.15l1.37-1.65h4.63l-.1 1.66h4.22L52.01 0l-4.43.01Zm.6 6.21-2.86.02 3.09-3.52-.22 3.5ZM66.83.03l-2.56 5.5L61.93.02h-3.86l-4.62 9.97 3.84.02 2.52-5.46 2.4 5.45h3.88L70.68.03h-3.85Z"
      />
    </svg>
  );
}

function BarButton({
  children,
  suffix,
  suffixKey,
  textKey,
  textScale,
}: {
  children: React.ReactNode;
  suffix?: string;
  suffixKey?: TextKey;
  textKey?: TextKey;
  textScale?: TextScale;
}) {
  const renderText = (value: string, key?: TextKey) => {
    const content = <ScrambleText>{value}</ScrambleText>;
    if (!key || !textScale) {
      return content;
    }

    return (
      <span className="ananta-text-scale" style={textScaleStyle(textScale, key)}>
        {content}
      </span>
    );
  };

  return (
    <span className="ananta-bar-button">
      <span>
        {typeof children === "string" ? (
          renderText(children, textKey)
        ) : (
          children
        )}
      </span>
      {suffix ? (
        <span className="ananta-muted">
          {renderText(suffix, suffixKey)}
        </span>
      ) : null}
    </span>
  );
}

function Header({
  assets,
  highlightedAssetKey,
  menuOpen,
  onMenuToggle,
  text,
  textScale,
}: {
  assets: PageAssets;
  highlightedAssetKey: AssetKey | null;
  menuOpen: boolean;
  onMenuToggle: () => void;
  text: PageText;
  textScale: TextScale;
}) {
  return (
    <header className="ananta-header" aria-label="Ananta navigation">
      <div
        className={[
          "ananta-header-top",
          highlightedAssetKey === "logoImage" ? "is-highlighted-target" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <AnantaLogo source={assets.logoImage} />
      </div>
      <nav className={menuOpen ? "ananta-header-menu is-open" : "ananta-header-menu"}>
        <div className="ananta-desktop-menu">
          <BarButton
            suffix={text.headerAllSuffix}
            suffixKey="headerAllSuffix"
            textKey="headerAll"
            textScale={textScale}
          >
            {text.headerAll}
          </BarButton>
          <BarButton
            suffix={text.headerStoriesSuffix}
            suffixKey="headerStoriesSuffix"
            textKey="headerStories"
            textScale={textScale}
          >
            {text.headerStories}
          </BarButton>
        </div>
        <button
          aria-expanded={menuOpen}
          className="ananta-mobile-menu"
          onClick={onMenuToggle}
          type="button"
        >
          <span className="ananta-text-scale" style={textScaleStyle(textScale, "headerMenu")}>
            <ScrambleText>{text.headerMenu}</ScrambleText>
          </span>
        </button>
        <div className="ananta-header-spacer" />
        <BarButton
          suffix={text.cartSuffix}
          suffixKey="cartSuffix"
          textKey="cartLabel"
          textScale={textScale}
        >
          {text.cartLabel}
        </BarButton>
      </nav>
    </header>
  );
}

function LookNavBar({
  currentCharacter,
  highlightedAssetKey,
  onCharacterSelect,
  text,
  textScale,
  thumbs,
}: {
  currentCharacter: CharacterId;
  highlightedAssetKey: AssetKey | null;
  onCharacterSelect: (character: CharacterId) => void;
  text: PageText;
  textScale: TextScale;
  thumbs: LookThumb[];
}) {
  return (
    <aside className="ananta-look-nav" aria-label="Look navigation">
      <BarButton
        suffix={text.lookNavSuffix}
        suffixKey="lookNavSuffix"
        textKey="lookNavLabel"
        textScale={textScale}
      >
        {text.lookNavLabel}
      </BarButton>
      <div className="ananta-thumb-row">
        {thumbs.map((thumb, index) => {
          const isCurrent = thumb.id ? currentCharacter === thumb.id : false;
          const isHighlighted =
            highlightedAssetKey === (`thumb.${index}.src` as AssetKey) ||
            highlightedAssetKey === (`thumb.${index}.video` as AssetKey);
          const className = [
            "ananta-look-thumb",
            isCurrent ? "is-current" : "",
            isHighlighted ? "is-highlighted-target" : "",
            thumb.video ? "has-video" : "has-image-only",
          ]
            .filter(Boolean)
            .join(" ");
          const content = (
            <>
              {thumb.video ? (
                <video
                  aria-hidden="true"
                  autoPlay
                  className="ananta-thumb-video"
                  key={thumb.video}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src={thumb.video} type="video/mp4" />
                </video>
              ) : null}
              {thumb.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={thumb.label}
                  className="ananta-thumb-image"
                  src={thumb.src}
                />
              ) : (
                <span className="ananta-thumb-label">{thumb.label.slice(0, 2)}</span>
              )}
            </>
          );

          if (!thumb.id) {
            return (
              <a
                aria-label={thumb.label}
                className={className}
                href={thumb.href || "#"}
                key={`${thumb.label}-${index}`}
                title={thumb.label}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              aria-current={isCurrent ? "true" : undefined}
              aria-label={thumb.label}
              className={className}
              key={`${thumb.label}-${index}`}
              onClick={() => onCharacterSelect(thumb.id as CharacterId)}
              title={thumb.label}
              type="button"
            >
              {content}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function TimelineBar({
  highlightedAssetKey,
  lookImages,
  currentCharacter,
  onScrubEnd,
  onScrubStart,
  onSeek,
  progress,
}: {
  highlightedAssetKey: AssetKey | null;
  lookImages: TimelineLookImage[];
  currentCharacter: CharacterId;
  onScrubEnd: () => void;
  onScrubStart: () => void;
  onSeek: (progress: number) => void;
  progress: number;
}) {
  const barRef = useRef<HTMLButtonElement>(null);
  const currentImage = lookImages.find(
    (img) => img.label.toLowerCase() === currentCharacter,
  ) ?? lookImages[0] ?? { desktop: "", mobile: "", label: "" };

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const rect = barRef.current?.getBoundingClientRect();
      if (!rect) { return; }
      onSeek(clampProgress((clientX - rect.left) / rect.width));
    },
    [onSeek],
  );

  return (
    <div className="ananta-timeline" aria-label="Video progress">
      <span>{Math.round(progress * 360)}&deg; / 360&deg;</span>
      <button
        aria-label="Scrub the look video"
        aria-valuemax={360}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress * 360)}
        className={[
          "ananta-timeline-strip",
          highlightedAssetKey === "timelineDesktop" ||
          highlightedAssetKey === "timelineMobile"
            ? "is-highlighted-target"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          onScrubEnd();
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onScrubStart();
          seekFromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            seekFromPointer(event.clientX);
          }
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          seekFromPointer(event.clientX);
          onScrubEnd();
        }}
        ref={barRef}
        role="slider"
        style={{ "--progress": progress } as CSSProperties}
        type="button"
      >
        <picture className="ananta-timeline-picture">
          <source media="(max-width: 900px)" srcSet={currentImage.mobile} />
          <img alt={currentImage.label} draggable={false} src={currentImage.desktop} />
        </picture>
        <span className="ananta-timeline-cursor" />
      </button>
    </div>
  );
}

function LookInfo({
  assets,
  highlightedAssetKey,
  hidden,
  onScrubEnd,
  onScrubStart,
  onSeek,
  progress,
  text,
  textScale,
  timelineLookImages,
  currentCharacter,
  chatCards,
  chatDialogScale,
}: {
  assets: PageAssets;
  highlightedAssetKey: AssetKey | null;
  hidden: HiddenSections;
  onScrubEnd: () => void;
  onScrubStart: () => void;
  onSeek: (progress: number) => void;
  progress: number;
  text: PageText;
  textScale: TextScale;
  timelineLookImages: TimelineLookImage[];
  currentCharacter: CharacterId;
  chatCards: Record<CharacterId, ChatCardData>;
  chatDialogScale: number;
}) {
  const isMobile = useIsMobileBreakpoint();

  return (
    <section className="ananta-look-info" aria-label="Look information">
      <p className="ananta-kicker">
        <span className="ananta-text-scale" style={textScaleStyle(textScale, "lookKicker")}>
          {text.lookKicker}
        </span>
      </p>
      <h1>
        <span className="ananta-text-scale" style={textScaleStyle(textScale, "lookTitle")}>
          {text.lookTitle}
        </span>
      </h1>
      {!hidden.timeline ? (
        <TimelineBar
          highlightedAssetKey={highlightedAssetKey}
          lookImages={timelineLookImages}
          currentCharacter={currentCharacter}
          onScrubEnd={onScrubEnd}
          onScrubStart={onScrubStart}
          onSeek={onSeek}
          progress={progress}
        />
      ) : null}
      {!isMobile && !hidden.details ? (
        <div className="ananta-chat-block">
          <div className="ananta-chat-bar">
            <div className="ananta-chat-avatar-wrap">
              {chatCards[currentCharacter]?.avatar ? (
                <img alt="" className="ananta-chat-avatar" src={chatCards[currentCharacter].avatar} />
              ) : (
                <div className="ananta-chat-avatar ananta-chat-avatar-placeholder" />
              )}
            </div>
            <span className="ananta-chat-divider" />
            <span className="ananta-chat-name">{chatCards[currentCharacter]?.name ?? ""}</span>
            <span className="ananta-chat-dots"><span /><span /><span /></span>
            <span className="ananta-chat-bar-end" />
          </div>
          <div className="ananta-chat-dialog" style={{"--chat-dialog-scale": chatDialogScale ?? 1} as React.CSSProperties}>
            <p className="ananta-chat-text">{chatCards[currentCharacter]?.dialog ?? ""}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ChromaKeyVideo({
  characterId,
  className,
  fallback,
  highlighted,
  label,
  onClick,
  onProgress,
  progress,
  quality = 1,
  source,
  scrubbing,
  seekSignal,
  style,
}: {
  characterId?: CharacterId;
  className?: string;
  fallback: string;
  highlighted?: boolean;
  label?: string;
  onClick?: () => void;
  onProgress?: (progress: number) => void;
  progress?: number;
  quality?: number;
  source: string;
  scrubbing?: boolean;
  seekSignal?: number;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onProgressRef = useRef(onProgress);
  const progressRef = useRef(progress ?? 0);
  const scrubbingRef = useRef(scrubbing ?? false);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    progressRef.current = progress ?? 0;
  }, [progress]);

  useEffect(() => {
    scrubbingRef.current = scrubbing ?? false;
  }, [scrubbing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }

    video.currentTime = clampProgress(progressRef.current) * video.duration;
  }, [seekSignal]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (scrubbing) {
      video.pause();
    } else {
      void video.play().catch(() => undefined);
    }
  }, [scrubbing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) {
      return;
    }

    video.load();
    if (!scrubbingRef.current) {
      void video.play().catch(() => undefined);
    }
  }, [source]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) {
      return;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    const offscreen =
      offscreenRef.current ?? document.createElement("canvas");
    const offscreenContext = offscreen.getContext("2d", {
      willReadFrequently: true,
    });
    offscreenRef.current = offscreen;

    if (!context || !offscreenContext) {
      return;
    }

    let frameId = 0;
    let started = false;
    let stopped = false;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const density = Math.max(
        0.5,
        Math.min(window.devicePixelRatio || 1, 1.5) * quality,
      );
      const width = Math.max(1, Math.round(rect.width * density));
      const height = Math.max(1, Math.round(rect.height * density));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (offscreen.width !== width || offscreen.height !== height) {
        offscreen.width = width;
        offscreen.height = height;
      }

      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        offscreenContext.clearRect(0, 0, width, height);
        offscreenContext.drawImage(video, 0, 0, width, height);

        let frame: ImageData;
        try {
          frame = offscreenContext.getImageData(0, 0, width, height);
        } catch {
          frameId = window.requestAnimationFrame(draw);
          return;
        }
        const pixels = frame.data;
        let visiblePixels = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          const red = pixels[index] ?? 0;
          const green = pixels[index + 1] ?? 0;
          const blue = pixels[index + 2] ?? 0;
          const alpha = pixels[index + 3] ?? 255;
          const greenLead = green - Math.max(red, blue);
          const strongGreen =
            green > 120 && greenLead > 38 && green > red * 1.28 && green > blue * 1.28;
          const softGreen =
            green > 85 && greenLead > 22 && green > red * 1.12 && green > blue * 1.12;

          if (strongGreen) {
            pixels[index + 3] = 0;
          } else if (softGreen) {
            pixels[index + 1] = Math.round(green * 0.35);
            pixels[index + 3] = Math.round(alpha * 0.55);
          }

          if ((pixels[index + 3] ?? 0) > 28) {
            visiblePixels += 1;
          }
        }

        context.clearRect(0, 0, width, height);
        if (visiblePixels / Math.max(1, width * height) < 0.01) {
          context.drawImage(video, 0, 0, width, height);
        } else {
          context.putImageData(frame, 0, 0);
        }

        if (
          !scrubbingRef.current &&
          Number.isFinite(video.duration) &&
          video.duration > 0
        ) {
          const nextProgress = video.currentTime / video.duration;
          if (
            onProgressRef.current &&
            Math.abs(nextProgress - progressRef.current) > 0.003
          ) {
            onProgressRef.current(nextProgress);
          }
        }
      }

      if (!stopped) {
        frameId = window.requestAnimationFrame(draw);
      }
    };

    const start = () => {
      if (started || stopped) {
        return;
      }
      started = true;
      void video.play().catch(() => undefined);
      draw();
    };

    video.addEventListener("canplay", start, { once: true });
    video.addEventListener("loadeddata", start, { once: true });
    video.addEventListener("playing", start, { once: true });
    start();

    return () => {
      stopped = true;
      window.cancelAnimationFrame(frameId);
      video.removeEventListener("canplay", start);
      video.removeEventListener("loadeddata", start);
      video.removeEventListener("playing", start);
    };
  }, [quality, source]);

  const classNames = [
    "ananta-keyed-video",
    className,
    highlighted ? "is-highlighted-target" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button
        aria-label={label}
        className={`${classNames} is-clickable`}
        data-character-id={characterId}
        onClick={onClick}
        style={style}
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="ananta-video-fallback"
          src={fallback}
        />
        <canvas
          aria-hidden="true"
          className="ananta-key-canvas"
          ref={canvasRef}
        />
        <video
          aria-hidden="true"
          className="ananta-key-source"
          key={source}
          loop
          muted
          playsInline
          preload="auto"
          ref={videoRef}
          src={source}
        />
      </button>
    );
  }

  return (
    <div
      className={classNames}
      data-character-id={characterId}
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="ananta-video-fallback"
        src={fallback}
      />
      <canvas
        aria-label="THE REBEL interactive look video"
        className="ananta-key-canvas"
        ref={canvasRef}
      />
      <video
        aria-hidden="true"
        className="ananta-key-source"
        key={source}
        loop
        muted
        playsInline
        preload="auto"
        ref={videoRef}
        src={source}
      />
    </div>
  );
}

function FigureField({
  characters,
  currentCharacter,
  highlightedAssetKey,
  hideGhosts,
  onCharacterSelect,
  onProgress,
  progress,
  scrubbing,
  seekSignal,
}: {
  characters: Record<CharacterId, CharacterMedia>;
  currentCharacter: CharacterId;
  highlightedAssetKey: AssetKey | null;
  hideGhosts: boolean;
  onCharacterSelect: (character: CharacterId) => void;
  onProgress: (progress: number) => void;
  progress: number;
  scrubbing: boolean;
  seekSignal: number;
}) {
  const activeCharacter = characters[currentCharacter] ? currentCharacter : "rebel";
  const current = characters[activeCharacter];
  const isCharacterHighlighted = (characterId: CharacterId) => {
    if (characterId === "rebel") {
      return highlightedAssetKey === "mainVideo" || highlightedAssetKey === "mainFallback";
    }

    return highlightedAssetKey === ghostAssetKeyByCharacter[characterId];
  };
  const rearCharacters = characterOrder
    .filter((character) => character !== activeCharacter)
    .map((character, index) => ({
      character: characters[character],
      slotClass: rearSlotClasses[index] ?? "ananta-ghost-d",
    }))
    .slice(0, 4);
  const ghostBaseStyle: CSSProperties = {
    aspectRatio: "9 / 16",
    top: "56%",
    transform: "translateY(-48%)",
    width: "auto",
    zIndex: 1,
  };

  return (
    <div className="ananta-figure-field" aria-label="Interactive look figures">
      {!hideGhosts ? (
        <>
          {rearCharacters.map(({ character, slotClass }, index) => (
            <ChromaKeyVideo
              characterId={character.id}
              className={`ananta-ghost-video ${slotClass}`}
              fallback={character.fallback}
              highlighted={isCharacterHighlighted(character.id)}
              key={character.id}
              label={`Show ${character.title}`}
              onClick={() => onCharacterSelect(character.id)}
              quality={0.92}
              source={character.source}
              style={{
                ...ghostBaseStyle,
                opacity: index === 0 || index === 3 ? 0.045 : 0.13,
              }}
            />
          ))}
        </>
      ) : null}
      <ChromaKeyVideo
        characterId={current.id}
        className="ananta-main-video"
        fallback={current.fallback}
        highlighted={isCharacterHighlighted(current.id)}
        key={current.id}
        label={current.title}
        onProgress={onProgress}
        progress={progress}
        source={current.source}
        scrubbing={scrubbing}
        seekSignal={seekSignal}
      />
    </div>
  );
}

function ProductBar({
  highlightedAssetKey,
  onOpenChange,
  open,
  products,
  text,
  textScale,
}: {
  highlightedAssetKey: AssetKey | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  products: ProductItem[];
  text: PageText;
  textScale: TextScale;
}) {
  return (
    <aside
      className={open ? "ananta-products is-open" : "ananta-products"}
      aria-label="Products in this look"
    >
      <button
        aria-expanded={open}
        className="ananta-products-summary"
        onClick={() => onOpenChange(!open)}
        type="button"
      >
        <span>
          <span className="ananta-text-scale" style={textScaleStyle(textScale, "productsButtonLabel")}>
            <ScrambleText>{text.productsButtonLabel || `${products.length} Products`}</ScrambleText>
          </span>
        </span>
        <span className="ananta-muted">
          <span
            className="ananta-text-scale"
            style={textScaleStyle(textScale, open ? "productsClose" : "productsOpen")}
          >
            <ScrambleText>{open ? text.productsClose : text.productsOpen}</ScrambleText>
          </span>
        </span>
      </button>
      <div className="ananta-products-list">
        {products.map((product, index) => (
          <a
            className={[
              "ananta-product",
              highlightedAssetKey === (`product.${index}.image` as AssetKey)
                ? "is-highlighted-target"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            href="#"
            key={product.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={product.image} />
            <span>
              <span
                className="ananta-text-scale"
                style={{ "--ananta-text-scale": String(clampTextScale(product.titleScale ?? 1)) } as CSSProperties}
              >
                <ScrambleText>{product.title}</ScrambleText>
              </span>
            </span>
            <span className="ananta-muted">
              <span className="ananta-text-scale" style={textScaleStyle(textScale, "productView")}>
                <ScrambleText>{text.productView}</ScrambleText>
              </span>
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function ControllerPanel({
  editor,
  paused,
  menuOpen,
  onAssetChange,
  onAssetPreviewChange,
  onCharacterTextChange,
  onFontChange,
  onLogoScaleChange,
  onHiddenChange,
  onMenuOpenChange,
  onPausedChange,
  onProductTitleChange,
  onProductTitleScaleChange,
  onProductsOpenChange,
  onPublish,
  onResetEditor,
  onSeek,
  onTextChange,
  onTextScaleChange,
  onThumbAdd,
  onThumbChange,
  onThumbRemove,
  onTimelineLookChange,
  onChatCardChange,
  onUploadReady,
  productsOpen,
  progress,
}: {
  editor: EditorState;
  paused: boolean;
  menuOpen: boolean;
  onAssetChange: (key: AssetKey, source: string) => void;
  onAssetPreviewChange: (key: AssetKey | null) => void;
  onCharacterTextChange: (character: CharacterId, field: CharacterTextField, value: string) => void;
  onFontChange: (fontFamily: string) => void;
  onLogoScaleChange: (scale: number) => void;
  onHiddenChange: (key: HiddenKey, hidden: boolean) => void;
  onMenuOpenChange: (open: boolean) => void;
  onPausedChange: (paused: boolean) => void;
  onProductTitleChange: (index: number, title: string) => void;
  onProductTitleScaleChange: (index: number, scale: number) => void;
  onProductsOpenChange: (open: boolean) => void;
  onPublish: () => Promise<void>;
  onResetEditor: () => void;
  onSeek: (progress: number) => void;
  onTextChange: (key: TextKey, value: string) => void;
  onTextScaleChange: (key: TextKey, scale: number) => void;
  onThumbAdd: () => void;
  onThumbChange: (index: number, field: LookThumbField, value: string) => void;
  onThumbRemove: (index: number) => void;
  onTimelineLookChange: (index: number, field: "desktop" | "mobile" | "label", value: string) => void;
  onChatCardChange: (character: CharacterId, field: "avatar" | "name" | "dialog", value: string) => void;
  onUploadReady: (source: string, objectUrl: string) => void;
  productsOpen: boolean;
  progress: number;
}) {
  const [visible, setVisible] = useState(false);
  const [assetKey, setAssetKey] = useState<AssetKey>("mainVideo");
  const [assetUrl, setAssetUrl] = useState("");
  const [feedback, setFeedback] = useState<ControllerFeedback>({
    message: "控制器已准备好。改动会先在当前页面预览。",
    tone: "info",
  });
  const [publishing, setPublishing] = useState(false);
  const uploadedUrlsRef = useRef<string[]>([]);
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const controllerRef = useRef<HTMLElement>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoPreviewSource, setLogoPreviewSource] = useState<string | null>(null);
  const [bgDesktopPreviewUrl, setBgDesktopPreviewUrl] = useState<string | null>(null);
  const [bgDesktopPreviewSource, setBgDesktopPreviewSource] = useState<string | null>(null);
  const [bgMobilePreviewUrl, setBgMobilePreviewUrl] = useState<string | null>(null);
  const [bgMobilePreviewSource, setBgMobilePreviewSource] = useState<string | null>(null);
  const [timelineUploadIndex, setTimelineUploadIndex] = useState<number | null>(null);
  const [timelineUploadField, setTimelineUploadField] = useState<"desktop" | "mobile" | null>(null);
  const [timelinePreviewUrl, setTimelinePreviewUrl] = useState<string | null>(null);
  const [timelinePreviewSource, setTimelinePreviewSource] = useState<string | null>(null);
const assetOptions = getAssetOptions(editor);
  const effectiveAssetKey = assetOptions.some((option) => option.key === assetKey)
    ? assetKey
    : "mainVideo";

  const showFeedback = useCallback((message: string, tone: ControllerFeedback["tone"] = "success") => {
    setFeedback({ message, tone });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVisible(new URLSearchParams(window.location.search).has("controller"));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    onAssetPreviewChange(visible ? effectiveAssetKey : null);

    return () => onAssetPreviewChange(null);
  }, [effectiveAssetKey, onAssetPreviewChange, visible]);

  useEffect(() => {
    const uploadedUrls = uploadedUrlsRef.current;

    return () => {
      uploadedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleAssetFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }

      try {
        const codecCheck = await checkVideoCodec(file);
        if (!codecCheck.ok) {
          showFeedback(`${file.name}：${codecCheck.message} 当前页面素材未被替换。`, "warning");
          return;
        }

        const source = await saveUploadToDb(file);
        const objectUrl = URL.createObjectURL(file);
        onUploadReady(source, objectUrl);
        onAssetChange(effectiveAssetKey, source);
        showFeedback(
          codecCheck.message
            ? `已上传 ${file.name} 到「${effectiveAssetKey}」。素材已存入浏览器本地。${codecCheck.message}`
            : `已上传 ${file.name} 到「${effectiveAssetKey}」。素材已存入浏览器本地，刷新后也会恢复。`,
          codecCheck.message ? "warning" : "success",
        );
      } catch {
        showFeedback(
          `无法保存 ${file.name}。可以尝试更小的 MP4，或放入 public/images/ananta 后填写路径。`,
          "warning",
        );
      }
    },
    [effectiveAssetKey, onAssetChange, onUploadReady, showFeedback],
  );

  const handleFontFile = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }

      const url = URL.createObjectURL(file);
      uploadedUrlsRef.current.push(url);
      onFontChange(`"Ananta Custom Font", ${defaultFontFamily}`);
      showFeedback(
        `已上传字体 ${file.name}。当前页面会立即预览，刷新后这个临时字体会清除。`,
        "success",
      );

      const nextStyle = document.createElement("style");
      nextStyle.id = "ananta-custom-font";
      nextStyle.textContent = `@font-face{font-family:"Ananta Custom Font";src:url("${url}");font-weight:400 900;font-style:normal;}`;
      document.head.append(nextStyle);
    },
    [onFontChange, showFeedback],
  );

  
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const cx = "touches"in e?e.touches[0].clientX:e.clientX, cy = "touches"in e?e.touches[0].clientY:e.clientY, ox=dragPos?.x??window.innerWidth-420, oy=dragPos?.y??100;
    const m=(ev: MouseEvent | TouchEvent)=>{ev.preventDefault();setDragPos({x:ox+("touches"in ev?ev.touches[0].clientX:ev.clientX)-cx,y:oy+("touches"in ev?ev.touches[0].clientY:ev.clientY)-cy});};
    const u=()=>{document.removeEventListener("mousemove",m);document.removeEventListener("mouseup",u);document.removeEventListener("touchmove",m);document.removeEventListener("touchend",u);};
    document.addEventListener("mousemove",m);document.addEventListener("mouseup",u);document.addEventListener("touchmove",m,{passive:false});document.addEventListener("touchend",u);
  },[dragPos]);

  const handleLogoFile=useCallback(async(f: File | null)=>{if(!f)return;try{const s=await saveUploadToDb(f);let p;if(f.type==="image/svg+xml"||f.name.endsWith(".svg")){const t=await f.text();p=`data:image/svg+xml;base64,${btoa(t)}`;}else p=URL.createObjectURL(f);onUploadReady(s,p);setLogoPreviewUrl(p);setLogoPreviewSource(s);showFeedback("已上传。","info");}catch{showFeedback("无法处理。","warning");}},[onUploadReady,showFeedback]);
  const handleBgDesktopFile=useCallback(async(f: File | null)=>{if(!f)return;try{const s=await saveUploadToDb(f);const u=URL.createObjectURL(f);onUploadReady(s,u);setBgDesktopPreviewUrl(u);setBgDesktopPreviewSource(s);showFeedback("已上传桌面背景。","info");}catch{showFeedback("无法处理。","warning");}},[onUploadReady,showFeedback]);
  const handleBgMobileFile=useCallback(async(f: File | null)=>{if(!f)return;try{const s=await saveUploadToDb(f);const u=URL.createObjectURL(f);onUploadReady(s,u);setBgMobilePreviewUrl(u);setBgMobilePreviewSource(s);showFeedback("已上传手机背景。","info");}catch{showFeedback("无法处理。","warning");}},[onUploadReady,showFeedback]);

  const handleTimelineFile = useCallback(async (file: File | null, index: number, field: "desktop" | "mobile") => {
    if (!file) return;
    try {
      const source = await saveUploadToDb(file);
      const url = URL.createObjectURL(file);
      onUploadReady(source, url);
      setTimelineUploadIndex(index);
      setTimelineUploadField(field);
      setTimelinePreviewUrl(url);
      setTimelinePreviewSource(source);
      showFeedback("已上传，请确认。", "info");
    } catch { showFeedback("无法处理。", "warning"); }
  }, [onUploadReady, showFeedback]);
const handlePublish = useCallback(async () => {
    setPublishing(true);
    showFeedback("正在把当前版本发布到 3007 项目文件中...", "info");

    try {
      await onPublish();
      showFeedback(
        "发布成功。上传素材已保存为项目文件，页面也已切换到正式路径。",
        "success",
      );
    } catch (error) {
      showFeedback(error instanceof Error ? error.message : "发布失败，请再试一次。", "warning");
    } finally {
      setPublishing(false);
    }
  }, [onPublish, showFeedback]);

  if (!visible) {
    return null;
  }

  return (
    <section className="ananta-controller" ref={controllerRef} aria-label="Ananta 页面控制器" style={dragPos?{left:dragPos.x,top:dragPos.y,right:"auto",bottom:"auto"}:undefined}>
      <div className="ananta-controller-handle" onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
        <div className="ananta-controller-grip" aria-hidden="true"><span/><span/><span/></div>
        <strong>控制器</strong>
        <span>{Math.round(progress * 360)}&deg;</span>
      </div>
      <div className="ananta-controller-body">
      <div
        className={`ananta-controller-feedback is-${feedback.tone}`}
        role="status"
      >
        {feedback.message}
      </div>
      <div className="ananta-controller-actions">
        <button
          className="ananta-controller-primary"
          disabled={publishing}
          onClick={() => {
            void handlePublish();
          }}
          type="button"
        >
          {publishing ? "发布中..." : "发布当前版本"}
        </button>
      </div>
      <label className="ananta-controller-range">
        <span>旋转角度</span>
        <input
          aria-label="设置 LOOK 旋转进度"
          max="360"
          min="0"
          onChange={(event) => {
            onSeek(Number(event.currentTarget.value) / 360);
            showFeedback(`旋转角度已设为 ${event.currentTarget.value} 度。`, "info");
          }}
          type="range"
          value={Math.round(progress * 360)}
        />
      </label>
      <div className="ananta-controller-actions">
        <button
          onClick={() => {
            onSeek(0);
            showFeedback("旋转角度已设为 0 度。", "info");
          }}
          type="button"
        >
          0
        </button>
        <button
          onClick={() => {
            onSeek(0.25);
            showFeedback("旋转角度已设为 90 度。", "info");
          }}
          type="button"
        >
          90
        </button>
        <button
          onClick={() => {
            onSeek(0.5);
            showFeedback("旋转角度已设为 180 度。", "info");
          }}
          type="button"
        >
          180
        </button>
        <button
          onClick={() => {
            onSeek(0.75);
            showFeedback("旋转角度已设为 270 度。", "info");
          }}
          type="button"
        >
          270
        </button>
      </div>
      <div className="ananta-controller-actions">
        <button
          onClick={() => {
            onMenuOpenChange(!menuOpen);
            showFeedback(!menuOpen ? "菜单已打开。" : "菜单已关闭。", "info");
          }}
          type="button"
        >
          {menuOpen ? "关闭菜单" : "打开菜单"}
        </button>
        <button
          onClick={() => {
            onProductsOpenChange(!productsOpen);
            showFeedback(!productsOpen ? "产品面板已打开。" : "产品面板已关闭。", "info");
          }}
          type="button"
        >
          {productsOpen ? "关闭产品" : "打开产品"}
        </button>
        <button
          onClick={() => {
            onPausedChange(!paused);
            showFeedback(!paused ? "视频已暂停。" : "视频已播放。", "info");
          }}
          type="button"
        >
          {paused ? "播放" : "暂停"}
        </button>
      </div>
      <details className="ananta-controller-group" open>
        <summary>替换图片 / 视频素材</summary>
        <label className="ananta-controller-field">
          <span>目标素材</span>
          <select
            onChange={(event) => setAssetKey(event.currentTarget.value as AssetKey)}
            value={effectiveAssetKey}
          >
            {assetOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="ananta-controller-field">
          <span>上传文件</span>
          <input
            accept="image/*,video/*"
            onChange={(event) => handleAssetFile(event.currentTarget.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <label className="ananta-controller-field">
          <span>或填写素材路径</span>
          <input
            onChange={(event) => setAssetUrl(event.currentTarget.value)}
            placeholder="/images/..."
            type="text"
            value={assetUrl}
          />
        </label>
        <button
          onClick={() => {
            if (assetUrl.trim()) {
              onAssetChange(effectiveAssetKey, assetUrl.trim());
              showFeedback(
                `已把 ${assetUrl.trim()} 应用到「${effectiveAssetKey}」。如果没有显示，请刷新一次或检查路径。`,
                "success",
              );
            } else {
              showFeedback("还没有填写素材路径。", "warning");
            }
          }}
          type="button"
        >
          应用素材路径
        </button>
      </details>
      <details className="ananta-controller-group" open>
        <summary>替换顶部 Logo（预览确认）</summary>
        <label className="ananta-controller-field"><span>上传 Logo 文件</span>
          <input accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif" onChange={(e)=>{void handleLogoFile(e.currentTarget.files?.[0]??null);}} type="file" />
        </label>
        {logoPreviewUrl ? (
          <div className="ananta-controller-card">
            <div className="ananta-controller-row"><strong>预览</strong></div>
            <div style={{padding:"8px 0",textAlign:"center"}}><img alt="Logo 预览" src={logoPreviewUrl} style={{maxHeight:"60px",maxWidth:"100%",objectFit:"contain"}} /></div>
            <div className="ananta-controller-actions">
              <button className="ananta-controller-primary" onClick={()=>{onAssetChange("logoImage",logoPreviewSource??"");setLogoPreviewUrl(null);setLogoPreviewSource(null);}} type="button">确认使用</button>
              <button onClick={()=>{if(logoPreviewUrl)URL.revokeObjectURL(logoPreviewUrl);setLogoPreviewUrl(null);setLogoPreviewSource(null);}} type="button">取消</button>
            </div>
          </div>
        ) : null}
        <div className="ananta-controller-size-row">
          <span>Logo 缩放倍率</span>
          <button onClick={()=>{const ns=clampTextScale((editor.logoScale??1)-0.05);onLogoScaleChange(ns);}} type="button">-</button>
          <input aria-label="Logo 缩放倍率" max="2" min="0.5" onChange={(e)=>onLogoScaleChange(clampTextScale(Number(e.currentTarget.value)))} step="0.05" type="number" value={clampTextScale(editor.logoScale??1)} />
          <button onClick={()=>{const ns=clampTextScale((editor.logoScale??1)+0.05);onLogoScaleChange(ns);}} type="button">+</button>
        </div>
        {!logoPreviewUrl ? (
          <div className="ananta-controller-actions"><button onClick={()=>{onAssetChange("logoImage","");showFeedback("已恢复默认 Logo。","success");}} type="button">恢复默认 Logo</button></div>
        ) : null}
      </details>
      <details className="ananta-controller-group" open>
        <summary>替换背景图（预览确认）</summary>
        <div className="ananta-controller-card">
          <div className="ananta-controller-row"><strong>桌面端背景</strong></div>
          <label className="ananta-controller-field"><span>上传文件</span>
            <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleBgDesktopFile(e.currentTarget.files?.[0]??null);}} type="file" />
          </label>
          {bgDesktopPreviewUrl ? (
            <div style={{padding:"4px 0",textAlign:"center"}}><img alt="桌面背景预览" src={bgDesktopPreviewUrl} style={{maxHeight:"80px",maxWidth:"100%",objectFit:"cover",borderRadius:"2px"}} />
              <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                <button className="ananta-controller-primary" onClick={()=>{onAssetChange("bgDesktop",bgDesktopPreviewSource??"");setBgDesktopPreviewUrl(null);setBgDesktopPreviewSource(null);}} type="button">确认使用</button>
                <button onClick={()=>{if(bgDesktopPreviewUrl)URL.revokeObjectURL(bgDesktopPreviewUrl);setBgDesktopPreviewUrl(null);setBgDesktopPreviewSource(null);}} type="button">取消</button>
              </div>
            </div>
          ) : (<div className="ananta-controller-actions"><button onClick={()=>{onAssetChange("bgDesktop","");}} type="button">清除背景</button></div>)}
        </div>
        <div className="ananta-controller-card">
          <div className="ananta-controller-row"><strong>移动端背景</strong></div>
          <label className="ananta-controller-field"><span>上传文件</span>
            <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleBgMobileFile(e.currentTarget.files?.[0]??null);}} type="file" />
          </label>
          {bgMobilePreviewUrl ? (
            <div style={{padding:"4px 0",textAlign:"center"}}><img alt="手机背景预览" src={bgMobilePreviewUrl} style={{maxHeight:"80px",maxWidth:"100%",objectFit:"cover",borderRadius:"2px"}} />
              <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                <button className="ananta-controller-primary" onClick={()=>{onAssetChange("bgMobile",bgMobilePreviewSource??"");setBgMobilePreviewUrl(null);setBgMobilePreviewSource(null);}} type="button">确认使用</button>
                <button onClick={()=>{if(bgMobilePreviewUrl)URL.revokeObjectURL(bgMobilePreviewUrl);setBgMobilePreviewUrl(null);setBgMobilePreviewSource(null);}} type="button">取消</button>
              </div>
            </div>
          ) : (<div className="ananta-controller-actions"><button onClick={()=>{onAssetChange("bgMobile","");}} type="button">清除背景</button></div>)}
        </div>
      </details>
      <details className="ananta-controller-group">
        <summary>替换主字体</summary>
        <label className="ananta-controller-field">
          <span>字体名称</span>
          <input
            onChange={(event) => {
              onFontChange(event.currentTarget.value || defaultFontFamily);
              showFeedback("字体名称已更新，预览会立即生效。", "success");
            }}
            placeholder={defaultFontFamily}
            type="text"
            value={editor.fontFamily}
          />
        </label>
        <label className="ananta-controller-field">
          <span>上传字体文件</span>
          <input
            accept=".woff,.woff2,.ttf,.otf,font/*"
            onChange={(event) => handleFontFile(event.currentTarget.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <div className="ananta-controller-actions">
          <button
          onClick={() => {
            onFontChange(defaultFontFamily);
              showFeedback("已恢复默认字体。", "success");
            }}
            type="button"
          >
            恢复默认字体
          </button>
          <button
            onClick={() =>
              {
                onFontChange('"Microsoft YaHei", "PingFang SC", Arial, sans-serif');
                showFeedback("已应用中文字体方案。", "success");
              }
            }
            type="button"
          >
            中文字体方案
          </button>
        </div>
      </details>
      <details className="ananta-controller-group">
        <summary>右上 LOOK 缩略项</summary>
        <div className="ananta-controller-actions">
          <button
            onClick={() => {
              onThumbAdd();
              showFeedback("已新增一个 LOOK 项。可以在下方编辑链接、图片和视频。", "success");
            }}
            type="button"
          >
            新增项目
          </button>
        </div>
        {editor.thumbs.map((thumb, index) => (
          <div className="ananta-controller-card" key={`thumb-editor-${index}`}>
            <div className="ananta-controller-row">
              <strong>{`LOOK ${index + 1}`}</strong>
              <button
                disabled={editor.thumbs.length <= 1}
                onClick={() => {
                  onThumbRemove(index);
                  showFeedback(`已删除 LOOK ${index + 1}。`, "success");
                }}
                type="button"
              >
                删除
              </button>
            </div>
            <label className="ananta-controller-field">
              <span>标题</span>
              <input
                onChange={(event) => {
                  onThumbChange(index, "label", event.currentTarget.value);
                  showFeedback(`LOOK ${index + 1} 标题已更新。`, "success");
                }}
                type="text"
                value={thumb.label}
              />
            </label>
            <label className="ananta-controller-field">
              <span>模式</span>
              <select
                onChange={(event) => {
                  onThumbChange(index, "id", event.currentTarget.value);
                  showFeedback(`LOOK ${index + 1} 模式已更新。`, "success");
                }}
                value={thumb.id ?? ""}
              >
                {thumbCharacterOptions.map((option) => (
                  <option key={option.value || "link"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ananta-controller-field">
              <span>链接</span>
              <input
                onChange={(event) => {
                  onThumbChange(index, "href", event.currentTarget.value);
                  showFeedback(`LOOK ${index + 1} 链接已更新。`, "success");
                }}
                placeholder="#"
                type="text"
                value={thumb.href ?? ""}
              />
            </label>
            <label className="ananta-controller-field">
              <span>图片</span>
              <input
                onChange={(event) => {
                  onThumbChange(index, "src", event.currentTarget.value);
                  showFeedback(`LOOK ${index + 1} 图片路径已更新。如果浏览器缓存了旧图，请刷新一次。`, "success");
                }}
                placeholder="/images/ananta/..."
                type="text"
                value={thumb.src}
              />
            </label>
            <label className="ananta-controller-field">
              <span>视频</span>
              <input
                onChange={(event) => {
                  onThumbChange(index, "video", event.currentTarget.value);
                  showFeedback(`LOOK ${index + 1} 视频路径已更新。如果没有重新播放，请刷新一次。`, "success");
                }}
                placeholder="/images/ananta/..."
                type="text"
                value={thumb.video}
              />
            </label>
          </div>
        ))}
      </details>
      <details className="ananta-controller-group">
        <summary>替换文字内容</summary>
        <div className="ananta-controller-row">
          <strong>5 个角色主标题 / LOOK 编号</strong>
        </div>
        {characterOrder.map((character) => (
          <div className="ananta-controller-card" key={`character-text-${character}`}>
            <div className="ananta-controller-row">
              <strong>{character}</strong>
            </div>
            <label className="ananta-controller-field">
              <span>LOOK 编号</span>
              <input
                onChange={(event) => {
                  onCharacterTextChange(character, "lookNumber", event.currentTarget.value);
                  showFeedback(`${character} 的 LOOK 编号已更新。`, "success");
                }}
                placeholder="03 / 11"
                type="text"
                value={editor.characterText[character]?.lookNumber ?? characterCopy[character].lookNumber}
              />
            </label>
            <label className="ananta-controller-field">
              <span>主标题</span>
              <input
                onChange={(event) => {
                  onCharacterTextChange(character, "title", event.currentTarget.value);
                  showFeedback(`${character} 的主标题已更新。`, "success");
                }}
                type="text"
                value={editor.characterText[character]?.title ?? characterCopy[character].title}
              />
            </label>
          </div>
        ))}
        {textFields.map((field) => (
          <div className="ananta-controller-card" key={field.key}>
            <label className="ananta-controller-field">
              <span>{field.label}</span>
              {field.multiline ? (
                <textarea
                  onChange={(event) => {
                    onTextChange(field.key, event.currentTarget.value);
                    showFeedback(`${field.label} 已更新，文字会立即预览。`, "success");
                  }}
                  value={editor.text[field.key]}
                />
              ) : (
                <input
                  onChange={(event) => {
                    onTextChange(field.key, event.currentTarget.value);
                    showFeedback(`${field.label} 已更新，文字会立即预览。`, "success");
                  }}
                  type="text"
                  value={editor.text[field.key]}
                />
              )}
            </label>
            <div className="ananta-controller-size-row">
              <span>字号倍率</span>
              <button
                onClick={() => {
                  const nextScale = clampTextScale((editor.textScale[field.key] ?? 1) - 0.05);
                  onTextScaleChange(field.key, nextScale);
                  showFeedback(`${field.label} 字号已缩小到 ${nextScale.toFixed(2)} 倍。`, "success");
                }}
                type="button"
              >
                -
              </button>
              <input
                max="2"
                min="0.5"
                onChange={(event) => {
                  const nextScale = clampTextScale(Number(event.currentTarget.value));
                  onTextScaleChange(field.key, nextScale);
                  showFeedback(`${field.label} 字号已设为 ${nextScale.toFixed(2)} 倍。`, "success");
                }}
                step="0.05"
                type="number"
                value={clampTextScale(editor.textScale[field.key] ?? 1)}
              />
              <button
                onClick={() => {
                  const nextScale = clampTextScale((editor.textScale[field.key] ?? 1) + 0.05);
                  onTextScaleChange(field.key, nextScale);
                  showFeedback(`${field.label} 字号已放大到 ${nextScale.toFixed(2)} 倍。`, "success");
                }}
                type="button"
              >
                +
              </button>
            </div>
          </div>
        ))}
        {editor.products.map((product, index) => (
          <div className="ananta-controller-card" key={`product-title-${index}`}>
            <label className="ananta-controller-field">
              <span>{`产品 ${index + 1} 标题`}</span>
              <input
                onChange={(event) => {
                  onProductTitleChange(index, event.currentTarget.value);
                  showFeedback(`产品 ${index + 1} 标题已更新。`, "success");
                }}
                type="text"
                value={product.title}
              />
            </label>
            <div className="ananta-controller-size-row">
              <span>字号倍率</span>
              <button
                onClick={() => {
                  const nextScale = clampTextScale((product.titleScale ?? 1) - 0.05);
                  onProductTitleScaleChange(index, nextScale);
                  showFeedback(`产品 ${index + 1} 标题字号已缩小到 ${nextScale.toFixed(2)} 倍。`, "success");
                }}
                type="button"
              >
                -
              </button>
              <input
                max="2"
                min="0.5"
                onChange={(event) => {
                  const nextScale = clampTextScale(Number(event.currentTarget.value));
                  onProductTitleScaleChange(index, nextScale);
                  showFeedback(`产品 ${index + 1} 标题字号已设为 ${nextScale.toFixed(2)} 倍。`, "success");
                }}
                step="0.05"
                type="number"
                value={clampTextScale(product.titleScale ?? 1)}
              />
              <button
                onClick={() => {
                  const nextScale = clampTextScale((product.titleScale ?? 1) + 0.05);
                  onProductTitleScaleChange(index, nextScale);
                  showFeedback(`产品 ${index + 1} 标题字号已放大到 ${nextScale.toFixed(2)} 倍。`, "success");
                }}
                type="button"
              >
                +
              </button>
            </div>
          </div>
        ))}
        <button
          className="ananta-controller-primary"
          disabled={publishing}
          onClick={() => {
            void handlePublish();
          }}
          type="button"
        >
          {publishing ? "保存发布中..." : "保存文字并发布"}
        </button>
      </details>
      <details className="ananta-controller-group">
        <summary>隐藏指定板块</summary>
        <div className="ananta-controller-checks">
          {hiddenOptions.map((option) => (
            <label key={option.key}>
              <input
                checked={editor.hidden[option.key]}
                onChange={(event) => {
                  onHiddenChange(option.key, event.currentTarget.checked);
                  showFeedback(
                    `${option.label} 已${event.currentTarget.checked ? "隐藏" : "显示"}。`,
                    "success",
                  );
                }}
                type="checkbox"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            onResetEditor();
            setAssetUrl("");
            showFeedback("控制器内容已全部恢复默认。", "warning");
          }}
          type="button"
        >
          重置全部内容
        </button>
      </details>

      <details className="ananta-controller-group" open>
        <summary>走马灯各 LOOK 图片（上传预览确认）</summary>
                  <div className="ananta-controller-card" key={"tl-0"}>
            <div className="ananta-controller-row"><strong>Rebel</strong></div>
            <div className="ananta-controller-actions">
              <label className="ananta-controller-field" style={{flex:1}}><span>桌面端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,0,"desktop");}} type="file" />
              </label>
              <label className="ananta-controller-field" style={{flex:1}}><span>移动端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,0,"mobile");}} type="file" />
              </label>
            </div>
            {timelineUploadIndex === 0 && timelinePreviewUrl ? (
              <div style={{padding:"4px 0",textAlign:"center"}}>
                <img alt="预览" src={timelinePreviewUrl} style={{maxHeight:"60px",maxWidth:"100%",objectFit:"contain",borderRadius:"2px"}} />
                <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                  <button className="ananta-controller-primary" onClick={()=>{onTimelineLookChange(0,timelineUploadField??"desktop",timelinePreviewSource??"");setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">确认使用</button>
                  <button onClick={()=>{if(timelinePreviewUrl)URL.revokeObjectURL(timelinePreviewUrl);setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">取消</button>
                </div>
              </div>
            ) : (
              <div className="ananta-controller-actions">
                <span style={{color:"#999",fontSize:"calc(6*var(--ananta-rem))",textTransform:"none"}}>路径: {(()=>{try{return editor.timelineLookImages[0]?.desktop||"无"}catch{return"无"}})()}</span>
              </div>
            )}
          </div>
          <div className="ananta-controller-card" key={"tl-1"}>
            <div className="ananta-controller-row"><strong>Siren</strong></div>
            <div className="ananta-controller-actions">
              <label className="ananta-controller-field" style={{flex:1}}><span>桌面端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,1,"desktop");}} type="file" />
              </label>
              <label className="ananta-controller-field" style={{flex:1}}><span>移动端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,1,"mobile");}} type="file" />
              </label>
            </div>
            {timelineUploadIndex === 1 && timelinePreviewUrl ? (
              <div style={{padding:"4px 0",textAlign:"center"}}>
                <img alt="预览" src={timelinePreviewUrl} style={{maxHeight:"60px",maxWidth:"100%",objectFit:"contain",borderRadius:"2px"}} />
                <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                  <button className="ananta-controller-primary" onClick={()=>{onTimelineLookChange(1,timelineUploadField??"desktop",timelinePreviewSource??"");setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">确认使用</button>
                  <button onClick={()=>{if(timelinePreviewUrl)URL.revokeObjectURL(timelinePreviewUrl);setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">取消</button>
                </div>
              </div>
            ) : (
              <div className="ananta-controller-actions">
                <span style={{color:"#999",fontSize:"calc(6*var(--ananta-rem))",textTransform:"none"}}>路径: {(()=>{try{return editor.timelineLookImages[1]?.desktop||"无"}catch{return"无"}})()}</span>
              </div>
            )}
          </div>
          <div className="ananta-controller-card" key={"tl-2"}>
            <div className="ananta-controller-row"><strong>Kiddo</strong></div>
            <div className="ananta-controller-actions">
              <label className="ananta-controller-field" style={{flex:1}}><span>桌面端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,2,"desktop");}} type="file" />
              </label>
              <label className="ananta-controller-field" style={{flex:1}}><span>移动端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,2,"mobile");}} type="file" />
              </label>
            </div>
            {timelineUploadIndex === 2 && timelinePreviewUrl ? (
              <div style={{padding:"4px 0",textAlign:"center"}}>
                <img alt="预览" src={timelinePreviewUrl} style={{maxHeight:"60px",maxWidth:"100%",objectFit:"contain",borderRadius:"2px"}} />
                <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                  <button className="ananta-controller-primary" onClick={()=>{onTimelineLookChange(2,timelineUploadField??"desktop",timelinePreviewSource??"");setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">确认使用</button>
                  <button onClick={()=>{if(timelinePreviewUrl)URL.revokeObjectURL(timelinePreviewUrl);setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">取消</button>
                </div>
              </div>
            ) : (
              <div className="ananta-controller-actions">
                <span style={{color:"#999",fontSize:"calc(6*var(--ananta-rem))",textTransform:"none"}}>路径: {(()=>{try{return editor.timelineLookImages[2]?.desktop||"无"}catch{return"无"}})()}</span>
              </div>
            )}
          </div>
          <div className="ananta-controller-card" key={"tl-3"}>
            <div className="ananta-controller-row"><strong>Warrior</strong></div>
            <div className="ananta-controller-actions">
              <label className="ananta-controller-field" style={{flex:1}}><span>桌面端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,3,"desktop");}} type="file" />
              </label>
              <label className="ananta-controller-field" style={{flex:1}}><span>移动端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,3,"mobile");}} type="file" />
              </label>
            </div>
            {timelineUploadIndex === 3 && timelinePreviewUrl ? (
              <div style={{padding:"4px 0",textAlign:"center"}}>
                <img alt="预览" src={timelinePreviewUrl} style={{maxHeight:"60px",maxWidth:"100%",objectFit:"contain",borderRadius:"2px"}} />
                <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                  <button className="ananta-controller-primary" onClick={()=>{onTimelineLookChange(3,timelineUploadField??"desktop",timelinePreviewSource??"");setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">确认使用</button>
                  <button onClick={()=>{if(timelinePreviewUrl)URL.revokeObjectURL(timelinePreviewUrl);setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">取消</button>
                </div>
              </div>
            ) : (
              <div className="ananta-controller-actions">
                <span style={{color:"#999",fontSize:"calc(6*var(--ananta-rem))",textTransform:"none"}}>路径: {(()=>{try{return editor.timelineLookImages[3]?.desktop||"无"}catch{return"无"}})()}</span>
              </div>
            )}
          </div>
          <div className="ananta-controller-card" key={"tl-4"}>
            <div className="ananta-controller-row"><strong>Domina</strong></div>
            <div className="ananta-controller-actions">
              <label className="ananta-controller-field" style={{flex:1}}><span>桌面端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,4,"desktop");}} type="file" />
              </label>
              <label className="ananta-controller-field" style={{flex:1}}><span>移动端</span>
                <input accept="image/png,image/jpeg,image/webp" onChange={(e)=>{void handleTimelineFile(e.currentTarget.files?.[0]??null,4,"mobile");}} type="file" />
              </label>
            </div>
            {timelineUploadIndex === 4 && timelinePreviewUrl ? (
              <div style={{padding:"4px 0",textAlign:"center"}}>
                <img alt="预览" src={timelinePreviewUrl} style={{maxHeight:"60px",maxWidth:"100%",objectFit:"contain",borderRadius:"2px"}} />
                <div className="ananta-controller-actions" style={{marginTop:"6px"}}>
                  <button className="ananta-controller-primary" onClick={()=>{onTimelineLookChange(4,timelineUploadField??"desktop",timelinePreviewSource??"");setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">确认使用</button>
                  <button onClick={()=>{if(timelinePreviewUrl)URL.revokeObjectURL(timelinePreviewUrl);setTimelinePreviewUrl(null);setTimelinePreviewSource(null);setTimelineUploadIndex(null);setTimelineUploadField(null);}} type="button">取消</button>
                </div>
              </div>
            ) : (
              <div className="ananta-controller-actions">
                <span style={{color:"#999",fontSize:"calc(6*var(--ananta-rem))",textTransform:"none"}}>路径: {(()=>{try{return editor.timelineLookImages[4]?.desktop||"无"}catch{return"无"}})()}</span>
              </div>
            )}
          </div>
      </details>
      <details className="ananta-controller-group" open>
        <summary>每个角色的聊天头像框</summary>
        {(["rebel","siren","kiddo","warrior","domina"] as const).map((ch) => (
          <div className="ananta-controller-card" key={"chat-"+ch}>
            <div className="ananta-controller-row"><strong>{ch}</strong></div>
            <label className="ananta-controller-field"><span>头像路径</span><input onChange={(e)=>{onChatCardChange(ch,"avatar",e.currentTarget.value);}} type="text" value={editor.chatCards[ch]?.avatar??""} /></label>
            <label className="ananta-controller-field"><span>名字</span><input onChange={(e)=>{onChatCardChange(ch,"name",e.currentTarget.value);}} type="text" value={editor.chatCards[ch]?.name??""} /></label>
            <label className="ananta-controller-field"><span>对话框文案</span><textarea onChange={(e)=>{onChatCardChange(ch,"dialog",e.currentTarget.value);}} value={editor.chatCards[ch]?.dialog??""} /></label>
          </div>
        ))}
      </details>
      </div>
    </section>
  );
}

function Footer({ text, textScale }: { text: PageText; textScale: TextScale }) {
  return (
    <footer className="ananta-footer">
      <nav className="ananta-footer-bars" aria-label="Footer links">
        <div className="ananta-footer-group">
          <a href="#">
            <span className="ananta-text-scale" style={textScaleStyle(textScale, "footerTerms")}>
              <ScrambleText>{text.footerTerms}</ScrambleText>
            </span>
          </a>
          <a href="#">
            <span className="ananta-text-scale" style={textScaleStyle(textScale, "footerShipping")}>
              <ScrambleText>{text.footerShipping}</ScrambleText>
            </span>
          </a>
          <a href="#">
            <span className="ananta-text-scale" style={textScaleStyle(textScale, "footerSizeGuide")}>
              <ScrambleText>{text.footerSizeGuide}</ScrambleText>
            </span>
          </a>
        </div>
        <div className="ananta-footer-group">
          <a className="ananta-expanded" href="mailto:hello@anantaparis.com">
            <span className="ananta-text-scale" style={textScaleStyle(textScale, "footerEmail")}>
              <ScrambleText>{text.footerEmail}</ScrambleText>
            </span>
          </a>
          <a href="https://instagram.com/anantaparis">
            <span className="ananta-text-scale" style={textScaleStyle(textScale, "footerInstagram")}>
              <ScrambleText>{text.footerInstagram}</ScrambleText>
            </span>
          </a>
        </div>
      </nav>
      <p className="ananta-manifesto">
        <span className="ananta-text-scale" style={textScaleStyle(textScale, "footerManifesto")}>
          {text.footerManifesto}
        </span>
      </p>
    </footer>
  );
}

export function AnantaLookPage() {
  const [controllerPaused, setControllerPaused] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<CharacterId>("rebel");
  const [editor, setEditor] = useState<EditorState>(defaultEditorState);
  const [hydratedEditor, setHydratedEditor] = useState(false);
  const [highlightedAssetKey, setHighlightedAssetKey] = useState<AssetKey | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [scrubbing, setScrubbing] = useState(false);
  const [seekSignal, setSeekSignal] = useState(0);
  const [uploadedSources, setUploadedSources] = useState<Record<string, string>>({});
  const uploadedSourcesRef = useRef<Record<string, string>>({});
  const resolvedEditor = useMemo(
    () => resolveUploadedEditorSources(editor, uploadedSources),
    [editor, uploadedSources],
  );
  const characters = getCharacterMedia(resolvedEditor);

  useEffect(() => {
    uploadedSourcesRef.current = uploadedSources;
  }, [uploadedSources]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const controllerMode = new URLSearchParams(window.location.search).has("controller");

        if (controllerMode) {
          const saved = window.localStorage.getItem(editorStorageKey);
          if (saved) {
            if (!cancelled) {
              setEditor(mergeEditorState(JSON.parse(saved) as Partial<EditorState>));
            }
            return;
          }
        }

        const publishedEditor = await fetchPublishedEditorState();
        if (publishedEditor && !cancelled) {
          setEditor({
            ...publishedEditor,
            hidden: { ...publishedEditor.hidden, details: false, footer: false },
          });
        }
      } catch {
        window.localStorage.removeItem(editorStorageKey);
      } finally {
        if (!cancelled) {
          setHydratedEditor(true);
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedEditor) {
      return;
    }

    if (new URLSearchParams(window.location.search).has("controller")) {
      window.localStorage.setItem(editorStorageKey, JSON.stringify(editor));
    }
  }, [editor, hydratedEditor]);

  useEffect(() => {
    const sources = collectUploadedAssetSources(editor);
    let cancelled = false;

    setUploadedSources((current) => {
      const next = { ...current };
      for (const [source, url] of Object.entries(next)) {
        if (!sources.includes(source)) {
          URL.revokeObjectURL(url);
          delete next[source];
        }
      }
      return next;
    });

    void Promise.all(
      sources.map(async (source) => {
        if (uploadedSourcesRef.current[source]) {
          return;
        }

        const upload = await readUploadFromDb(source);
        if (!upload || cancelled) {
          return;
        }

        const objectUrl = URL.createObjectURL(upload.blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setUploadedSources((current) => ({
          ...current,
          [source]: objectUrl,
        }));
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [editor]);

  useEffect(
    () => () => {
      Object.values(uploadedSourcesRef.current).forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const handleUploadReady = useCallback((source: string, objectUrl: string) => {
    setUploadedSources((current) => {
      if (current[source]) {
        URL.revokeObjectURL(current[source]);
      }

      return {
        ...current,
        [source]: objectUrl,
      };
    });
  }, []);

  const handleResetEditor = useCallback(() => {
    setEditor(defaultEditorState);
    window.localStorage.removeItem(editorStorageKey);
    setUploadedSources((current) => {
      Object.values(current).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
    void clearUploadDb();
  }, []);

  const handlePublishEditor = useCallback(async () => {
    const publishedEditor = await publishEditorState(editor);
    setEditor(publishedEditor);
    window.localStorage.setItem(editorStorageKey, JSON.stringify(publishedEditor));
  }, [editor]);

  const handleSeek = useCallback((nextProgress: number) => {
    setProgress(nextProgress);
    setSeekSignal((signal) => signal + 1);
  }, []);

  const handleControlledSeek = useCallback(
    (nextProgress: number) => {
      handleSeek(nextProgress);
      setControllerPaused(true);
    },
    [handleSeek],
  );

  const handleAssetChange = useCallback((key: AssetKey, source: string) => {
    setEditor((state) => updateAssetState(state, key, source));
  }, []);

  const handleCharacterTextChange = useCallback(
    (character: CharacterId, field: CharacterTextField, value: string) => {
      setEditor((state) => {
        const nextCharacterText = {
          ...state.characterText,
          [character]: {
            ...state.characterText[character],
            [field]: value,
          },
        };
        const nextText =
          character === currentCharacter
            ? {
                ...state.text,
                ...(field === "lookNumber"
                  ? {
                      lookKicker: value,
                      lookNavSuffix: value.replace(/\s/g, ""),
                    }
                  : {
                      lookTitle: value,
                    }),
              }
            : state.text;

        return {
          ...state,
          characterText: nextCharacterText,
          text: nextText,
        };
      });
    },
    [currentCharacter],
  );

  const handleLogoScaleChange = useCallback((scale: number) => { setEditor((s) => ({...s, logoScale: clampTextScale(scale)})); }, []);

  const handleFontChange = useCallback((fontFamily: string) => {
    setEditor((state) => ({ ...state, fontFamily }));
  }, []);

  const handleHiddenChange = useCallback((key: HiddenKey, hidden: boolean) => {
    setEditor((state) => ({
      ...state,
      hidden: {
        ...state.hidden,
        [key]: hidden,
      },
    }));
  }, []);

  const handleProductTitleChange = useCallback((index: number, title: string) => {
    setEditor((state) => ({
      ...state,
      products: state.products.map((product, productIndex) =>
        productIndex === index ? { ...product, title } : product,
      ),
    }));
  }, []);

  const handleProductTitleScaleChange = useCallback((index: number, scale: number) => {
    setEditor((state) => ({
      ...state,
      products: state.products.map((product, productIndex) =>
        productIndex === index ? { ...product, titleScale: clampTextScale(scale) } : product,
      ),
    }));
  }, []);

  const handleTextChange = useCallback((key: TextKey, value: string) => {
    setEditor((state) => ({
      ...state,
      characterText:
        key === "lookTitle" || key === "lookKicker" || key === "lookNavSuffix"
          ? {
              ...state.characterText,
              [currentCharacter]: {
                ...state.characterText[currentCharacter],
                ...(key === "lookTitle"
                  ? { title: value }
                  : { lookNumber: normalizeLookNumber(value) }),
              },
            }
          : state.characterText,
      text: {
        ...state.text,
        [key]: value,
      },
    }));
  }, [currentCharacter]);

  const handleTextScaleChange = useCallback((key: TextKey, scale: number) => {
    setEditor((state) => ({
      ...state,
      textScale: {
        ...state.textScale,
        [key]: clampTextScale(scale),
      },
    }));
  }, []);

  const handleTimelineLookChange = useCallback(
    (index: number, field: "desktop" | "mobile" | "label", value: string) => {
      setEditor((state) => ({
        ...state,
        timelineLookImages: state.timelineLookImages.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      }));
    },
    [],
  );

  const handleChatCardChange = useCallback(
    (character: CharacterId, field: "avatar" | "name" | "dialog", value: string) => {
      setEditor((state) => ({
        ...state,
        chatCards: {
          ...state.chatCards,
          [character]: { ...state.chatCards[character], [field]: value },
        },
      }));
    },
    [],
  );

  const handleThumbAdd = useCallback(() => {
    setEditor((state) => ({
      ...state,
      thumbs: [...state.thumbs, createLookThumb(state.thumbs.length)],
    }));
  }, []);

  const handleThumbChange = useCallback(
    (index: number, field: LookThumbField, value: string) => {
      setEditor((state) => ({
        ...state,
        thumbs: state.thumbs.map((thumb, thumbIndex) => {
          if (thumbIndex !== index) {
            return thumb;
          }

          if (field === "id") {
            return {
              ...thumb,
              id: value ? (value as CharacterId) : undefined,
            };
          }

          return {
            ...thumb,
            [field]: value,
          };
        }),
      }));
    },
    [],
  );

  const handleThumbRemove = useCallback((index: number) => {
    setEditor((state) => {
      if (state.thumbs.length <= 1) {
        return state;
      }

      return {
        ...state,
        thumbs: state.thumbs.filter((_, thumbIndex) => thumbIndex !== index),
      };
    });
  }, []);

  const handleCharacterSelect = useCallback((character: CharacterId) => {
    if (!characterCopy[character]) {
      return;
    }

    setCurrentCharacter(character);
    setProgress(initialProgress);
    setSeekSignal((signal) => signal + 1);
    setControllerPaused(false);
    setEditor((state) => {
      const copy = state.characterText[character] ?? characterCopy[character];

      return {
        ...state,
        text: {
          ...state.text,
          lookKicker: copy.lookNumber,
          lookNavSuffix: copy.lookNumber.replace(/\s/g, ""),
          lookTitle: copy.title,
        },
        thumbs: state.thumbs.map((thumb) => ({
          ...thumb,
          current: thumb.id === character,
        })),
      };
    });
  }, []);

  useEffect(() => {
    const setControlledProgress = (nextProgress: number) => {
      if (!Number.isFinite(nextProgress)) {
        return;
      }
      const normalized =
        Math.abs(nextProgress) > 1 ? nextProgress / 360 : nextProgress;
      handleControlledSeek(clampProgress(normalized));
    };

    const controller: AnantaPageController = {
      addLookThumb: (thumb) =>
        setEditor((state) => ({
          ...state,
          thumbs: [...state.thumbs, createLookThumb(state.thumbs.length, thumb)],
        })),
      closeMenu: () => setMenuOpen(false),
      closeProducts: () => setProductsOpen(false),
      describe: () => ({
        breakpoint: "(max-width: 900px)",
        controller: "window.anantaPageController",
        editorControls: [
          "setAsset(key, source)",
          "setText(key, value)",
          "setFont(fontFamily)",
          "hideSection(section)",
          "showSection(section)",
          "toggleSection(section)",
          "selectCharacter(character)",
          "addLookThumb(thumb)",
          "setLookThumb(index, patch)",
          "removeLookThumb(index)",
        ],
        sections: [
          "header",
          "look navigation",
          "look information",
          "video progress bar",
          "figure field",
          "product bar",
          "footer",
        ],
        responsiveResources: [
          "timeline desktop/mobile image",
          "look thumbnail desktop video/mobile image",
          "desktop product list/mobile collapsed product panel",
        ],
      }),
      getState: () => ({
        angle: Math.round(progress * 360),
        breakpoint: window.matchMedia("(max-width: 900px)").matches
          ? "mobile"
          : "desktop",
        menuOpen,
        productsOpen,
        progress,
        currentCharacter,
        paused: controllerPaused,
        editor,
        viewport: {
          height: window.innerHeight,
          width: window.innerWidth,
        },
      }),
      hideSection: (section: HiddenKey) => handleHiddenChange(section, true),
      openMenu: () => setMenuOpen(true),
      openProducts: () => setProductsOpen(true),
      pause: () => setControllerPaused(true),
      play: () => setControllerPaused(false),
      removeLookThumb: handleThumbRemove,
      resetEditor: handleResetEditor,
      selectCharacter: handleCharacterSelect,
      setAngle: (degrees: number) => setControlledProgress(degrees / 360),
      setAsset: handleAssetChange,
      setFont: handleFontChange,
      setLookThumb: (index, patch) =>
        setEditor((state) => ({
          ...state,
          thumbs: state.thumbs.map((thumb, thumbIndex) =>
            thumbIndex === index ? { ...thumb, ...patch } : thumb,
          ),
        })),
      setProgress: setControlledProgress,
      setText: handleTextChange,
      showSection: (section: HiddenKey) => handleHiddenChange(section, false),
      toggleMenu: () => setMenuOpen((open) => !open),
      toggleProducts: () => setProductsOpen((open) => !open),
      toggleSection: (section: HiddenKey) =>
        setEditor((state) => ({
          ...state,
          hidden: {
            ...state.hidden,
            [section]: !state.hidden[section],
          },
        })),
    };

    window.anantaPageController = controller;
    window.dispatchEvent(new CustomEvent("ananta:controller-ready"));

    return () => {
      if (window.anantaPageController === controller) {
        delete window.anantaPageController;
      }
    };
  }, [
    controllerPaused,
    currentCharacter,
    editor,
    handleAssetChange,
    handleControlledSeek,
    handleFontChange,
    handleHiddenChange,
    handleCharacterSelect,
    handleResetEditor,
    handleTextChange,
    handleThumbRemove,
    menuOpen,
    productsOpen,
    progress,
  ]);

  return (
    <main
      className="ananta-page"
      data-controller-ready="true"
      data-menu-open={menuOpen ? "true" : "false"}
      data-paused={controllerPaused ? "true" : "false"}
      data-products-open={productsOpen ? "true" : "false"}
      data-progress={progress.toFixed(4)}
      style={{
        fontFamily: editor.fontFamily,
        "--ananta-bg-desktop": resolvedEditor.assets.bgDesktop
          ? `url(${resolvedEditor.assets.bgDesktop})`
          : "none",
        "--ananta-bg-mobile": resolvedEditor.assets.bgMobile
          ? `url(${resolvedEditor.assets.bgMobile})`
          : "none",
        "--ananta-logo-scale": editor.logoScale ?? 1,
      } as React.CSSProperties}
    >
      {!editor.hidden.header ? (
        <Header
          assets={resolvedEditor.assets}
          highlightedAssetKey={highlightedAssetKey}
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          text={editor.text}
          textScale={editor.textScale}
        />
      ) : null}
      {!editor.hidden.lookNav ? (
        <LookNavBar
          currentCharacter={currentCharacter}
          highlightedAssetKey={highlightedAssetKey}
          onCharacterSelect={handleCharacterSelect}
          text={editor.text}
          textScale={editor.textScale}
          thumbs={resolvedEditor.thumbs}
        />
      ) : null}
      <section className="ananta-hero">
        {!editor.hidden.lookInfo ? (
          <LookInfo
            assets={resolvedEditor.assets}
            highlightedAssetKey={highlightedAssetKey}
            hidden={editor.hidden}
            onScrubEnd={() => setScrubbing(false)}
            onScrubStart={() => setScrubbing(true)}
            onSeek={handleSeek}
            progress={progress}
            text={editor.text}
            textScale={editor.textScale}
            timelineLookImages={resolvedEditor.timelineLookImages}
            currentCharacter={currentCharacter}
            chatCards={resolvedEditor.chatCards}
            chatDialogScale={editor.chatDialogScale}
          />
        ) : null}
        {!editor.hidden.figure ? (
          <FigureField
            characters={characters}
            currentCharacter={currentCharacter}
            highlightedAssetKey={highlightedAssetKey}
            hideGhosts={editor.hidden.ghosts}
            onCharacterSelect={handleCharacterSelect}
            onProgress={setProgress}
            progress={progress}
            scrubbing={scrubbing || controllerPaused}
            seekSignal={seekSignal}
          />
        ) : null}
        {!editor.hidden.products ? (
          <ProductBar
            highlightedAssetKey={highlightedAssetKey}
            onOpenChange={setProductsOpen}
            open={productsOpen}
            products={resolvedEditor.products}
            text={editor.text}
            textScale={editor.textScale}
          />
        ) : null}
      </section>
      <ControllerPanel
        editor={editor}
        paused={controllerPaused}
        menuOpen={menuOpen}
        onAssetChange={handleAssetChange}
        onAssetPreviewChange={setHighlightedAssetKey}
        onCharacterTextChange={handleCharacterTextChange}
        onLogoScaleChange={handleLogoScaleChange}
        onFontChange={handleFontChange}
        onHiddenChange={handleHiddenChange}
        onMenuOpenChange={setMenuOpen}
        onPausedChange={setControllerPaused}
        onProductTitleChange={handleProductTitleChange}
        onProductTitleScaleChange={handleProductTitleScaleChange}
        onProductsOpenChange={setProductsOpen}
        onPublish={handlePublishEditor}
        onResetEditor={handleResetEditor}
        onSeek={handleControlledSeek}
        onTextChange={handleTextChange}
        onTextScaleChange={handleTextScaleChange}
        onThumbAdd={handleThumbAdd}
        onThumbChange={handleThumbChange}
        onThumbRemove={handleThumbRemove}
        onTimelineLookChange={handleTimelineLookChange}
        onChatCardChange={handleChatCardChange}
        onUploadReady={handleUploadReady}
        productsOpen={productsOpen}
        progress={progress}
      />
      {!editor.hidden.footer ? <Footer text={editor.text} textScale={editor.textScale} /> : null}
    </main>
  );
}
