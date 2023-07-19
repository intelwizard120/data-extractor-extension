$(document).ready(() => {
  const data = JSON.parse(localStorage.getItem("selectedItem"));
  document.getElementById("success-heading").textContent = data?.name;
});
