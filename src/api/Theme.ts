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
        border = "#444444",
        background = "#202124",
        secondaryBackground = "#383838",
        darkBackground = "#161616",
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
        document.body.style.setProperty("--matter-helper-theme", this.accent);

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

        // special elements (transparency)
        // YES I KNOW IT'S JANK
        if (document.querySelector("footer")) {
            document.querySelector("footer")!.style.background =
                anura.ui.theme.darkBackground + "e6";
        }

        if (document.getElementById("launcher")) {
            document.getElementById("launcher")!.style.background =
                anura.ui.theme.darkBackground + "e6";
        }

        if (document.getElementById("quickSettings")) {
            document.getElementById("quickSettings")!.style.background =
                anura.ui.theme.darkBackground + "e6";
        }

        if (document.getElementById("notificationCenter")) {
            document.getElementById("notificationCenter")!.style.background =
                anura.ui.theme.darkBackground + "e6";
        }

        // the jank gets jankier
        document
            .querySelectorAll(".notification")
            .forEach((el: HTMLElement) => {
                // this is sooo bad code bro
                el.style.background = anura.ui.theme.darkBackground + "e6";
            });
    }

    css(): string {
        return `
:root {
  --theme-bg: ${this.background};
  --theme-border: ${this.border};
  --theme-fg: ${this.foreground};
  --theme-secondary-bg: ${this.secondaryBackground};
  --theme-secondary-fg: ${this.secondaryForeground};
  --theme-dark-bg: ${this.darkBackground};
  --theme-accent: ${this.accent};
}
        `;
    }
}
