var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This plugin resizes component instances based on the aspect ratio of their nested image layers
figma.showUI(__html__, { themeColors: true, width: 240, height: 204 });
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'resize-cards') {
        yield resizeSelectedCards(msg.options);
        figma.ui.postMessage({ type: 'resize-done' });
    }
});
// Type guard to check if a node can be resized
function isResizable(node) {
    return 'resize' in node;
}
// Type guard to check if a node is an instance
function isInstance(node) {
    return node.type === 'INSTANCE';
}
function resizeSelectedCards(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { imageLayerName = "image", maintainWidth = true, } = options;
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.notify("Please select at least one component instance");
            return;
        }
        let resizedCount = 0;
        let skippedCount = 0;
        // Process each selected node
        for (const node of selection) {
            try {
                // Check if the node is resizable and is an instance
                if (!isResizable(node)) {
                    console.log(`Node "${node.name}" is not resizable, skipping`);
                    skippedCount++;
                    continue;
                }
                // Find the image layer within the instance
                const imageLayers = findLayersByName(node, imageLayerName);
                if (imageLayers.length === 0) {
                    console.log(`No layer named "${imageLayerName}" found in instance`);
                    continue;
                }
                const imageLayer = imageLayers[0]; // Use the first matching image layer
                // Check if the image layer has fills
                if ('fills' in imageLayer) {
                    // Check if fills is an array and not the unique symbol
                    if (Array.isArray(imageLayer.fills)) {
                        const imageFills = imageLayer.fills
                            .filter(fill => fill.type === 'IMAGE')
                            .map(fill => fill);
                        if (imageFills.length > 0) {
                            const imageFill = imageFills[0]; // Use the first image fill
                            if (imageFill.imageHash) {
                                // Get the natural dimensions of the image
                                const image = figma.getImageByHash(imageFill.imageHash);
                                const imageData = yield image.getBytesAsync();
                                // Get image dimensions through the UI
                                figma.ui.postMessage({
                                    type: 'get-image-dimensions',
                                    imageData: Array.from(imageData)
                                });
                                // Wait for response with dimensions
                                const dimensions = yield new Promise(resolve => {
                                    figma.ui.once('message', (msg) => {
                                        if (msg.type === 'image-dimensions') {
                                            resolve(msg.dimensions);
                                        }
                                    });
                                });
                                if (dimensions) {
                                    const { width, height } = dimensions;
                                    const imageAspectRatio = width / height;
                                    // Get the current dimensions
                                    const cardWidth = node.width;
                                    const cardHeight = node.height;
                                    const imageLayerWidth = imageLayer.width;
                                    const imageLayerHeight = imageLayer.height;
                                    // Calculate how much of the card is the image vs. body content
                                    // In a component instance, we can't modify the internal layout,
                                    // but we can estimate the body height
                                    const currentBodyHeight = cardHeight - imageLayerHeight;
                                    // Ensure we respect the minimum body height
                                    const bodyHeight = Math.max(currentBodyHeight);
                                    //const bodyHeight = Math.max(currentBodyHeight, minBodyHeight);
                                    // Calculate the ideal image height based on the actual image aspect ratio
                                    const idealImageHeight = imageLayerWidth / imageAspectRatio;
                                    // Calculate new total card height: ideal image height + body height
                                    const newCardHeight = idealImageHeight + bodyHeight;
                                    // Resize the card instance (we're maintaining width in this approach)
                                    if (maintainWidth) {
                                        node.resize(cardWidth, newCardHeight);
                                    }
                                    else {
                                        // If not maintaining width, calculate based on aspect ratio
                                        const idealImageWidth = imageLayerHeight * imageAspectRatio;
                                        const widthRatio = idealImageWidth / imageLayerWidth;
                                        const newCardWidth = cardWidth * widthRatio;
                                        node.resize(newCardWidth, cardHeight);
                                    }
                                    resizedCount++;
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error("Error processing card:", error);
            }
        }
        let message = `Resized ${resizedCount} card${resizedCount !== 1 ? 's' : ''}`;
        if (skippedCount > 0) {
            message += ` (skipped ${skippedCount} non-resizable node${skippedCount !== 1 ? 's' : ''})`;
        }
        figma.notify(message);
    });
}
// Helper function to find layers by name recursively
function findLayersByName(node, name) {
    const results = [];
    // Check if the current node's name matches
    if ('name' in node && node.name.toLowerCase() === name.toLowerCase()) {
        results.push(node);
    }
    // Check children if this node has them
    if ('children' in node) {
        const children = node.children;
        for (const child of children) {
            results.push(...findLayersByName(child, name));
        }
    }
    return results;
}
