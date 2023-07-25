var csvFileObject = {};
document
  .getElementById("add_conversion_form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
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
          url: "https://new-app.datatera.io/api/v1/conversion",
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
            console.log(data);
            console.log("Conversion Added Successfully");

            csvFileObject.conversion = data.createConversion._id;
            csvFileObject.user = data.createConversion.user;

            $.ajax({
              type: "POST",
              url: "https://new-app.datatera.io/api/v1/conversion/addData",
              Headers: {
                Authorization: "Bearer " + d.token,
              },
              data: JSON.stringify(csvFileObject),
              dataType: "json",
              contentType: "application/json",
              success: function (result) {
                console.log(result);
                window.location.href = "/pages/conversions.html";
              },
            });
          },
        });
      }
    });
  });

//CSV Reader Function will store CSV values in csvArray
function csvReader(selectedFile) {
  // Create a FileReader instance
  const reader = new FileReader();

  // Set up an event handler for when the file reading is complete
  reader.onload = function (event) {
    // Access the parsed CSV data from the result of the FileReader
    const csvData = event.target.result;
    // Example: Splitting the CSV data by new lines to get rows
    const rows = csvData.split("\n");
    // Extract table headers (first row)
    const tableHeaders = rows[0].split(",").map((header) => header.trim());
    // Extract table data (remaining rows)
    const tableData = rows
      .slice(1)
      .map((row) => row.split(",").map((value) => value.trim())); // Trim values
    // Create an object with tableHeaders and tableData
    const csvObject = {
      tableHeaders: tableHeaders,
      tableData: tableData,
    };
    // Add the csvObject to the csvArray
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
