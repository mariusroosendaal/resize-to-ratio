// Get references to the UI elements we'll be interacting with
const resizeBtn = document.getElementById('resize');
const selectionMessage = document.getElementById('selection-message');
 
// Listen for messages from the plugin's main code (code.ts)
onmessage = event => {
    const msg = event.data.pluginMessage;
    if (!msg) {
        return; // Exit if the message is invalid
    }

    // Handle selection change messages
    if (msg.type === 'selection-change') {
        const count = msg.count;
        if (count > 0) {
            // If items are selected, update the message and enable the button
            selectionMessage.textContent = `${count} item${count > 1 ? 's' : ''} selected.`;
            resizeBtn.disabled = false;
        } else {
            // If nothing is selected, show the initial prompt and disable the button
            selectionMessage.textContent = 'Select one or more cards.';
            resizeBtn.disabled = true;
        }
    }

    // Handle the completion of the resize operation
    if (msg.type === 'resize-done') {
        // Reset the button's text after resizing
        resizeBtn.textContent = 'Resize Cards';
        // The button's disabled state will be correctly set by the 'selection-change' event
    }
};

// Handle the click event for the resize button
document.getElementById('resize').onclick = () => {
    // Disable the button and show a "working" state to prevent multiple clicks
    resizeBtn.disabled = true;
    resizeBtn.textContent = 'Resizing...';

    // Collect the options from the UI controls
    const options = {
        imageLayerName: document.getElementById('imageLayerName').value,
        maintainWidth: document.getElementById('maintainWidth').checked,
    };

    // Send the options to the main plugin code to start the resizing process
    parent.postMessage({
        pluginMessage: {
            type: 'resize-cards',
            options: options
        }
    }, '*');
};