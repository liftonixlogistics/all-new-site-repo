# Robot scroll assets

The homepage scroll engine uses the original supplied JPEG frame sequences without resizing or recompression.

Place the desktop 16:9 sequence here:
- `assets/robot/desktop/ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`

Place the mobile 9:16 sequence here:
- `assets/robot/mobile/ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`

The frame loader in `assets/home.js` automatically switches between desktop and mobile at 760px, preloads around the current scroll position, and draws the original frames to a high-DPI canvas.

Do not recompress or downscale these source images.
