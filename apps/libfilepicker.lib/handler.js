export function selectFile(options) {
    const defaultOptions = {
        regex: ".*",
        app: anura.apps["anura.fsapp"],
        multiple: false,
    };
    options = Object.assign({}, defaultOptions, options);
    return new Promise((resolve, reject) => {
        let picker = anura.wm.create(options.app, "Select a File...");
        let id = crypto.randomUUID();

        picker.onclose = () => {
            reject("User cancelled");
        };

        let iframe = document.createElement("iframe");
        iframe.style =
            "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
        iframe.setAttribute(
            "src",
            `/apps/fsapp.app/index.html?picker=` +
                ExternalApp.serializeArgs([
                    options.regex,
                    "file",
                    options.multiple,
                    id,
                ]),
        );
        function handleMessage(event) {
            if (
                typeof event.data === "object" &&
                event.data.message === "FileSelected" &&
                event.data.id === id
            ) {
                let receivedData = event.data;
                let filePath = receivedData.filePath;

                resolve(filePath);
                picker.close();
            }
        }
        picker.content.appendChild(iframe);
        Object.assign(iframe.contentWindow, {
            anura,
            AliceWM,
            ExternalApp,
            LocalFS,
            instance: options.app,
            callback: handleMessage,
            instanceWindow: picker,
        });
    });
}

export function selectFolder(options) {
    const defaultOptions = {
        regex: "",
        app: anura.apps["anura.fsapp"],
        multiple: false,
    };
    options = Object.assign({}, defaultOptions, options);
    return new Promise((resolve, reject) => {
        let picker = anura.wm.create(options.app, "Select a Folder...");
        let id = crypto.randomUUID();

        picker.onclose = () => {
            reject("User cancelled");
        };

        let iframe = document.createElement("iframe");
        iframe.style =
            "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
        iframe.setAttribute(
            "src",
            `/apps/fsapp.app/index.html?picker=` +
                ExternalApp.serializeArgs([
                    options.regex,
                    "dir",
                    options.multiple,
                    id,
                ]),
        );
        function handleMessage(event) {
            if (
                typeof event.data === "object" &&
                event.data.message === "FileSelected" &&
                event.data.id === id
            ) {
                let receivedData = event.data;
                let filePath = receivedData.filePath;

                resolve(filePath);
                picker.close();
            }
        }
        picker.content.appendChild(iframe);
        Object.assign(iframe.contentWindow, {
            anura,
            AliceWM,
            ExternalApp,
            LocalFS,
            instance: options.app,
            callback: handleMessage,
            instanceWindow: picker,
        });
    });
}
