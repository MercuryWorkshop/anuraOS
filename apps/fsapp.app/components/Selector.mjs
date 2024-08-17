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
    width: 100%; /* Make sure it spans the entire width */
    justify-content: center; /* Center the content horizontally */
    padding: 0.5em; /* Optional padding */

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
