# Website assets

## Structure

```
assets/
├── css/
│   └── site.css
├── js/
│   ├── site.js
│   └── home.js
└── robot/
    ├── desktop.mp4
    └── mobile.mp4
```

The homepage uses one high-quality, scroll-scrubbed MP4 per device class instead of hundreds of individual network image requests.

- Desktop video: 1912 × 1080, 30 fps
- Mobile video: 1080 × 1912, 30 fps
- Both are generated from the supplied 241-frame sequences without resizing.
- The MP4 encoding uses an intra/key frame for every source frame so forward and reverse scroll seeking stays responsive.
