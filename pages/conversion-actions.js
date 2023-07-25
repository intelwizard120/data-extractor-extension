let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];

const uploadFileToDb = (data, type) => {
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
  const file = new File([data], " ", {
    type: type === "text" ? "text/plain" : "text/html",
  });
  let formData = new FormData();
  formData.append("file", file);
  formData.append("processUrls", `${textCheckBox ? true : false}`);
  formData.append("id", conversionId);
  formData.append(
    "returnRowsLimit",
    `${returnRowsLimitValue ? returnRowsLimitValue : null}`
  );
  formData.append("merge", `${mergeCheckBox ? true : false}`);

  formData.append("model", `${model ? model : null}`);

  chrome.storage.local.get(["token", "userData"], (d) => {
    if (
      d.token == null ||
      d.token == undefined ||
      d.token == "" ||
      d.userData == null ||
      d.userData == undefined
    ) {
      console.log("Token Not FOUND");
    } else {
      //"http://new-app.datatera.io/v1/conversion/uploadFileToDb"
      //"http://localhost:5000/api/v1/conversion/uploadFileToDb"
      fetch("http://new-app.datatera.io/v1/conversion/uploadFileToDb", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + d.token,
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((resp) => {
          var loaderElement = document.querySelector(".loader");
          loaderElement.style.display = "none";

          if (Array.isArray(resp) && resp?.length === 0) {
            window.location.href =
              "/pages/no-new-data-recognized.html?id=" + conversionId;
          } else {
            window.location.href =
              "/pages/success-page.html?id=" + conversionId;
          }
        })
        .catch((e) => {
          var loaderElement = document.querySelector(".loader");
          loaderElement.style.display = "none";
        });
    }
  });
};

$(document).ready(() => {
  let search = location.search.substring(1);
  search = search.split("=");
  let conversionId = search[1];
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
  //                 "Authorization": "Bearer " + d.token
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
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];
      chrome.runtime.sendMessage({
        message: "inject",
        tabData: JSON.stringify(tab),
      });
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
