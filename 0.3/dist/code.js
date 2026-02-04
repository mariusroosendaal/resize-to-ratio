var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This plugin resizes component instances based on the aspect ratio of their nested image layers.
// It now includes a listener for selection changes to update the UI.
figma.showUI(__html__, { themeColors: true, width: 240, height: 219 });
// --- Selection Handling ---
// Function to post the current selection count to the UI
const sendSelectionCount = () => {
    const selectionCount = figma.currentPage.selection.length;
    figma.ui.postMessage({ type: 'selection-change', count: selectionCount });
};
// Send the initial selection count when the plugin is opened
sendSelectionCount();
// Listen for any changes in the user's selection and update the UI
figma.on('selectionchange', () => {
    sendSelectionCount();
});
// --- Message Handling ---
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'resize-cards') {
        yield resizeSelectedCards(msg.options);
        // After resizing, send the latest selection count back to correctly set the button state
        sendSelectionCount();
        figma.ui.postMessage({ type: 'resize-done' });
    }
});
// Type guard to check if a node can be resized
function isResizable(node) {
    return 'resize' in node;
}
function resizeSelectedCards(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { imageLayerName = "image", maintainWidth = true, } = options;
        const selection = figma.currentPage.selection;
        // This check is a safeguard, but the UI should prevent this from being called with 0 selection.
        if (selection.length === 0) {
            figma.notify("Please select at least one component instance");
            return;
        }
        let resizedCount = 0;
        let skippedCount = 0;
        // Process each selected node
        for (const node of selection) {
            try {
                // Check if the node is resizable
                if (!isResizable(node)) {
                    console.log(`Node "${node.name}" is not resizable, skipping`);
                    skippedCount++;
                    continue;
                }
                // Find the image layer within the node
                const imageLayers = findLayersByName(node, imageLayerName);
                if (imageLayers.length === 0) {
                    console.log(`No layer named "${imageLayerName}" found in "${node.name}"`);
                    continue;
                }
                const imageLayer = imageLayers[0]; // Use the first matching image layer
                // Check if the image layer has image fills
                if ('fills' in imageLayer && Array.isArray(imageLayer.fills)) {
                    const imageFills = imageLayer.fills.filter(fill => fill.type === 'IMAGE');
                    if (imageFills.length > 0 && imageFills[0].imageHash) {
                        const imageFill = imageFills[0];
                        const image = figma.getImageByHash(imageFill.imageHash);
                        if (!image)
                            continue;
                        // Get image dimensions
                        const { width: naturalWidth, height: naturalHeight } = yield image.getSizeAsync();
                        const imageAspectRatio = naturalWidth / naturalHeight;
                        // Get the current dimensions of the card and the image layer inside it
                        const cardWidth = node.width;
                        const cardHeight = node.height;
                        const imageLayerWidth = imageLayer.width;
                        const imageLayerHeight = imageLayer.height;
                        // Estimate the height of the non-image content (the "body")
                        const currentBodyHeight = cardHeight - imageLayerHeight;
                        if (maintainWidth) {
                            // Calculate the ideal height for the image layer based on its width and the image's aspect ratio
                            const idealImageHeight = imageLayerWidth / imageAspectRatio;
                            // The new card height is the new image height plus the existing body height
                            const newCardHeight = idealImageHeight + currentBodyHeight;
                            node.resize(cardWidth, newCardHeight);
                        }
                        else {
                            // Calculate the ideal width for the image layer based on its height and the image's aspect ratio
                            const idealImageWidth = imageLayerHeight * imageAspectRatio;
                            const widthRatio = idealImageWidth / imageLayerWidth;
                            // The new card width is scaled proportionally
                            const newCardWidth = cardWidth * widthRatio;
                            node.resize(newCardWidth, cardHeight);
                        }
                        resizedCount++;
                    }
                }
            }
            catch (error) {
                console.error("Error processing node:", error);
                figma.notify(`Error processing "${node.name}". See console for details.`);
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
    if ('name' in node && node.name.toLowerCase() === name.toLowerCase()) {
        results.push(node);
    }
    if ('children' in node) {
        for (const child of node.children) {
            results.push(...findLayersByName(child, name));
        }
    }
    return results;
}
