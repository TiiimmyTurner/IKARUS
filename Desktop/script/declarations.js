// parameters
var mapUpdateDelay = 1000;
var mapPanDelayAfterDrag = 200;
var updateDelay = 20;
var checkServerDelay = 15000
var recordCount = 40;
var chunkTime = 60;
const RASPBERRYPI = "192.168.0.115";
const HTTPSERVER = `http://${RASPBERRYPI}:8000`

// global variables
var map;
var marker;
var mapMouseDown = false;
var commands = "Dew it!";
var lastMapPan = 0;
var lastServerCheck = 0;
var keys = {};


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
var dataset = {}

var win = require('electron').remote.BrowserWindow.getFocusedWindow();
var chart;

function reload(){};
var loaded = {};
var tables = [];
var logblacklist = [ "rotation_z", "rotation_y", "rotation_x", "satellites", "launch" ];
var connected = false
var receiving = false
var nodata = true
var latest_position = null


