# Changelog

## [Unreleased]

### Changed

- Disabled Resize cards button now shows a tooltip when nothing is selected
- Image layer name input has an associated label

## [1.0.0] - 2026-02-19

### Changed

- UI — Updated to Figma UI3.

### Fixed

- Nodes where image dimensions aren't available (e.g. off-screen components) are now skipped silently instead of triggering error notifications. The success toast reports how many were skipped.
