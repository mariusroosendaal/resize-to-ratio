import { createSettingsStore } from "figma-plugin-utilities/lib/figma-helpers";

figma.showUI(__html__, { themeColors: true, width: 240, height: 226 });

const STORAGE_KEY = "resize-to-ratio-settings";

interface ResizeSettings {
  imageLayerName: string;
  maintainWidth: boolean;
}

const settingsStore = createSettingsStore<ResizeSettings>(
  STORAGE_KEY,
  (raw) => {
    const obj =
      typeof raw === "object" && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    return {
      imageLayerName:
        typeof obj.imageLayerName === "string" ? obj.imageLayerName : "image",
      maintainWidth:
        typeof obj.maintainWidth === "boolean" ? obj.maintainWidth : true,
    };
  },
);

const sendSelectionCount = () => {
  figma.ui.postMessage({
    type: "selection-change",
    count: figma.currentPage.selection.length,
  });
};

figma.on("selectionchange", sendSelectionCount);

(async () => {
  const settings = await settingsStore.load();
  figma.ui.postMessage({ type: "plugin-ready", settings });
  sendSelectionCount();
})();

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "resize-cards") return;

  if (
    typeof msg.options !== "object" ||
    msg.options === null ||
    Array.isArray(msg.options)
  ) {
    figma.ui.postMessage({ type: "resize-done" });
    return;
  }

  try {
    await resizeSelectedCards(msg.options);
    await settingsStore.save(msg.options);
    sendSelectionCount();
  } catch (error) {
    console.error("Resize failed:", error);
    figma.notify("Something went wrong.", { error: true });
  } finally {
    figma.ui.postMessage({ type: "resize-done" });
  }
};

interface ResizeOptions {
  imageLayerName: string;
  maintainWidth: boolean;
}

function isResizable(node: SceneNode): node is ResizeableNode {
  return "resize" in node;
}

type ResizeableNode = SceneNode & {
  resize(width: number, height: number): void;
};

async function resizeSelectedCards(options: ResizeOptions) {
  const { imageLayerName = "image", maintainWidth = true } = options;
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("Please select at least one component instance.", {
      error: true,
    });
    return;
  }

  let skippedCount = 0;
  let unavailableCount = 0;

  type Candidate = {
    node: ResizeableNode;
    imageLayer: SceneNode;
    imageFill: ImagePaint;
  };
  const candidates: Candidate[] = [];

  for (const node of selection) {
    if (!isResizable(node)) {
      skippedCount++;
      continue;
    }
    const imageLayer = findFirstLayerByName(node, imageLayerName);
    if (!imageLayer) continue;
    if (!("fills" in imageLayer) || !Array.isArray(imageLayer.fills)) continue;
    const imageFill = (imageLayer.fills as Paint[]).find(
      (f): f is ImagePaint => f.type === "IMAGE" && !!f.imageHash,
    );
    if (!imageFill) continue;
    candidates.push({ node, imageLayer, imageFill });
  }

  const sizeResults = await Promise.all(
    candidates.map(async ({ node, imageLayer, imageFill }) => {
      const image = figma.getImageByHash(imageFill.imageHash!);
      if (!image) return null;
      try {
        const { width, height } = await image.getSizeAsync();
        return { node, imageLayer, aspectRatio: width / height };
      } catch {
        unavailableCount++;
        return null;
      }
    }),
  );

  let resizedCount = 0;
  for (const result of sizeResults) {
    if (!result) continue;
    const { node, imageLayer, aspectRatio } = result;
    const cardWidth = node.width;
    const cardHeight = node.height;
    const imageLayerWidth = imageLayer.width;
    const imageLayerHeight = imageLayer.height;
    const currentBodyHeight = cardHeight - imageLayerHeight;

    if (maintainWidth) {
      node.resize(cardWidth, imageLayerWidth / aspectRatio + currentBodyHeight);
    } else {
      node.resize(
        cardWidth * ((imageLayerHeight * aspectRatio) / imageLayerWidth),
        cardHeight,
      );
    }
    resizedCount++;
  }

  if (resizedCount === 0) {
    const reason =
      candidates.length === 0
        ? `no layer named "${imageLayerName}" with an image fill was found`
        : "image dimensions could not be read";
    figma.notify(`No cards resized — ${reason}.`, { error: true });
    return;
  }

  let message = `Resized ${resizedCount} card${resizedCount !== 1 ? "s" : ""}`;
  if (unavailableCount > 0) {
    message += `, skipped ${unavailableCount} (image not loaded)`;
  }
  if (skippedCount > 0) {
    message += `, skipped ${skippedCount} non-resizable node${skippedCount !== 1 ? "s" : ""}`;
  }
  message += ". Press Ctrl/Cmd+Z to undo.";
  figma.notify(message);
}

// Searches descendants only — skipping the root — so a card named "image" won't match itself.
function findFirstLayerByName(node: BaseNode, name: string): SceneNode | null {
  if ("children" in node) {
    for (const child of node.children) {
      if ("name" in child && child.name.toLowerCase() === name.toLowerCase()) {
        return child as SceneNode;
      }
      const found = findFirstLayerByName(child, name);
      if (found) return found;
    }
  }
  return null;
}
