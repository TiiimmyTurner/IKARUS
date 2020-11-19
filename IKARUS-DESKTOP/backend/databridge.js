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
        var package = JSON.parse(data.toString())
        log(package);
        for (var x of package) {
            buffer.push(x);
        }
        if (!running) {
            running = true;
            read_buffer();
        }
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
        console.log(msg.toString());
    });

    uplink.on("exit", function (code, signal) {
        console.error("Uplink has stopped with code " + code.toString() + ".");
    });
    uplink.stderr.on('data', (data) => {
        console.error("An error occured with uplink:\n" + data.toString());
    });



});




var mqtt = require('mqtt');


var client = mqtt.connect('mqtt://192.168.0.115');
 
client.on('connect', function () {
  client.subscribe('data', function (err) {
  });
  console.log("connected");

});
 
client.on('message', function (topic, message) {
  
    var package = JSON.parse(data.toString())
    for (var x of package){
        buffer.push(x);
        log(x);
        console.log(x);
    }
    if(!running){
        running = true;
        read_buffer();
    }
    client.end()
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
    db.run(`CREATE TABLE IF NOT EXISTS ${launch} (time INT, pressure_outside INT, humidity_outside FLOAT)`);

});


function log(data) {
    let rows = [];
    db.each(`select * from pragma_table_info('${launch}')`, function (err, row) {
        rows.push(row.name);
    }, function (err, number) {

        db.serialize(() => {
            for (var record of data) {
                var union = [];
                for (var k in record) {
                    if (rows.includes(k)) union.push(k);
                };
                var into = "", values = "";
                for (var i = 0; i < union.length; i++) {
                    into += union[i];
                    values += record[union[i]].toString();
                    if (i < union.length - 1){
                        into += ",";
                        values += ",";
                    }
                   
                }
                //console.log(`INSERT INTO ${launch} (${into}) VALUES (${values})`);
                db.run(`INSERT INTO ${launch} (${into}) VALUES (${values})`);
            }
        })
    });





}


