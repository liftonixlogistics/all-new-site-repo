# Robot scroll animation assets

The homepage scroll engine is `assets/js/home.js`.

Required media files:

- `assets/robot/desktop.mp4` — 1912 × 1080, 30 fps
- `assets/robot/mobile.mp4` — 1080 × 1912, 30 fps

These are generated directly from the supplied 241-frame desktop and mobile image sequences. Keep the exact filenames above because the homepage switches between them automatically at 760px.

For responsive scroll seeking, the delivered files use an intra/key frame for every source frame.
