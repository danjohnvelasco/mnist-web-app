// Get any element
var element = x => document.getElementById(x);

// Find canvas element
var canvas = document.getElementById("canvas");

// Set canvas context
var context = canvas.getContext("2d");

// Set canvas color
context.fillStyle = "black";
context.fillRect(0, 0, canvas.width, canvas.height);

// set brush color and width
context.strokeStyle = "white";
context.lineCap = "round";
context.lineWidth = 13;

// Attach event listeners to canvas element
canvas.addEventListener('mousemove', draw, false); // Mouse movement
canvas.addEventListener('mouseup', setPosition, false); // Button released
canvas.addEventListener('mousedown', setPosition, false); // Button clicked

// Mouse pointer coordinates
var pos = {x: 0, y : 0};

// Function responsible for drawing. Executed only when mouse is moving
function draw (ev) {
    if (ev.buttons == 1 || first != null) { // if button isn't pressed
        context.beginPath();

        context.moveTo(pos.x, pos.y); // from position
        setPosition(ev);
        context.lineTo(pos.x, pos.y); // to position

        context.stroke();
    } else {
        console.log("mousevent / touch fail");
        return
    }
}

// Support mobile touch
var first;

function touchHandler(event)
{
    var touches = event.changedTouches,
        type = "";

    first = touches[0];
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; console.log("start"); break;
        case "touchmove":  type = "mousemove"; console.log("move"); break;
        case "touchend":   type = "mouseup";   console.log("end"); break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //                screenX, screenY, clientX, clientY, ctrlKey,
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent", "buttons");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                                  first.screenX, first.screenY,
                                  first.clientX, first.clientY, false,
                                  false, false, false, 0/*left*/, null);

    canvas.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

function init()
{
    canvas.addEventListener("touchstart", touchHandler, true);
    canvas.addEventListener("touchmove", touchHandler, true);
    canvas.addEventListener("touchend", touchHandler, true);
    canvas.addEventListener("touchcancel", touchHandler, true);
}

init();

// Function responsible for updating mouse pointer coordinates
// offsetX, offsetY return x,y coordinate of mouse pointer relative to element
function setPosition (ev) {
    console.log("setPosition");
    pos.x = ev.offsetX;
    pos.y = ev.offsetY;
}

/*
// Mobile touch controls
// Set up touch events for mobile, etc
canvas.addEventListener("touchstart", function (e) {
    console.log("touchstart");
    mousePos = getTouchPos(canvas, e);
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", setPosition);
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchend", function (e) {
    console.log("touchend");
    var mouseEvent = new MouseEvent("mousemove", setPosition);
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchmove", function (e) {
    console.log("touchmove");
    var touch = e.touches[0];
    var mouseEvent = new MouseEvent("mousemove", draw);
    canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  pos.x = touchEvent.touches[0].clientX - rect.left;
  pos.y = touchEvent.touches[0].clientY - rect.top;
}*/

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

element("clear-button").addEventListener('click', function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
}, false);

var img_dim = 28;
function analyze () {
    var file, img64, buffer, ctx, img,
    formData, xhr, loc;

    // create buffer canvas
    buffer = document.createElement('canvas');
    buffer.width = img_dim;
    buffer.height = img_dim;
    ctx = buffer.getContext('2d');

    // converts to 28 x 28 images
    img = Canvas2Image.convertToImage(canvas, img_dim, img_dim, "png");

    formData = new FormData();
    xhr = new XMLHttpRequest();
    loc = window.location;

    xhr.open("POST", `${loc.protocol}//${loc.hostname}:${loc.port}/analyze`,
      true);

    xhr.onerror = function() {
      alert(xhr.responseText);
    };

    xhr.onload = function(ev) {
      if (this.readyState === 4) {
        var response = JSON.parse(ev.target.responseText);
        element("result-label").innerHTML = `Result = ${response["result"]}`;
        console.log("onload done");
      }
      element("analyze-button").innerHTML = "Analyze";
    };

    img.onload = function() {
        ctx.drawImage(img, 0, 0, img.width, img.height,0,0,img_dim,img_dim);

        // for displaying image
        test = Canvas2Image.convertToImage(buffer, img_dim, img_dim, "png");
        document.body.appendChild(test);

        // base64 to blob then send to server
        img64 = buffer.toDataURL("image/png");
        file = dataURItoBlob(img64);
        formData.append("file", file);
        xhr.send(formData);
    }

/* upload image feature
    element("analyze-button").innerHTML = "Analyzing...";
    upload = element("file-input").files;
    formData.append("file", upload[0]);
    xhr.send(formData);*/
}
