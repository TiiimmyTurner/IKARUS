const { remote } = require('electron');
var line = document.getElementById("line");
var square = document.getElementById("square");
var cross = document.getElementById("cross");

/*
line.onmouseover = () => {
    square.setAttribute("style", "border-radius: 0px 0px 0px 8px;");
};

line.onmouseleave = () => {
    square.setAttribute("style", "border-radius: 0px 0px 0px 0px;");
};



square.onmouseover = () => {
    line.setAttribute("style", "border-radius: 0px 0px 8px 0px;");
    cross.setAttribute("style", "border-radius: 0px 0px 0px 8px;");
};

square.onmouseleave = () => {
    line.setAttribute("style", "border-radius: 0px 0px 0px 0px;");
    cross.setAttribute("style", "border-radius: 0px 0px 0px 0px;");
};



cross.onmouseover = () => {
    square.setAttribute("style", "border-radius: 0px 0px 8px 0px;");
};

cross.onmouseleave = () => {
    square.setAttribute("style", "border-radius: 0px 0px 0px 0px;");
};

*/
square.onclick = () => {
    console.log(document.documentElement.clientWidth);
    if (window.innerHeight == document.documentElement.clientHeight && window.innerWidth == document.documentElement.clientWidth && false){
        window.resizeTo(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 2);
        window.moveTo(document.documentElement.clientWidth / 4, document.documentElement.clientHeight / 4);

    }
    else {
    window.moveTo(0, 0);
    window.resizeTo(screen.width, screen.height);
    }
}
line.onclick = () => {
    remote.BrowserWindow.getCurrentWindow().minimize();
};

cross.onclick = () => {
    window.close();
};