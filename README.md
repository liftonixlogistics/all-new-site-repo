# Timex Solution Inc — Website

Static multi-page website deployed on Vercel.

## Project structure

```
/
├── index.html
├── 404.html
├── services.html
├── automation.html
├── industries.html
├── web-development.html
├── app-development.html
├── digital-marketing.html
├── creative-video.html
├── tech-it.html
├── business-operations.html
├── contact.html
├── robots.txt
├── vercel.json
└── assets/
    ├── css/
    │   └── site.css
    ├── js/
    │   ├── site.js
    │   └── home.js
    └── robot/
        ├── desktop/
        │   └── ezgif-frame-001.jpg ... ezgif-frame-241.jpg
        └── mobile/
            └── ezgif-frame-001.jpg ... ezgif-frame-241.jpg
```

## Animation assets

The homepage uses the original JPEG frame sequences directly.

- Desktop / 16:9: `assets/robot/desktop/`
- Mobile / 9:16: `assets/robot/mobile/`
- Expected filenames: `ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`
- Do not resize, recompress, rename, or convert the source JPGs.

The scroll renderer is `assets/js/home.js`. Scroll down advances the frame sequence; scroll up reverses it.

## Editing

- Global styles: `assets/css/site.css`
- Shared site interactions: `assets/js/site.js`
- Homepage frame animation: `assets/js/home.js`
- Page content: individual root-level HTML files
