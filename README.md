# Timex Solution Inc — Website

A lightweight, multi-page static website for Timex Solution Inc, focused on AI automation, custom CRM, digital services and business workflows.

## Architecture

The site intentionally stays framework-free so a manual developer can understand and edit it without a build tool.

- Root HTML files are individual clean-URL pages.
- Shared visual system: `assets/css/site.css`
- Shared interactions/navigation/form behavior: `assets/js/site.js`
- Homepage scroll-scrub engine: `assets/js/home.js`
- Original robot animation frames: `assets/robot/desktop/` and `assets/robot/mobile/`
- Vercel routing/cache/security rules: `vercel.json`

## Pages

- `/` — full-screen scroll-controlled animation homepage
- `/services`
- `/automation`
- `/industries`
- `/web-development`
- `/app-development`
- `/digital-marketing`
- `/creative-video`
- `/tech-it`
- `/business-operations`
- `/contact`

## Robot animation

The homepage is designed around two original 241-frame JPEG sequences.

Desktop:
- 16:9
- 1912 × 1080
- `assets/robot/desktop/ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`

Mobile:
- 9:16
- 1080 × 1912
- `assets/robot/mobile/ezgif-frame-001.jpg` through `ezgif-frame-241.jpg`

The source JPEGs should remain at their original resolution and quality. The browser only keeps a small rolling window of decoded frames in memory and preloads around the current scroll direction. No source image is resized or recompressed in the repository.

## Deployment

Static/Vercel deployment:

- Framework preset: **Other**
- Build command: none
- Output directory: none
- Root directory: repository root
- `cleanUrls` is enabled in `vercel.json`

## Editing notes

1. Change global colors/spacing/components in `assets/css/site.css`.
2. Change global navigation, reveal, pointer and contact behavior in `assets/js/site.js`.
3. Change scroll-frame logic only in `assets/js/home.js`.
4. Keep service/page content inside the relevant HTML file.
5. Do not put long-lived immutable cache headers on CSS or JavaScript filenames that may change.
