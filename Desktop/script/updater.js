const fs = require('fs');
const { resolve } = require('path');
const http = require("http")
const SerialPort = require("serialport")
const usb = require("usb")


setInterval(update, updateDelay);
jQuery("body").flowtype({ fontRatio: 100, minFont: 10 })


// port = new SerialPort();
// port.write("some data");
// port.on("data", (data) => {
//     console.log(data);
// });

SerialPort.list((err, ports) => {
    ports.forEach((port) => {
        console.log(port.comName);
    });
});


//responsive font-size

function adaptFont() {
    document.querySelectorAll(".text.list").forEach((element) => {



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
                    if (document.querySelector(".list.row").offsetHeight <= 35) {
                        return 15 - Math.floor((35 - document.querySelector(".list.row").offsetHeight) / 5)
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
    if (!(loaded.react && loaded.map && loaded.gyro && loaded.sql)) {
        return
    }
    now = new Date();
    reload();
    //adaptFont();

    // HTTP-Server
    if (!connected) {
        if (now.getTime() - lastServerCheck >= checkServerDelay) {
            lastServerCheck = now.getTime();

            http.get(HTTPSERVER, res => {
                connected = true

                if (!receiving) {
                    receiving = true
                    http.get(`${HTTPSERVER}/data`, res => {

                        res.on('data', function (buf) {
                            handle_data(buf.toString())
                        });

                        res.on('end', function () {
                            receiving = false
                            connected = false
                            nodata = true
                        });
                    })
                }

            })
                .on('error', e => connected = false);
        }
    }


    // Map
    if (latest_position) {

        if (!marker) {
            marker = new google.maps.Marker({
                position: formalize(latest_position.latitude, latest_position.longitude),
                map: map
            });
            map.setZoom(10)
        }


        if (!mapMouseDown && now.getTime() - lastMapPan >= mapUpdateDelay) {
            lastMapPan = now.getTime();
            updatePosition(latest_position.latitude, latest_position.longitude);
        }
    }
    else {
        if (marker) {
            marker.setMap(null)
            marker = null
            map.panTo({ lat: 0, lng: 0 })
            map.setZoom(2)
        }
    }

    if (!nodata) {
        rotations.x = dataset.rotation_x;
        rotations.y = dataset.rotation_y;
    }




    // Commands for uplink   
    // fs.appendFile('temporary/commands.txt', commands, (err) => { if (err) throw err; })
    // commands = '';







    if (!win.started) {
        win.start();
    }

}