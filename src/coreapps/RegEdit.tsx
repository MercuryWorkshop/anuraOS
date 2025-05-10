function hasChildren(entry: any[]) {
	return (
		Object.entries(entry[1]).filter((setting) => {
			return setting[1] instanceof Object && !(setting[1] instanceof Array);
		}).length > 0
	);
}

const DisclosureGroup: Component<{
	entry: any[];
	sel: { [key: string]: any };
	level?: number;
}> = function () {
	if (!this.level) this.level = 1;

	this.css = `
        padding-left: ${0.8 * this.level!}em;
		// height: 1.75em;
		border-radius: 0.2em;

		transition: background-color 0.05s;

		&:hover {
			background-color: color-mix(in srgb, var(--theme-secondary-bg), transparent 90%);
		}

		&.selected {
            background-color: var(--theme-secondary-bg);
        }

        &.selected details {
            background-color: var(--theme-bg);
        }
    `;

	return (
		<div
			class:selected={use(this.sel, (sel) => sel === this.entry[1])}
			class={this.css}
		>
			{hasChildren(this.entry) ? (
				<details>
					<summary
						class:selected={use(this.sel, (sel) => sel === this.entry[1])}
					>
						<span
							on:click={(e: MouseEvent) => {
								e.preventDefault();
								this.sel = this.entry[1];
							}}
						>
							{this.entry[0]}
						</span>
					</summary>
					{Object.entries(this.entry[1])
						.filter((setting) => {
							return (
								setting[1] instanceof Object && !(setting[1] instanceof Array)
							);
						})
						.map((item: any) => (
							<DisclosureGroup
								entry={item}
								bind:sel={use(this.sel)}
								level={this.level! + 1}
							/>
						))}
				</details>
			) : (
				<span
					on:click={() => {
						this.sel = this.entry[1];
					}}
					class:selected={use(this.sel, (sel) => sel === this.entry[1])}
				>
					{this.entry[0]}
				</span>
			)}
		</div>
	);
};

class RegEdit extends App {
	name = "Registry Editor";
	package = "anura.regedit";
	icon = "/assets/icons/regedit.svg";

	css = css`
		display: flex;
		border-top: 1px solid var(--theme-border);

		#pane-left {
			width: max(10%, 200px);
			border-right: 1px solid var(--theme-border);
			overflow: scroll;
			text-overflow: nowrap;
			white-space: nowrap;
			padding-left: 0.5em;
		}

		#pane-right {
			width: calc(100% - max(10%, 200px));
			min-width: 400px;
			padding-inline: 0.5em;
			overflow: scroll;
		}

		#detail {
			width: 100%;
			height: 100%;
		}

		table {
			width: 100%;
			margin: 0;
		}

		summary {
			// height: 2em;
			cursor: pointer;
		}

		.value {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 100%;
			background-color: var(--theme-bg);
			outline: none;
		}

		.name {
			max-width: 8em;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		td {
			padding-inline: 0.5em;
		}

		tr {
			height: 4rem;
			margin: 0;
			// border-bottom: 1px solid var(--theme-border);
		}

		label {
			width: 100%;
		}

		table {
			border-color: var(--theme-border);
			// border-collapse: collapse;
		}

		// tr:last-child {
		//     border-bottom: none;
		// }

		// td:not(:last-child) {
		//     border-right: 1px solid var(--theme-border);
		// }
	`;

	constructor() {
		super();
	}

	state = $state({
		selected: anura.settings.cache,
	});

	page = async () => (
		<div
			style={{
				height: "100%",
				width: "100%",
				position: "absolute",
				color: use(anura.ui.theme.state.foreground),
				background: use(anura.ui.theme.state.background),
			}}
			class={`background ${this.css}`}
		>
			<div id="pane-left">
				<div id="detail">
					<details open>
						<summary
							class:selected={use(
								this.state.selected,
								(sel) => sel === anura.settings.cache,
							)}
						>
							<span
								on:click={(e: MouseEvent) => {
									e.preventDefault();
									this.state.selected = anura.settings.cache;
								}}
							>
								Root
							</span>
						</summary>
						{Object.entries(anura.settings.cache)
							.filter((setting) => {
								return (
									setting[1] instanceof Object && !(setting[1] instanceof Array)
								);
							})
							.map((item: any) => (
								<DisclosureGroup
									entry={item}
									bind:sel={use(this.state.selected)}
								/>
							))}
					</details>
				</div>
			</div>

			<div id="pane-right">
				{/* someone else can make this resizable, i cba */}
				<table>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Value</th>
					</tr>
					{use(this.state.selected, (sel) =>
						Object.entries(sel)
							.filter((setting) => {
								return (
									!(setting[1] instanceof Object) || setting[1] instanceof Array
								);
							})
							.map((item: any) => (
								<tr>
									<td class="name" title={item[0]}>
										{item[0]}
									</td>
									<td class="type">{typeof item[1]}</td>
									<td class="value">
										{typeof item[1] === "boolean" ? (
											<label class="value matter-switch">
												<input
													type="checkbox"
													checked={item[1]}
													on:change={function (e: any) {
														console.log(item[0], e.srcElement.srcchecked);
														sel[item[0]] = e.srcElement.checked;
														anura.settings.save();
													}}
												/>
												<span></span>
											</label>
										) : (
											<label class="matter-textfield-filled">
												<input
													placeholder=" "
													on:blur={function (event: any) {
														const elements =
															event.srcElement.parentElement.children;
														console.log(item[0], event.srcElement.value);
														try {
															const parsed = JSON.parse(event.srcElement.value);

															sel[item[0]] = parsed;
															anura.settings.save();
														} catch (e) {
															elements[2].value = anura.settings.get(item[0]);
															anura.notifications.add({
																title: "RegEdit Error",
																description: `Failed to set value for ${elements[0].innerText}, invalid input`,
																timeout: 50000,
															});
														}

														// console.log(JSON.parse(event.srcElement.value));
														console.log("blur", event);
													}}
													value={JSON.stringify(item[1])}
												/>
												<span>Value</span>
											</label>
										)}
									</td>
								</tr>
							)),
					)}
				</table>
			</div>
		</div>
	);

	async open(): Promise<WMWindow | undefined> {
		if (
			!anura.settings.get("disable-regedit-warning") &&
			!(await anura.dialog.confirm(
				"Are you sure you want to continue?",
				"Editing the registry can cause irreparable damage to your system!",
			))
		) {
			return;
		}

		anura.settings.set("disable-regedit-warning", true);

		const win = anura.wm.create(this, {
			title: "Registry Editor",
			width: "910px",
			height: `${(720 * window.innerHeight) / 1080}px`,
			resizable: true,
		});

		win.content.appendChild(await this.page());

		return win;
	}
}
