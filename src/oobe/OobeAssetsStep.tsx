// TODO: Add spinner.gif to assets

class OobeAssetsStep {
    nextButton: HTMLElement;

    element = (
        <div class="screen" id="downloadingFiles">
            <div id="assetsDiv" style="display:none;"></div>
            <h1>Downloading assets</h1>
            <div id="subtitle">
                For the best experience, ChromeOS needs to download assets so
                that there is no unstyled content.
            </div>
            <img src="/assets/oobe/spinner.gif" />
            <button bind:nextButton={this} class="preferredButton">
                Skip OOBE for now
            </button>
        </div>
    );
}
