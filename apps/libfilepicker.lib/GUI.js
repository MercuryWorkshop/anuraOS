// This context menu is for files and folders
const newcontextmenu = new parent.anura.ContextMenu();
// This context menu is for applications and libraries
const appcontextmenu = new parent.anura.ContextMenu();
// This context menu is for when no files are selected
const emptycontextmenu = new parent.anura.ContextMenu();

// Helper to add context menu items to both menus
function addContextMenuItem(name, func) {
    newcontextmenu.addItem(name, func);
    appcontextmenu.addItem(name, func);
}

// addContextMenuItem("Get Info", function () {});
// addContextMenuItem("Pin to Shelf", function () {});
addContextMenuItem("Cut", function () {
    cut();
});
addContextMenuItem("Copy", function () {
    copy();
});
addContextMenuItem("Paste", function () {
    paste();
});
addContextMenuItem("Delete", function () {
    deleteFile();
});
addContextMenuItem("Rename", function () {
    rename();
});

appcontextmenu.addItem("Install (Session)", function () {
    // While this is the same as double clicking, it's still useful to have the verbosely named option
    installSession();
});

appcontextmenu.addItem("Install (Permanent)", function () {
    // This is not the same as double clicking, as it will install the app permanently
    installPermanent();
});

appcontextmenu.addItem("Navigate", function () {
    // Normally, double clicking a folder will navigate into it, but for apps and libs, this is not the case
    navigate();
});

emptycontextmenu.addItem("Upload from PC", function () {
    upload();
});
emptycontextmenu.addItem("New folder", function () {
    newFolder();
});
emptycontextmenu.addItem("New file", function () {
    newFile();
})
emptycontextmenu.addItem("Refresh", function () {
    reload();
});

const min = 150;
// The max (fr) values for grid-template-columns
const columnTypeToRatioMap = {
    icon: 0.1,
    name: 3,
    size: 1,
    type: 1,
    modified: 1,
};

const table = document.querySelector("table");
/*
The following will soon be filled with column objects containing
the header element and their size value for grid-template-columns
*/
const columns = [];
let headerBeingResized;

// The next three functions are mouse event callbacks

// Where the magic happens. I.e. when they're actually resizing
const onMouseMove = (e) =>
    requestAnimationFrame(() => {
        console.log("onMouseMove");

        (window.getSelection
            ? window.getSelection()
            : document.selection
        ).empty();

        // Calculate the desired width
        horizontalScrollOffset = document.documentElement.scrollLeft;
        const width =
            horizontalScrollOffset + e.clientX - headerBeingResized.offsetLeft;

        // Update the column object with the new size value
        const column = columns.find(
            ({ header }) => header === headerBeingResized,
        );
        column.size = Math.max(min, width) + "px"; // Enforce our minimum

        // For the other headers which don't have a set width, fix it to their computed width
        columns.forEach((column) => {
            if (column.size.startsWith("minmax")) {
                // isn't fixed yet (it would be a pixel value otherwise)
                column.size = parseInt(column.header.clientWidth, 10) + "px";
            }
        });

        /*
      Update the column sizes
      Reminder: grid-template-columns sets the width for all columns in one value
  */
        table.style.gridTemplateColumns = columns
            .map(({ header, size }) => size)
            .join(" ");
    });

// Clean up event listeners, classes, etc.
const onMouseUp = () => {
    console.log("onMouseUp");

    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    headerBeingResized.classList.remove("header--being-resized");
    headerBeingResized = null;
};

// Get ready, they're about to resize
const initResize = ({ target }) => {
    console.log("initResize");

    headerBeingResized = target.parentNode;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    headerBeingResized.classList.add("header--being-resized");
};

// Let's populate that columns array and add listeners to the resize handles
document.querySelectorAll("th").forEach((header) => {
    const max = columnTypeToRatioMap[header.dataset.type] + "fr";
    columns.push({
        header,
        // The initial size value for grid-template-columns:
        size: `minmax(${min}px, ${max})`,
    });
    header
        .querySelector(".resize-handle")
        .addEventListener("mousedown", initResize);
});
