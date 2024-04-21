let openedMenus = [];
function RepoItem() {
    this.mount = async () => {
        console.log(this.reponame);
        console.log(this.repourl);
        console.log("Mounting RepoItem")
        try {
            const repo = await marketplace.getRepo(this.repourl, this.reponame);
            console.log(repo);
            this.repoItem.onclick = async () => {
                console.log(repo);
                state.currentRepo = [this.reponame, this.repourl, repo];
                state.currentScreen = "itemList";
            };
        } catch (e) {
            this.repoItem.innerText += " (Error)";
            this.repoItem.style.color = "red";
            this.repoItem.onclick = async () => {
                anura.notifications.add({
                    title: "Marketplace",
                    description: "The repository " + this.reponame + " encountered an error: " + e,
                    timeout: 5000,
                });
            };
        }
    }

    this.css = css`
        background: rgba(255, 255, 255, 0.05);
        margin-right: auto;
        margin-left: auto;
        height: 38px;
        line-height: 38px;
        width: 100%;
        text-align: left;
        color: var(--theme-fg);
        background-color: var(--theme-secondary-bg);
        font-weight: 500;
        border-bottom: 1px solid var(--theme-border);
        cursor: pointer;

        &:first-of-type {
            border-radius: 4px 4px 0 0;
        }

        &:nth-last-of-type(2) {
            border-radius: 0 0 4px 4px;
            border-bottom: none;
        }

        &:hover {
            transition: 0.3s;
            background-color: rgba(255, 255, 255, 0.08);
        }
    `;

    return html`
        <div class="repoItem" on:contextmenu=${(e) => {
            e.preventDefault();

            openedMenus.forEach(m => m.hide());
            openedMenus = [];

            const menu = new anura.ContextMenu();
            openedMenus.push(menu);

            menu.addItem("Remove", () => {
                saved.repos = saved.repos.filter(([name]) => name != this.reponame);
            });

            const rect = frameElement.getBoundingClientRect();
            menu.show(e.pageX + rect.x, e.pageY + rect.y);

            addEventListener("click", (e) => {
                e.preventDefault();
                menu.hide();
                openedMenus = openedMenus.filter(m => m != menu);
            }, { once: true });
        }} bind:this=${use(this.repoItem)}>${this.reponame}</div>
    `;
}

export default function RepoList() {
    handle(
        use(saved.repos),
        repos => {
            this.repos = repos.map(([name, url]) => html`<${RepoItem} reponame=${name} repourl=${url} />`)
        }
    );

    this.css = css`
        position: fixed;
        top: 28px;
        width: 30%;
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
                border: none!important;
                cursor: pointer;
            }

            & > p {
                margin: 0;
                font-size: 10px;
                color: var(--theme-secondary-fg);
            }
        }
    `

    return html`
        <div>
            <div id="repoScreen">
                <div id="repoList">
                    ${use(this.repos)}
                    <div class="repoAdd">
                        <input type="text" placeholder="My Repo" bind:this=${use(this.newRepoName)} /><br>
                        <input type="text" placeholder="https://anura.repo/" bind:this=${use(this.newRepoURL)} /><br>
                        <input type="submit" value="Add Repository" on:click=${() => {
                            if (!this.newRepoURL.value.endsWith("/")) {
                                anura.notifications.add({
                                    title: "Marketplace",
                                    description: "URL does not end with a \"/\" character",
                                    timeout: 5000,
                                });
                                return;
                            }
                            if (saved.repos.filter(([n]) => n == this.newRepoName.value).length > 0) {
                                anura.notifications.add({
                                    title: "Marketplace",
                                    description: "Repo is already added",
                                    timeout: 5000,
                                });
                                return;
                            } else {
                                saved.repos = [...saved.repos, [this.newRepoName.value, this.newRepoURL.value]];
                            }
                        }} />
                    </div>
                </div>
            </div>
        </div>
    `;
}
