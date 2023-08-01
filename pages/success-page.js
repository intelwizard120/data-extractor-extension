$(document).ready(() => {
  const data = JSON.parse(localStorage.getItem("selectedItem"));
  document.getElementById("success-heading").textContent = data?.name;
});
// document.getElementById("myLink").addEventListener("click", function () {
//   localStorage.setItem(
//     "viewData",
//     JSON.stringify({
//       convertedData: [
//         {
//           FileName: "blob",
//           "Date/Time": "7/31/2023, 10:31:23 PM",
//           Item: "Item 1",
//           price: "12",
//           amount: "24",
//         },
//         {
//           FileName: "blob",
//           "Date/Time": "7/31/2023, 10:31:23 PM",
//           Item: "4",
//           price: "32",
//           amount: "12",
//         },
//         {
//           FileName: "blob",
//           "Date/Time": "7/31/2023, 10:31:23 PM",
//           Item: "3rd one",
//           price: "21",
//           amount: "24",
//         },
//         {
//           FileName: "blob",
//           "Date/Time": "8/1/2023, 10:01:26 PM",
//           Item: "Item 1",
//           price: "12",
//           amount: "24",
//         },
//         {
//           FileName: "blob",
//           "Date/Time": "8/1/2023, 10:01:26 PM",
//           Item: "4",
//           price: "32",
//           amount: "12",
//         },
//         {
//           FileName: "blob",
//           "Date/Time": "8/1/2023, 10:01:26 PM",
//           Item: "3rd one",
//           price: "21",
//           amount: "24",
//         },
//       ],
//       _id: "64c6a7af3826c8001997bdf8",
//       csvFileName: "",
//       csvFileSize: "64 bytes",
//       sheetDetailsWrite: {
//         empty: "",
//       },
//       data: [
//         {
//           tableHeaders: ["FileName", "Date/Time", "Item", "price", "amount"],
//           tableData: [
//             ["", "7/30/2023, 6:10:55 PM", "Item 1", "12", "100"],
//             ["", "7/30/2023, 6:10:55 PM", "Second item", "32", "12"],
//             ["", "7/30/2023, 6:10:55 PM", "3rd one", "53", "42"],
//           ],
//           _id: "64c6a7af3826c8001997bdf9",
//         },
//       ],
//       conversion: "64c6a7ae3826c8001997bdf5",
//       user: "6487f82ae08440001a184b86",
//       __v: 0,
//     })
//   );

//   window.location.href = "/pages/view-data.html";
// });
