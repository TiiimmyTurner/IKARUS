//!!! Für Livestream muss Programm neu gestartet, nicht nur neu geladen werden!!!

var { spawn, exec } = require('child_process');

//Python-Pfad
new Promise((resolve) => {
    exec('python -c "import sys; print(sys.executable)"', function (error, stdout, stderr) {
        if (error) {
            console.error(error, stderr)
        }
        path = stdout.replaceAll("\\", "/");
        resolve(path.slice(0, path.length - 2))
    });
}).then((python) => {


    //downlink
    var downlink = spawn(python, ['backend/downlink.py']);

    downlink.stdout.on('data', (data) => {
        var lines = data.toString().split("\n");
        var data = JSON.parse(lines[0]);
        
        var calc = calculation(data["temperature_outside"], data["pressure_outside"]);
        for (id in calc){
            data[id] = calc[id];
        }
        dataset = data
        
        log(data)

    });

    downlink.on("exit", function (code, signal) {
        console.error("Downlink has stopped with code " + code.toString() + ".");
    });
    downlink.stderr.on('data', (data) => {
        console.error("An error occured with downlink:\n" + data.toString());
    });


    //uplink
    var uplink = spawn(python, ['backend/uplink.py']);

    //uplink.unref();

    uplink.stdout.on('data', (msg) => {
    });

    uplink.on("exit", function (code, signal) {
        console.error("Uplink has stopped with code " + code.toString() + ".");
    });
    uplink.stderr.on('data', (data) => {
        console.error("An error occured with uplink:\n" + data.toString());
    });



});




// var mqtt = require('mqtt');


// // var client = mqtt.connect('mqtt://test.mosquitto.org');
 
// var client  = mqtt.connect("mqtt://192.168.0.115", {clientId: 'bgtestnodejs', protocolId: 'MQIsdp', protocolVersion: 3, connectTimeout:1000, debug:true})

// client.on('connect', function () {
//   client.subscribe('/data', function (err) {
//   });
//   console.log("connected");

// });
 
// client.on('message', function (topic, message) {

//     var lines = data.toString().split("\n");
//     var data = JSON.parse(lines[0]);
    
//     var calc = calculation(x["temperature_outside"], x["pressure_outside"]);
//     for (id in calc){
//         x[id] = calc[id];
//     }
//     // dataset = data

//     // log(data);

// })


var sqlite = require('sqlite3').verbose();
db = new sqlite.Database('data.db');

function createTable(data) {
    db.serialize(function () {

        var columns = [];

        Object.keys(data).map( id => {
            if (!logblacklist.includes(id)) {
                var entry = id + " ";
                switch(typeof data[id]) {
                    case "boolean":
                        entry += "BOOLEAN";
                        break
                    case "number":
                        entry += "FLOAT";
                        break
                    default:
                        entry += "TEXT";
                        break
                }

                columns.push(entry);
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS ${data.launch} (${commafy(columns)})`);

    });    
}


function log(data) {
    Object.keys(data).map( id => {
        if (typeof data[id] == "number") {
            data[id] = +data[id].toFixed(3);
        }
    })

    if (!tables.includes(data.launch)) {
        createTable(data);
        tables.push(data.launch)
    }

    let columns = {};
    db.each(`SELECT * FROM PRAGMA_TABLE_INFO('${data.launch}')`, function (err, row) {
        columns[row.name] = row;
    }, function (err, number) {

            var union = [];

            for (var k in data) {
                if (Object.keys(columns).includes(k)){
                    union.push(k)
                };
            };

            var into = [], values = [];
            
            union.map( id => {

                if (data[id]) {

                    into.push(id.toString());

                    if (columns[id].type == "TEXT") {
                        values.push('"' + data[id] + '"');
                    }
                    else {
                        values.push(data[id])
                    }

                }
                
            })

            db.run(`INSERT INTO ${data.launch} (${commafy(into)}) VALUES (${commafy(values)})`);
            
        });




}


