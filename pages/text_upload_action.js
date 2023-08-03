let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];

document
  .getElementById("back-btn")
  .setAttribute("href", "./conversion-actions.html?id=" + conversionId);

document
  .getElementById("text_upload_action_form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    var loaderElement = document.querySelector(".loader");
    loaderElement.style.display = "flex";

    let textCheckBox = false;
    if (document.getElementById("processURLs").checked) {
      textCheckBox = true;
    } else {
      textCheckBox = false;
    }
    let mergeCheckBox = false;
    if (document.getElementById("smartMerge").checked) {
      mergeCheckBox = true;
    } else {
      mergeCheckBox = false;
    }
    let returnRowsLimitValue = document.getElementById("returnRowsLimit").value;
    let model = document.getElementById("model").value;
    let textInput = document.getElementById("text_data").value;
    const file = new File([textInput], "text.txt", {
      type: "text/plain",
    });

    const fileURL = URL.createObjectURL(file);

    chrome.runtime.sendMessage(
      {
        message: "uploadFileToDB",
        model: model,
        returnRowsLimitValue: returnRowsLimitValue,
        mergeCheckBox: mergeCheckBox,
        textCheckBox: textCheckBox,
        fileURL: fileURL, // Send the temporary URL of the file
        conversionId: conversionId,
      },
      function (response) {
        // This callback function will be called when a response is received
        console.log("Received response from background script:", response);
        if (response?.message === "success") {
          console.log("hello");
          var loaderElement = document.querySelector(".loader");
          loaderElement.style.display = "none";

          if (response?.args && response?.args?.length === 0) {
            localStorage.setItem("viewData", JSON.stringify([]));
            window.location.href =
              "/pages/no-new-data-recognized.html?id=" + conversionId;
          } else if (response?.status === 200) {
            localStorage.setItem("viewData", JSON.stringify(response?.args));
            window.location.href =
              "/pages/success-page.html?id=" + conversionId;
          }
        }
      }
    );
  });
