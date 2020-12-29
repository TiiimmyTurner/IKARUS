
function updateFrame() {

    var cam = document.querySelector("#cam > img");
    if (!cam) {
        return
    }


    //resizing

    var ratio = cam.naturalHeight / cam.naturalWidth;
    var w = document.getElementById("cam").offsetWidth;
    var h = document.getElementById("cam").offsetHeight;

    if (h / w > ratio) {
        cam.setAttribute("width", "100%");
        cam.setAttribute("height", w * ratio);
    }
    else {
        cam.setAttribute("height", "100%");
        cam.setAttribute("width", h / ratio);
    }
}
setInterval(() => { updateFrame(); }, 10);