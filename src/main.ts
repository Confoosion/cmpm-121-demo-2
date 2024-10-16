import "./style.css";

type Point = { x: number; y: number };
type Stroke = Point[];

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
let strokes: Stroke[] = [];
let redoStack: Stroke[] = [];
let currentStroke: Stroke | null = null;

// MOUSE DOWN
canvas.addEventListener("mousedown", (e) => {
    currentStroke = [{ x: e.offsetX, y: e.offsetY }];
});

// MOUSE MOVEMENT
canvas.addEventListener("mousemove", (e) => {
    if (currentStroke) {
        currentStroke.push({ x: e.offsetX, y: e.offsetY });
        canvas.dispatchEvent(new Event("drawing-changed"));
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
  
    // REDRAW
    strokes.forEach((stroke) => {
      canvasContext?.beginPath();
      for (let i = 0; i < stroke.length; i++) {
        const point = stroke[i];
        if (i === 0) {
          canvasContext?.moveTo(point.x, point.y);
        } else {
          canvasContext?.lineTo(point.x, point.y);
        }
      }
      canvasContext?.stroke();
      canvasContext?.closePath();
    });
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