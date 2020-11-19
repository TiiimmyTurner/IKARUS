var map;
var marker;
var isMapLoaded = false;
var commands = "Dew it!";
var lastUpdate = 0;
var dataset = {

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
    "launch": 0

}

var buffer = [];
var running = false;
var win = require('electron').remote.BrowserWindow.getFocusedWindow();
var now = new Date();
var chart;
launch = "x";