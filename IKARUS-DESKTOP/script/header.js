line = document.getElementById("line");
square = document.getElementById("square");
cross = document.getElementById("cross");




/* tech-stuff here */
square.onclick = () => {
    if (win.isMaximized()){
        win.unmaximize();

    }
    else {
        win.maximize();
    }
}

line.onclick = () => {
    win.minimize();
};

cross.onclick = () => {
    win.close();
}
