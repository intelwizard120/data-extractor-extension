document.getElementById("logout-btn").addEventListener("click", (e)=>{
    chrome.storage.local.clear();
    window.location.href = "./login.html"
    chrome.action.setPopup({ popup: "/pages/login.html" });
});