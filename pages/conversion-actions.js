let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];

const uploadFileToDb = (data, type, selectedFile) => {
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
  let file;
  if (type === "file") {
    file = selectedFile;
  } else {
    file = new File([data], " ", {
      type: type === "text" ? "text/plain" : "text/html",
    });
  }

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
        var loaderElement = document.querySelector(".loader");
        loaderElement.style.display = "none";

        if (response?.args && response?.args?.length === 0) {
          localStorage.setItem("viewData", JSON.stringify([]));
          window.location.href =
            "/pages/no-new-data-recognized.html?id=" + conversionId;
        } else if (response?.args?.status) {
        } else if (response?.status === 200) {
          localStorage.setItem("viewData", JSON.stringify(response?.args));
          window.location.href = "/pages/success-page.html?id=" + conversionId;
        }
      }
    }
  );
};

$(document).ready(() => {
  let search = location.search.substring(1);
  search = search.split("=");
  let conversionId = search[1];
  $("#text_upload_btn").click((e) => {
    window.location.href = "/pages/text_upload_action.html?id=" + conversionId;
  });
});

document
  .getElementById("screenshot_area_btn")
  .addEventListener("click", (e) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      chrome.runtime.sendMessage(
        {
          message: "inject",
          tabData: JSON.stringify(tab),
        },
        function (response) {
          console.log("response:", response);
        }
      );
      // window.close();
    });
  });

document
  .getElementById("upload_whole_page_btn")
  .addEventListener("click", (e) => {
    var loaderElement = document.querySelector(".loader");
    loaderElement.style.display = "flex";
    let pageSourceString;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      function returnPageSource() {
        var source = document.documentElement.outerHTML;
        return source;
      }

      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id },
          func: returnPageSource,
        })
        .then((injectionResults) => {
          console.log(`Function to get page source injected!`);

          for (const { frameId, result } of injectionResults) {
            pageSourceString = result;
          }

          uploadFileToDb(pageSourceString, "html");
        })
        .catch((e) => {
          console.log(e);
        });
    });
  });

document.getElementById("file_upload_btn").addEventListener("click", () => {
  console.log("Upload action clicked");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.click();
  fileInput.addEventListener("change", () => {
    var loaderElement = document.querySelector(".loader");
    loaderElement.style.display = "flex";

    const selectedFile = fileInput.files[0];
    console.log("Selected file:", selectedFile);
    uploadFileToDb("", "file", selectedFile);

    fileInput.value = null;
  });
});

document.getElementById("highlight-action").addEventListener("click", () => {
  var loaderElement = document.querySelector(".loader");
  loaderElement.style.display = "flex";
  let highlightedText = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    function returnHighlight() {
      selectedText = window.getSelection().toString();
      console.log("Selected text:", selectedText);
      return selectedText;
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tabs[0].id },
        func: returnHighlight,
      })
      .then((injectionResults) => {
        for (const { frameId, result } of injectionResults) {
          console.log(`Frame ${frameId} result:`, result);
          highlightedText = result;
        }

        console.log(`highlightedText: ${highlightedText}`);
        uploadFileToDb(highlightedText, "text");
      })
      .catch();
  });
});

// Function to handle reading data from the clipboard
function readClipboardData() {
  e.preventDefault();
  const input = document.createElement("input");
  input.style.position = "fixed";
  input.style.opacity = 0;
  document.body.appendChild(input);
  input.focus();
  document.execCommand("paste");
  const clipboardData = input.value;
  document.body.removeChild(input);
  console.log(clipboardData);
}

document.getElementById("reloadCsv").addEventListener("click", (e) => {
  window.location.href = "./reloadModal.html?id=" + conversionId;
});
