// adapted from: https://github.com/abenjamin765/camera-app/blob/master/part-1/app.js

// Set constraints for the video stream
var constraints = { video: { facingMode: "environment" }, audio: false };
// video MediaStreamTrack object
var track;

// Define constants
const cameraViewport = document.querySelector("#camera-viewport");
const cameraCanvas   = document.querySelector("#camera-canvas");
const cameraImage    = document.querySelector("#camera-image");
const cameraButton   = document.querySelector("#camera-button");
const downloadButton = document.querySelector("#download-button");
const swapButton     = document.querySelector("#swap-camera-button");

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            track = stream.getTracks()[0];
            // webcamWidth, webcamHeight = track.getSettings()
            cameraViewport.srcObject = stream;
        })
        .catch(function(error) {
            console.error("Error reading camera stream.", error);
        });
}

// Take a picture when cameraTrigger is tapped
function get_image_data() {
    let w = cameraViewport.videoWidth;
    let h = cameraViewport.videoHeight;

    cameraImage.width  = w;
    cameraImage.height = h;

    cameraCanvas.width = w;
    cameraCanvas.height = h;

    cameraCanvas.getContext("2d").drawImage(cameraViewport, 0, 0, w, h);
    cameraImage.src = cameraCanvas.toDataURL("image/webp");

    let image_data = cameraCanvas.toDataURL("image/png").replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    cameraCanvas.getContext("2d").clearRect(0, 0, w, h)
    
    return image_data
};

swapButton.onclick = function() {
    if (constraints.video.facingMode == "environment") {
        constraints.video.facingMode = "user";
    } else if (constraints.video.facingMode == "user") {
        constraints.video.facingMode = "environment";
    }

    cameraStart();

    cameraCanvas.classList.toggle('flipped');
    cameraImage.classList.toggle('flipped');
    cameraViewport.classList.toggle('flipped');
}

// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);