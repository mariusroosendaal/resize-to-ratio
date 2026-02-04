// This plugin resizes image components to match the aspect ratio of their image fills
figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'resize-images') {
    await resizeSelectedImages();
  }
};

async function resizeSelectedImages() {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify("Please select at least one object with an image fill");
    return;
  }
  
  let resizedCount = 0;
  
  // Load all image fills to get their natural dimensions
  const nodesToProcess = selection.filter(node => 
    node.type === "RECTANGLE" || 
    node.type === "ELLIPSE" || 
    node.type === "FRAME"
  );
  
  for (const node of nodesToProcess) {
    if ('fills' in node) {
      // Check if fills is an array and not the unique symbol
      if (Array.isArray(node.fills)) {
        const imageFills = node.fills
          .filter(fill => fill.type === 'IMAGE')
          .map(fill => fill as ImagePaint); // Cast to ImagePaint
        
        if (imageFills.length > 0) {
          // We'll use the first image fill if there are multiple
          const imageFill = imageFills[0];
          
          // Check if the image has a hash
          if (imageFill.imageHash) {
            try {
              // Get the natural dimensions of the image
              const image = figma.getImageByHash(imageFill.imageHash);
              const imageData = await image.getBytesAsync();
              
              // Create a temporary image to get dimensions
              figma.ui.postMessage({
                type: 'get-image-dimensions',
                imageData: Array.from(imageData)
              });
              
              // We'll wait for a response from the UI with the dimensions
              const dimensions = await new Promise<{width: number, height: number}>(resolve => {
                figma.ui.once('message', (msg: any) => {
                  if (msg.type === 'image-dimensions') {
                    resolve(msg.dimensions);
                  }
                });
              });
              
              if (dimensions) {
                const { width, height } = dimensions;
                const aspectRatio = width / height;
                
                // Decide how to resize based on current dimensions
                const currentWidth = node.width;
                
                // Option 1: Keep the width and adjust height
                node.resize(currentWidth, currentWidth / aspectRatio);
                
                resizedCount++;
              }
            } catch (error) {
              console.error("Error processing image:", error);
            }
          }
        }
      }
    }
  }
  
  figma.notify(`Resized ${resizedCount} image${resizedCount !== 1 ? 's' : ''} to match their original aspect ratios`);
}

// Note: Make sure to define the HTML UI code in a separate HTML file or as a template string

// Import types if needed
type ImagePaint = Paint & {
  type: 'IMAGE';
  imageHash: string | null;
  scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE';
};