// TODO: Make the button actually mirror CrOS's design
export function Selector() {
	this.css = `
    display: flex;
    flex-direction: row;
    align-items: center;
    position: fixed;
    bottom: 0;
    right: 0;
    padding: 0.3em;

    button {
        background: var(--theme-accent);
        margin: 1rem .5rem;
        padding: .8em 1.5em;
        display: flex;
        align-items: center;
        border-radius: 9999px;
        border: none;
        cursor: pointer;

        &,
        &:hover,
        &:active,
        &:focus {
            outline: none;
            transition: background-color 0.15s ease-in-out;
        }

        &:focus,
        &:hover {
            background: color-mix(in srgb, var(--theme-accent), var(--theme-fg) 8%);
        }

        &:active {
            background: color-mix(in srgb, var(--theme-accent), var(--theme-fg) 20%);
        }
    }
    `;

	return html`
		<div class="topbar" id="selector">
			<div class="sep"></div>
			<button
				on:click=${() => {
					filePickerAction(currentlySelected);
				}}
			>
				Select
			</button>
		</div>
	`;
}
