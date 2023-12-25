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

// Parameters:

// selectFile(fileExtension {can use regex or just be a file extension}) 
// Example: selectFile("txt")

// Returning:

// One file
"/example.txt"

// Multiple files
["/example.txt", "/example1.txt"]
```

Picking a folder:
```js
// Synchronously:
selectFolder().then((filePath) => {
// implement your logic here
});
// Asynchronously:
await selectFolder()

// Returns:

// One folder
"/folder"

// Multiple folders
["/folder", "/folder2"]
```