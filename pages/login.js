import { getUser } from "../helper.js";

let baseUrl = "";

chrome.storage.local.get(["baseUrl"], (d) => {
  baseUrl = d.baseUrl;
  console.log("Retrieved data:", baseUrl);
});

const loginBtn = document.querySelector("#login-btn");
const registerLink = document.querySelector("#register-link");

loginBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://new-app.datatera.io/signin" });
});

registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://new-app.datatera.io/register" });
});

$(document).ready(async () => {
  let user = await getUser();
  if (user) {
    await chrome.storage.local.set({ ...user });
    showDashboard();
    return;
  }
  showLoginForm();

  /* $(document).on("submit", "#login_form", (e) => {
    e.preventDefault();

    let userEmail = $("#user-email").val();
    let userPassword = $("#user-password").val();

    $.ajax({
      type: "POST",
      url: `${baseUrl}/v1/user/login`,
      data: JSON.stringify({ email: userEmail, password: userPassword }),
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        chrome.storage.local.set({
          token: data.token,
          userLoggedIn: true,
          userData: data.data.user,
        });
        chrome.action.setPopup({ popup: "/pages/conversions.html" });
        window.location.href = "./conversions.html";
      },
      error: function (e) {
        let error = e.responseJSON;
        console.log(error.message);
        console.log("I am error");
      },
      complete: function (data) {
        console.log("I am complete");
      },
    });
  }); */
});

/* document.getElementById("google-login-btn").addEventListener("click", (e) => {
  chrome.runtime.sendMessage({ message: "google-login" });
});
 */
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === "dashboard") showDashboard();
});

function showDashboard() {
  chrome.action.setPopup({ popup: "/pages/conversions.html" });
  window.location.href = "./conversions.html";
}

function showLoginForm() {
  document.querySelector(".loader").remove();
  const sectionElements = document.querySelectorAll(
    'section[class*="tera-login-"]'
  );
  sectionElements.forEach(function (section) {
    if (section.classList.contains("display-none")) {
      section.classList.remove("display-none");
    }
  });
}
