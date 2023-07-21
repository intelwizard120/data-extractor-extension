import "./google.js";

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    chrome.storage.local.set({ token: "", userLoggedIn: false });
  } else if (details.reason == "update") {
    var thisVersion = chrome.runtime.getManifest().version;
    console.log(
      "Updated from " + details.previousVersion + " to " + thisVersion + "!"
    );
  }
});

// chrome.storage.sync.clear()
chrome.storage.sync.get((config) => {
  if (!config.method) {
    chrome.storage.sync.set({
      method: "crop",
    });
  }
  if (!config.format) {
    chrome.storage.sync.set({
      format: "png",
    });
  }
  if (!config.save) {
    chrome.storage.sync.set({
      save: "file",
    });
  }
  if (config.dpr === undefined) {
    chrome.storage.sync.set({
      dpr: true,
    });
  }
  // v1.9 -> v2.0
  if (config.save === "clipboard") {
    config.save = "url";
    chrome.storage.sync.set({
      save: "url",
    });
  }
  // v2.0 -> v3.0
  if (config.icon === undefined) {
    config.icon = false;
    chrome.storage.sync.set({
      icon: false,
    });
  }
  // chrome.action.setIcon({
  //     path: [16, 19, 38, 48, 128].reduce((all, size) => (
  //         color = config.icon ? 'light' : 'dark',
  //         all[size] = `/assets/icons/${color}/${size}x${size}.png`,
  //         all
  //     ), {})
  // })
});
function inject(tab) {
  chrome.tabs.sendMessage(
    tab.id,
    {
      message: "init",
    },
    (res) => {
      if (res) {
        clearTimeout(timeout);
      }
    }
  );
  var timeout = setTimeout(() => {
    chrome.scripting.insertCSS({
      files: ["assets/vendor/jquery.Jcrop.min.css"],
      target: {
        tabId: tab.id,
      },
    });
    chrome.scripting.insertCSS({
      files: ["assets/content/index.css"],
      target: {
        tabId: tab.id,
      },
    });
    chrome.scripting.executeScript({
      files: ["assets/vendor/jquery.min.js"],
      target: {
        tabId: tab.id,
      },
    });
    chrome.scripting.executeScript({
      files: ["assets/vendor/jquery.Jcrop.min.js"],
      target: {
        tabId: tab.id,
      },
    });
    chrome.scripting.executeScript({
      files: ["assets/content/crop.js"],
      target: {
        tabId: tab.id,
      },
    });
    chrome.scripting.executeScript({
      files: ["assets/content/index.js"],
      target: {
        tabId: tab.id,
      },
    });
    setTimeout(() => {
      chrome.tabs.sendMessage(tab.id, {
        message: "init",
      });
    }, 100);
  }, 100);
}
// chrome.action.onClicked.addListener((tab) => {
//     inject(tab)
// })
// chrome.commands.onCommand.addListener((command) => {
//     if (command === 'take-screenshot') {
//         chrome.tabs.query({
//             active: true,
//             currentWindow: true
//         }, (tab) => {
//             inject(tab[0])
//         })
//     }
// })
chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === "capture") {
    chrome.storage.sync.get((config) => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tab) => {
          chrome.tabs.captureVisibleTab(
            tab.windowId,
            {
              format: config.format,
            },
            (image) => {
              // image is base64
              if (config.method === "view") {
                if (req.dpr !== 1 && !config.dpr) {
                  res({
                    message: "image",
                    args: [image, req.area, req.dpr, config.dpr, config.format],
                  });
                } else {
                  res({
                    message: "image",
                    image,
                  });
                }
              } else {
                res({
                  message: "image",
                  args: [image, req.area, req.dpr, config.dpr, config.format],
                });
              }
            }
          );
        }
      );
    });
  } else if (req.message === "active") {
    if (req.active) {
      chrome.storage.sync.get((config) => {
        if (config.method === "view") {
          chrome.action.setTitle({
            tabId: sender.tab.id,
            title: "Capture Viewport",
          });
          chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: "⬒",
          });
        }
        // else if (config.method === 'full') {
        //   chrome.action.setTitle({tabId: sender.tab.id, title: 'Capture Document'})
        //   chrome.action.setBadgeText({tabId: sender.tab.id, text: '⬛'})
        // }
        else if (config.method === "crop") {
          chrome.action.setTitle({
            tabId: sender.tab.id,
            title: "Crop and Save",
          });
          chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: "◩",
          });
        } else if (config.method === "wait") {
          chrome.action.setTitle({
            tabId: sender.tab.id,
            title: "Crop and Wait",
          });
          chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: "◪",
          });
        }
      });
    } else {
      chrome.action.setTitle({
        tabId: sender.tab.id,
        title: "Screenshot Capture",
      });
      chrome.action.setBadgeText({
        tabId: sender.tab.id,
        text: "",
      });
    }
  } else if (req.message == "inject") {
    console.log("Inject Message");
    let tab = JSON.parse(req.tabData);
    console.log(tab);

    // Get the popup window.
    // const popup = chrome.windows.get({
    //   url: "/pages/conversion-actions.html",
    // });

    // // Close the popup window.
    // popup.close();
    setTimeout(() => {
      inject(tab);
    }, 1000);
  } else if (req.message == "full_page_screenshot") {
    setTimeout(() => {
      chrome.windows.getCurrent((currentWindow) => {
        chrome.tabs.captureVisibleTab(currentWindow.id, (dataUrl) => {
          // Do something with the dataUrl.
          console.log(dataUrl);
        });
      });
    }, 3000);
  }
  return true;
});
