// implementing it myself was too hard so i just stole it from https://codepen.io/adam-lynch/pen/GaqgXP

const newcontextmenu = new anura.ContextMenu();
newcontextmenu.addItem("Get Info", function () {});
newcontextmenu.addItem("Pin to Shelf", function () {});
newcontextmenu.addItem("Refresh", function () {
    reload();
});
newcontextmenu.addItem("Cut", function () {
    cut();
});
newcontextmenu.addItem("Copy", function () {
    copy();
});
newcontextmenu.addItem("Paste", function () {
    paste();
});
newcontextmenu.addItem("Delete", function () {
    deleteFile();
});
newcontextmenu.addItem("Rename", function () {
    rename();
});
newcontextmenu.addItem("Upload from PC", function () {
    upload();
});
newcontextmenu.addItem("New folder", function () {
    newFolder();
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
