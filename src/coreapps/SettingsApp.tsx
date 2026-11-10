const settingsCSS = css`
	color: var(--theme-fg);

	.header {
		margin-left: 20px;
		font-family: var(--theme-font-sans);
	}
	.container {
		display: flex;
		height: calc(100% - 97px);
	}
	.settings-category {
		margin-left: 20px;
		margin-right: 10px;
		width: 100%;
	}

	*::-webkit-scrollbar {
		width: 8px;
	}

	*::-webkit-scrollbar-thumb {
		background-color: var(--theme-secondary-fg);
		border-radius: 8px;
	}

	*::-webkit-scrollbar-button {
		display: none;
	}

	*::-webkit-input-placeholder {
		color: var(--theme-secondary-fg);
	}

	.settings-body {
		display: flex;
		width: 100%;
		padding-right: 20px;
		flex-direction: column;
		overflow-x: hidden;
		overflow-y: auto;
	}
	.sidebar {
		margin-left: 20px;
		margin-top: 15px;
	}
	.sidebar-settings-item {
		height: 40px;
		display: flex;
		align-items: center;
		margin: 5px;
		width: 150px;
		cursor: pointer;
		border-radius: 5px;
		transition: 250ms ease-in-out;
	}
	.sidebar-settings-item-name {
		display: flex;
		align-items: center;
		color: var(--theme-secondary-fg);
	}
	.sidebar-settings-item-name > a:hover {
		color: var(--theme-fg);
	}
	.settings-category-name {
		color: var(--theme-secondary-fg);
		margin-bottom: 15px;
	}

	.settings-group {
		background-color: var(--theme-dark-bg);
		padding: 10px;
		border-radius: 10px;
		width: calc(100% - 40px);
		margin-right: 10px;
	}

	.settings-item {
		margin-bottom: 10px;
		height: 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: calc(100% - 20px);
	}

	.settings-group .settings-item:not(:last-of-type) {
		border-bottom: 1px solid var(--theme-border);
	}

	.settings-item-name,
	.matter-switch {
		margin-left: 10px;
		font-size: 1rem;
	}

	.settings-button {
		background-color: var(--theme-secondary-bg);
		border: none;
		border-radius: 5px;
		padding: 5px;
		color: var(--theme-fg);
		cursor: pointer;
		margin-right: 10px;
	}

	.settings-item-text-input {
		background-color: var(--theme-bg);
		margin-right: 10px;
		border: none;
		border-radius: 4px;
		padding: 3px;
		color: var(--theme-fg);
		font-family: var(--theme-font-sans);
		height: 1.65em;
		margin-block: 0;
		padding-inline: 10px;

		&::placeholder {
			color: color-mix(in srgb, var(--theme-secondary-fg) 80%, var(--theme-bg));
			font-family: var(--theme-font-sans);
		}
	}

	.settings-item-text-input:focus {
		outline: none;
	}
	.sidebar-settings-item-name > a {
		color: var(--theme-secondary-fg);
		margin-left: 20px;
		text-decoration: none;
		font-family: var(--theme-font-sans);
	}

	.disk-info {
		display: flex;
		align-items: center;
		flex-direction: row;
	}
	.disk-size-bytes {
		height: 15px;
		margin-left: 10px;
	}
	.settings-button-group {
		display: flex;
	}
	.grouped-btn {
		width: 100%;
	}

	.matter-switch {
		width: 100%;
	}

	.matter-button-contained {
		background-color: var(--theme-accent);
		color: var(--theme-fg);
	}
`;

const SettingSwitch: Component<{
	title: string;
	setting: string;
	callback?: any;
	on?: boolean;
}> = function () {
	this.mount = () => {
		this.on = anura.settings.get(this.setting);
	};
	return (
		<div class="settings-item">
			<label class="matter-switch">
				<input
					id={this.setting}
					type="checkbox"
					role="switch"
					on:click={() => {
						anura.settings.set(this.setting, this.on);
						if (this.callback) this.callback();
					}}
					bind:checked={use(this.on)}
				/>
				<span>{use(this.title)}</span>
			</label>
		</div>
	);
};

const SettingText: Component<{
	title: string;
	setting: string;
	callback?: any;
	value?: string;
	type?: string;
}> = function () {
	return (
		<div class="settings-item">
			<span class="settings-item-name">{use(this.title)}</span>
			<input
				id={this.setting}
				class="settings-item-text-input"
				on:change={(event: any) => {
					switch (this.type) {
						case "number":
							anura.settings.set(this.setting, parseInt(event.target.value));
							break;
						case "string":
							anura.settings.set(this.setting, event.target.value);
							break;
						default:
							anura.settings.set(this.setting, event.target.value);
							break;
					}
					if (this.callback) this.callback();
				}}
				placeholder={anura.settings.get(this.setting)}
				type="text"
			/>
		</div>
	);
};

class SettingsApp extends App {
	name = "Settings";
	package = "anura.settings";
	icon = "/assets/icons/settings.png";
	win: WMWindow;

