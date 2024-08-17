export function Folder() {
    this.mount = async () => {
        this.absolutePath = `${this.path}/${this.file}`;
        this.description = "Folder";
        try {
            let manifestPath = `${this.absolutePath}/manifest.json`;
            console.log(manifestPath);

            const data = await fs.promises.readFile(manifestPath);
            let manifest = JSON.parse(data);
            let folderExt = this.file.split(".").slice("-1")[0];

            this.icon = `/fs${this.absolutePath}/${manifest.icon}`;
            console.log(this.icon);
            this.description = `Anura ${folderExt == "app" ? "Application" : "Library"}`;
        } catch (error) {
            console.log(error);
            this.icon = anura.files.folderIcon;
        }
    };
    return html`
        <table>
        <thead></thead>
        <tbody>
            <tr
                on:mouseenter=${(e) => {
                    e.currentTarget.classList.add("hover");
                }}
                on:mouseleave=${(e) => {
                    e.currentTarget.classList.remove("hover");
                }}
                on:contextmenu=${(e) => {
                    if (self.currentlySelected.length > 0) {
                        return;
                    }
                    e.currentTarget.classList.add("selected");
                    self.currentlySelected = [e.currentTarget];
                }}
                on:click=${(e) => {
                    if (currentlySelected.includes(e.currentTarget)) {
                        if (
                            self.filePicker &&
                            self.filePicker?.type === "file" &&
                            e.currentTarget.getAttribute("data-type") === "file"
                        ) {
                            selectAction(currentlySelected);
                        } else {
                            fileAction(currentlySelected);
                        }
                        currentlySelected.forEach((row) => {
                            row.classList.remove("selected");
                        });
                        currentlySelected = [];
                        return;
                    }
                    if (!e.shiftKey) {
                        if (!e.ctrlKey) {
                            currentlySelected.forEach((row) => {
                                row.classList.remove("selected");
                            });
                            currentlySelected = [];
                        }
                        e.currentTarget.classList.add("selected");
                        currentlySelected.push(e.currentTarget);
                    } else {
                        if (currentlySelected.length == 0) {
                            e.currentTarget.classList.add("selected");
                            currentlySelected.push(e.currentTarget);
                        } else {
                            var arr = Array.from(
                                document.querySelectorAll("tr"),
                            ).filter(
                                (row) =>
                                    row.parentNode.nodeName.toLowerCase() !==
                                    "thead",
                            );
                            var firstI = arr.indexOf(
                                currentlySelected[currentlySelected.length - 1],
                            );
                            var lastI = arr.indexOf(e.currentTarget);
                            var first = Math.min(firstI, lastI);
                            var last = Math.max(firstI, lastI);
                            for (var i = first; i <= last; i++) {
                                if (!currentlySelected.includes(arr[i])) {
                                    currentlySelected.push(arr[i]);
                                    arr[i].classList.add("selected");
                                }
                            }
                        }
                    }
                }}
                data-type="dir"
                data-path=${use(this.absolutePath)}
            >
                <td id="iconContainer">
                    <img class="icon" src=${use(this.icon)}></img>
                </td>
                <td id="name">${this.file}/</td>
                <td id="size">N/A</td>
                <td id="description">${use(this.description)}</td>
                <td id="date">${new Date(this.stats.mtime).toLocaleString()}</td>
            </tr>
        </tbody>
        </table>
    `;
}
