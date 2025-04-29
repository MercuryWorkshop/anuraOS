type WallpaperObject = {
	name: string;
	url: string;
};

class WallpaperAndStyle extends App {
	name = "Wallpaper & Style";
	package = "anura.wallpaper";
	icon = "/assets/icons/wallpaper.png";

	libfilepicker: {
		selectFile: (options?: object) => Promise<string | string[]>;
		selectFolder: (options?: object) => Promise<string | string[]>;
	};

	wallpaperList = async () => {
		return await this.loadWallpaperManifest();
	};

	state = $state({
		resizing: false,
		tab: "wallpapers",
	});

	css = css`
		color: var(--theme-fg);

		.header {
			margin-left: 20px;
			display: flex;
			justify-content: space-between;
		}
		.current-wallpaper {
			margin-left: 20px;
			display: flex;
			align-items: center;
		}
		.current-wallpaper-image {
			aspect-ratio: 16/9;
			height: 125px;
			border-radius: 10px;
			margin-right: 20px;
		}
		.current-wallpaper-image:hover {
			cursor: pointer;
		}
		.curr-wallpaper-text {
			color: var(--theme-secondary-fg);
			margin-bottom: 5px;
		}
		.curr-wallpaper-name {
			margin-top: 0px;
		}
		select {
			background-color: var(--theme-secondary-bg);
			color: var(--theme-fg);
			border: none;
			padding: 5px;
			border-radius: 5px;
			font-family: var(--theme-font-sans);
			outline: none;
			height: 25px;
		}
		.separator-hr {
			margin: 20px;
			border: 2px solid var(--theme-border);
			border-radius: 10px;
		}
		*::-webkit-scrollbar {
			width: 8px;
		}

		*::-webkit-scrollbar-thumb {
			background-color: var(--theme-secondary-bg);
			border-radius: 8px;
		}

		*::-webkit-scrollbar-button {
			display: none;
		}
		.wallpaper-list-container {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
			grid-gap: 20px;
			margin-left: 20px;
			text-align: center;
			overflow-y: auto;
			height: calc(100% - 250px);
		}
		.wallpaper-list-item {
			cursor: pointer;
		}
		.wallpaper-list-item-image {
			aspect-ratio: 16/9;
			height: 100px;

			border-radius: 10px;
			transition: border 0.2s;
			border: 3px solid transparent; /* another shit workaround :frcoal: */
		}
		.wallpaper-list-item-name {
			margin: 10px;
		}

		.wallpaper-list-item.selected img {
			border-color: var(--theme-accent);
			transition: border 0.2s;
		}

		.custom-wallpaper {
			margin-left: 20px;
			margin-bottom: 20px;
		}

		.matter-button-contained {
			background-color: var(--theme-accent);
			color: var(--theme-fg);
		}

		#custom-wallpaper-btn {
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: var(--theme-secondary-bg);
			color: var(--theme-fg);
			border-radius: 10px;
			aspect-ratio: 16 / 9;
			height: 100px;
			width: 177.78px; /* EWW DIRTY HACK PLEASE FIX - fish */
			cursor: pointer;
		}

		input[type="color"] {
			background-color: transparent;
			border: none;
			padding: 0;
			width: 2.5rem;
			height: 2rem;
		}

		input[type="color" i]::-webkit-color-swatch {
			/* This will never work on firefox but who gaf */
			border-radius: 0.5rem;
			border: 1px solid var(--theme-border);
			height: 25px;
		}

		input[type="color" i]::-webkit-color-swatch-wrapper {
			padding: 0;
			height: 25px;
		}

		.wall-fit {
			display: flex;
			gap: 5px;
		}

		width: 100%;
		height: 100%;
		position: absolute;
		overflow-y: auto;

		input[type="color"] {
			appearance: none;
			background: none;
			padding: 0;
			border: 0;
			border-radius: 1rem;
			width: 4rem;
			height: 3rem;
		}

		input[type="color" i]::-webkit-color-swatch-wrapper {
			padding: 0;
			border: 0;
		}

		input[type="color" i]::-webkit-color-swatch {
			border-radius: 1rem;
			padding: 0;
			border-color: var(--theme-border);
		}

		.editor {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			padding-block: 0.6rem;
			/* height: 2.75em; */
		}

		.editor:not(:last-of-type) {
			border-bottom: 1px solid var(--theme-border);
		}

		.editor input {
			margin: 0 0.8rem;
		}

		#colors {
			display: flex;
			flex-direction: column;
			padding-inline: 2rem;
			padding-top: 0.6rem;
		}

		#head {
			padding: 0.5rem 1rem;
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: sticky;
			top: 0;
			background: var(--theme-bg);

			& > h1 {
				margin-left: 0.5rem;
				margin-block: 0.9rem;
			}
		}

		#btns {
			display: flex;
			gap: 0.15rem;

			opacity: 1;
			transition: opacity 0.15s allow-discrete;

			& button {
				padding: 0.5rem 0.75rem;
				border-radius: 10rem;
				background: transparent;
				color: var(--theme-fg);
				border: none;
				cursor: pointer;
				font-family: var(--theme-font-sans);
				font-size: 1rem;

				display: flex;
				align-items: center;
				gap: 0.3rem;

				transition: 0.15s background;

				& .material-symbols-outlined {
					font-size: 1.7rem;
				}

				&:hover,
				&:focus-visible {
					background: var(--theme-secondary-bg);
					transition: 0.15s background;
					outline: none;
				}

				&:active {
					background: color-mix(
						in srgb,
						var(--theme-secondary-bg) 90%,
						var(--theme-fg)
					);
					transition: 0.05s background;
				}
			}

			&[hidden] {
				opacity: 0;
				pointer-events: none;
				transition: opacity 0.15s allow-discrete;
			}

			/* because fuck firefox and its users */
			@starting-style {
				opacity: 0;
				transition: opacity 0.15 allow-discrete;
			}
		}

		&:has(#colors) h2:not(:first-of-type) {
			color: var(--theme-accent);

			&::after {
				width: 100%;
			}
		}

		&:has(#colors) h2 {
			color: var(--theme-fg);

			&::after {
				width: 0px;
			}
		}

		&:not(:has(#colors)) h2 {
			color: var(--theme-accent);

			&::after {
				width: 100%;
			}
		}

		&:not(:has(#colors)) h2:not(:first-of-type) {
			color: var(--theme-fg);

			&::after {
				width: 0px;
			}
		}

		h2 {
			display: inline-block;
			margin-right: 1rem;
			cursor: pointer;
			font-size: 1rem;
			text-transform: capitalize;

			&::after {
				content: "";
				display: block;
				width: 0px;
				height: 3px;
				background: var(--theme-accent);
				margin-top: 0.5rem;
				transition: 0.15s width;
				display: flex;
				align-self: center;
				justify-self: center;
			}
		}
	`;

