# Website assets

## Structure

```
assets/
├── css/
│   └── site.css        # Shared design system, components, responsive rules
├── js/
│   ├── site.js         # Navigation, reveal effects, pointer effects, contact form
│   └── home.js         # Scroll-controlled robot frame engine
└── robot/
    ├── desktop/        # 16:9 original JPEG frames
    └── mobile/         # 9:16 original JPEG frames
```

The previous yellow-taxi sprite animation has been removed.

## Robot source frames

The homepage expects 241 frames per orientation.

Desktop:
`assets/robot/desktop/ezgif-frame-001.jpg` … `ezgif-frame-241.jpg`

Mobile:
`assets/robot/mobile/ezgif-frame-001.jpg` … `ezgif-frame-241.jpg`

Keep these source files at their original resolution and JPEG quality.
