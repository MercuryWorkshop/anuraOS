class Calendar {
    state: Stateful<{
        show?: boolean;
    }> = $state({
        show: false,
    });

    element: HTMLElement = document.createElement("div");

    calCSS = css`
        min-height: 355px;
        bottom: 60px;
        right: 10px;

        .calContent {
            height: 100%;
            width: 100%;
            border-radius: 1em;
            overflow: hidden;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            background: transparent;
        }

        body {
            display: flex;
            height: 100%;
            align-items: top;
            justify-content: center;
            overflow: hidden;
            font-family:
                "Roboto",
                RobotoDraft,
                "Droid Sans",
                Arial,
                Helvetica,
                -apple-system,
                BlinkMacSystemFont,
                system-ui,
                sans-serif;
            color: var(--theme-fg);
        }

        .calendar-container {
            width: 100%;
            height: 100%;
        }

        .calendar-container header {
            display: flex;
            align-items: center;
            padding: 25px 30px 10px;
            justify-content: space-between;
        }

        header .calendar-navigation {
            display: flex;
        }

        header .calendar-navigation span {
            height: 38px;
            width: 38px;
            margin: 0 1px;
            cursor: pointer;
            text-align: center;
            line-height: 38px;
            border-radius: 50%;
            user-select: none;
            color: var(--theme-secondary-fg);
            font-size: 1.9rem;
        }

        .calendar-navigation span:last-child {
            margin-right: -10px;
        }

        header .calendar-navigation span:hover {
            background: var(--theme-secondary-bg);
        }

        header #calendar-date {
            font-weight: 500;
            font-size: 1.45rem;
            color: var(--theme-secondary-fg);
            display: flex;
            gap: 10px;
        }

        .calendar-body {
            padding: 20px;
        }

        .calendar-body ul {
            list-style: none;
            flex-wrap: wrap;
            display: flex;
            text-align: center;
        }

        .calendar-body li {
            width: calc(100% / 7);
            font-size: 1.07rem;
            color: var(--theme-secondary-fg);
        }

        .calendar-body .calendar-weekdays li {
            cursor: default;
            font-weight: 500;
        }

        .calendar-body .calendar-dates li {
            margin-top: 25px;
            position: relative;
            z-index: 1;
            cursor: pointer;
        }

        .calendar-dates li.inactive {
            color: var(--theme-secondary-fg);
            opacity: 0.5;
        }

        .calendar-dates li.active {
            color: var(--theme-fg);
        }

        .calendar-dates li::before {
            position: absolute;
            content: "";
            z-index: -1;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }

        .calendar-dates li.active::before {
            background: var(--theme-accent);
        }

        .calendar-dates li:not(.active):hover::before {
            background: var(--theme-secondary-bg);
        }
    `;

    transition = css`
        transition: opacity 0.08s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    `;

    show = css`
        opacity: 1;
        z-index: 9998;
    `;

    hide = css`
        opacity: 0;
        z-index: -1;
    `;

    clickoffChecker: HTMLDivElement;
    updateClickoffChecker: (show: boolean) => void;

    open() {
        this.state.show = true;
    }

    close() {
        this.state.show = false;
    }

    toggle() {
        if (this.state.show) {
            this.close();
        } else {
            this.open();
        }
    }

    constructor(
        clickoffChecker: HTMLDivElement,
        updateClickoffChecker: (show: boolean) => void,
    ) {
        clickoffChecker.addEventListener("click", () => {
            this.state.show = false;
        });
        this.clickoffChecker = clickoffChecker;
        this.updateClickoffChecker = updateClickoffChecker;
    }

    async init() {
        const Panel: Component<
            {
                width?: string;
                height?: string;
                margin?: string;
                grow?: boolean;
                style?: any;
                class?: string | (string | DLPointer<any>)[];
                id?: string;
            },
            { children: HTMLElement[] }
        > = await anura.ui.get("Panel");

        let css = anura.ui.theme.css();
        document.addEventListener("anura-theme-change", () => {
            css = anura.ui.theme.css();
            document.getElementById("calc-style")!.innerHTML = css;
        });

        this.element = (
            <Panel
                class={[
                    this.transition,
                    use(this.state.show, (open) =>
                        open ? this.show : this.hide,
                    ),
                    this.show,
                    this.calCSS,
                ]}
                width="380px"
                height="380px"
                grow
                id="calendar"
            >
                <div
                    class={["calContent"]}
                    on:contextmenu={(e: PointerEvent) => e.preventDefault()}
                >
                    <link
                        rel="stylesheet"
                        href="/assets/materialsymbols.css"
                    ></link>
                    <div class="calendar-container">
                        <header class="calendar-header">
                            <div id="calendar-date">
                                <span class="calendar-current-month"></span>
                                <span class="calendar-current-year"></span>
                            </div>
                            <div class="calendar-navigation">
                                <span
                                    id="cal-prev"
                                    class="material-symbols-outlined"
                                >
                                    chevron_left
                                </span>
                                <span
                                    id="cal-next"
                                    class="material-symbols-outlined"
                                >
                                    chevron_right
                                </span>
                            </div>
                        </header>
                        <div class="calendar-body">
                            <ul class="calendar-weekdays">
                                <li>Sun</li>
                                <li>Mon</li>
                                <li>Tue</li>
                                <li>Wed</li>
                                <li>Thu</li>
                                <li>Fri</li>
                                <li>Sat</li>
                            </ul>
                            <ul class="calendar-dates"></ul>
                        </div>
                    </div>
                </div>
            </Panel>
        );
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const manipulate = () => {
            const day = document.querySelector(".calendar-dates");
            const currMonth = document.querySelector(
                ".calendar-current-month",
            ) as HTMLDivElement;
            const currYear = document.querySelector(
                ".calendar-current-year",
            ) as HTMLDivElement;
            const dayone = new Date(year, month, 1).getDay();
            const lastdate = new Date(year, month + 1, 0).getDate();
            const dayend = new Date(year, month, lastdate).getDay();
            const monthlastdate = new Date(year, month, 0).getDate();
            let lit = "";
            for (let i = dayone; i > 0; i--) {
                lit += `<li class="inactive">${monthlastdate - i + 1}</li>`;
            }
            for (let i = 1; i <= lastdate; i++) {
                const isToday =
                    i === date.getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear()
                        ? "active"
                        : "";
                lit += `<li class="${isToday}">${i}</li>`;
            }
            for (let i = dayend; i < 6; i++) {
                lit += `<li class="inactive">${i - dayend + 1}</li>`;
            }
            if (currMonth) {
                currMonth.innerText = months[month]!;
            }
            currMonth.innerText = months[month]!;
            currYear.innerText = year.toString();
            day!.innerHTML = lit;
        };

        useChange(use(this.state.show), (show: boolean) => {
            this.updateClickoffChecker(show);
        });
        setTimeout(() => {
            manipulate();
            const prenexIcons = document.querySelectorAll(
                ".calendar-navigation span",
            );
            prenexIcons.forEach((icon) => {
                icon.addEventListener("click", () => {
                    month = icon.id === "cal-prev" ? month - 1 : month + 1;
                    if (month < 0 || month > 11) {
                        date = new Date(year, month, new Date().getDate());
                        year = date.getFullYear();
                        month = date.getMonth();
                    } else {
                        date = new Date();
                    }
                    manipulate();
                });
            });
        }, 300);
    }
}
