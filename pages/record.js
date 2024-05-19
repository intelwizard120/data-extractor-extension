let mediaRecorder;
let chunks = [];

navigator.mediaDevices
  .getUserMedia({
    video: false,
    audio: true,
  })
  .then(async (stream) => {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      await audioUpload(blob);
    };

    mediaRecorder.start();
  });

document.getElementById('stopRecord').addEventListener('click', async (e) => {
  await mediaRecorder.stop();
  setTimeout(()=>window.close(), 1000);
});

async function audioUpload(blob) {
  // var [header, base64] = image.split(",");
  // var [_, type] = /data:(.*);base64/.exec(header);
  // var binary = atob(base64);
  // var array = new Uint8Array(
  //   Array.from({ length: binary.length }, (_, index) =>
  //     binary.charCodeAt(index)
  //   )
  // );

  // const file = new File([array], fileName, { type });
  const [tab] = await chrome.tabs.query({ active: true });
  let sourceUrl = tab.url;

  chrome.storage.local.get(
    ["token", "userData", "baseUrl", "conversionId", "uploadParams"],
    (d) => {
      let baseUrl = d.baseUrl;
      let formData = new FormData();
      formData.append("sourceUrl", sourceUrl);
      formData.append("id", d.conversionId);
      formData.append("isBackground", true);
      //formData.append("model", 1);
      //formData.append("processUrls", false);

      for (const k in d.uploadParams) {
        formData.append(k, d.uploadParams[k]);
      }

      var pad = (n) => ((n = n + ""), n.length >= 2 ? n : `0${n}`);
      var timestamp = (now) =>
        [pad(now.getFullYear()), pad(now.getMonth() + 1), pad(now.getDate())].join(
          "-"
        ) +
        " - " +
        [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join(
          "-"
        );

      formData.append("file", blob, `Audio Record - ${timestamp(new Date())}.wav`);

      if (
        d.token == null ||
        d.token == undefined ||
        d.token == "" ||
        d.userData == null ||
        d.userData == undefined ||
        d.conversionId == null ||
        d.conversionId == undefined
      ) {
        console.log("Audio Upload: Missing Form Data");
      } else {
        fetch(`${baseUrl}/v1/conversion/uploadFileToDb`, {
          method: "POST",
          headers: {
            Authorization: "Bear " + d.token,
          },
          body: formData,
          credentials: "include",
        })
          .then((res) => res.json())
          .then((resp) => console.log(resp));
      }
    }
  );
}