	colorEditors: {
		prop: keyof ThemeProps;
		name: string;
	}[] = [
		{
			prop: "background",
			name: "Background",
		},
		{
			prop: "secondaryBackground",
			name: "Secondary Background",
		},
		{
			prop: "darkBackground",
			name: "Dark Background",
		},
		{
			prop: "accent",
			name: "Accent",
		},
		{
			prop: "foreground",
			name: "Foreground",
		},
		{
			prop: "secondaryForeground",
			name: "Secondary Foreground",
		},
		{
			prop: "border",
			name: "Border",
		},
		{
			prop: "darkBorder",
			name: "Dark Border",
		},
	];

	page = async () => (
		<div
			style="height:100%;width:100%;position:absolute"
			class={`background ${this.css}`}
		>
			<div class="header">
				<span>
					<h2
						on:click={() => {
							this.state.tab = "wallpapers";
						}}
					>
						Wallpapers
					</h2>
					<h2
						on:click={() => {
							this.state.tab = "colors";
						}}
					>
						Colors
					</h2>
				</span>
				{$if(
					use(this.state.tab, (tab) => tab === "colors"),
					<span
						id="btns"
						bind:hidden={use(this.state.tab, (tab) => tab === "wallpapers")}
					>
						<button
							style={{
								color: use(anura.ui.theme.state.foreground),
							}}
							on:click={() => {
								anura.ui.theme.reset();
								anura.settings.set("theme", anura.ui.theme.state);
							}}
						>
							<span class="material-symbols-outlined">restore</span>
							Reset
						</button>

						<button
							style={{
								color: use(anura.ui.theme.state.foreground),
							}}
							on:click={() => {
								this.exportTheme(JSON.stringify(anura.ui.theme.state));
							}}
						>
							<span class="material-symbols-outlined">save</span>
							Save
						</button>

						<button
							style={{
								color: use(anura.ui.theme.state.foreground),
							}}
							on:click={() => {
								this.importTheme();
							}}
						>
							<span class="material-symbols-outlined">folder</span>
							Import
						</button>
					</span>,
				)}
			</div>
			{$if(
				use(this.state.tab, (tab) => tab === "wallpapers"),
				<div style="flex-direction: column; height: 100%;">
					<div class="current-wallpaper">
						<img
							class="current-wallpaper-image"
							src={this.getCurrentWallpaper().url}
						/>
						<div className="current-wallpaper-attributes">
							<h5 class="curr-wallpaper-text" color="gray">
								Current Wallpaper
							</h5>
							<h3 class="curr-wallpaper-name" color="white">
								{this.getCurrentWallpaper().name}
							</h3>
							<div class="wall-fit">
								<select
									name="fit-select"
									id="fit-select"
									on:change={(e: Event) => {
										anura.settings.set(
											"wallpaper-fit",
											(e.target as HTMLSelectElement).value,
										);
										window.document.body.style.backgroundSize =
											anura.settings.get("wallpaper-fit");
									}}
								>
									<option
										value="cover"
										selected={
											// Hacky fix but it works
											anura.settings.get("wallpaper-fit") === "cover"
										}
									>
										Cover
									</option>
									<option
										value="contain"
										selected={
											anura.settings.get("wallpaper-fit") === "contained"
										}
									>
										Contain
									</option>
									<option
										value="auto"
										selected={anura.settings.get("wallpaper-fit") === "auto"}
									>
										Auto
									</option>
								</select>
								{$if(
									anura.settings.get("wallpaper-fit") === "contain",
									<input
										type="color"
										name="contain-color"
										id="contain-color"
										value={anura.settings.get("wallpaper-contain-color")}
										on:change={(e: Event) => {
											anura.settings.set(
												"wallpaper-contain-color",
												(e.target as HTMLInputElement).value,
											);
											window.document.documentElement.style.backgroundColor =
												anura.settings.get("wallpaper-contain-color");
										}}
									/>,
								)}
							</div>
						</div>
					</div>

					<hr class="separator-hr" />

					{await this.wallpaperList().then((wallpaperJSON: any) => {
						const wallpaperList = (
							<div id="wallpaper-list" class="wallpaper-list-container">
								<div
									class="wallpaper-list-item"
									style="display: flex;flex-direction: column;align-items: center;"
								>
									<div
										on:click={() => {
											this.libfilepicker
												.selectFile({
													regex: "(png|jpe?g|gif|bmp|webp|tiff|svg|ico)",
													app: this,
												})
												.then((filename: any) => {
													if (filename === undefined) return;
													const wallpaperName = filename.split("/").pop();
													const wallpaperURL = "/fs" + filename;
													this.setNewWallpaper({
														name: wallpaperName,
														url: wallpaperURL,
													});
												});
										}}
										id="custom-wallpaper-btn"
									>
										<span
											class="material-symbols-outlined"
											style="font-size: 32px;"
										>
											add
										</span>
									</div>
									<h5 class="wallpaper-list-item-name" color="white">
										Upload new
									</h5>
								</div>
							</div>
						);
						wallpaperJSON["wallpapers"].forEach(
							(wallpaper: WallpaperObject) => {
								wallpaperList.appendChild(
									<div
										on:click={() => {
											this.setNewWallpaper(wallpaper);
										}}
										class={`wallpaper-list-item ${this.getCurrentWallpaper().name === wallpaper.name ? "selected" : ""}`}
										id={`wallpaper-${wallpaper.name.replace(" ", "-")}`}
									>
										<img
											class="wallpaper-list-item-image"
											src={wallpaper.url}
										/>
										<h5 class="wallpaper-list-item-name" color="white">
											{wallpaper.name}
										</h5>
									</div>,
								);
							},
						);
						return wallpaperList;
					})}
				</div>,
				<div id="colors">
					{this.colorEditors.map((color) => (
						<div class="editor">
							{color.name}
							<input
								type="color"
								bind:value={use(anura.ui.theme.state[color.prop])}
								on:input={(e: InputEvent) => {
									const val = (e.target! as HTMLInputElement).value;
									anura.ui.theme[color.prop] = val;
									anura.settings.set("theme", val, color.prop);
								}}
							/>
						</div>
					))}
				</div>,
			)}
		</div>
	);

