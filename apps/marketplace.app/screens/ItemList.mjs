function Item() {
    const repo = state.currentRepo[2];
    let desc;
    let id;
    if (repo.version === "legacy") {
        desc = this.data.desc;
        id = this.data.name;
    } else {
        desc = this.data.summary;
        id = this.data.package;
    }

    this.mount = async () => {
        let installed;
        if (this.type === "app") {
            this.thumbnail.src = await repo.getAppThumb(id);
            installed = !!anura.apps[this.data.package];
        } else {
            this.thumbnail.src = await repo.getLibThumb(id);
            installed = !!anura.libs[this.data.package];
        }

        if (installed) {
            this.installButton.value = "Installed";
            this.installButton.style.backgroundColor =
                "var(--theme-secondary-bg)";
            this.installButton.style.color = "#fff";
            this.installButton.disabled = true;
        } else {
            this.installButton.value = "Install";
            this.installButton.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (this.type === "app") {
                    await repo.installApp(id);
                } else {
                    await repo.installLib(id);
                }
            });
        }
    };

    this.css = css`
        height: 100px;
        width: 100%;
        background: var(--theme-secondary-bg);
        display: flex;
        align-items: center;
        transition: 0.2s;

        input {
            margin-left: auto;
            margin-right: 20px;
        }

        img {
            display: block;
            position: relative;
            height: 80px;
            width: 80px;
            float: left;
            margin-left: 15px;
            margin-right: 15px;
        }

        .infoContainer {
            display: flex;
            flex-direction: column;
            justify-content: center;

            span {
                display: block;
                position: relative;
                font-size: 16px;
                text-align: left;
                color: var(--theme-fg);
            }

            p {
                display: block;
                position: relative;
                font-size: 14px;
                text-align: left;
                color: var(--theme-secondary-fg);
                margin: 0;
                padding: 0;
            }
        }
    `;

    return html`<div
        class="item"
        on:click=${() => {
            state.currentItem = this.data;
            state.currentItemType = this.type;
            state.currentScreen = "overview";
        }}
    >
        <img class="thumbnail" bind:this=${use(this.thumbnail)} />
        <div class="infoContainer">
            <span>${this.data.name}</span>
            <p>${desc}</p>
        </div>
        <input
            class="matter-button-contained"
            bind:this=${use(this.installButton)}
            type="button"
        />
    </div>`;
}

export default function ItemList() {
    this.mount = async () => {
        console.log(state.currentRepo);
        const apps = await state.currentRepo[2].getApps();
        const libs = await state.currentRepo[2].getLibs();

        apps.forEach(async (app) => {
            this.listElem.appendChild(html`<${Item} type="app" data=${app} />`);
        });

        libs.forEach(async (lib) => {
            this.listElem.appendChild(html`<${Item} type="lib" data=${lib} />`);
        });
    };

    this.css = css`
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 2em 0;
        gap: 1em;

        #searchBox {
            appearance: none;
            background-color: transparent;
            border: none;
            border-style: solid;
            border: 0px solid transparent;
            border-bottom: 2px solid var(--theme-secondary-bg);
            box-shadow: none !important;
            border-style: solid !important;
            padding-bottom: 2px;
            display: flex;
            width: 40%;
            height: 3vh;
            font-family: inherit;
            transition: border-color 0.2s;
            color: var(--theme-fg);
        }

        #itemList {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: var(--theme-border);
            gap: 1px;
            width: 90%;
        }

        // For some reason the & selector is not working right inside Item, so instead we are applying some Item styles here

        .item:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        ::-webkit-input-placeholder {
            color: var(--theme-secondary-fg);
        }

        #searchBox:focus {
            outline: none;
            border-bottom-color: var(--theme-accent);
        }
    `;

    return html`
        <div>
            <input
                placeholder="Search for items..."
                on:input=${() => {
                    const searchQuery = this.search.value.toLowerCase();
                    Array.from(this.listElem.children).forEach((item) => {
                        const itemName = item
                            .querySelector("span")
                            .innerText.toLowerCase();
                        if (searchQuery === "") {
                            item.style.display = "";
                        } else if (itemName.includes(searchQuery)) {
                            item.style.display = "";
                        } else {
                            item.style.display = "none";
                        }
                    });
                }}
                bind:this=${use(this.search)}
                type="text"
                id="searchBox"
            />
            <div id="itemList" bind:this=${use(this.listElem)}></div>
        </div>
    `;
}
