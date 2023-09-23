chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "ss-capture") {
    capture(message, sendResponse);
  }
  return true;
});

async function capture(message, sendResponse) {
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
  let obj = { ...message, dataUrl };
  sendResponse(obj);
}
