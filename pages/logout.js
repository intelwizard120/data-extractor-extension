document.getElementById("logout-btn").addEventListener("click", async (e) => {
  chrome.runtime.sendMessage({ message: "google-logout" });
  await resetStorageState();
  window.location.href = "./login.html";
  chrome.action.setPopup({ popup: "/pages/login.html" });
});

async function resetStorageState() {
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  chrome.storage.local.set({ baseUrl, token: "", userLoggedIn: false });
}
