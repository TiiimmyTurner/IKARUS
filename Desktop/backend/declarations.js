// parameters
var mapUpdateDelay = 1000;
var mapPanDelayAfterDrag = 200;
var updateDelay = 20;
var checkStreamDelay = 30000
var recordCount = 40;
var chunkTime = 60;
const RASPBERRYPI = "192.168.0.115";
const VIDEOSTREAM = `http://${RASPBERRYPI}:8000/stream.mjpg`

// global variables
var map;
var marker;
var isMapLoaded = false;
var mapMouseDown = false;
var commands = "Dew it!";
var lastMapPan = 0;
var lastStreamCheck = 0;
var control_pressed = false;

var parameterEncoding = {

    "temperature_inside": "",
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

function getParameterDescription(id) {
    var name;
    if (id.includes("inside")) {
        name = "Innen"
    }
    if (id.includes("outside")) {
        name = "Au\u00DFen"
    }
    if (name) {
        if (id.includes("pressure")){
            name += "druck"
        }
        if (id.includes("temperature")){
            name += "temperatur"
        }
    }
    if (id == "altitude") {
        name = "H\u00F6he"
    }
    if (id == "humidity_outside") {
        name = "Luftfeuchtigkeit"
    }
    if (id.includes("relative")) {
        if (id.includes("radius")) {
            name = "relativer Radius"
        }
        if (id.includes("volume")) {
            name = "relatives Volumen"
        }
    }
    return name;
}
dataset = {}

var win = require('electron').remote.BrowserWindow.getFocusedWindow();
var chart;
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
var loaded = {};
var tables = [];
var logblacklist = [ "rotation_z", "rotation_y", "rotation_x", "satellites", "launch" ];
var videostream_active = false;
