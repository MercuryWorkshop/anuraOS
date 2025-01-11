# Browser specific Quirks

This is a list of known issues with other browsers that may affect usability of Anura

## Firefox

- No LocalFS feature due to no Filesystem Access API
- Powerwashing broken on versions pre 126 due to [indexedDB.databases](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/databases)

## Safari

- x86 unusable in safari pre iOS 17 and macOS 14 due to low indexeddb limits
- Data may be cleared after 7 days if PWA not saved to home screen
- More limited storage if PWA not saved to home screen

## Chromium Browsers

- ChromeOS chrome may have low indexeddb limits on personal accounts, down to only 300MB, doesn't seem to affect enterprise or education accounts, or other platforms
