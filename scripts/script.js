let start = document.getElementById("start"),
  stop = document.getElementById("stop"),
  start2 = document.getElementById("startcam"),
  recordstart = document.getElementById("recordstart"),
  recordend = document.getElementById("recordend"),
  circrec = document.getElementById("circrec"),
  precordedTime = document.getElementById("timerecorded"),
  recordedtimeSecs = 0,
  mediaRecorder,
  mediaRecorder2;

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function hasGetDisplayMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
}

let handle;

start.addEventListener("click", async function () {
  let stream = await recordScreen();
  let mimeType = "video/mp4";
  mediaRecorder = createRecorder(stream, mimeType);
  recordstart.textContent = "Started recording";
  recordend.textContent = "";
  circrec.style.backgroundColor = "red";
  handle = setInterval(() => {
    recordedtimeSecs += 500 / 1000;
    //convert seconds to hours minutes and seconds
    let hours = Math.floor(recordedtimeSecs / 3600),
      minutes = Math.floor(recordedtimeSecs / 60),
      seconds = Math.floor(recordedtimeSecs % 60);

    precordedTime.innerText = `${hours}:${minutes}:${seconds}`;
    if (circrec.style.backgroundColor === "rgb(16, 13, 49)") {
      circrec.style.backgroundColor = "red";
    } else {
      circrec.style.backgroundColor = "#100d31";
    }
  }, 500);
});

start2.addEventListener("click", async function () {
  let stream = await recordwebCam();
  let mimeType = "video/mp4";
  setTimeout(() => {
    mediaRecorder = createRecorder(stream, mimeType);
    recordstart.textContent = "Started recording";
    recordend.textContent = "";
    circrec.style.backgroundColor = "red";
    handle = setInterval(() => {
      recordedtimeSecs += 500 / 1000;
      //convert seconds to hours minutes and seconds
      let hours = Math.floor(recordedtimeSecs / 3600),
        minutes = Math.floor(recordedtimeSecs / 60),
        seconds = Math.floor(recordedtimeSecs % 60);

      precordedTime.innerText = `${hours}:${minutes}:${seconds}`;
      if (circrec.style.backgroundColor === "rgb(16, 13, 49)") {
        circrec.style.backgroundColor = "red";
      } else {
        circrec.style.backgroundColor = "#100d31";
      }
    }, 500);
  }, 2000);
});

stop.addEventListener("click", function () {
  recordedtimeSecs = 0;
  mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  mediaRecorder.stop();
  recordend.textContent = "Stopped recording";
  recordstart.textContent = "";
  circrec.style.backgroundColor = "#100d31";
  clearInterval(handle);
});

async function recordScreen() {
  //create a  display media options object
  if (hasGetDisplayMedia()) {
    let displayMediaOptions = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        cursor: "always",
      },
      audio: true,
    };

    return await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } else {
    console.log("Screen Record get display media is not supported");
  }
}

async function recordwebCam() {
  //create a  display media options object
  if (hasGetUserMedia()) {
    let displayMediaOptions = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        cursor: "always",
      },
      audio: true,
    };
    return await navigator.mediaDevices.getUserMedia(displayMediaOptions);
  } else {
    console.log("User Media (Camera) not Supported");
  }
}

function createRecorder(stream, mimeType) {
  // the stream data is stored in this array
  let recordedChunks = [];

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.onstop = function () {
    //saveFile(recordedChunks);
    getSeekableBlob(new Blob(recordedChunks), function (seekableBlob) {
      saveFile(seekableBlob);
    });
    recordedChunks = [];
  };

  mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}

function saveFile(blob) {
  let filename = window.prompt("Enter file name"),
    downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${
    filename.length > 0 ? filename : "recordingAppkazuya"
  }.mp4`;

  document.getElementById("body").appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(blob); // clear from memory
  document.getElementById("body").removeChild(downloadLink);
}

function getSeekableBlob(inputBlob, callback) {
  // EBML.js copyrights goes to: https://github.com/legokichi/ts-ebml
  if (typeof EBML === "undefined") {
    throw new Error("Please link: https://cdn.webrtc-experiment.com/EBML.js");
  }
  var reader = new EBML.Reader();
  var decoder = new EBML.Decoder();
  var tools = EBML.tools;
  var fileReader = new FileReader();
  fileReader.onload = function (e) {
    var ebmlElms = decoder.decode(this.result);
    ebmlElms.forEach(function (element) {
      reader.read(element);
    });
    reader.stop();
    var refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas,
      reader.duration,
      reader.cues
    );
    var body = this.result.slice(reader.metadataSize);
    var newBlob = new Blob([refinedMetadataBuf, body], {
      type: "video/mp4",
    });
    callback(newBlob);
  };
  fileReader.readAsArrayBuffer(inputBlob);
}
