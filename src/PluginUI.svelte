<script>
  import { Button, Checkbox, Input, Label, Text } from "figma-ui3-kit-svelte";

  let imageLayerName = "image";
  let maintainWidth = true;
  let selectionCount = 0;
  let isResizing = false;

  $: selectionMessage =
    selectionCount > 0
      ? `${selectionCount} item${selectionCount > 1 ? "s" : ""} selected.`
      : "Select one or more cards.";

  function handleResize() {
    isResizing = true;
    parent.postMessage(
      {
        pluginMessage: {
          type: "resize-cards",
          options: {
            imageLayerName,
            maintainWidth,
          },
        },
      },
      "*",
    );
  }

  window.onmessage = (event) => {
    const msg = event.data?.pluginMessage;
    if (!msg) return;

    if (msg.type === "selection-change") {
      selectionCount = msg.count || 0;
    }

    if (msg.type === "resize-done") {
      isResizing = false;
    }
  };
</script>

<div class="wrapper">
  <div class="content">
    <div class="field">
      <Label>Image Layer Name</Label>
      <Input bind:value={imageLayerName} placeholder="Layer name to find" />
    </div>

    <Checkbox bind:checked={maintainWidth}>
      Maintain Width (adjust height)
    </Checkbox>

    <Text variant="body-medium" color="secondary">{selectionMessage}</Text>

    <Button
      variant="primary"
      on:click={handleResize}
      disabled={selectionCount === 0 || isResizing}
    >
      {isResizing ? "Resizing..." : "Resize Cards"}
    </Button>
  </div>
</div>

<style>
  .wrapper {
    padding: var(--size-xxsmall);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--size-xsmall);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--size-xxxsmall);
  }
</style>
