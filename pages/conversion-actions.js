let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];
let mediaRecorder = null;
let chunks = [];

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
  addSettingsEventListener();
  await updateConversionName();
  addViewDataListener();

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
      var [tab] = tabs;
      chrome.tabs.sendMessage(tab.id, { action: "ss-selection" });
      //window.close();
    });
  });

document
  .getElementById("capture_audio_btn")
  .addEventListener("click", (e) => {
    e.stopPropagation();
    let current = e.currentTarget.children[1].innerText;
    saveUploadParams();
    if (current === "Stop Capture") stopAudioCapture();
    else startAudioCapture();
    e.currentTarget.children[1].innerText = current === "Stop Capture" ? "Capture Audio from Current Browser Tab" : "Stop Capture";
});

document
  .getElementById("record_audio_btn")
  .addEventListener("click", async (e) => {
    saveUploadParams();
    await chrome.tabs.create({ url: chrome.runtime.getURL("pages//record.html"), active: true, index: 0, pinned: true });
});

document
  .getElementById("upload_whole_page_btn")
  .addEventListener("click", (e) => {
    /*     var loaderElement = document.querySelector(".loader");
    loaderElement.style.display = "flex"; */

    notify("Page uploaded successfully!");

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
    /*  var loaderElement = document.querySelector(".loader");
    loaderElement.style.display = "flex"; */
    notify("File uploaded successfully!");
    const selectedFile = fileInput.files[0];
    console.log("Selected file:", selectedFile);
    uploadFileToDb("", "file", selectedFile);

    fileInput.value = null;
  });
});

document.getElementById("highlight-action").addEventListener("click", () => {
  /* var loaderElement = document.querySelector(".loader");
  loaderElement.style.display = "flex"; */
  notify("Selected content uploaded successfully!");
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
  //let returnRowsLimit = document.getElementById("returnRowsLimit").value;
  let returnRowsLimit = 0;
  //let model = document.getElementById("model").value;
  let model = 1;

  const data = {
    processUrls,
    merge,
    returnRowsLimit,
    model,
  };
//  console.log(data.toString());
  chrome.storage.local.set({ uploadParams: data });
}

async function setUploadsInfo() {
  const { uploadsInfo } = await chrome.storage.local.get("uploadsInfo");
  const { remainingUploads, totalUploads } = uploadsInfo;
  document.querySelector(
    ".uploads-info span"
  ).innerText = `${remainingUploads}/${totalUploads}`;
  if(remainingUploads === 0) ActionZero();
}

function addSettingsEventListener() {
  let fields = ["processURLs", "smartMerge", "returnRowsLimit", "model"];
  for (const f of fields) {
    document
      .querySelector(`#${f}`)
      .addEventListener("change", saveUploadParams);
  }
}

async function updateConversionName() {
  const { conversionList } = await chrome.storage.local.get("conversionList");
  let conversionName = conversionList.find((c) => c._id == conversionId)?.name;
  document.querySelector(".tera-welcome-top h1").innerText = conversionName;
}

function addViewDataListener() {
  document.addEventListener("click", function (e) {
    if (e.target.matches("#viewDataInApp")) {
      var linkUrl = `https://new-app.datatera.io/?id=${conversionId}`;
      window.open(linkUrl, "_blank");
    }
  });
}

function notify(msg) {
  $.notify(msg, {
    className: "success",
    globalPosition: "top right",
  });
}

function startAudioCapture() {
  chrome.tabCapture.capture({
    audio: true,
    video: false,
  }, (stream) => {
    let context = new AudioContext();
    let tstream = context.createMediaStreamSource(stream);
    tstream.connect(context.destination);

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'captured_audio.wav';
      // document.body.appendChild(a);
      // a.click();
      // document.body.removeChild(a);
      chunks = [];
      audioUpload(blob);
    };

    mediaRecorder.start();
  });
}

function stopAudioCapture() {
  mediaRecorder.stop();
  $.notify("Audio uploaded successfully!", "success");
  setTimeout(()=>window.close(), 1000);
}

async function audioUpload(blob) {
  // var [header, base64] = image.split(",");
  // var [_, type] = /data:(.*);base64/.exec(header);
  // var binary = atob(base64);
  // var array = new Uint8Array(
  //   Array.from({ length: binary.length }, (_, index) =>
  //     binary.charCodeAt(index)
  //   )
  // );

  // const file = new File([array], fileName, { type });
  const [tab] = await chrome.tabs.query({ active: true });
  let sourceUrl = tab.url;

  chrome.storage.local.get(
    ["token", "userData", "baseUrl", "conversionId", "uploadParams"],
    (d) => {
      let baseUrl = d.baseUrl;
      let formData = new FormData();
      formData.append("sourceUrl", sourceUrl);
      formData.append("id", d.conversionId);
      formData.append("isBackground", true);
      //formData.append("model", 1);
      //formData.append("processUrls", false);

      for (const k in d.uploadParams) {
        formData.append(k, d.uploadParams[k]);
      }

      var pad = (n) => ((n = n + ""), n.length >= 2 ? n : `0${n}`);
      var timestamp = (now) =>
        [pad(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate())].join(
          "-"
        ) +
        " - " +
        [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(
          "-"
        );

      formData.append("file", blob, `Audio Capture - ${timestamp(new Date())}.wav`);

      if (
        d.token == null ||
        d.token == undefined ||
        d.token == "" ||
        d.userData == null ||
        d.userData == undefined ||
        d.conversionId == null ||
        d.conversionId == undefined
      ) {
        console.log("Audio Upload: Missing Form Data");
      } else {
        //console.log("Form data (screenshot): "+formData);
        fetch(`${baseUrl}/v1/conversion/uploadFileToDb`, {
          method: "POST",
          headers: {
            Authorization: "Bear " + d.token,
          },
          body: formData,
          credentials: "include",
        })
          .then((res) => res.json())
          .then((resp) => console.log(resp));
      }
    }
  );
}

function ActionZero()
{
  let btn_ids = ["upload_whole_page_btn", "highlight-action", "screenshot_area_btn", "capture_audio_btn", "record_audio_btn", "file_upload_btn", "text_upload_btn"];
  btn_ids.forEach((btn_id) => {
    let btn =  document.getElementById(btn_id);
    btn.style.pointerEvents = "none";
    btn.children[1].style.color = "white";
  });
  setTimeout(()=>window.open("https://new-app.datatera.io/?showPlans=true", "_blank"), 2000);
}