<script>
  import { Button, Checkbox, Input } from "figma-ui3-kit-svelte";
  import {
    PluginLayout,
    FieldGroup,
    Footer,
    sendToPlugin,
    createMessageHandler,
  } from "figma-plugin-utilities";

  let imageLayerName = "image";
  let maintainWidth = true;
  let selectionCount = 0;
  let isResizing = false;

  $: selectionMessage =
    selectionCount > 0
      ? `${selectionCount} item${selectionCount > 1 ? "s" : ""} selected`
      : "Select one or more cards";

  $: isDisabled =
    selectionCount === 0 || isResizing || imageLayerName.trim() === "";

  function handleResize() {
    isResizing = true;
    sendToPlugin("resize-cards", {
      options: {
        imageLayerName,
        maintainWidth,
      },
    });
  }

  window.onmessage = createMessageHandler({
    "plugin-ready": (msg) => {
      imageLayerName = msg.settings?.imageLayerName ?? "image";
      maintainWidth = msg.settings?.maintainWidth ?? true;
    },
    "selection-change": (msg) => {
      selectionCount = msg.count || 0;
    },
    "resize-done": () => {
      isResizing = false;
    },
  });
</script>

<div class="plugin-container">
  <PluginLayout>
    <FieldGroup label="Image layer name" labelFor="image-layer-name">
      <Input
        bind:value={imageLayerName}
        placeholder="Layer name to find"
        id="image-layer-name"
      />
    </FieldGroup>

    <Checkbox bind:checked={maintainWidth}>
      Maintain width (adjust height)
    </Checkbox>

    <p class="selection-status">{selectionMessage}</p>
  </PluginLayout>

  <Footer variant="full">
    <Button
      variant="primary"
      on:click={handleResize}
      disabled={isDisabled}
      fullWidth
    >
      {isResizing ? "Resizing..." : "Resize cards"}
    </Button>
  </Footer>
</div>

<style>
  .plugin-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .selection-status {
    margin: 0;
    padding: var(--size-xsmall);
    border: 1px solid var(--figma-color-border);
    border-radius: var(--border-radius-medium);
    color: var(--figma-color-text-secondary);
    font-family: var(--font-stack);
    font-size: var(--body-medium-font-size);
    font-weight: var(--body-medium-font-weight);
    letter-spacing: var(--body-medium-letter-spacing);
    line-height: var(--body-medium-line-height);
    text-align: center;
    text-wrap: balance;
  }
</style>
