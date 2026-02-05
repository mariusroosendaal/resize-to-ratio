# Resize to Ratio

Resize components to match the aspect ratio of their nested images.

## What it does

Adjusts the dimensions of selected components based on the natural aspect ratio of an image layer inside them. Useful for card components where you want the container to fit the image properly.

## Usage

1. Select one or more component instances containing an image layer
2. Run the plugin
3. Specify the image layer name (default: `image`)
4. Choose to maintain width or height
5. Click resize

## Options

- **Image layer name** - Name of the nested layer containing the image fill
- **Maintain width** - Keep width fixed, adjust height to match ratio
- **Maintain height** - Keep height fixed, adjust width to match ratio

## Development

```bash
npm install
npm run dev    # Watch mode
npm run build  # Production build
```
