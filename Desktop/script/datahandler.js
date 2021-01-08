//!!! Für Livestream muss Programm neu gestartet, nicht nur neu geladen werden!!!

var sqlite = require('sqlite3').verbose();
db = new sqlite.Database('./log/data.db');
db.each("SELECT name FROM sqlite_master WHERE type='table'", (_err, row) => {

    tables.push({ name: row.name, columns: [] })

}, () => {
    let task = () => loaded.sql = true
    tables.forEach(table => {

        let then = task
        task = () => db.each(`SELECT name, type FROM PRAGMA_TABLE_INFO('${table.name}')`, (err, column) => {
            table.columns.push(column)
        }, then)

    })
    task()

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

function handle_data(string) {
    // var data = JSON.parse(data);
    var data = {}
    var types = {}
    var chunks = string.split("\n")
    chunks.forEach(chunk => {
        let args = chunk.split(",")

        var type = args[0]
        var id = args[1]
        var value = args[2]

        switch (type) {
            case "FLOAT":
                value = +value.toFixed(3)
                break
            case "BOOLEAN":
                value = value == "True"
                break
        }
        if (value = "None") {
            value = null
        }
        data[id] = value
        types[id] = type

    })

    var calc = calculation(data["temperature_outside"], data["pressure_outside"]);
    for (id in calc) {
        data[id] = calc[id];
    }

    if (dataset.latitude && dataset.longitude) {
        latest_position = {latitude: dataset.latitude, longitude: dataset.longitude}
    }
    else {
        if (data.launch == dataset.launch) {
            // handeled before
        }
        else {
            if (tables[data.launch]) {
                db.each(`SELECT latitude, longitude, MAX(time) FROM ${data.launch}`, (_err, row) => {
                    latest_position = {latitude: row.latitude, longitude: row.longitude}
                })
            }
            else {
                latest_position = null
            }
        }
    }

    dataset = data
    nodata = false



    // SQL logging
    new Promise(resolve => {
        if (tables.includes(dataset.launch)) {
            resolve()
        }
        else {
            createTable(dataset.launch, types).then(resolve)
        }

    }).then(() => {


        let columns = tables[dataset.launch].columns
        let columnNames = columns.map(column => column.name)
        var common = Object.keys(dataset).filter(id => columnNames.includes(id))


        var into = [], values = [];

        common.forEach(id => {

            if (dataset[id]) {

                into.push(id.toString());

                if (columns[id].type == "TEXT") {
                    values.push('"' + dataset[id] + '"');
                }
                else {
                    values.push(dataset[id])
                }

            }

        })

        db.run(`INSERT INTO ${dataset.launch} (${into.toString()}) VALUES (${values.toString()})`);

    });



}


function createTable(name, types) {
    return new Promise(resolve => {
        db.run(`CREATE TABLE IF NOT EXISTS ${name} (${Object.keys(types).map(id => `${id} ${types[id]}`).toString()})`, () => {
            tables.push({ name: name, columns: Object.keys(types).map(id => ({ name: id, type: types[id] })) })
            resolve();
        });
    })

}
