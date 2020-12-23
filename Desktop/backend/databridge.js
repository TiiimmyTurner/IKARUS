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




var mqtt = require('mqtt');


var client = mqtt.connect('mqtt://broker.192.168.0.115');
 
client.on('connect', function () {
  client.subscribe('data', function (err) {
  });
  console.log("connected");

});
 
client.on('message', function (topic, message) {

    var lines = data.toString().split("\n");
    var data = JSON.parse(lines[0]);
    
    var calc = calculation(x["temperature_outside"], x["pressure_outside"]);
    for (id in calc){
        x[id] = calc[id];
    }
    dataset = data

    // log(data);

})


var sqlite = require('sqlite3').verbose();
db = new sqlite.Database('data.db');

db.serialize(function () {
    /*db.each(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${launch}'`, function (err, row) {
    }, (err, count)=>{
        if (count == 0){
            db.run(`CREATE TABLE ${launch} (id INT, dt TEXT)`)
        }
    });*/
    var columns = [];
    for (id in dataset){
        columns.push(id + " FLOAT");
    }
    db.run(`CREATE TABLE IF NOT EXISTS ${launch} (${commafy(dataset).replaceAll(",", " FLOAT,")})`);

});

function log(data) {
    let columns = [];
    db.each(`SELECT * FROM PRAGMA_TABLE_INFO('${launch}')`, function (err, row) {
        columns.push(row.name);
    }, function (err, number) {

        //db.serialize(() => {
            var union = [];
            for (var k in data) {
                if (columns.includes(k)) union.push(k);
            };
            var into = "", values = "";
            
            for (var i = 0; i < union.length; i++) {

                if (data[union[i]]) {

                    into += union[i].toString();
                    values += data[union[i]];
                    if (i < union.length - 1){
                        into += ",";
                        values += ",";
                    }

                }
                
            }
            
            db.run(`INSERT INTO ${launch} (${into}) VALUES (${values})`);
            
        })
    /*/)*/;




}


