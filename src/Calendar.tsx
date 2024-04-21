class Calendar {
    state: Stateful<{
        show?: boolean;
    }> = stateful({
        show: false,
    });

    element: HTMLElement = (<div>Ceci n'est pas un calendrier</div>);

    calCSS = css`
        bottom: 60px;
        right: 10px;

        .calContent {
            height: 100%;
            width: 100%;
            border-radius: 1em;
            overflow: hidden;
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
                width="360px"
                height="40%"
                grow
                id="calendar"
            >
                <div class={["calContent"]}>
                    <iframe
                        style="width: 100%; height: 100%; border: none; margin: 0; padding: 0;background: transparent;"
                        srcdoc={`
                  <!DOCTYPE html>
                  <html lang="en" dir="ltr">

                  <head>
                  <script>
                              var css = window.parent.anura.ui.theme.css();
                              let style = document.createElement("style");
                              style.innerHTML = css;
                              document.head.appendChild(style);
                          </script>
                  <style>
                  * {
                      margin: 0;
                      padding: 0;
                      box-sizing: border-box;
                      background: transparent;
                  }

                  body {
                      display: flex;
                      min-height: 100vh;
                      align-items: top;
                      justify-content: center;
                      overflow: hidden;
                      font-family: "Roboto Flex", Roboto, RobotoDraft,  sans-serif;
                      color: var(--theme-fg)
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
                  }

                  header .calendar-current-year {
                      color: var(--theme-secondary-fg);
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
                  </style>
	<meta charset="utf-8">
	<title>Calendar</title>
	<meta name="viewport"
		content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet"
		href=
                  "/assets/materialsymbols.css">
                  </head>

                  <body>
	<div class="calendar-container">
		<header class="calendar-header">
		  <div id="calendar-date">
			<span class="calendar-current-month"></span>
			<span class="calendar-current-year"></span>
			</div>
			<div class="calendar-navigation">
				<span id="calendar-prev"
					class="material-symbols-outlined">
					chevron_left
				</span>
				<span id="calendar-next"
					class="material-symbols-outlined">
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
	<script>
	let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

const day = document.querySelector(".calendar-dates");

const currMonth = document.querySelector(".calendar-current-month");

const currYear = document
    .querySelector(".calendar-current-year");

const prenexIcons = document
    .querySelectorAll(".calendar-navigation span");

// Array of month names
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
    "December"
];

// Function to generate the calendar
const manipulate = () => {

    // Get the first day of the month
    let dayone = new Date(year, month, 1).getDay();

    // Get the last date of the month
    let lastdate = new Date(year, month + 1, 0).getDate();

    // Get the day of the last date of the month
    let dayend = new Date(year, month, lastdate).getDay();

    // Get the last date of the previous month
    let monthlastdate = new Date(year, month, 0).getDate();

    // Variable to store the generated calendar HTML
    let lit = "";

    // Loop to add the last dates of the previous month
    for (let i = dayone; i > 0; i--) {
        lit +=
            \`<li class="inactive">\${monthlastdate - i + 1}</li>\`;
    }

    // Loop to add the dates of the current month
    for (let i = 1; i <= lastdate; i++) {

        // Check if the current date is today
        let isToday = i === date.getDate()
            && month === new Date().getMonth()
            && year === new Date().getFullYear()
            ? "active"
            : "";
        lit += \`<li class="\${isToday}">\${i}</li>\`;
    }

    // Loop to add the first dates of the next month
    for (let i = dayend; i < 6; i++) {
        lit += \`<li class="inactive">\${i - dayend + 1}</li>\`
    }

    // Update the text of the current date element
    // with the formatted current month and year
    currMonth.innerText = months[month];
    currYear.innerText = year;

    // update the HTML of the dates element
    // with the generated calendar
    day.innerHTML = lit;
}

manipulate();

// Attach a click event listener to each icon
prenexIcons.forEach(icon => {

    // When an icon is clicked
    icon.addEventListener("click", () => {

        // Check if the icon is "calendar-prev"
        // or "calendar-next"
        month = icon.id === "calendar-prev" ? month - 1 : month + 1;

        // Check if the month is out of range
        if (month < 0 || month > 11) {

            // Set the date to the first day of the
            // month with the new year
            date = new Date(year, month, new Date().getDate());

            // Set the year to the new year
            year = date.getFullYear();

            // Set the month to the new month
            month = date.getMonth();
        }

        else {

            // Set the date to the current date
            date = new Date();
        }

        // Call the manipulate function to
        // update the calendar display
        manipulate();
    });
});
  </script>
                  </body>
                  </html>

                  `}
                    ></iframe>
                </div>
            </Panel>
        );

        handle(use(this.state.show), (show: boolean) => {
            this.updateClickoffChecker(show);
        });
    }
}
