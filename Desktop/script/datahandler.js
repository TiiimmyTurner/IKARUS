//!!! Für Livestream muss Programm neu gestartet, nicht nur neu geladen werden!!!

var sqlite = require('sqlite3').verbose();
db = new sqlite.Database('./log/data.db');
db.each("SELECT name FROM sqlite_master WHERE type='table'", (_err, row) => {

    tables.push({ name: row.name, columns: [] })

}, async () => {
    for (var table of tables) {
        await new Promise(resolve => db.each(`SELECT name, type FROM PRAGMA_TABLE_INFO('${table.name}')`, (err, column) => {
            table.columns.push({ name: column.name, type: column.type })
        }, resolve))
    }

    loaded.sql = true
})



function calculation(temperature, pressure) {
    R = 8.31446261815324;
    g = 9.81;

    //initial conditions
    const height0 = 300;
    const v0 = 905;
    const temperature0 = 20;
    const mass_balloon = 0.1;
    const mass_probe = 0.3;

    const pressure0 = 1013.25;
    var mass_gas = 4.002602 * pressure0 * v0 / R / (temperature0 + 273.15) / 1000;
    var v = v0 * (temperature + 273.15) * pressure0 / (temperature0 + 273.15) / pressure;
    var mass_environment = 28.949 * pressure * v / R / (temperature + 273.15) / 1000;
    var mass = mass_balloon + mass_probe + mass_gas;

    var acceleration = (g * mass_environment - g * mass) / mass;
    var thrust = mass_environment - mass_gas;
    var relative_volume = v / v0;
    var relative_radius = Math.pow(relative_volume, 1 / 3);
    var altitude = (temperature + 273.15) / 0.0065 * (Math.pow(pressure0 / pressure, 1 / 5.257) - 1);


    return {
        "acceleration": acceleration,
        "thrust": thrust,
        "volume_balloon": v,
        "relative_volume": relative_volume,
        "relative_radius": relative_radius,
        "altitude": altitude
    };

}

async function handle_data(string) {

    var data = {}
    var types = {}
    var chunks = string.split("\n")
    chunks.forEach(chunk => {
        let args = chunk.split(",")

        var type = args[0]
        var id = args[1]
        var value = args[2]

        if (value == "None") {
            value = null
        }

        else {
            switch (type) {
                case "FLOAT":

                    if (["latitude", "longitude"].includes(id)) {
                        value = +value
                    }
                    else {
                        value = +(+value).toFixed(4)
                    }
                    break

                case "BOOLEAN":
                    value = value == "True"
                    break

                default:
                    // stays string
                    break
            }
        }



        data[id] = value
        types[id] = type

    })
    if(Number(data.temperature_outside) && Number(data.pressure_outside)) {
        var calc = calculation(data.temperature_outside, data.pressure_outside);
        for (id in calc) {
            data[id] = +calc[id].toFixed(4);
            types[id] = "FLOAT"
        }        
    }


    if (Number(dataset.latitude) && Number(dataset.longitude)) {
        latest_position = { latitude: dataset.latitude, longitude: dataset.longitude }
    }
    else {
        if (data.launch == dataset.launch) {
            // handeled before
        }
        else {

            latest_position = null

            if (tables.filter(table => table.name == data.launch)[0]) {
                async function call() {
                    let positions = []
                    await new Promise(resolve => {
                        db.each(`SELECT latitude, longitude, time FROM ${data.launch}`, (_err, row) => {
                            if (Number(row.latitude) && Number(row.longitude)) {
                                positions.push(row)
                            }
                        }, resolve)
                    })

                    if (positions.length > 0) {

                        latest = positions.reduce((previous, current) => {
                            if (current.time > previous.time) {
                                return current
                            }
                            else {
                                return previous
                            }
                        }, positions[0])

                        latest_position = { latitude: latest.latitude, longitude: latest.longitude }                        
                    }

                }

                call()

            }
        }
    }





    // SQL logging
    new Promise(resolve => {
        var table;
        if (table = tables.filter(table => table.name == data.launch)[0]) {
            resolve(table)
        }
        else {
            createTable(data.launch, types).then(resolve)
        }

    }).then((table) => {

        let columns = table.columns
        let columnNames = columns.map(column => column.name)
        var common = Object.keys(data).filter(id => columnNames.includes(id))


        var into = [], values = [];

        common.forEach(id => {

            if (data[id] || data[id] == 0) {

                into.push(id.toString());

                if (columns.filter(column => column.name == id)[0].type == "TEXT") {
                    values.push('"' + data[id] + '"');
                }
                else {
                    values.push(data[id])
                }

            }

        })

        db.run(`INSERT INTO ${data.launch} (${into.toString()}) VALUES (${values.toString()})`, err => err ? console.log(err) : {});

    });
    
    if( !dataset.time || data.time > dataset.time){
        Object.assign(dataset, data)
    }



}


function createTable(name, types) {
    return new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS ${name} (${Object.keys(types).map(id => `${id} ${types[id]}`).toString()})`, () => {
            table = { name: name, columns: Object.keys(types).map(id => ({ name: id, type: types[id] })) }
            tables.push(table)
            resolve(table);
        });
    })

}
