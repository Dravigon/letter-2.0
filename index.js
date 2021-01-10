let toggleDiv=(id)=>{
  let toggleDivElement = document.getElementById(id);
  toggleDivElement.className+=" show-content";
  document.getElementById("qr-window").className += " show-focussed";
  this.disable=true;
};
function showIFRAMEWithScript(script){
  document.getElementById("qr-window").className += " render-data";
  document.getElementById("sandbox-frame").srcdoc = `
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script>
        ${script}
    </script>
</head>
<body>
    
</body>
</html>
  `;
}

let captureQRCode=()=>{

var video = document.createElement("video");
var canvasElement = document.getElementById("show-qr-from-camera");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("show-loading");
var outputMessage = document.getElementById("outputMessage");
var outputData = document.getElementById("outputData");

function testJSON(text) { 
  if (typeof text !== "string") { 
      return false; 
  } 
  try { 
      JSON.parse(text); 
      return true; 
  } catch (error) { 
      return false; 
  } 
} 

function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {  
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
  });

  function tick() {
    loadingMessage.innerText = "⌛ Loading video..."
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      loadingMessage.hidden = true;
      canvasElement.hidden = false;

      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
        outputData.innerText = code.data;
        if(testJSON(code.data)){
          let qrdata = JSON.parse(code.data);
          outputData.innerText = "acrual data "+ qrdata.author;
          if(qrdata.author){
            showIFRAMEWithScript(qrdata.code);
          }
        }
      } else {
        outputMessage.hidden = false;
        outputData.parentElement.hidden = true;
      }
    }
    requestAnimationFrame(tick);
  }
};