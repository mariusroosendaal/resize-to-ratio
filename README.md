![Resize to Ratio Cover](assets/thumbnail.png)

# Resize to Ratio

Resize components to the aspect ratio of the image inside them.

## Install

Get it from the [Figma Community](https://www.figma.com/community/plugin/1488572643184012930/resize-to-ratio)

## What it does

Adjusts the dimensions of selected components based on the natural aspect ratio of an image layer inside them. Useful for card components where you want the container to fit the image properly.

## Usage

1. Select one or more cards that contain an image layer
2. Run the plugin
3. Enter the name of the image layer (default: `image`)
4. Keep **Maintain width** checked to change the height, or clear it to change the width
5. Click **Resize cards**

For each screen and what its controls do, see the [user guide](https://figma-plugins.notion.site/Resize-to-Ratio-3eef29c09c9d81b6925cc8c4e9da360c).

## Requirements

- The image layer must resize with its card: **Fill container** in auto layout, or **Left and right** and **Top and bottom** constraints.

## Development

```bash
npm install
npm run dev    # Watch mode
npm run build  # Production build
```
