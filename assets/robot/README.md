# Robot scroll animation assets

The homepage frame-scrub engine is in `assets/js/home.js`.

## Desktop
Place the original 16:9 sequence here:
`assets/robot/desktop/ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`

Expected source dimensions: **1912 × 1080**

## Mobile
Place the original 9:16 sequence here:
`assets/robot/mobile/ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`

Expected source dimensions: **1080 × 1912**

The runtime automatically selects the correct sequence at 760px, preloads frames around the user's scroll direction and keeps a limited rolling decode cache for memory stability.

**Do not recompress or downscale the source frames.**
