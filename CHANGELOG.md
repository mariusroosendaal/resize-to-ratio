# Changelog

## [Unreleased]

### Changed

- Resizing with nothing selected, or with no card that has the image layer, shows a regular notification that says what to check, instead of an error. A resize that skipped cards whose image hadn't loaded shows in red

## [1.0.1] - 2026-05-09

### Fixed

- Zero-resize result now shows an error notification explaining why nothing was resized, instead of a misleading success toast
- Notification correctly reports both unavailable images and non-resizable nodes when both occur in the same selection
- Success notification appends "Press Ctrl/Cmd+Z to undo."
- Plugin no longer freezes in a loading state if an unexpected error occurs during resize
- Image layer named the same as a selected card no longer matches the card itself

### Changed

- Image layer name and maintain-width preference are now saved and restored between sessions
- Action button is disabled when the image layer name field is empty
- Selection status display replaced with a plain label (was incorrectly using the EmptyState component)
- Image dimensions fetched in parallel across the selection instead of sequentially
- Image layer name input has an associated label

## [1.0.0] - 2026-02-19

### Changed

- UI — Updated to Figma UI3.

### Fixed

- Nodes where image dimensions aren't available (e.g. off-screen components) are now skipped silently instead of triggering error notifications. The success toast reports how many were skipped.