	setNewWallpaper(wallpaperObj: WallpaperObject) {
		anura.settings.set("wallpaper", wallpaperObj.url);
		anura.settings.set("wallpaper-name", wallpaperObj.name);

		this.updateCurrentWallpaperElements();
		this.setWallpaper(wallpaperObj.url);
	}

	getCurrentWallpaper(): WallpaperObject {
		let currWallpaper = anura.settings.get("wallpaper");
		let currWallpaperName = anura.settings.get("wallpaper-name");
		if (
			currWallpaper === undefined ||
			currWallpaper === null ||
			currWallpaperName === undefined ||
			currWallpaperName === null
		) {
			currWallpaper = "/assets/wallpaper/bundled_wallpapers/Nocturne.jpg";
			currWallpaperName = "Nocturne";
			anura.settings.set("wallpaper", currWallpaper);
			anura.settings.set("wallpaper-name", currWallpaperName);
		}
		return {
			name: currWallpaperName,
			url: currWallpaper,
		};
	}

	async loadWallpaperManifest() {
		const wallpaperManifest = await fetch(
			"/assets/wallpaper/bundled_wallpapers/manifest.json",
		);
		return JSON.parse(await wallpaperManifest.text());
	}

	updateCurrentWallpaperElements() {
		// Updates the display for the current wallpaper.
		// I'm so sorry for how ugly this function is, this was written in ~30 seconds.
		const currWallpaper = this.getCurrentWallpaper();
		const currWallpaperImage = document.getElementsByClassName(
			"current-wallpaper-image",
		)[0];
		const currWallpaperName = document.getElementsByClassName(
			"curr-wallpaper-name",
		)[0];

		if (currWallpaperImage === undefined || currWallpaperName === undefined)
			return;
		currWallpaperImage.setAttribute("src", currWallpaper.url);
		(currWallpaperName as HTMLHeadingElement).innerText = currWallpaper.name;

		// this is where it gets way jankier
		Array.from(document.getElementsByClassName("wallpaper-list-item")) // woah that is jank
			.forEach((item) => {
				item.classList.remove("selected");
			});

		document
			.getElementById("wallpaper-" + currWallpaper.name.replace(" ", "-"))
			?.classList.add("selected");
	}

