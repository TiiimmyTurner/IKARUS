// parameters
var mapUpdateDelay = 1000;
var mapPanDelayAfterDrag = 200;
var updateDelay = 20;
var checkServerDelay = 30000
var recordCount = 40;
var chunkTime = 60;
const SONDE = "192.168.0.160";
const DONGLE = "192.168.0.195"
var server = {
    dongle: {
        ip: DONGLE,
        http: `http://${DONGLE}:8001`,
        connected: false,
        data: false
    },
    sonde: {
        ip: SONDE,
        http: `http://${SONDE}:8000`,
        connected: false,
        data: false
    }
}

// global variables
const jQuery = require("jquery")
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

var live = false
var latest_position = null


