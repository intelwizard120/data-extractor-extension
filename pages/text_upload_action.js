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
    let formData = new FormData();
    let textInput = document.getElementById("text_data").value;
    const file = new File([textInput], "text.txt", {
      type: "text/plain",
    });
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
        fetch("http://localhost:5000/api/v1/conversion/uploadFileToDb", {
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
  });
