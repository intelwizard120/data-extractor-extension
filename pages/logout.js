document.getElementById("logout-btn").addEventListener("click", (e)=>{
    chrome.storage.local.clear();
    chrome.runtime.sendMessage({ message: "google-logout" });
    window.location.href = "./login.html"
    chrome.action.setPopup({ popup: "/pages/login.html" });
});