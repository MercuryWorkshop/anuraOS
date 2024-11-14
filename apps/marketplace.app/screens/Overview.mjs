export default function Overview() {
    const repo = state.currentRepo[2];
    let id =
        repo.version === "legacy"
            ? state.currentItem.name
            : state.currentItem.package;

    this.mount = async () => {
        let installed;
        if (state.currentItemType === "app") {
            this.thumbnail.src = await repo.getAppThumb(id);
            installed = !!anura.apps[state.currentItem.package];
        } else {
            this.thumbnail.src = await repo.getLibThumb(id);
            installed = !!anura.libs[state.currentItem.package];
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
                if (state.currentItemType === "app") {
                    await repo.installApp(id);
                } else {
                    await repo.installLib(id);
                }
            });
        }
    };

    this.css = `
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;

        .infoSection {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: var(--theme-dark-bg);
            width: 100%;
            height: 150px;
        }

        .infoContainer {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            width: 70%;
        }

        .appInfoContainer {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-left: 20px;
            margin-right: auto;
            height: 100px;
        }

        .appTitle {
            display: block;
            margin: 0;
            font-size: 35px;
            font-weight: bolder;
            color: var(--theme-fg);
            text-align: left;
        }

        .appCategory {
            display: block;
            position: relative;
            font-size: 16px;
            text-align: left;
            color: var(--theme-secondary-fg);
            width: 100%;
        }

        .thumbnailContainer {
            display: flex;
            flex-direction: row;
            justify-content: center;
            height: 80px;
            width: 80px;
        }

        .screenshotSection {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: var(--theme-dark-bg);
            width: 100%;
        }

        .screenshotContainer {
            display: flex;
            flex-direction: row;
            justify-content: center;
            width: 70%;
            max-height: 250px;
            min-height: 50px;
        }

        .aboutSection {
            display: flex;
            justify-content: center;
            width: 100%;
        }

        .aboutContainer {
            display: flex;
            flex-direction: column;
            text-align: left;
            width: 70%;
        }

        .aboutDesc {
            color: var(--theme-secondary-fg);
        }
    `;

    return html` <div>
        <div class="infoSection">
            <div class="infoContainer">
                <div class="thumbnailContainer">
                    <img class="thumbnail" bind:this=${use(this.thumbnail)} />
                </div>
                <div class="appInfoContainer">
                    <h1 class="appTitle">${state.currentItem.name}</h1>
                    <span class="appCategory"
                        >${state.currentItem.category || "Uncategorized"}</span
                    >
                </div>
                <input
                    class="matter-button-contained"
                    bind:this=${use(this.installButton)}
                    type="button"
                />
            </div>
        </div>
        <div class="screenshotSection" style=${{ display: "none" }}>
            Unimplemented
        </div>
        <div class="aboutSection">
            <div class="aboutContainer">
                <h2 class="aboutTitle">${state.currentItem.summary || ""}</h2>
                <p class="aboutDesc">${state.currentItem.desc}</p>
            </div>
        </div>
    </div>`;
}
