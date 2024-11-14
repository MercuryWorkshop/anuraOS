// Runs on every boot as the lib is installed
export default async function install(_, filePickerLib) {
    const { selectFile, selectFolder } = await filePickerLib.getImport();
    top.navigator.serviceWorker.addEventListener("message", async (event) => {
        if (event.data.anura_target === "anura.filepicker") {
            if (event.data.type === "folder") {
                let folders;
                let cancelled = false;
                try {
                    folders = await selectFolder({ regex: event.data.regex });
                    if (typeof folders === "string") {
                        folders = [folders];
                    }
                } catch (e) {
                    folders = [];
                    cancelled = true;
                }
                top.navigator.serviceWorker.controller.postMessage({
                    anura_target: "anura.filepicker.result",
                    id: event.data.id,
                    value: {
                        folders,
                        cancelled,
                    },
                });
                return;
            } else {
                let files;
                let cancelled = false;
                try {
                    files = await selectFile({ regex: event.data.regex });
                    if (typeof files === "string") {
                        files = [files];
                    }
                } catch (e) {
                    files = [];
                    cancelled = true;
                }
                top.navigator.serviceWorker.controller.postMessage({
                    anura_target: "anura.filepicker.result",
                    id: event.data.id,
                    value: {
                        files,
                        cancelled,
                    },
                });
            }
        }
    });
}
