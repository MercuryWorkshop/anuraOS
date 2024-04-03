# Browser specific Quirks

This is a list of known issues with other browsers that may affect usability of anura

## Firefox

-   No LocalFS feature due to no Filesystem Access API

## Safari

-   x86 unusable in safari pre iOS 17 and macOS 14 due to low indexeddb limits
-   Data may be cleared after 7 days if PWA not saved to home screen
-   More limited storage if PWA not saved to home screen

## Chromium Browsers

-   ChromeOS chrome may have low indexeddb limits on personal accounts, down to only 300MB, doesn't seem to affect enterprise or education accounts, or other platforms
