//!!! Für Livestream muss Programm neu gestartet, nicht nur neu geladen werden!!!


function handle_data(string) {
    // var data = JSON.parse(data);
    var data = {}
    var chunks = string.split("\n")
    chunks.forEach(chunk => {
        var type = ""
        var id = ""
        var value = ""
        var arg = 0
        for (chr of chunk) {
            if (chr == ",") {
                arg += 1
            }
            else {
                switch (arg) {
                    case 0:
                        type += chr
                        break
                    case 1:
                        id += chr
                        break
                    case 2:
                        value += chr
                        break
                }
            }
        }
        switch (type) {
            case "FLOAT":
                value = Number(value)
                break
            case "BOOLEAN":
                value = value == "True"
                break
        }
        data[id] = value

    })
    
    var calc = calculation(data["temperature_outside"], data["pressure_outside"]);
    for (id in calc){
        data[id] = calc[id];
    }
    dataset = data
    
    log(data)
}






var sqlite = require('sqlite3').verbose();
db = new sqlite.Database('./log/data.db');

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


