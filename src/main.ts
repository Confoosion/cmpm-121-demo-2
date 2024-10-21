import "./style.css";

class MarkerLine {
    points: { x: number; y: number }[];
    thickness: number;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points = [{ x: initialX, y: initialY }];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(canvasContext: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;

    canvasContext.lineWidth = this.thickness;
    canvasContext.beginPath();
    canvasContext.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      canvasContext.lineTo(this.points[i].x, this.points[i].y);
    }

    canvasContext.stroke();
    canvasContext.closePath();
  }
}

class ToolPreview {
    x: number;
    y: number;
    thickness: number;
  
    constructor(x: number, y: number, thickness: number) {
      this.x = x;
      this.y = y;
      this.thickness = thickness;
    }
  
    updatePosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    display(canvasContext: CanvasRenderingContext2D) {
      canvasContext.beginPath();
      canvasContext.arc(this.x, this.y, this.thickness / 2, 0, 2 * Math.PI);
      canvasContext.strokeStyle = "black";
      canvasContext.lineWidth = 1;
      canvasContext.stroke();
      canvasContext.closePath();
    }
}

class Sticker {
    x: number;
    y: number;
    sticker: string;

    constructor(x: number, y: number, sticker: string) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
    }

    drag(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(canvasContext: CanvasRenderingContext2D) {
        canvasContext.font = "40px serif";
        canvasContext.fillText(this.sticker, this.x, this.y);

        canvasContext.strokeStyle = "black";
        canvasContext.lineWidth = 1;
        canvasContext.strokeText(this.sticker, this.x, this.y);
    }
}

const APP_NAME = "Drawing Board";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
// app.innerHTML = APP_NAME;

// TITLE
const title = document.createElement("h1");
title.innerText = APP_NAME;
app.appendChild(title);

const layoutContainer = document.createElement("div");
layoutContainer.id = "layoutContainer";
app.appendChild(layoutContainer);

const leftButtonContainer = document.createElement("div");
leftButtonContainer.id = "leftButtonContainer";
layoutContainer.appendChild(leftButtonContainer);

// DRAWING CANVAS
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "gameCanvas";

// THIN BUTTON
const thinButton = document.createElement("button");
thinButton.innerText = "Thin";
thinButton.id = "thinButton";
thinButton.classList.add("selectedTool");
leftButtonContainer.appendChild(thinButton);

// THICK BUTTON
const thickButton = document.createElement("button");
thickButton.innerText = "Thick";
thickButton.id = "thickButton";
leftButtonContainer.appendChild(thickButton);

layoutContainer.appendChild(canvas);

const rightButtonContainer = document.createElement("div");
rightButtonContainer.id = "rightButtonContainer";
layoutContainer.appendChild(rightButtonContainer);

// STICKERS
let stickers: string[] = ["😊", "💩", "👍"];

function createStickerButtons() {
    stickers.forEach((sticker, index) => {
        const stickerButton = document.createElement("button");
        stickerButton.innerText = sticker;
        stickerButton.id = `stickerButton${index}`;
        stickerButton.addEventListener("click", () => {
            currentSticker = sticker;
            displaySticker = null;
        });
        rightButtonContainer.appendChild(stickerButton);
    });
}

createStickerButtons();

// STICKER BUTTONS
const customStickerButton = document.createElement("button");
customStickerButton.innerText = "Add Custom Sticker";
customStickerButton.id = "customStickerButton";
customStickerButton.addEventListener("click", () => {
    const userSticker = prompt("Enter your custom sticker:", "");
    if (userSticker) {
        stickers.push(userSticker);
        rightButtonContainer.innerHTML = "";
        createStickerButtons();
        rightButtonContainer.appendChild(customStickerButton);
    }
});
rightButtonContainer.appendChild(customStickerButton);

const bottomButtonContainer = document.createElement("div");
bottomButtonContainer.id = "bottomButtonContainer";
layoutContainer.appendChild(bottomButtonContainer);

// UNDO BUTTON
const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.id = "undoButton";
bottomButtonContainer.appendChild(undoButton);

// REDO BUTTON
const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.id = "redoButton";
bottomButtonContainer.appendChild(redoButton);

// CLEAR BUTTON
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.id = "clearButton";
bottomButtonContainer.appendChild(clearButton);

const canvasContext = canvas.getContext("2d");
let strokes: MarkerLine[] = [];
let redoStack: MarkerLine[] = [];
let currentStroke: MarkerLine | null = null;
let currentThickness = 5;
let toolPreview: ToolPreview | null = null;
let currentSticker: string | null = null;
let displaySticker: Sticker | null = null;
let placedStickers: Sticker[] = [];

