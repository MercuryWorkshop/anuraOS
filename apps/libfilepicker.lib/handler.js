export function selectFile(regex = ".*", app = anura.apps["anura.fsapp"]) {
    return new Promise((resolve, reject) => {
        let picker = anura.wm.create(app, "Select a File...");

        picker.onclose = () => {
            reject("User cancelled");
        }

        let iframe = document.createElement("iframe");
        iframe.style =
            "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
            iframe.setAttribute("src", `/apps/libfilepicker.lib/file.html?regex=${encodeURIComponent(regex)}`);
        function handleMessage(event) {
            if (typeof event.data === 'object' && event.data.message === 'FileSelected') {
                let receivedData = event.data;
                let filePath = receivedData.filePath;
    
                parent.removeEventListener('message', handleMessage);
                
                picker.close()
                resolve(filePath)
            }
        }
        parent.addEventListener('message', handleMessage);
        picker.content.appendChild(iframe);
    });
}

export function selectFolder(regex = "", app = anura.apps["anura.fsapp"]) {
    return new Promise((resolve, reject) => {
        let picker = anura.wm.create(app, "Select a Folder...");

        picker.onclose = () => {
            reject("User cancelled");
        }

        let iframe = document.createElement("iframe");
        iframe.style =
            "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
        iframe.setAttribute("src", `/apps/libfilepicker.lib/folder.html?regex=${encodeURIComponent(regex)}`);
        function handleMessage(event) {
            if (typeof event.data === 'object' && event.data.message === 'FileSelected') {
                let receivedData = event.data;
                let filePath = receivedData.filePath;
    
                parent.removeEventListener('message', handleMessage);

                picker.close()
                resolve(filePath)
            }
        }
        picker.content.appendChild(iframe);
        parent.addEventListener('message', handleMessage);
    });
}