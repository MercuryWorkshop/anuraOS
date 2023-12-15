# Usage

Adding the library to your app:
```html
<script src="/apps/libfilepicker.app/handler.js"></script>
```

Picking a file:
```js
// Synchronously:
selectFile().then((filePath) => {
// implement your logic here
});
// Asynchronously:
await selectFile()
```

Picking a folder:
```js
// Synchronously:
selectFolder().then((filePath) => {
// implement your logic here
});
// Asynchronously:
await selectFolder()
```