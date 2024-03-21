let selectedArea, startX, startY, endX, endY, overlayArea;
let isSelectionActive = false;
let isMousedown = false;

chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === "ss-selection") {
    if (isSelectionActive) return;
    addOverlay();
    startCapture();
  }
  if (message.action === "ss-crop") startCropping(message);
});

function addOverlay() {
  document.documentElement.style.cursor = "crosshair";
  document.body.style.overflow = "hidden";

  const overlayStyles = {
    zIndex: "100000000",
    position: "fixed",
    top: "0px",
    left: "0px",
    width: "100%",
    height: "100%",
  };
  overlayArea = document.createElement("div");
  Object.assign(overlayArea.style, overlayStyles);
  document.body.appendChild(overlayArea);
}

const styles = {
  zIndex: "100000000",
  position: "fixed",
  top: "0px",
  left: "0px",
  width: "0px",
  height: "0px",
};

function startCapture() {
  selectedArea = document.createElement("div");
  Object.assign(selectedArea.style, styles);
  document.body.appendChild(selectedArea);
  isSelectionActive = true;
}

window.addEventListener("mousedown", (event) => {
  if (!isSelectionActive) return;
  event.preventDefault();
  isMousedown = true;
  startX = event.clientX;
  startY = event.clientY;
  selectedArea.style.top = startX + "px";
  selectedArea.style.left = startY + "px";
  selectedArea.style.width = "0px";
  selectedArea.style.height = "0px";
  selectedArea.style.border = "2px dotted red";
});

window.addEventListener("mousemove", (event) => {
  if (!isSelectionActive || !isMousedown) return;

  endX = Math.max(event.clientX, 0);
  endY = Math.max(event.clientY, 0);

  const [left, right, top, bottom, width, height] = getRegionDimensions(
    startX,
    startY,
    endX,
    endY
  );

  setRegionDimensions(left, right, top, bottom, width, height);

  clipOverlay(startX, startY, endX, endY);
});

function clipOverlay(startX, startY, endX, endY) {
  const left = Math.min(startX, endX);
  const right = Math.max(startX, endX);
  const top = Math.min(startY, endY);
  const bottom = Math.max(startY, endY);
  overlayArea.style.clipPath = `polygon(
    0% 0%, 
    0% 100%, 
    ${left}px 100%, 
    ${left}px ${top}px, 
    ${right}px ${top}px, 
    ${right}px ${bottom}px, 
    ${left}px ${bottom}px, 
    ${left}px 100%, 
    100% 100%, 
    100% 0%
  )`;
}

function getRegionDimensions(prevX, prevY, currX, currY) {
  const width = Math.abs(currX - prevX);
  const height = Math.abs(currY - prevY);
  const left = Math.min(prevX, currX);
  const right = document.body.clientWidth - Math.max(prevX, currX);
  const top = Math.min(prevY, currY);
  const bottom = window.innerHeight - Math.max(prevY, currY);

  return [left, right, top, bottom, width, height];
}

function setRegionDimensions(left, right, top, bottom, width, height) {
  selectedArea.style.top = `${top}px`;
  selectedArea.style.left = `${left}px`;
  selectedArea.style.right = `${right}px`;
  selectedArea.style.bottom = `${bottom}px`;
  selectedArea.style.width = `${width}px`;
  selectedArea.style.height = `${height}px`;
}

window.addEventListener("mouseup", (event) => {
  if (!isSelectionActive || !isMousedown) return;

  isSelectionActive = false;
  isMousedown = false;

  endX = Math.max(event.clientX, 0);
  endY = Math.max(event.clientY, 0);

  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(startX - endX);
  const height = Math.abs(startY - endY);
  const region = { x, y, width, height };
  const windowSize = { width: window.innerWidth, height: window.innerHeight };
  const data = { region, windowSize };

  selectedArea.parentNode.removeChild(selectedArea);
  document.documentElement.style.cursor = "auto";
  document.body.style.overflow = "auto";

  overlayArea.parentNode.removeChild(overlayArea);
  makeCaptureRequest(data);
});

async function makeCaptureRequest(data) {
  const result = await chrome.runtime.sendMessage({
    action: "ss-capture",
    ...data,
  });
  startCropping(result);
}

async function startCropping(data) {
  const { dataUrl, region, windowSize } = data;
  const imageDimensions = await getImageDimensions(dataUrl);

  let scale = imageDimensions.width / windowSize.width;
  let x = Math.floor(region.x * scale);
  let y = Math.floor(region.y * scale);
  let width = Math.floor(region.width * scale);
  let height = Math.floor(region.height * scale);
  const croppedImage = await cropImage({
    dataUrl,
    x,
    y,
    height,
    width,
  });

  $.confirm({
    title: "Image Crop",
    content: "Are you sure?",
    buttons: {
      Upload: function () {
        notify("Image uploaded successfully!");
        chrome.runtime.sendMessage({
          message: "image-upload",
          image: croppedImage,
          fileName: getImageFileName(),
        });
      },
      Cancel: function () {
        return;
      },
    },
  });
}

function getImageDimensions(image) {
  return new Promise(function (resolved, rejected) {
    var img = new Image();
    img.onload = function () {
      resolved({ width: img.width, height: img.height });
    };
    img.src = image;
  });
}

function cropImage({ dataUrl, x, y, width, height }) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = dataUrl;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
      const croppedImageDataURL = canvas.toDataURL("image/png", 1.0);
      resolve(croppedImageDataURL);
    };
  });
}

function getImageFileName(format = "png") {
  let pad = (n) => ((n = n + ""), n.length >= 2 ? n : `0${n}`);
  let ext = (format) =>
    format === "jpeg" ? "jpg" : format === "png" ? "png" : "png";
  let timestamp = (now) =>
    [pad(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate())].join(
      "-"
    ) +
    " - " +
    [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(
      "-"
    );
  return `Screenshot Capture - ${timestamp(new Date())}.${ext(format)}`;
}