// THIN BUTTON EVENT
thinButton.addEventListener("click", () => {
    currentThickness = 5;
    toolPreview = new ToolPreview(0, 0, currentThickness);
    updateSelectedTool(thinButton);
});

// THICK BUTTON EVENT
thickButton.addEventListener("click", () => {
    currentThickness = 10;
    toolPreview = new ToolPreview(0, 0, currentThickness);
    updateSelectedTool(thickButton);
});

// CHANGE SELECTED THICKNESS BUTTON
function updateSelectedTool(selectedButton: HTMLButtonElement) {
    document.querySelectorAll(".selectedTool").forEach((btn) => {
        btn.classList.remove("selectedTool");
    });
    selectedButton.classList.add("selectedTool");
}

// MOUSE DOWN
canvas.addEventListener("mousedown", (e) => {
    if(!currentSticker) {
        currentStroke = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
        toolPreview = null;
    }
    else {
        displaySticker = new Sticker(e.offsetX, e.offsetY, currentSticker);
        placedStickers.push(displaySticker);
        currentSticker = null;
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

// MOUSE MOVEMENT
canvas.addEventListener("mousemove", (e) => {
    if (currentStroke) {
        currentStroke.drag(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new Event("drawing-changed"));
    } else if (currentSticker) {
        if (!displaySticker) {
            displaySticker = new Sticker(e.offsetX, e.offsetY, currentSticker);
        } else {
            displaySticker.drag(e.offsetX, e.offsetY);
        }
        canvas.dispatchEvent(new Event("tool-moved"));
    } else {
        if (!toolPreview) {
            toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
        } else {
            toolPreview.updatePosition(e.offsetX, e.offsetY);
        }
        canvas.dispatchEvent(new Event("tool-moved"));
    }
});

// MOUSE UP
canvas.addEventListener("mouseup", () => {
    if (currentStroke) {
        strokes.push(currentStroke);
        currentStroke = null;
        redoStack = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

// MOUSE NOT IN CANVAS EVENT
canvas.addEventListener("mouseleave", () => {
    if (currentStroke) {
        strokes.push(currentStroke);
        currentStroke = null;
        redoStack = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

// drawing-changed EVENT
canvas.addEventListener("drawing-changed", () => {
    canvasContext?.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
        stroke.display(canvasContext!);
    });

    if(currentStroke) {
        currentStroke.display(canvasContext!);
    }

    toolPreview?.display(canvasContext!);

    if (displaySticker) {
        displaySticker.display(canvasContext!);
    }

    placedStickers.forEach((sticker) => {
        sticker.display(canvasContext!);
    });
});

// tool-moved EVENT
canvas.addEventListener("tool-moved", () => {
    canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
  
    strokes.forEach((stroke) => {
      stroke.display(canvasContext!);
    });
  
    placedStickers.forEach((sticker) => {
        sticker.display(canvasContext!);
    });

    toolPreview?.display(canvasContext!);

    if (currentSticker && displaySticker) {
        displaySticker.display(canvasContext!);
    }
});

// CLEAR BUTTON EVENT
clearButton.addEventListener("click", () => {
    strokes = [];
    redoStack = [];
    placedStickers = [];
    currentSticker = null;
    displaySticker = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
});

// UNDO BUTTON EVENT
undoButton.addEventListener("click", () => {
    if (strokes.length > 0) {
        const undoneStroke = strokes.pop();
        if (undoneStroke) {
            redoStack.push(undoneStroke);
            canvas.dispatchEvent(new Event("drawing-changed"));
        }
    }
});

// REDO BUTTON EVENT
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const redoneStroke = redoStack.pop();
        if (redoneStroke) {
            strokes.push(redoneStroke);
            canvas.dispatchEvent(new Event("drawing-changed"));
        }
    }
});

// EXPORT BUTTON
const exportButton = document.createElement("button");
exportButton.innerText = "Export";
exportButton.id = "exportButton";
app.appendChild(exportButton);

// EXPORT BUTTON EVENT
exportButton.addEventListener("click", () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportContext = exportCanvas.getContext("2d");

    if (exportContext) {
        exportContext.scale(4, 4);

        strokes.forEach((stroke) => {
            stroke.display(exportContext);
        });

        placedStickers.forEach((sticker) => {
            sticker.display(exportContext);
        });

        const anchor = document.createElement("a");
        anchor.href = exportCanvas.toDataURL("image/png");
        anchor.download = "sketchpad.png";
        anchor.click();
    }
});