	constructor() {
		super();
	}

	state = $state({
		settingsBody: undefined as unknown as HTMLDivElement,
		show_linux_install: anura.settings.get("gex-enabled"),
	});

	page = async () => (
		<div
			style="height:100%;width:100%;position:absolute"
			class={`background ${settingsCSS}`}
		>
			<div class="header">
				<h2>Anura Settings</h2>
			</div>

			<div css={this.state} class="container">
				<div class="sidebar">
					<div
						class="sidebar-settings-item"
						on:click={() => {
							this.state.settingsBody.scrollTo({
								top: 0,
								behavior: "smooth",
							});
						}}
					>
						<span class="sidebar-settings-item-name">
							<span class="material-symbols-outlined">build</span>
							<a>General</a>
						</span>
					</div>
					<div
						class="sidebar-settings-item"
						on:click={() => {
							this.state.settingsBody.scrollTo({
								top: 100000,
								behavior: "smooth",
							});
						}}
					>
						<span class="sidebar-settings-item-name">
							<span class="material-symbols-outlined">memory</span>
							<a>x86</a>
						</span>
					</div>
					<div
						class="sidebar-settings-item"
						on:click={() => {
							this.state.settingsBody.scrollTo({
								top: 100000,
								behavior: "smooth",
							});
						}}
					>
						<span class="sidebar-settings-item-name">
							<span class="material-symbols-outlined">device_reset</span>
							<a>Reset</a>
						</span>
					</div>
				</div>
				<div bind:this={use(this.state.settingsBody)} class="settings-body">
					<div id="general" class="general settings-category">
						<h3 class="settings-category-name">General</h3>
						<div class="settings-group">
							<SettingSwitch
								title="Allow offline use"
								setting="use-sw-cache"
								callback={async () => {
									if (
										await anura.dialog.confirm(
											"This will restart Anura. Are you sure?",
										)
									) {
										anura.settings.set("milestone", "__INVALID");
										window.location.reload();
									} else {
										anura.settings.set(
											"use-sw-cache",
											!anura.settings.get("use-sw-cache"),
										);
									}
								}}
							/>
							<SettingSwitch
								title="Boot from OPFS"
								setting="bootFromOPFS"
								callback={async () => {
									if (
										await anura.dialog.confirm(
											"This will restart Anura. Are you sure?\nYour data will not be accessible",
										)
									) {
										await (window as any).idbKeyval.set(
											"bootFromOPFS",
											!(await (window as any).idbKeyval.get("bootFromOPFS")),
										);
										window.location.reload();
									} else {
										anura.settings.set(
											"bootFromOpfs",
											!anura.settings.get("bootFromOpfs"),
										);
									}
								}}
							/>
							<SettingSwitch title="24-hour time" setting="sir-yes-sir" />
							<SettingSwitch title="Performance mode" setting="blur-disable" />
							<SettingSwitch
								title="Reduce motion"
								setting="disable-animation"
							/>
							<SettingSwitch
								title="Window Edge Clamping"
								setting="clampWindows"
							/>
							<SettingSwitch
								title="Transparent Anura Shell Background"
								setting="transparent-ashell"
							/>
							<SettingSwitch
								title="Enable Launcher Keybind"
								setting="launcher-keybind"
							/>
							<SettingText title="Custom Wisp URL" setting="wisp-url" />
							<SettingText title="Custom Power Off URL" setting="exitUrl" />
						</div>
					</div>
					<div id="gex" class="gex settings-category">
						<h3 class="settings-category-name">Anura Linux</h3>
					</div>
					<div id="reset" class="settings-category">
						<h3 class="settings-category-name">Reset Anura</h3>
						<div class="settings-group">
							<div class="settings-item">
								<span class="settings-item-name">
									Reset your Anura install.
								</span>
								<button
									class="matter-button-outlined"
									on:click={async () => {
										const confirmation = await anura.dialog.confirm(
											"Are you sure you want to powerwash Anura? All of your data will be lost.",
										);
										if (confirmation) {
											try {
												navigator.serviceWorker
													.getRegistrations()
													.then(function (registrations) {
														for (const registration of registrations) {
															registration.unregister();
														}
													});
												localStorage.clear();
												sessionStorage.clear();
												const databases = await indexedDB.databases();
												for (const database of databases) {
													try {
														await indexedDB.deleteDatabase(database.name!);
													} catch {
														console.log(
															`Failed to delete database ${database.name}`,
														);
													}
												}
												window.location.reload();
											} catch (e) {
												console.error("failed powerwash: ", e);
											}
										}
									}}
								>
									Powerwash
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	async open(): Promise<WMWindow | undefined> {
		if (this.win?.element?.parentElement) {
			return this.win;
		}
		this.win = anura.wm.create(this, {
			title: "",
			width: "910px",
			height: `${(720 * window.innerHeight) / 1080}px`,
			resizable: true,
		});

		this.win.content.appendChild(await this.page());
		return this.win;
	}
}
