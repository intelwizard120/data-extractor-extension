document.getElementById("logout-btn").addEventListener("click", async (e) => {
  chrome.runtime.sendMessage({ message: "google-logout" });  
  await chrome.tabs.create({ url: "https://new-app.datatera.io/logout" });
  await reloadTabs();
  await resetStorageState();
  window.location.href = "./login.html";
  chrome.action.setPopup({ popup: "/pages/login.html" });
});

async function resetStorageState() {
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  chrome.storage.local.set({
    baseUrl,
    token: "",
    userLoggedIn: false,
    conversionList: [],
    uploadParams: {
      processURLs: false,
      smartMerge: false,
      returnRowsLimit: 0,
      model: 1,
    },
  });
}

async function reloadTabs() {
  const tabs = await chrome.tabs.query({
    url: "https://new-app.datatera.io/*",
  });
  for (const tab of tabs) {
    chrome.tabs.reload(tab.id);
  }
}
