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
    let textCheckBox = false;

    if (document.getElementById("process_urls").checked) {
      textCheckBox = true;
    } else {
      textCheckBox = false;
    }

    // let finalTxtData = [];

    // let tableData;
    // let tableHeaders;

    // tableData?.map((el) => {
    //   let obj = {};
    //   tableHeaders?.map((hd, i) => {
    //     obj[hd] = el[i];
    //   });
    //   delete obj["Date/Time"];
    //   delete obj["FileName"];
    //   finalTxtData.push(obj);
    //   obj = {};
    // });

    let textInput = document.getElementById("text_data").value;
    console.log(textInput)
    // const sample_file = new Blob([JSON.stringify(finalTxtData)], {
    //   type: "text/plain",
    // });

    const file = new File([textInput], "text.txt", {
      type: "text/plain",
    });

    let formData = new FormData();
    formData.append("file", file);
    // formData.append("sample_file", sample_file);
    // formData.append("processUrls", `${textCheckBox ? true : false}`);
    formData.append("processUrls", false)
    formData.append("id", conversionId);
    formData.append("returnRowsLimit", null);
    formData.append("merge", false);
    formData.append("model", 1);

    console.log(formData)

    chrome.storage.local.get(["token", "userData"], (d) => {
      if((d.token == null || d.token == undefined ||  d.token =="") || (d.userData == null || d.userData == undefined )) {
        console.log("Token Not FOUND")
      }else {
        fetch("https://new-app.datatera.io/api/v1/conversion/uploadFileToDb", {
          method: "POST",
          headers: {
            "Authorization": "Bear " + d.token,
          },
          body: formData
        }).then(res => res.json()).then(resp => console.log(resp)); 
      }
    });

   
    // $.ajax({
    //   type: "POST",
    //   url: "https://new-app.datatera.io/api/v1/conversion/uploadFileToDb",
    //   data: formData,
    //   dataType: "json",
    //   // enctype: "multipart/form-data",
    //   processData: false,
    //   contentType: false,
    //   // cache: false,
    //   contentType: "application/json",
    //   success: function (data) {
    //     console.log(data);
    //     // chrome.action.setPopup({ popup: "/pages/login.html" });
    //     // window.location.href = "./login.html?register=success";
    //   },
    //   error: function (e) {
    //     let error = e.responseJSON;
    //     console.log(error.message);
    //     console.log("I am error");
    //   },
    //   complete: function (data) {
    //     console.log("I am complete");
    //   },
    // });
  });
