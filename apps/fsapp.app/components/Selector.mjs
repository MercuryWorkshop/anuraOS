export function Selector() {
    this.css = `
    margin-top: 0.3em;
    margin-right: 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    justify-content: flex-end;
    padding: 0.5em;

    button {
        background: var(--theme-accent);
        margin: 1rem 0.5rem;
        padding: 1.5em;
        display: flex;
        align-items: center;
        border-radius: 9999px;
    }
    `;

    return html`
        <div class="topbar" id="selector">
            <div class="sep"></div>
            <button
                on:click=${() => {
                    selectAction(currentlySelected);
                }}
            >
                Select
            </button>
        </div>
    `;
}
