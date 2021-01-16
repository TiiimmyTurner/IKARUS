const fs = require('fs');
const { resolve } = require('path');
const http = require("http")
const SerialPort = require("serialport")
const usb = require("usb")


setInterval(update, updateDelay);
jQuery("body").flowtype({ fontRatio: 110, minFont: 10 })




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
    if (now.getTime() - lastServerCheck >= checkServerDelay) {
        lastServerCheck = now.getTime()

        http.get(server.sonde.http, _res => {


            if (!server.sonde.connected) {
                http.get(`${server.sonde.http}/data`, res => {

                    res.on('data', async function (buf) {
                        await handle_data(buf.toString())
                        server.sonde.data = true
                    });

                    res.on('end', function () {
                        server.sonde.connected = false
                        server.sonde.data = false
                    });
                })
            }
            server.sonde.connected = true


        }).on('error', e => {
            server.sonde.connected = false
            server.sonde.data = false
        })




        http.get(server.dongle.http, _res => {

            if (!server.dongle.connected) {
                http.get(`${server.dongle.http}/data`, res => {

                    res.on('data', async function (buf) {
                        await handle_data(buf.toString())
                        server.dongle.data = true
                    });

                    res.on('end', function () {
                        server.dongle.connected = false
                        server.dongle.data = false
                        console.log("end")
                    });
                })

            }
            server.dongle.connected = true
        }).on('error', e => {
            server.dongle.connected = false
            server.dongle.data = false
        })



    }

    live = server.sonde.data || server.dongle.data

    // Map
    if (latest_position) {

        if (!marker) {
            marker = new google.maps.Marker({
                position: { lat: latest_position.latitude, lng: latest_position.longitude },
                map: map
            });
            map.setZoom(13)
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

    if (live) {
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