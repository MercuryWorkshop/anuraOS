interface ThemeProps {
    foreground: string;
    secondaryForeground: string;
    border: string;
    darkBorder: string;
    background: string;
    secondaryBackground: string;
    darkBackground: string;
    accent: string;
}

class Theme implements ThemeProps {
    // foreground: string;
    // secondaryForeground: string;
    // border: string;
    // background: string;
    // secondaryBackground: string;
    // darkBackground: string;
    // accent: string;
    get foreground() {
        return this.state.foreground;
    }

    set foreground(value) {
        this.state.foreground = value;
        this.apply();
    }

    get secondaryForeground() {
        return this.state.secondaryForeground;
    }

    set secondaryForeground(value) {
        this.state.secondaryForeground = value;
        this.apply();
    }

    get border() {
        return this.state.border;
    }

    set border(value) {
        this.state.border = value;
        this.apply();
    }

    get darkBorder() {
        return this.state.darkBorder;
    }

    set darkBorder(value) {
        this.state.darkBorder = value;
        this.apply();
    }

    get background() {
        return this.state.background;
    }

    set background(value) {
        this.state.background = value;
        this.apply();
    }

    get secondaryBackground() {
        return this.state.secondaryBackground;
    }

    set secondaryBackground(value) {
        this.state.secondaryBackground = value;
        this.apply();
    }

    get darkBackground() {
        return this.state.darkBackground;
    }

    set darkBackground(value) {
        this.state.darkBackground = value;
        this.apply();
    }

    get accent() {
        return this.state.accent;
    }

    set accent(value) {
        this.state.accent = value;
        this.apply();
    }

    state: Stateful<ThemeProps>;

    cssPropMap: Record<keyof ThemeProps, string[]> = {
        background: ["--theme-bg", "--material-bg"],
        border: ["--theme-border", "--material-border"],
        darkBorder: ["--theme-dark-border"],
        foreground: ["--theme-fg"],
        secondaryBackground: ["--theme-secondary-bg"],
        secondaryForeground: ["--theme-secondary-fg"],
        darkBackground: ["--theme-dark-bg"],
        accent: ["--theme-accent", "--matter-helper-theme"],
    };

    static new(json: { [key: string]: string }) {
        return new Theme(
            json["foreground"],
            json["secondaryForeground"],
            json["border"],
            json["darkBorder"],
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
        darkBorder = "#000000",
        background = "#202124",
        secondaryBackground = "#383838",
        darkBackground = "#161616",
        accent = "#4285F4",
    ) {
        this.state = $state<ThemeProps>({
            foreground,
            secondaryForeground,
            border,
            darkBorder,
            background,
            secondaryBackground,
            darkBackground,
            accent,
        });

        for (const key in this.state) {
            useChange(use(this.state[key as keyof ThemeProps]), (value) => {
                for (const prop of this.cssPropMap[key as keyof ThemeProps]) {
                    document.body.style.setProperty(prop, value);
                }
            });
        }

        this.apply();
    }

    reset() {
        this.state.foreground = "#FFFFFF";
        this.state.secondaryForeground = "#C1C1C1";
        this.state.border = "#444444";
        this.state.darkBorder = "#000000";
        this.state.background = "#202124";
        this.state.secondaryBackground = "#383838";
        this.state.darkBackground = "#161616";
        this.state.accent = "#4285F4";

        this.apply();
    }

    // This applies the theme to special elements that need to be updated manually
    // Ideally, this should be done automatically and if it is possible to do so
    // outside of this function, it should be done there instead. However, this
    // function should always remain here for the cases where it is not possible,
    // even if this function is empty.

    apply() {
        const darkBackground = this.state.darkBackground;
        document
            .querySelectorAll(".notification")
            .forEach((el: HTMLElement) => {
                // this is sooo bad code bro
                el.style.background = darkBackground + "e6";
            });
        document.querySelectorAll("iframe").forEach((el: HTMLIFrameElement) => {
            el.contentWindow?.document.dispatchEvent(
                new Event("anura-theme-change"),
            );
        });
    }

    css(): string {
        const lines = [];
        lines.push(":root {");
        for (const key in this.state) {
            for (const prop of this.cssPropMap[key as keyof ThemeProps]) {
                lines.push(
                    `  ${prop}: ${this.state[key as keyof ThemeProps]};`,
                );
            }
        }
        lines.push("}");
        return lines.join("\n");
    }
}
