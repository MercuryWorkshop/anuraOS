export function TopBar() {
    this.css = `
    margin-top: 0.3em;
    margin-right: 1em;
    display: flex;
    flex-direction: row;
    align-items: center;
    
    button {
        border-radius: 1em;
        border: none;
        background-color: var(--theme-bg);
        height: 2.25em;
        transition: background-color 0.1s;
    }
    
    button > i {
        padding: 0.25em;
    }
    
    button:hover {
        transition: background-color 0.1s;
        background-color: var(--theme-secondary-bg);
    }
    
    button:active {
        background-color: color-mix(
            var(--theme-bg),
            var(--theme-secondary-bg),
            0.5
        );
    }
    
    .sep {
        flex-grow: 1;
    }
    
    .breadcrumbs button {
        font-size: 16px;
        margin-right: 0.25em;
        margin-left: 0.25em;
        border-radius: 0;
        display: inline-block;
    }
    
    .breadcrumbs button:hover {
        background-color: transparent;
    }
    `;
    return html`
        <div>
            <div class="breadcrumbs">
                <button>My files</button><span>></span><button>owo :3</button>
            </div>
            <div class="sep"></div>
            <button>
                <i class="material-symbols-outlined">search</i>
            </button>
            <button>
                <i class="material-symbols-outlined">table_rows</i>
            </button>
            <button>
                <i class="material-symbols-outlined">sort_by_alpha</i>
                <!--<i class="fa-solid fa-arrow-down-z-a fa-lg"></i> - opposite-->
            </button>
            <button>
                <i class="material-symbols-outlined">settings</i>
            </button>
        </div>
    `;
}
