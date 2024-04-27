const icons = await (await fetch(localPathToURL("icons.json"))).json();

// This constant is our own ID. It is used when registering the library.
const HANDLER = "anura.fileviewer";

// This is the list of file extensions that we will handle
const defaultHandlers = [...icons.files.map((file) => file.ext), "default"];

// The install function is called when the library is registered on boot.
// If you want to detect the first install, you can set an anura registry
// key and retrieve it later.
// Here, we set the file handler for a few common file types to ourself.
// If you want to restore to this file handler after an override, you can
// set the `libfileview.reset` key to true.
// following code in the console:
// anura.settings.set('libfileview.reset', true)
// If you want to disable the default file handler entirely, you can set
// the `libfileview.disable` key to true.
// anura.settings.set('libfileview.disable', true)

export default function install(anura) {
    if (anura.settings.get("libfileview.disable")) {
        return;
    }
    anura.files.setFolderIcon(localPathToURL(icons.folder));
    const exts = anura.settings.get("FileExts") || {};
    const resetMode = anura.settings.get("libfileview.reset");
    const externalHandlers = Object.keys(exts).filter(
        (ext) => exts[ext].id !== HANDLER,
    );
    defaultHandlers.forEach((ext) => {
        if (!externalHandlers.includes(ext) || resetMode) {
            anura.files.setModule(HANDLER, ext);
        }
    });
    anura.settings.set("libfileview.reset", false);
}

function localPathToURL(path) {
    return (
        import.meta.url.substring(0, import.meta.url.lastIndexOf("/")) +
        "/" +
        path
    );
}