	setWallpaper(url: string) {
		window.document.documentElement.style.backgroundColor = anura.settings.get(
			"wallpaper-contain-color",
		); // this might not be ideal but it works
		window.document.body.style.background = `url("${url}") no-repeat center center fixed`;
		window.document.body.style.backgroundSize =
			anura.settings.get("wallpaper-fit");
	}

	async importTheme() {
		// Here be dragons
		this.libfilepicker
			.selectFile({ regex: "(json|txt)", app: this })
			.then(async (file: any) => {
				try {
					const data = await anura.fs.promises.readFile(file);
					Object.assign(anura.ui.theme.state, JSON.parse(data as any));
					anura.ui.theme.apply();
					await anura.settings.set("theme", anura.ui.theme.state);
				} catch (e) {
					anura.notifications.add({
						title: "Theme editor",
						description: `Theme could not be loaded: ${e}`,
						timeout: 5000,
					});
				}
			});
	}

	exportTheme(theme: string) {
		const filePath = `/theme-${Math.floor(Math.random() * 1e10)}.json`;
		anura.fs.writeFile(filePath, theme);
		anura.notifications.add({
			title: "Theme editor",
			description: `Theme saved to ${filePath}`,
			timeout: 5000,
		});
	}

	constructor() {
		super();
	}

	async open(): Promise<WMWindow | undefined> {
		const win = anura.wm.create(this, {
			title: "",
			width: "910px",
			height: `${(720 * window.innerHeight) / 1080}px`,
		});

		if (this.libfilepicker === undefined) {
			// Lazy load the filepicker library.
			this.libfilepicker = await anura.import("anura.filepicker");
		}

		win.content.appendChild(await this.page());

		return win;
	}
}
