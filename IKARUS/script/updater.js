setInterval(update, 500);


const fs = require('fs');

function update(){
    if (dataset["time"] == 0){return}
    const display = ["humidity_inside", "humidity_outside", "pressure_inside", "pressure_outside", "temperature_inside", "temperature_outside"];
    const units = {
        "humidity_inside":"%",
        "humidity_outside":"%",
        "pressure_inside":"hPa",
        "pressure_outside": "hPa",
        "temperature_inside":"°C",
        "temperature_outside":"°C",
        "altitude": "m",
        "relative_volume": "%",
        "relative_radius": "%"
    }

    function set(id, val, d, unit = true){
        if(unit){
            document.getElementById(id).innerHTML = +val.toFixed(d) + " " + units[id];
        }
        else{
            document.getElementById(id).innerHTML = +val.toFixed(d)
        }
    }

    function calculated_data(temperature, pressure){
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
        var relative_volume = v/v0;
        var relative_radius = Math.pow(relative_volume, 1/3);
        var altitude = (temperature + 273.15)/0.0065 * (Math.pow(pressure0/pressure, 1/5.257)-1);
    
        return {"acceleration": acceleration, "thrust": thrust, "volume_balloon": v,
                "relative_volume": relative_volume, "relative_radius": relative_radius, "altitude": altitude}
    
    }

    //calculating additional values for current dataset
    var calc = calculated_data(dataset["temperature_outside"], dataset["pressure_outside"]);
    
    //humidity, pressure and temperature
    for(var x in dataset){
        if(display.includes(x)){
            if(x.includes("temperature")){
                set(x, dataset[x], 1);
            }
            else{
                set(x, dataset[x], 0);
            }
        }
        else if(x.includes("rotation")){
            rotations[x[x.length - 1]] = dataset[x];
        }
    }

    //Expanse of Balloon
    set("relative_volume", calc["relative_volume"] * 100, 0)
    set("relative_radius", calc["relative_radius"] * 100, 0)

    //Map
    if(isMapLoaded){
        updatePosition([dataset["gps_x"], dataset["gps_y"]]);
    }

    //Altitude
    set("altitude", calc["altitude"], 0);

    //Commands for uplink
    
    fs.appendFile('temp/commands.txt', commands, (err) => {if (err) throw err;})
    commands = '';
    

}