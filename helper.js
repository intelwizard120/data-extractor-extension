export async function updateUploadsInfo() {
  let uploadsInfo = { remainingUploads: 0, totalUploads: 0 };
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  const { token } = await chrome.storage.local.get("token");
  try {
    const res = await fetch(`${baseUrl}/v1/user/total-uploads`, {
      method: "GET",
      headers: { Authorization: "Bear " + token },
      credentials: "include",
    });

    if (!res.ok) throw new Error("Uploads Info - Server error!");
    uploadsInfo = await res.json();
  } catch (error) {
    console.log(error.message);
  }
  chrome.storage.local.set({ uploadsInfo });
}

export async function getCurrentPageSource() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });  
  return result;
}

export async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  });
  return result;
}
