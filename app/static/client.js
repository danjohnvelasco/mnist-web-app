// Get any element
var element = x => document.getElementById(x);

// Find canvas element
var canvas = document.getElementById("canvas");

// Set canvas context
var context = canvas.getContext("2d");

// Set canvas color
context.fillStyle = "white";
context.fillRect(0, 0, canvas.width, canvas.height);

// Attach event listeners to canvas element
canvas.addEventListener('mousemove', draw, false); // Mouse movement
canvas.addEventListener('mouseup', setPosition, false); // Button released
canvas.addEventListener('mousedown', setPosition, false); // Button clicked

// Mouse pointer coordinates
var pos = {x: 0, y : 0};

// Function responsible for drawing. Executed only when mouse is moving
function draw (ev) {
    if (ev.buttons != 1) { // if button isn't pressed
        return;
    }

    context.beginPath();

    context.moveTo(pos.x, pos.y); // from position
    console.log("x: " + pos.x + " y: " + pos.y);
    setPosition(ev);
    context.lineTo(pos.x, pos.y); // to position

    context.stroke();
}

// Function responsible for updating mouse pointer coordinates
// offsetX, offsetY return x,y coordinate of mouse pointer relative to element
function setPosition (ev) {
    pos.x = ev.offsetX;
    pos.y = ev.offsetY;
}

function b64ToUint8Array(b64Image) {
   var img = atob(b64Image.split(',')[1]);
   var img_buffer = [];
   var i = 0;
   while (i < img.length) {
      img_buffer.push(img.charCodeAt(i));
      i++;
   }
   return new Uint8Array(img_buffer);
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:mimeString});
}


function analyze () {
/*
    var img = canvas.toDataURL("image/png");
    var file = dataURItoBlob(img);
*/
    var fileData = new FormData();

    canvas.toBlob(function(blob) {
      var img = document.createElement('img'),
          url = URL.createObjectURL(blob);

      img.onload = function() {
        // no longer need to read the blob so it's revoked
        URL.revokeObjectURL(url);
      };

      img.src = url;
      document.body.appendChild(img);
      fileData.append("file", img[0]);
    });

    element("analyze-button").innerHTML = "Analyzing...";

    var xhr = new XMLHttpRequest();
    var loc = window.location;

    xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/analyze`,
      true);

    xhr.onerror = function() {
      alert(xhr.responseText);
    };

    xhr.onload = function(ev) {
      if (this.readyState === 4) {
        var response = JSON.parse(ev.target.responseText);
        element("result-label").innerHTML = `Result = ${response["result"]}`;
      }
      element("analyze-button").innerHTML = "Analyze";
    };

    xhr.send(fileData);
}
