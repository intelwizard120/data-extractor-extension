let conversionIdGlobal = null;
function createTable(headers, tableData, convertedData) {
  // Create the table element
  const table = document.createElement("table");

  // Create the table header row
  const headerRow = document.createElement("tr");
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Create table data rows
  tableData.forEach((rowData) => {
    const row = document.createElement("tr");
    rowData.forEach((cellData) => {
      const td = document.createElement("td");
      td.classList.add("converted-data-td1");
      td.textContent = cellData;
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  // Create convertedData rows
  convertedData.forEach((itemData) => {
    const row = document.createElement("tr");
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.classList.add("converted-data-td2");
      td.textContent = itemData[header] || "";
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  // Create a container for the table with scrollable properties
  const tableContainer = document.createElement("div");
  tableContainer.style.overflowX = "auto";
  tableContainer.style.overflowY = "auto";
  tableContainer.style.maxHeight = "350px"; // Adjust the height as needed
  tableContainer.appendChild(table);

  // Append the table to the extension popup
  const container = document.getElementById("tableContainer");
  container.appendChild(tableContainer);
}

$(document).ready(() => {
  const data2 = JSON.parse(localStorage.getItem("selectedItem"));
  document.getElementById("success-heading").textContent = data2?.name;
  const data = JSON.parse(localStorage.getItem("viewData"));
  conversionIdGlobal = data?.conversion;
  // Retrieve data from local storage
  if (data) {
    createTable(
      data.data[0].tableHeaders,
      data.data[0].tableData,
      data?.convertedData
    );
  } else {
    console.error("Data not found in local storage.");
  }
});

document.getElementById("openInApp").addEventListener("click", function () {
  var linkUrl = `https://new-app.datatera.io/?id=${conversionIdGlobal}`;
  window.open(linkUrl, "_blank");
});
// Get the array data you want to convert to XLSX format

// Create a function to convert the array to XLSX format and initiate download
function exportToExcel(convertedData) {
  const worksheet = XLSX.utils.json_to_sheet(convertedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Convert workbook to binary array
  const excelData = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

  // Convert binary array to Blob
  const blob = new Blob([excelData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Use chrome.downloads API to download the Blob as a file
  chrome.downloads.download({
    url: URL.createObjectURL(blob),
    filename: "convertedData.xlsx",
    saveAs: true,
  });
}
document.getElementById("exportData").addEventListener("click", function () {
  const data = JSON.parse(localStorage.getItem("viewData"));
  if (data?.convertedData?.length) {
    exportToExcel(data.convertedData);
  }
});
