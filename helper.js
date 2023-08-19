export async function updateUploadsInfo() {
  const { baseUrl } = await chrome.storage.local.get("baseUrl");
  const { token } = await chrome.storage.local.get("token");
  try {
    const res = await fetch(`${baseUrl}/v1/user/total-uploads`, {
      method: "GET",
      headers: {
        Authorization: "Bear " + token,
      },
      credentials: "include",
    });

    if (!res.ok) throw new Error("Uploads Info - Server error!");
    const uploadsInfo = await res.json();    
    chrome.storage.local.set({ uploadsInfo });
  } catch (error) {
    console.log(error.message);
  }
}
