chrome.runtime.onMessage.addListener((req) => {
  if (req.action == "notify") notify(req.text);
});

function notify(msg) {
  $.notify(msg, { className: "success", globalPosition: "top right" });
}
