# AliceWM
Window manager for FrogOS 

### Usage:

`let dialog = AliceWM.create("TITLE")` returns an HTML object and create a resizable Window on screen. You add content to it by invoking `dialog.content.innterHTML` or `dialog.content.appendChild`

### Exmaple:
```js
let dialog = AliceWM.create("Bruhmium Browser");

let iframe = document.createElement("iframe")
iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
iframe.setAttribute("src", "https://hypertabs.cc")

dialog.content.appendChild(iframe)
```

run server with `npm run start`

you will need to symlink your arch of `symlinks.` to `symlinks`
