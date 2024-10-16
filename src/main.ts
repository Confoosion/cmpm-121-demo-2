import "./style.css";

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

const ctx = canvas.getContext("2d");
let drawing = false;

// DRAW EVENT
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx?.beginPath();
  ctx?.moveTo(e.offsetX, e.offsetY);
});

// CREATE LINE EVENT
canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
  }
});

// DONE DRAWING EVENT
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx?.closePath();
});

// MOUSE NOT IN CANVAS EVENT
canvas.addEventListener("mouseleave", () => {
  drawing = false;
  ctx?.closePath();
});

// CLEAR BUTTON EVENT
clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
});