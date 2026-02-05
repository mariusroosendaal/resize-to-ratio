<script>
  import { Button, Checkbox, Input } from "figma-ui3-kit-svelte";
  import {
    PluginLayout,
    FieldGroup,
    Footer,
    EmptyState,
    sendToPlugin,
    createMessageHandler,
  } from "figma-plugin-utils";

  let imageLayerName = "image";
  let maintainWidth = true;
  let selectionCount = 0;
  let isResizing = false;

  $: selectionMessage =
    selectionCount > 0
      ? `${selectionCount} item${selectionCount > 1 ? "s" : ""} selected`
      : "Select one or more cards";

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
    <FieldGroup label="Image Layer Name">
      <Input bind:value={imageLayerName} placeholder="Layer name to find" />
    </FieldGroup>

    <Checkbox bind:checked={maintainWidth}>
      Maintain Width (adjust height)
    </Checkbox>

    <EmptyState message={selectionMessage} size="small" />
  </PluginLayout>

  <Footer variant="full">
    <Button
      variant="primary"
      on:click={handleResize}
      disabled={selectionCount === 0 || isResizing}
      fullWidth
    >
      {isResizing ? "Resizing..." : "Resize Cards"}
    </Button>
  </Footer>
</div>

<style>
  .plugin-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
