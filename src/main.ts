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
      canvasContext.strokeStyle = "gray";
      canvasContext.lineWidth = 1;
      canvasContext.stroke();
      canvasContext.closePath();
    }
}

const APP_NAME = "Game";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// TITLE
const title = document.createElement("h1");
title.innerText = APP_NAME;
app.appendChild(title);

// DRAWING CANVAS
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "gameCanvas";
app.appendChild(canvas);

// THIN BUTTON
const thinButton = document.createElement("button");
thinButton.innerText = "Thin";
thinButton.id = "thinButton";
thinButton.classList.add("selectedTool");
app.appendChild(thinButton);

// THICK BUTTON
const thickButton = document.createElement("button");
thickButton.innerText = "Thick";
thickButton.id = "thickButton";
app.appendChild(thickButton);

// CLEAR BUTTON
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.id = "clearButton";
app.appendChild(clearButton);

// UNDO BUTTON
const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.id = "undoButton";
app.appendChild(undoButton);

// REDO BUTTON
const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.id = "redoButton";
app.appendChild(redoButton);

const canvasContext = canvas.getContext("2d");
let strokes: MarkerLine[] = [];
let redoStack: MarkerLine[] = [];
let currentStroke: MarkerLine | null = null;
let currentThickness = 5;
let toolPreview: ToolPreview | null = null;

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
    currentStroke = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
    toolPreview = null;
});

// MOUSE MOVEMENT
canvas.addEventListener("mousemove", (e) => {
    if(currentStroke) {
        currentStroke.drag(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
    else {
        if(!toolPreview) {
            toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
        }
        else {
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
});

// tool-moved EVENT
canvas.addEventListener("tool-moved", () => {
    canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
  
    strokes.forEach((stroke) => {
      stroke.display(canvasContext!);
    });
  
    toolPreview?.display(canvasContext!);
});

// CLEAR BUTTON EVENT
clearButton.addEventListener("click", () => {
    strokes = [];
    redoStack = [];
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