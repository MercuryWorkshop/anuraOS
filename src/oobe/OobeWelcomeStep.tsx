class OobeWelcomeStep {
    nextButton: HTMLElement;

    element = (
        <div class="screen" id="welcome">
            <h1>Welcome to your Chromebook</h1>
            <div id="subtitle">Fast. Insecure. Effortless.</div>
            <div id="gridContent">
                <div id="topButtons">
                    <button>Random button</button>
                </div>
                <img id="animation" src="assets/oobe/welcome.gif" />
                <div id="bottomButtons">
                    <button bind:nextButton={this} class="preferredButton">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
