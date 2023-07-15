$(document).ready(() => {
  $(document).on("submit", "#register_form", (e) => {
    e.preventDefault();

    let userEmail = $("#user-email").val();
    let userPassword = $("#user-password").val();
    let userConfirmPassword = $("#user-confirm-password").val();

    $.ajax({
      type: "POST",
      url: "https://new-app.datatera.io/api/v1/user/register",
      data: JSON.stringify({
        email: userEmail,
        password: userPassword,
        passwordConfirm: userConfirmPassword,
      }),
      dataType: "json",
      contentType: "application/json",
      success: function (data) {
        console.log(data);
        chrome.action.setPopup({ popup: "/pages/login.html" });
        window.location.href = "./login.html?register=success";
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
