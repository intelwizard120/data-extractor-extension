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

    chrome.runtime.sendMessage({message: "full_page_screenshot"})
    window.close();
    // Get the active tab.
    

    // Capture the visible tab.
     
  });
