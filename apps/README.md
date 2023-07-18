# AnuraOS Apps
AnuraOS apps are simple creatures. They live inside folders with the suffix `.app` and the resources specific to each app are contained within that folder\*\*\*.

### TODO
Hi developers. The structure here is a little wonky and kinda outgrew itself.

You might notice a lot of the values in manifest are conditionally required. This is probably due to growth rot. 

I propose that in the future, the manifest should be structured where `type` is an Object which contains the required values depending on which type.

## Manifest
Each app contains a `manifest.json`\*, which defines the functionality of the app. See `manifest.json.example`.

- `name`: `String` - Program name. Required. 
- `type`: `String`\*\* - Program type. "auto" or "manual". Required. 
 * "manual": Evaluates at top-window level. Highly discouraged.
 * "auto": Evaluates within a contained iframe.
- `package`: `String` - Package name (structured class-like, `organization.programname`). Required.
- `index`: `String` - Path (from app directory) to the index HTML file. Required if `type` is `"auto"` - the iframe source will be set to this.
- `icon`: `String` - Path (from app directory) to the application's icon. Optional but highly recommended. Anura will display this icon throughout the DE.
- `background`: Background color of iframe while it is loading. Optional. 
- `handler`: `String` - Path (from app directory) to a file containing JavaScript to execute at the top-level document. Required if `type` is `"manual"`, ignored otherwise - the top-level document will execute this file as JavaScript.
- `wininfo`: `Object {title, width, height}` - Required if `type` is `"auto"`.
 * `wininfo.title`: `String` - The title of the program. Defaults to "". Optional.
 * `wininfo.width`: `String` - The default width, in pixels, of the program. Defaults to "1000px". Optional.
 * `wininfo.height`: `String` - The default height, in pixels, of the program. Defaults to "500px". Optional.

### Footnotes
\* This appears to be false based on the apps within the apps/ directory, which is very strange because Anura.ts relies on it. Investigation needed.

\*\* TODO developers: This should probably be its own object type?

\*\*\* Not always, but this is best practice and should become standardized.