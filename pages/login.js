let baseUrl = "";

chrome.storage.local.get(["userLoggedIn", "baseUrl"], (d) => {
  if (
    d.userLoggedIn == null ||
    d.userLoggedIn == undefined ||
    d.userLoggedIn == ""
  ) {
  } else {
    chrome.action.setPopup({ popup: "/pages/conversions.html" });
    window.location.href = "./conversions.html";
  }
  if (d.baseUrl) {
    baseUrl = d.baseUrl;
    console.log("Retrieved data:", baseUrl);
  }
});

$(document).ready(() => {
  $(document).on("submit", "#login_form", (e) => {
    e.preventDefault();

    let userEmail = $("#user-email").val();
    let userPassword = $("#user-password").val();

    $.ajax({
      type: "POST",
      url: `${baseUrl}/api/v1/user/login`,
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
  });
});

document.getElementById("google-login-btn").addEventListener("click", (e) => {
  chrome.runtime.sendMessage({ message: "google-login" });
});

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === "dashboard") showDashboard();
});

function showDashboard() {
  chrome.action.setPopup({ popup: "/pages/conversions.html" });
  window.location.href = "./conversions.html";
}
