// parameters
var mapUpdateDelay = 1000;
var mapPanDelayAfterDrag = 200;
var updateDelay = 20;
var checkStreamDelay = 0
const RASPBERRYPI = "192.168.0.115";
const VIDEOSTREAM = `http://${RASPBERRYPI}:8000/stream.mjpg`

// global variables
var map;
var marker;
var isMapLoaded = false;
var mapMouseDown = false;
var commands = "Dew it!";
var lastMapPan = 0;
dataset = {

    "temperature_inside": 0,
    "temperature_outside": 20.234,
    "pressure_inside": 0,
    "pressure_outside": 1013,
    "humidity_inside": 25.345,
    "humidity_outside": 0,
    "rotation_x": 1,
    "rotation_y": 1,
    "rotation_z": 4,
    "gps_x": 48.001,
    "gps_y": 11,
    "time": 0,
    "launch": 0,
    "acceleration": 0,
    "thrust": 0, 
    "volume_balloon": 0,
    "relative_volume": 0, 
    "relative_radius": 0, 
    "altitude": 0

}

var win = require('electron').remote.BrowserWindow.getFocusedWindow();
var now = new Date();
var chart;
launch = "x";
function commafy(arr){
    var str = "";
    if(!Array.isArray(arr)) arr = Object.keys(arr);
    for (var i = 0; i < arr.length; i++){
        str += arr[i];
        if (i < arr.length - 1){
            str += ", ";
        }
    }
    return str;
}
function reload(){};
