



// resizeBtn.addEventListener('click', () => {
//     // Disable + show loading
//     resizeBtn.disabled = true;
//     resizeBtn.textContent = 'Resizing...';

//     // Send message to plugin
//     parent.postMessage({
//         pluginMessage: {
//             type: 'resize-cards',
//             imageLayerName: document.getElementById('imageLayerName').value,
//             maintainWidth: document.getElementById('maintainWidth').checked,
//             minBodyHeight: parseInt(document.getElementById('minBodyHeight').value, 10)
//         }
//     }, '*');
// });
const resizeBtn = document.getElementById('resize');

onmessage = event => {
    const msg = event.data.pluginMessage;

    if (msg && msg.type === 'resize-done') {
        // Reset button state
        resizeBtn.disabled = false;
        resizeBtn.textContent = 'Resize Cards';
    }

    if (msg.type === 'get-image-dimensions') {
        // Create array buffer from the array
        const buffer = new Uint8Array(msg.imageData).buffer;

        // Create a blob from the array buffer
        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);

        // Create an image element to get the dimensions
        const img = new Image();
        img.onload = () => {
            // Send the dimensions back to the plugin
            parent.postMessage({
                pluginMessage: {
                    type: 'image-dimensions',
                    dimensions: {
                        width: img.width,
                        height: img.height
                    }
                }
            }, '*');

            // Clean up
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }
};

document.getElementById('resize').onclick = () => {
        resizeBtn.disabled = true;
    resizeBtn.textContent = 'Resizing...';
    const options = {
        imageLayerName: document.getElementById('imageLayerName').value,
        maintainWidth: document.getElementById('maintainWidth').checked,
        //minBodyHeight: parseInt(document.getElementById('minBodyHeight').value, 10) || 40
    };

    parent.postMessage({
        pluginMessage: {
            type: 'resize-cards',
            options: options
        }
    }, '*');
};