function RepoItem() {
    this.mount = async () => {
        console.log("Mounting RepoItem");
        try {
            const repo = await marketplace.getRepo(this.repourl, this.reponame);
            this.root.onclick = () => {
                state.currentRepo = [this.reponame, this.repourl, repo];
                state.currentScreen = "itemList";
            };
        } catch (e) {
            this.root.innerText += " (Error)";
            this.root.style.color = "red";
            this.root.onclick = () => {
                anura.notifications.add({
                    title: "Marketplace",
                    description:
                        "The repository " +
                        this.reponame +
                        " encountered an error: " +
                        e,
                    timeout: 5000,
                });
            };
        }
    };

    this.css = css`
        margin-right: 10px;
        border-radius: 0 9999px 9999px 0;
        margin-left: auto;
        height: 38px;
        line-height: 38px;
        width: auto;
        text-align: left;
        padding-left: 10px;
        color: var(--theme-fg);
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.1s;
        display: flex;
        align-items: center;

        .material-symbols-outlined {
            margin-right: 10px;
            font-size: 1.4em;
        }
    `;

    const contextMenu = new anura.ContextMenu();
    contextMenu.addItem("Remove", () => {
        saved.repos = saved.repos.filter(([name]) => name != this.reponame);
    });

    return html`
        <div
            class=${[
                "repoItem",
                use(state.currentRepo, (repo) =>
                    (repo || Array(3))[0] == this.reponame
                        ? "selected"
                        : "inactive",
                ),
            ]}
            on:contextmenu=${(e) => {
                e.preventDefault();

                const rect = frameElement.getBoundingClientRect();
                contextMenu.show(e.pageX + rect.x, e.pageY + rect.y);

                addEventListener(
                    "click",
                    (e) => {
                        e.preventDefault();
                        contextMenu.hide();
                    },
                    { once: true },
                );
            }}
        >
            <span class="material-symbols-outlined">shopping_bag</span>
            ${use(this.reponame)}
        </div>
    `;
}

export default function RepoList() {
    handle(use(saved.repos), (repos) => {
        this.repos = repos.map(
            ([name, url]) =>
                html`<${RepoItem} reponame=${name} repourl=${url} />`,
        );
    });

    this.css = css`
        position: fixed;
        width: 30%;
        border-right: 1px solid var(--theme-border);

        // For some reason the & selector is not working right inside RepoItem, so instead we are applying some repoItem styles here

        .repoItem:hover {
            background-color: var(--theme-secondary-bg);
        }

        .repoItem.selected {
            background-color: color-mix(
                in srgb,
                var(--theme-bg) 60%,
                var(--theme-accent) 30%
            );
        }

        .repoAdd > * {
            margin-left: 0.4rem;
            margin-bottom: 0.7rem;
        }

        .repoAdd {
            margin-left: auto;
            margin-right: auto;
            display: table;
            position: fixed;
            bottom: 0;
            margin-top: 20px;

            & > input {
                appearance: none;
                background-color: transparent;
                border: none; /* reset */
                border-style: solid;
                border: 0px solid transparent;
                border-bottom: 2px solid var(--theme-secondary-fg);
                box-shadow: none !important;
                border-style: solid !important;
                margin-right: 5px;
                margin-left: 5px;
                box-shadow: none;
                outline: none;
                color: var(--theme-fg);
            }

            ::-webkit-input-placeholder {
                color: var(--theme-secondary-fg);
            }

            & > input:focus {
                outline: none;
                border-bottom-color: var(--theme-accent);
                transition: 0.2s;
            }

            & > input[type="submit"] {
                background: var(--theme-secondary-bg);
                color: var(--theme-fg);
                padding: 6px;
                border-radius: 6px;
                border: none !important;
                cursor: pointer;
            }

            & > p {
                margin: 0;
                font-size: 10px;
                color: var(--theme-secondary-fg);
            }
        }
    `;

    return html`
        <div>
            <div id="repoScreen">
                <div id="repoList">
                    ${use(this.repos)}
                    <div class="repoAdd">
                        <input
                            type="text"
                            placeholder="My Repo"
                            bind:this=${use(this.newRepoName)}
                        /><br />
                        <input
                            type="text"
                            placeholder="https://anura.repo/"
                            bind:this=${use(this.newRepoURL)}
                        /><br />
                        <input
                            type="submit"
                            value="Add Repository"
                            on:click=${() => {
                                if (!this.newRepoURL.value.endsWith("/")) {
                                    anura.notifications.add({
                                        title: "Marketplace",
                                        description:
                                            'URL does not end with a "/" character',
                                        timeout: 5000,
                                    });
                                    return;
                                }
                                if (
                                    saved.repos.filter(
                                        ([n]) => n == this.newRepoName.value,
                                    ).length > 0
                                ) {
                                    anura.notifications.add({
                                        title: "Marketplace",
                                        description: "Repo is already added",
                                        timeout: 5000,
                                    });
                                    return;
                                } else {
                                    saved.repos = [
                                        ...saved.repos,
                                        [
                                            this.newRepoName.value,
                                            this.newRepoURL.value,
                                        ],
                                    ];
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    `;
}
