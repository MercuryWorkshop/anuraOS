class NotificationService {
    element = (<div class="notif-container"></div>);

    notifications: AnuraNotification[] = [];

    constructor() {}

    add(params: NotifParams) {
        const notif = new AnuraNotification(params, () => {
            this.remove(notif);
        });

        this.element.appendChild(notif.element);

        this.notifications.push(notif);
    }
    remove(notification: AnuraNotification) {
        this.notifications = this.notifications.filter(
            (n) => n != notification,
        );

        notification.element.style.opacity = "0";
        setTimeout(() => {
            notification.element.remove();
        }, 360);
    }
}

interface NotifParams {
    title?: string;
    description?: string;
    timeout?: number;
    callback?: () => void;
    closeIndicator?: boolean;
    // COMING SOON (hopefully)
    // icon?: string
    // buttons?: Array<{ text: string, callback: Function }>
}

class AnuraNotification {
    title = "Anura Notification";
    description = "Anura Description";
    timeout = 2000;
    closeIndicator = false;
    callback = () => null;
    close: () => void;
    element: HTMLElement;
    constructor(params: NotifParams, close: () => void) {
        Object.assign(this, params);
        this.close = close;
        this.element = (
            <div class="notif">
                <div class="notif-close-indicator">
                    <span class="material-symbols-outlined">close</span>
                </div>
                <div
                    class="notif-body"
                    on:click={() => {
                        this.callback();
                        this.close();
                    }}
                >
                    <div class="notif-title">{this.title}</div>
                    <div class="notif-description">{this.description}</div>
                </div>
            </div>
        );
        setTimeout(() => {
            close();
        }, this.timeout);
    }

    async show() {
        const id = crypto.randomUUID();
        // initializing the elements
        const notifContainer =
            document.getElementsByClassName("notif-container")[0];
        const notif = document.createElement("div");
        notif.className = "notif";
        const notifBody = document.createElement("div");
        notifBody.className = "notif-body";
        const notifTitle = document.createElement("div");
        notifTitle.className = "notif-title";
        const notifDesc = document.createElement("div");
        notifDesc.className = "notif-description";
        if (this.closeIndicator) {
            const closeIndicator = document.createElement("div");
            closeIndicator.className = "notif-close-indicator";
            // temporary because im too lazy to make a span item properly, it's hardcoded so it's fine.
            closeIndicator.innerHTML =
                '<span class="material-symbols-outlined">close</span>';
            notif.appendChild(closeIndicator);
        }

        // assign relevant values
        notifTitle.innerText = this.title;
        notifDesc.innerText = this.description;
        notif.id = id;

        const callback = this.callback;

        notif.onclick = function () {
            deleteNotif();
            callback();
        };

        // adding the elements to the list
        notifBody.appendChild(notifTitle);
        notifBody.appendChild(notifDesc);
        notif.appendChild(notifBody);
        notifContainer?.appendChild(notif);

        // remove afyer period
        setTimeout(() => {
            deleteNotif();
        }, this.timeout);

        function deleteNotif() {
            const oldNotif = document.getElementById(id)!;
            // do nothing if the notification is already deleted
            if (oldNotif == null) return;
            oldNotif.style.opacity = "0";
            setTimeout(() => {
                notifContainer?.removeChild(oldNotif);
            }, 360);
        }
    }
}
