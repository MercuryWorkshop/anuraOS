export function SideBar() {
    this.css = `
    display: flex;
    flex-direction: column;
    flex: 0 0 15em;
    margin-right: 3em;
    button {
        height: 3em;
        border-bottom-right-radius: 5em;
        border-top-right-radius: 5em;
        background-color: var(--theme-bg);
        border: none;
        text-align: left;
        display: flex;
        align-items: center;
    }
    button:hover {
        background-color: var(--theme-secondary-bg);
    }
    button:active {
        background-color: color-mix(
            var(--theme-bg),
            var(--theme-secondary-bg),
            0.5
        );
    }
    
    i {
        margin-right: 1em;
        margin-left: 0.5em;
    }
    `;
    return html`
        <div>
            <button>
                <i class="material-symbols-outlined">history</i>Recent
            </button>
            <hr />
            <button onclick="loadPath('/')">
                <i class="material-symbols-outlined">laptop_chromebook</i>My
                files
            </button>
            <button
                on:click=${async () => {
                    if (!window.showDirectoryPicker) {
                        anura.dialog.alert(
                            "Your browser does not support mounting local directories.",
                            "Error",
                        );
                        return;
                    }
                    let path = await anura.dialog.prompt(
                        "Enter the path where you want to mount the local filesystem",
                    );
                    if (!path.startsWith("/")) {
                        anura.dialog.alert(
                            "Path does not start with a " / " character",
                            "Error",
                        );
                        return;
                    }

                    await sh.promises.mkdirp(path);
                    await LocalFS.new(path);
                    reload();
                }}
            >
                <i class="material-symbols-outlined">usb</i>Mount local drive
            </button>
        </div>
    `;
}
