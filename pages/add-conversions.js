let baseUrl = "";
$(document).ready(() => {
  const data = JSON.parse(localStorage.getItem("selectedItem"));
  const typeNav = JSON.parse(localStorage.getItem("typeNav"));

  if (data?.name && typeNav) {
    localStorage.setItem("typeNav", JSON.stringify(false));
    document.getElementById("cake-sales-data-name").value = data?.name;
  }
  chrome.storage.local.get("baseUrl", (result) => {
    baseUrl = result.baseUrl;
    console.log("Retrieved data:", baseUrl);
  });
});

var csvFileObject = {};
document
  .getElementById("add_conversion_form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const target = event.submitter;

    if (target.id === "paste-from-clipboard") {
      const input = document.createElement("textarea");
      input.style.position = "fixed";
      input.style.opacity = 0;
      document.body.appendChild(input);
      input.focus();
      document.execCommand("paste");
      const clipboardData = input.value;
      document.body.removeChild(input);
      console.log(clipboardData);
      const file = new File([clipboardData], "", {
        type: "text/csv",
      });
      csvReader(file);

      csvFileObject.csvFileName = "";
      csvFileObject.csvFileSize = formatFileSize(file.size);
      csvFileObject.sheetDetailsWrite = {
        empty: "",
      };
      console.log(csvFileObject);
    }
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
        let dataName = $("#cake-sales-data-name").val();
        $.ajax({
          type: "POST",
          url: `${baseUrl}/api/v1/conversion`,
          Headers: {
            Authorization: "Bearer " + d.token,
          },
          data: JSON.stringify({
            name: dataName,
            user: d.userData._id,
          }),
          dataType: "json",
          contentType: "application/json",
          success: function (data) {
            csvFileObject.conversion = data.createConversion._id;
            csvFileObject.user = data.createConversion.user;

            $.ajax({
              type: "POST",
              url: `${baseUrl}/api/v1/conversion/addData`,
              Headers: {
                Authorization: "Bearer " + d.token,
              },
              data: JSON.stringify(csvFileObject),
              dataType: "json",
              contentType: "application/json",
              success: function (result) {
                window.location.href = "/pages/conversions.html";
              },
            });
          },
        });
      }
    });
  });

// document
//   .getElementById("paste-from-clipboard")
//   .addEventListener("click", (e) => {
//     e.preventDefault();
//     chrome.storage.local.get(["token", "userData"], (d) => {
//       if (
//         d.token == null ||
//         d.token == undefined ||
//         d.token == "" ||
//         d.userData == null ||
//         d.userData == undefined
//       ) {
//         console.log(d.token);
//         console.log(d.userdata);
//       } else {
//         let dataName = $("#cake-sales-data-name").val();
//         $.ajax({
//           type: "POST",
//           url: "https://new-app.datatera.io/api/v1/conversion",
//           Headers: {
//             Authorization: "Bearer " + d.token,
//           },
//           data: JSON.stringify({
//             name: dataName,
//             user: d.userData._id,
//           }),
//           dataType: "json",
//           contentType: "application/json",
//           success: function (data) {
//             console.log(data);
//             console.log("Conversion Added Successfully");

//             csvFileObject.conversion = data.createConversion._id;
//             csvFileObject.user = data.createConversion.user;

//             $.ajax({
//               type: "POST",
//               url: "https://new-app.datatera.io/api/v1/conversion/addData",
//               Headers: {
//                 Authorization: "Bearer " + d.token,
//               },
//               data: JSON.stringify(csvFileObject),
//               dataType: "json",
//               contentType: "application/json",
//               success: function (result) {
//                 console.log(result);
//                 window.location.href = "/pages/conversions.html";
//               },
//             });
//           },
//         });
//       }
//     });
//   });

//CSV Reader Function will store CSV values in csvArray
function csvReader(selectedFile) {
  // Create a FileReader instance
  const reader = new FileReader();

  // Set up an event handler for when the file reading is complete
  reader.onload = function (event) {
    const csvData = event.target.result;
    const rows = csvData.split("\n");
    const tableHeaders = rows[0].split(",").map((header) => header.trim());

    const tableData = rows
      ?.filter((el) => el?.length > 0)
      .map((row) => row.split(",").map((value) => value.trim())); // Trim values

    const csvObject = {
      tableHeaders: tableHeaders,
      tableData: tableData,
    };
    csvArray = [];
    csvArray.push(csvObject);
    csvFileObject.data = csvArray;
  };
  reader.readAsText(selectedFile);
}
function csvReader2(selectedFile) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const csvData = event.target.result;
    const rows = csvData.split("\n");
    const tableHeaders = rows[0].split(",").map((header) => header.trim());
    const tableData = rows
      .slice(1)
      .map((row) => row.split(",").map((value) => value.trim())); // Trim values

    console.log(tableData);
    const csvObject = {
      tableHeaders: tableHeaders,
      tableData: tableData,
    };
    csvArray = [];
    csvArray.push(csvObject);
    // Print the populated csvArray
    console.log(csvArray);
    csvFileObject.data = csvArray;
  };
  reader.readAsText(selectedFile);
}
document
  .getElementById("tera-csv-upload-btn")
  .addEventListener("click", (e) => {
    e.preventDefault();

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "text/csv"; // Only allow CSV files

    // Trigger file selection dialog
    fileInput.click();

    fileInput.addEventListener("change", () => {
      // Get the selected file
      const selectedFile = fileInput.files[0];
      const fileName = selectedFile.name;

      csvReader(selectedFile);

      csvFileObject.csvFileName = fileName;
      csvFileObject.csvFileSize = formatFileSize(selectedFile.size);

      csvFileObject.sheetDetailsWrite = {
        empty: "",
      };

      console.log(csvFileObject);
      if (csvFileObject !== {}) {
        document.getElementById("CreateBtn").click();
      }
    });
  });

// Helper function to format file size
function formatFileSize(size) {
  const kilobyte = 1024;
  const megabyte = kilobyte * 1024;

  if (size >= megabyte) {
    return (size / megabyte).toFixed(2) + " MB";
  } else if (size >= kilobyte) {
    return (size / kilobyte).toFixed(2) + " KB";
  } else {
    return size + " bytes";
  }
}
