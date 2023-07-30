var jcrop, selection;

var overlay = ((active) => (state) => {
  active =
    typeof state === "boolean" ? state : state === null ? active : !active;
  $(".jcrop-holder")[active ? "show" : "hide"]();
  chrome.runtime.sendMessage({ message: "active", active });
})(false);

var image = (done) => {
  var image = new Image();
  image.id = "fake-image";
  image.src = chrome.runtime.getURL("assets/content/pixel.png");
  image.onload = () => {
    $("body").append(image);
    done();
  };
};

var init = (done) => {
  $("#fake-image").Jcrop(
    {
      bgColor: "none",
      onSelect: (e) => {
        selection = e;
        capture();
      },
      onChange: (e) => {
        selection = e;
      },
      onRelease: (e) => {
        setTimeout(() => {
          selection = null;
        }, 100);
      },
    },
    function ready() {
      jcrop = this;

      $(".jcrop-hline, .jcrop-vline").css({
        backgroundImage: `url(${chrome.runtime.getURL(
          "assets/vendor/Jcrop.gif"
        )})`,
      });

      if (selection) {
        jcrop.setSelect([selection.x, selection.y, selection.x2, selection.y2]);
      }

      done && done();
    }
  );
};

var capture = (force) => {
  console.log("force");
  chrome.storage.sync.get((config) => {
    if (
      selection &&
      (config.method === "crop" || (config.method === "wait" && force))
    ) {
      console.log("crop");

      jcrop.release();
      setTimeout(() => {
        chrome.runtime.sendMessage(
          {
            message: "capture",
            area: selection,
            dpr: devicePixelRatio,
          },
          (res) => {
            overlay(false);
            selection = null;
            crop(...res.args, (image) => {
              save(image, config.format, config.save);
            });
          }
        );
      }, 50);
    } else if (config.method === "view") {
      console.log("view");
      chrome.runtime.sendMessage(
        {
          message: "capture",
          area: { x: 0, y: 0, w: innerWidth, h: innerHeight },
          dpr: devicePixelRatio,
        },
        (res) => {
          overlay(false);
          if (res.args) {
            crop(...res.args, (image) => {
              save(image, config.format, config.save);
            });
          } else if (res.image) {
            save(res.image, config.format, config.save);
          }
        }
      );
    }
  });
};

var filename = (format) => {
  var pad = (n) => ((n = n + ""), n.length >= 2 ? n : `0${n}`);
  var ext = (format) =>
    format === "jpeg" ? "jpg" : format === "png" ? "png" : "png";
  var timestamp = (now) =>
    [pad(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate())].join(
      "-"
    ) +
    " - " +
    [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(
      "-"
    );
  return `Screenshot Capture - ${timestamp(new Date())}.${ext(format)}`;
};

const uploadFileToDb = (data, type, selectedFile) => {
  let textCheckBox = false;
  if (document.getElementById("processURLs").checked) {
    textCheckBox = true;
  } else {
    textCheckBox = false;
  }
  let mergeCheckBox = false;
  if (document.getElementById("smartMerge").checked) {
    mergeCheckBox = true;
  } else {
    mergeCheckBox = false;
  }

  let returnRowsLimitValue = document.getElementById("returnRowsLimit").value;

  let model = document.getElementById("model").value;

  let formData = new FormData();
  if (type === "file") {
    formData.append("file", selectedFile);
  } else {
    const file = new File([data], " ", {
      type: type === "text" ? "text/plain" : "text/html",
    });
    formData.append("file", file);
  }
  formData.append("processUrls", `${textCheckBox ? true : false}`);
  formData.append("id", conversionId);
  formData.append(
    "returnRowsLimit",
    `${returnRowsLimitValue ? returnRowsLimitValue : null}`
  );
  formData.append("merge", `${mergeCheckBox ? true : false}`);

  formData.append("model", `${model ? model : null}`);

  chrome.storage.local.get(["token", "userData"], (d) => {
    if (
      d.token == null ||
      d.token == undefined ||
      d.token == "" ||
      d.userData == null ||
      d.userData == undefined
    ) {
      console.log("Token Not FOUND");
    } else {
      //"http://new-app.datatera.io/v1/conversion/uploadFileToDb"
      //"http://localhost:5000/api/v1/conversion/uploadFileToDb"
      fetch("http://localhost:5000/api/v1/conversion/uploadFileToDb", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + d.token,
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((resp) => {
          var loaderElement = document.querySelector(".loader");
          loaderElement.style.display = "none";

          if (Array.isArray(resp) && resp?.length === 0) {
            window.location.href =
              "/pages/no-new-data-recognized.html?id=" + conversionId;
          } else {
            window.location.href =
              "/pages/success-page.html?id=" + conversionId;
          }
        })
        .catch((e) => {
          var loaderElement = document.querySelector(".loader");
          loaderElement.style.display = "none";
        });
    }
  });
};
var save = (image, format, save) => {
  console.log("save");

  if (save === "file") {
    console.log("file");
    // chrome.action.openPopup({
    //   url: '/pages/conversion-actions.html',
    // });
    var link = document.createElement("a");
    link.download = filename(format);
    link.href = image;
    link.click();
  } else if (save === "url") {
    console.log("url");

    navigator.clipboard.writeText(image).then(() => {
      alert(
        ["Screenshot Capture:", "Data URL String", "Saved to Clipboard!"].join(
          "\n"
        )
      );
    });
  } else if (save === "binary") {
    console.log("binary");

    var [header, base64] = image.split(",");
    var [_, type] = /data:(.*);base64/.exec(header);
    var binary = atob(base64);
    var array = Array.from({ length: binary.length }).map((_, index) =>
      binary.charCodeAt(index)
    );
    navigator.clipboard
      .write([
        new ClipboardItem({
          // jpeg is not supported on write, though the encoding is preserved
          "image/png": new Blob([new Uint8Array(array)], { type: "image/png" }),
        }),
      ])
      .then(() => {
        alert(
          ["Screenshot Capture:", "Binary Image", "Saved to Clipboard!"].join(
            "\n"
          )
        );
      });
  }
};

window.addEventListener(
  "resize",
  ((timeout) => () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      jcrop.destroy();
      init(() => overlay(null));
    }, 100);
  })()
);

chrome.runtime.onMessage.addListener((req, sender, res) => {
  if (req.message === "init") {
    res({}); // prevent re-injecting
    console.log("init");

    if (!jcrop) {
      image(() =>
        init(() => {
          overlay();
          capture();
        })
      );
    } else {
      overlay();
      capture(true);
    }
  }
  return true;
});
