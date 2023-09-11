chrome.runtime.onMessage.addListener((req) => {
  if (req.action == "notify") {
    $.notify(req.text, { className: "success", globalPosition: "top right" });
  }
});
