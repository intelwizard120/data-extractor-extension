import "./firebase.js";

function initFirebase() {
  const config = {
    apiKey: "AIzaSyBeabr2Qu1oWvvN1s28jmFctfb1vDYrM0o",
    authDomain: "datatera-io-auth.firebaseapp.com",
    projectId: "datatera-io-auth",
    storageBucket: "datatera-io-auth.appspot.com",
    messagingSenderId: "653572586876",
    appId: "1:653572586876:web:079d181ea5f08870c7b8f9",
  };

  firebase.initializeApp(config);
}

// My Code
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === "google-login") googleLogin();
  if (req.message === "google-logout") googleLogout();
});

function googleLogout() {
  initFirebase();
  firebase
    .auth()
    .signOut()
    .then(() => {      
      chrome.identity.clearAllCachedAuthTokens();
    })
    .catch((err) => console.log(err));
}

function googleLogin() {
  initFirebase();
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    let credential = firebase.auth.GoogleAuthProvider.credential(null, token);
    firebase
      .auth()
      .signInWithCredential(credential)
      .then(({ user }) => {
        const obj = {
          token,
          email: user.email,
          photo: user.photoURL,
          name: user.displayName,
        };
        requestGoogleLogin(obj);
      })
      .catch((err) => console.log(err));
  });
}

function requestGoogleLogin(body) {
  fetch("https://new-app.datatera.io/api/v1/user/googleSignin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      chrome.storage.local.set({
        token: data.token,
        userLoggedIn: true,
        userData: data.data.user,
      });
      chrome.runtime.sendMessage({ message: "dashboard" });
    })
    .catch((error) => {
      console.log(error.message);
      console.log("I am error");
    })
    .finally(() => {
      console.log("I am complete");
    });
}
