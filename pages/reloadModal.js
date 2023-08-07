let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];

document.getElementById("reload").addEventListener("click", (e) => {
  chrome.runtime.sendMessage(
    {
      message: "delete",
      conversionId: conversionId,
    },
    function (response) {
      console.log("Received response from background script:", response);

      if (response?.message === "success" && !response?.args?.status) {
        localStorage.setItem("typeNav", JSON.stringify(true));
        window.location.href = "/pages/add-conversions.html";
      }
    }
  );
});
