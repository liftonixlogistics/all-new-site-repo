# Website assets

Runtime animation data for the Timex Solution Inc website.

## HQ frame data

`frames-data-hq/` contains 10 base64-encoded WebP sprite sheets generated from the supplied 236-frame animation.

The homepage loads these files progressively, decodes each sheet in the browser, and draws the required frame to a canvas based on scroll position.

Do not rename the sprite-data files without updating the `sheetUrls` configuration in `index.html`.
