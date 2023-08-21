let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];

const uploadFileToDb = async (data, type, selectedFile) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let sourceUrl = tab.url;

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
      sourceUrl,
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

$(document).ready(async () => {
  
  await setUploadsInfo();

  let search = location.search.substring(1);
  search = search.split("=");
  let conversionId = search[1];
  chrome.storage.local.set({ conversionId });
  $("#text_upload_btn").click((e) => {
    window.location.href = "/pages/text_upload_action.html?id=" + conversionId;
  });

  // chrome.storage.local.get(["token", "userData"], (d) => {
  //     if((d.token == null || d.token == undefined ||  d.token =="") || (d.userData == null || d.userData == undefined )) {
  //     console.log(d.token);
  //     console.log(d.userdata)
  //     }else {
  //         $.ajax({
  //             url: "https://new-app.datatera.io/api/v1/conversion/getData/" + conversionId,
  //             type: "GET",
  //             dataType: "json",
  //             Headers: {
  //                 "Authorization": "Bear " + d.token
  //             },
  //             success: function (res) {
  //                 console.log(res);
  //                 let tableData = res.data[0].tableData;
  //                 let tableHeaders = res.data[0].tableHeaders;
  //                 let columnRows = '<tr>';
  //                 tableHeaders.forEach(item => columnRows += `<td>${item}</td>`);
  //                 columnRows += "</tr>";
  //                 $("#table-columns").html(columnRows)
  //                 let dataRows = "";
  //                 tableData.forEach(item => dataRows += `<tr>
  //                 <td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td><td>${item[3]}</td><td>${item[4]}</td><td>${item[5]}</td><td>${item[6]}</td><td>${item[7]}</td><td>${item[8]}</td><td>${item[9]}</td><td>${item[10]}</td></tr>`);
  //                 $("#table-rows").html(dataRows);
  //             }
  //         })
  //     }
  // })
});

document
  .getElementById("screenshot_area_btn")
  .addEventListener("click", (e) => {
    saveUploadParams();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      chrome.runtime.sendMessage({
        message: "inject",
        tabData: JSON.stringify(tab),
      });
      window.close();
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

async function saveUploadParams() {
  let processUrls = document.getElementById("processURLs").checked;
  let merge = document.getElementById("smartMerge").checked;
  let returnRowsLimit = document.getElementById("returnRowsLimit").value;
  let model = document.getElementById("model").value;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let sourceUrl = tab.url;

  const data = {
    processUrls,
    merge,
    returnRowsLimit,
    model,
    sourceUrl,
  };
  chrome.storage.local.set({ uploadParams: data });
}

async function setUploadsInfo() {
  const { uploadsInfo } = await chrome.storage.local.get("uploadsInfo");
  const { remainingUploads, totalUploads } = uploadsInfo;  
  document.querySelector(
    ".uploads-info span"
  ).innerText = `${remainingUploads}/${totalUploads}`;
}