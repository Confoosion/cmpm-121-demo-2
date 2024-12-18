import "./style.css";

class MarkerLine {
  points: { x: number; y: number }[];
  thickness: number;
  color: string;

  constructor(initialX: number, initialY: number, thickness: number, color: string) {
    this.points = [{ x: initialX, y: initialY }];
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(canvasContext: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;

    canvasContext.lineWidth = this.thickness;
    canvasContext.strokeStyle = this.color;
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
  rotation: number;

  constructor(x: number, y: number, thickness: number, rotation: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.rotation = rotation;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updateRotation(rotation: number) {
    this.rotation = rotation;
  }

  display(canvasContext: CanvasRenderingContext2D) {
    canvasContext.beginPath();
    canvasContext.arc(this.x, this.y, this.thickness / 2, 0, 2 * Math.PI);
    canvasContext.strokeStyle = "black";
    canvasContext.rotate((this.rotation * Math.PI) / 180);
    canvasContext.lineWidth = 1;
    canvasContext.stroke();
    canvasContext.closePath();
  }
}

class Sticker {
  x: number;
  y: number;
  sticker: string;
  rotation: number;

  constructor(x: number, y: number, sticker: string, rotation: number) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
    this.rotation = rotation;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(canvasContext: CanvasRenderingContext2D) {
    canvasContext.save();

    canvasContext.translate(this.x, this.y);
    canvasContext.rotate((this.rotation * Math.PI) / 180);

    canvasContext.font = "40px serif";
    canvasContext.fillText(this.sticker, 0, 0);
    canvasContext.strokeStyle = "black";
    canvasContext.lineWidth = 1;
    canvasContext.strokeText(this.sticker, 0, 0);

    canvasContext.restore();
  }
}

const CONFIG = {
  canvas: {
    width: 256,
    height: 256,
  },
  exportCanvas: {
    width: 1024,
    height: 1024,
  },
  ui: {
    colorPickerDefault: "#000000",
    defaultThickness: 5,
  },
};

const APP_NAME = "Drawing Board";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

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
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.width;
canvas.id = "gameCanvas";

// THICKNESS SLIDER TITLE
const sliderTitle = document.createElement("label");
sliderTitle.htmlFor = "thicknessSlider";
sliderTitle.innerText = "Brush Thickness:";
leftButtonContainer.appendChild(sliderTitle);

// THICKNESS SLIDER
const thicknessSlider = document.createElement("input");
thicknessSlider.type = "range";
thicknessSlider.min = "1";  // Minimum thickness
thicknessSlider.max = "20";  // Maximum thickness
thicknessSlider.value = CONFIG.ui.defaultThickness.toString();  // Default thickness
thicknessSlider.id = "thicknessSlider";
thicknessSlider.classList.add("slider");
leftButtonContainer.appendChild(thicknessSlider);

// COLOR PICKER
const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.value = CONFIG.ui.colorPickerDefault;
leftButtonContainer.appendChild(colorPicker);

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
      randomizeStickerRotation();
    });
    rightButtonContainer.appendChild(stickerButton);
  });
}

function randomizeStickerRotation() {
  const randomRotation = Math.floor(Math.random() * 360);
  displaySticker = new Sticker(0, 0, currentSticker!, randomRotation);
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

// THICKNESS SLIDER EVENT
thicknessSlider.addEventListener("input", () => {
  currentThickness = parseInt(thicknessSlider.value);
  if (toolPreview) {
    toolPreview.thickness = currentThickness;
    canvas.dispatchEvent(new Event("tool-moved"));  // Trigger tool moved to update the preview
  }
});

// MOUSE DOWN
canvas.addEventListener("mousedown", (e) => {
  if (!currentSticker) {
    const selectedColor = colorPicker.value;
    currentStroke = new MarkerLine(
      e.offsetX,
      e.offsetY,
      currentThickness,
      selectedColor
    );
    toolPreview = null;
  } else {
    displaySticker = new Sticker(
      e.offsetX,
      e.offsetY,
      currentSticker,
      displaySticker!.rotation
    );
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
      displaySticker = new Sticker(
        e.offsetX,
        e.offsetY,
        currentSticker,
        displaySticker!.rotation
      );
    } else {
      displaySticker.drag(e.offsetX, e.offsetY);
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  } else {
    if (!toolPreview) {
      toolPreview = new ToolPreview(
        e.offsetX,
        e.offsetY,
        currentThickness,
        0
      );
    } else {
      toolPreview.updatePosition(e.offsetX, e.offsetY);
      toolPreview.thickness = currentThickness;  // Update the preview thickness on move
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

  if (currentStroke) {
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
  exportCanvas.width = CONFIG.exportCanvas.width;
  exportCanvas.height = CONFIG.exportCanvas.width;
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
