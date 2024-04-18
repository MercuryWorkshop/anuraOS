class Theme {
    foreground: string;
    secondaryForeground: string;
    border: string;
    background: string;
    secondaryBackground: string;
    darkBackground: string;
    accent: string;

    static new(json: { [key: string]: string }) {
        return new Theme(
            json["foreground"],
            json["secondaryForeground"],
            json["border"],
            json["background"],
            json["secondaryBackground"],
            json["darkBackground"],
            json["accent"],
        );
    }

    constructor(
        foreground = "#FFFFFF",
        secondaryForeground = "#C1C1C1",
        border = "#202124",
        background = "#202124",
        secondaryBackground = "#383838",
        darkBackground = "#1A1A1C",
        accent = "#4285F4",
    ) {
        this.foreground = foreground;
        this.secondaryForeground = secondaryForeground;
        this.border = border;
        this.background = background;
        this.secondaryBackground = secondaryBackground;
        this.darkBackground = darkBackground;
        this.accent = accent;
        this.apply();
    }

    apply() {
        // backwards compat with matter
        document.body.style.setProperty("--material-bg", this.background);
        document.body.style.setProperty("--material-border", this.border);
        document.body.style.setProperty("--matter-primary-rgb", this.accent);

        document.body.style.setProperty("--theme-bg", this.background);
        document.body.style.setProperty("--theme-border", this.border);
        document.body.style.setProperty("--theme-fg", this.foreground);
        document.body.style.setProperty(
            "--theme-secondary-bg",
            this.secondaryBackground,
        );
        document.body.style.setProperty(
            "--theme-secondary-fg",
            this.secondaryForeground,
        );
        document.body.style.setProperty("--theme-dark-bg", this.darkBackground);
        document.body.style.setProperty("--theme-accent", this.accent);
    }
}
