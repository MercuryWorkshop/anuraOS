// this has now been redone, nobody is getting sent to hell anymore
type ProgressObject = {
	title: string;
	detail: string;
	progress: number;
};

class Dialog extends App {
	name = "Anura Dialog";
	package = "anura.dialog";
	icon = "/assets/icons/generic.svg";
	source: string;
	hidden = true;

	css = css`
		padding: 14px;
		height: calc(100% - 24px);
		overflow: hidden;
		display: flex;
		flex-direction: column;

		h2 {
			font-size: 1.2rem;
		}
		.buttons {
			flex-grow: 1;
			display: flex;
			justify-content: flex-end;
			margin-top: 10px;

			.matter-button-contained {
				background-color: var(--theme-accent);
				color: var(--theme-fg);
			}
		}
		.confirm {
			margin-left: 5px;
		}

		.matter-progress-linear {
			width: 100%;
		}
	`;

	constructor() {
		super();
	}

	// this is probably the worst way to do this but hey it works - fish
	private getFit(element: HTMLElement, minHeight?: number): number {
		const el = element.cloneNode(true) as HTMLElement;
		el.style.position = "absolute";
		el.style.top = "0";
		el.style.left = "0";
		// el.classList = this.css;
		el.style.width = "350px";
		el.style.padding = "14px";
		el.style.height = "max-content";
		el.style.visibility = "hidden";
		el.style.zIndex = "-1";
		el.style.opacity = "0";

		document.body.appendChild(el);
		const height = el.offsetHeight;

		// setTimeout(() => {
		document.body.removeChild(el);
		// }, 1000);

		// console.log("height", height);
		return Math.max(height + 50, minHeight || 170);
	}

	alert(message: string, title = "Alert") {
		const contents: HTMLElement = (
			<div class={[this.css]}>
				<h2>{title}</h2>
				<p>{message}</p>
				<div class={["buttons"]}>
					<button
						class={["matter-button-contained"]}
						on:click={() => {
							win.close();
						}}
					>
						OK
					</button>
				</div>
			</div>
		);

		const win = anura.wm.create(this, {
			title: title,
			width: "350px",
			height: this.getFit(contents) + "px",
		});

		// MARK: The DAMN CSS
		win.content.style.background = "var(--material-bg)";
		win.content.style.color = "white";

		// MARK: good idea?
		// (win.element as HTMLElement).querySelectorAll(".windowButton").forEach((el: HTMLElement) => {
		//     el.style.display = "none";
		// })

		win.content.appendChild(contents);
	}
	async confirm(message: string, title = "Confirmation"): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const contents: HTMLElement = (
				<div class={[this.css]}>
					<h2>{title}</h2>
					<p>{message}</p>
					<div class="buttons">
						<button
							class="matter-button-outlined"
							on:click={() => {
								resolve(false);
								win.close();
							}}
						>
							Cancel
						</button>
						<button
							class={["matter-button-contained", "confirm"]}
							on:click={() => {
								resolve(true);
								win.close();
							}}
						>
							OK
						</button>
					</div>
				</div>
			);

			const win = anura.wm.create(this, {
				title: title,
				width: "350px",
				height: this.getFit(contents) + "px",
			});

			win.onclose = () => {
				resolve(false);
			};

			win.content.style.background = "var(--material-bg)";
			win.content.style.color = "white";

			win.content.appendChild(contents);
		});
	}
	async prompt(message: string, defaultValue?: any): Promise<any> {
		return new Promise((resolve, reject) => {
			let input: HTMLInputElement;

			const contents: HTMLElement = (
				<div class={[this.css]}>
					<h2>{message}</h2>
					<label class="matter-textfield-filled">
						{(input = (<input placeholder=" " />) as HTMLInputElement)}
					</label>

					<div class="buttons">
						<button
							class="matter-button-outlined"
							on:click={() => {
								resolve(null);
								win.close();
							}}
						>
							Cancel
						</button>
						<button
							class={["matter-button-contained", "confirm"]}
							on:click={() => {
								const value = input.value;
								if (value && value !== "") {
									resolve(value);
								} else if (defaultValue) {
									resolve(defaultValue);
								} else {
									resolve(null);
								}
								win.close();
							}}
						>
							OK
						</button>
					</div>
				</div>
			);

			const win = anura.wm.create(this, {
				title: message,
				width: "350px",
				height: this.getFit(contents) + "px",
			});

			win.onclose = () => {
				resolve(null);
			};

			win.content.style.background = "var(--material-bg)";
			win.content.style.color = "white";

			win.content.appendChild(contents);
		});
	}
	progress(title: string, detail?: string): Stateful<ProgressObject> {
		const state = $state({
			title: title || "",
			detail: detail || "",
			progress: 0,
		});
		const contents: HTMLElement = (
			<div class={[this.css]}>
				<h2 style="margin-bottom: 3px;">{use(state.title)}</h2>
				<p style="margin-top: 4px; margin-bottom: 16px; font-size: 0.925rem;">
					{use(state.detail)}
				</p>
				<progress
					class="matter-progress-linear"
					bind:value={use(state.progress)}
				></progress>
			</div>
		);

		const win = anura.wm.create(this, {
			title: title,
			width: "350px",
			height: this.getFit(contents) + "px",
		});

		// MARK: The DAMN CSS
		win.content.style.background = "var(--material-bg)";
		win.content.style.color = "white";
		useChange(state.progress, () => {
			if (state.progress >= 1) win.close();
		});
		useChange([state.title, state.detail], () => {
			// TODO: Implement size changing on title or detail change
		});

		win.content.appendChild(contents);

		return state;
	}
}
