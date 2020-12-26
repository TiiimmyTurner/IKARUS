const fs = require('fs');

setInterval(update, updateDelay);

function calculation(temperature, pressure) {
    R = 8.31446261815324;
    g = 9.81;

    //initial conditions
    const height0 = 300;
    const v0 = 905;
    const temperature0 = 20;
    const mass_balloon = 0.1;
    const mass_probe = 0.3;

    const pressure0 = 1013.25;
    var mass_gas = 4.002602 * pressure0 * v0 / R / (temperature0 + 273.15) / 1000;
    var v = v0 * (temperature + 273.15) * pressure0 / (temperature0 + 273.15) / pressure;
    var mass_environment = 28.949 * pressure * v / R / (temperature + 273.15) / 1000;
    var mass = mass_balloon + mass_probe + mass_gas;

    var acceleration = (g * mass_environment - g * mass) / mass;
    var thrust = mass_environment - mass_gas;
    var relative_volume = v / v0;
    var relative_radius = Math.pow(relative_volume, 1 / 3);
    var altitude = (temperature + 273.15) / 0.0065 * (Math.pow(pressure0 / pressure, 1 / 5.257) - 1);


    return {
        "acceleration": acceleration,
        "thrust": thrust, 
        "volume_balloon": v,
        "relative_volume": relative_volume, 
        "relative_radius": relative_radius, 
        "altitude": altitude
    };

}



//responsive font-size

function adaptFont() {
    document.querySelectorAll(".dataline a").forEach((element) => {



        /*
        if (element.clientWidth > element.parentElement.clientWidth - 6 || element.clientHeight > element.parentElement.clientHeight - 4){
            element.setAttribute("style", "font-size: " + (element.style.fontSize - 1).toString() + "px");
        }
        

        */
        element.setAttribute("style", "font-size: " +
            Math.min(
                (() => {
                    if (window.innerWidth <= 1550) {
                        return 15 - Math.floor((1550 - window.innerWidth) / 100);
                    }

                    else {
                        return 16;
                    }
                })(),

                (() => {
                    if (document.querySelector(".dataline").offsetHeight <= 35) {
                        return 15 - Math.floor((35 - document.querySelector(".dataline").offsetHeight) / 5)
                    }
                    else {
                        return 16;
                    }
                })()
            ).toString()


            + "px;");

    });
}

function update() {
    reload();
    adaptFont();
    //if (dataset["time"] == 0){return}
    rotations.x = dataset.rotation_x;
    rotations.y = dataset.rotation_y;

    //Map
    if(!mapMouseDown && now.getTime() - lastMapPan >= mapUpdateDelay && isMapLoaded && dataset["gps_x"] != null && dataset["gps_x"] != null) {
        lastMapPan = now.getTime();
        updatePosition([dataset["gps_x"], dataset["gps_y"]]);
    }

    //Commands for uplink   
    fs.appendFile('temporary/commands.txt', commands, (err) => { if (err) throw err; })
    commands = '';

    //Videostream
    if ( !(async () => Boolean(VIDEOSTREAM) || (await fetch(VIDEOSTREAM)).ok)() ) {
        var html = document.getElementBy("cam").innerHTML;
        document.getElementBy("cam").innerHTML = html;

    }
}