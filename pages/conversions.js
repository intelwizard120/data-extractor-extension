import { updateUploadsInfo } from "../helper.js";

let search = location.search.substring(1);
search = search.split("=");
let conversionId = search[1];
let baseUrl = "";

$(document).ready(() => {
  // Fetch and Display Remaining Uploads
  showUploadsInfo();

  chrome.storage.local.get("baseUrl", (result) => {
    baseUrl = result.baseUrl;
    console.log("Retrieved data:", baseUrl);
  });

  chrome.storage.local.get(["token", "userData"], (d) => {
    if (
      d.token == null ||
      d.token == undefined ||
      d.token == "" ||
      d.userData == null ||
      d.userData == undefined
    ) {
      console.log(d.token);
      console.log(d.userdata);
    } else {
      $.ajax({
        url: `${baseUrl}/v1/conversion/all-notes/` + d.userData._id,
        type: "GET",
        dataType: "json",
        Headers: {
          Authorization: "Bearer " + d.token,
        },
        success: function (res) {
          let conversionList = res.getAllConversion;
          let rows = "";
          conversionList.forEach((item) => {
            rows += `<div class="tera-conversion-item" data-item='${JSON.stringify(
              item
            )}' id='${item._id}'>
                          <img src="/assets/images/bubble.png" alt="" />&nbsp;&nbsp;
                          <a style='color:white'>${item.name}</a>
                        </div>`;
          });
          $("#tera-conversion-list").html(rows);

          // Event delegation for click event on "tera-conversion-item" elements
          $("#tera-conversion-list").on(
            "click",
            ".tera-conversion-item",
            function () {
              saveToLocalStorage($(this).data("item"));
            }
          );
        },
      });
    }
  });
});

function saveToLocalStorage(item) {
  // Save the item to local storage
  console.log(item);
  localStorage.setItem("selectedItem", JSON.stringify(item));

  chrome.runtime.sendMessage(
    {
      message: "getData",
      conversionId: item?._id,
    },
    function (response) {
      if (response?.message === "success") {
        console.log(response);
        if (response?.args === null) {
          localStorage.setItem("typeNav", JSON.stringify(true));

          window.location.href = "./add-conversions.html";
        } else {
          // Redirect to the desired page
          window.location.href = "./conversion-actions.html?id=" + item?._id;
        }
      }
    }
  );
}

document.getElementById("addBtn").addEventListener("click", (e) => {
  localStorage.setItem("typeNav", JSON.stringify(false));
  window.location.href = "./add-conversions.html";
});

async function showUploadsInfo() {
  await updateUploadsInfo();
  await setUploadsInfo();
}
async function setUploadsInfo() {
  const { uploadsInfo } = await chrome.storage.local.get("uploadsInfo");
  const { remainingUploads, totalUploads } = uploadsInfo;
  document.querySelector(
    ".uploads-info span"
  ).innerText = `${remainingUploads}/${totalUploads}`;
}
