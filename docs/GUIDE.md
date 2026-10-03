# Resize to Ratio

Resize to Ratio fits each card you select to the image inside it. For example, a card with a landscape photo in a square image area gets shorter, until the image area has the photo's shape. The plugin reads the size of each image file, so every card fits its own image.

## Resize cards

![](resize-to-ratio-main.svg)

Select one or more cards, then run the plugin. A card can be a component, an instance or a frame.

1. **Image layer name** — the layer inside each card that has the image fill, `image` by default. Upper and lower case don't matter.
2. **Maintain width (adjust height)** — keeps each card's width and changes its height. Clear it to keep the height and change the width.
3. **items selected** — how many layers you selected. With nothing selected, it reads **Select one or more cards**.

Click **Resize cards** to resize every selected card. With **Maintain width** checked, the rest of the card keeps its height, so the text under the image stays as it is. Press Ctrl/Cmd+Z to undo. The plugin remembers the layer name and the checkbox for your next run.

The plugin resizes the card, not the image layer. If the image doesn't change size with the card, set the image layer to **Fill container** in auto layout, or to **Left and right** and **Top and bottom** constraints.

If the plugin says no cards were resized, check the layer name, and check that the layer has an image fill. The plugin uses the first layer with that name in each card, so give the image layer a name no other layer in the card has. If it skips a card because the image isn't loaded, wait for the image to appear, then run it again.
