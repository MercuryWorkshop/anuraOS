function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function onMouseEnter(e) {
	e.currentTarget.classList.add("hover");
}

function onMouseLeave(e) {
	e.currentTarget.classList.remove("hover");
}

function onContextMenu(e) {
	if (currentlySelected.length > 0) {
		return;
	}
	e.currentTarget.classList.add("selected");
	currentlySelected = [e.currentTarget];
}

function onClick(e) {
	if (currentlySelected.includes(e.currentTarget)) {
		if (
			self.filePicker &&
			self.filePicker?.type === "file" &&
			e.currentTarget.getAttribute("data-type") === "file"
		) {
			filePickerAction(currentlySelected);
		} else {
			fileAction(currentlySelected);
		}
		currentlySelected.forEach((row) => {
			row.classList.remove("selected");
		});
		currentlySelected = [];
		return;
	}
	if (!e.shiftKey) {
		if (!e.ctrlKey) {
			currentlySelected.forEach((row) => {
				row.classList.remove("selected");
			});
			currentlySelected = [];
		}
		e.currentTarget.classList.add("selected");
		currentlySelected.push(e.currentTarget);
	} else {
		if (currentlySelected.length == 0) {
			e.currentTarget.classList.add("selected");
			currentlySelected.push(e.currentTarget);
		} else {
			var arr = Array.from(document.querySelectorAll("tr")).filter(
				(row) => row.parentNode.nodeName.toLowerCase() !== "thead",
			);
			var firstI = arr.indexOf(currentlySelected[currentlySelected.length - 1]);
			var lastI = arr.indexOf(e.currentTarget);
			var first = Math.min(firstI, lastI);
			var last = Math.max(firstI, lastI);
			for (var i = first; i <= last; i++) {
				if (!currentlySelected.includes(arr[i])) {
					currentlySelected.push(arr[i]);
					arr[i].classList.add("selected");
				}
			}
		}
	}
}

export function Item() {
	this.absolutePath = `${this.path}/${this.file}`.replace("//", "/");
	if (this.type === "file") {
		this.icon = anura.files.fallbackIcon;
		this.description = "Anura File";
	} else {
		this.icon = anura.files.folderIcon;
		this.description = "Folder"
	}
	this.mount = async () => {
		if (this.type === "dir" && (this.ext !== "app" && this.ext !== "lib")) return;
		try {
			const iconURL = await anura.files.getIcon(this.absolutePath);
			this.icon = iconURL;
		} catch (e) {
			console.error(e);
		}
		try {
			const fileType = await anura.files.getFileType(this.absolutePath);
			this.description = fileType;
		} catch (e) {
			console.error(e);
		}
	};
	return html`
        <table>
        <thead></thead>
        <tbody>
            <tr
                on:mouseenter=${(e) => onMouseEnter(e)}
                on:mouseleave=${(e) => onMouseLeave(e)}
                on:contextmenu=${(e) => onContextMenu(e)}
                on:click=${(e) => onClick(e)}
                data-type=${this.type}
                data-path=${use(this.absolutePath)}
            >
                <td id="iconContainer">
                    <img class="icon" src=${use(this.icon)}></img>
                </td>
                <td id="name">${this.file}</td>
                <td id="size">${this.type === "file" ? formatBytes(this.stats.size) : "N/A"}</td>
                <td id="description">${use(this.description)}</td>
                <td id="date">${new Date(this.stats.mtime).toLocaleString()}</td>
            </tr>
        </tbody>
        </table>
    `;
}
