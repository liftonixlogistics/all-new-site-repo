# Timex Solution Inc — New Website

From-scratch Timex Solution Inc website focused on AI Automation, web and app development, digital marketing, creative production, IT, and business operations.

## Deployment

This is currently a static HTML/CSS/JavaScript site and is Vercel-ready.

- Framework preset: **Other**
- Build command: none
- Output directory: none
- Root directory: repository root

## Cinematic scroll animation

The AI Automation journey is a canvas-based, scroll-controlled image sequence.

- 236 source frames
- 720 × 405 optimized frame resolution
- 10 WebP sprite sheets
- 24 frames per sprite sheet
- Sprite data is stored as base64 text under `assets/frames-data-hq/`
- Sheets are decoded and lazy-loaded in the browser
- Scrolling forward/reverse maps directly to animation frame progress
- Portrait/mobile uses contain-style framing to preserve the wide road composition

The base64 transport is intentional: it lets the optimized binary sprite assets remain reproducible through the connected GitHub workflow while keeping the runtime animation fully client-side.
