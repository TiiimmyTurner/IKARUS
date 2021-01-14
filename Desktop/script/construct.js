import React from 'react';
import ReactDOM from 'react-dom';
// import $ from "jquery";

function flip(ids) {
    return () => {
        document.getElementById("frontside").setAttribute("style", "transform: rotateY(180deg);");
        document.getElementById("backside").setAttribute("style", "transform: rotateY(360deg); height: 100%; width: 100%;");
    
        
/*
        var wrappers = document.querySelectorAll("#data .values.auxiliary > *");
        for (var element of wrappers) {
            if (element == wrappers[0]) {
                element.setAttribute("style", "border-radius: 8px 8px 0px 0px; height: 20%; transition-delay: 0s;");
            }
            else if (element == wrappers[wrappers.length - 1]) {
                element.setAttribute("style", "border-radius: 0px 0px 8px 8px; height: 20%; transition-delay: 0s;");
            }
            else {
                element.setAttribute("style", "border-radius: 0px; height: 20%; transition-delay: 0s;");
            }
        }
*/
        setTimeout(spawnChart(ids), 250);
    }
    
}

class CMD extends React.Component {
    render() {

    }
}

function getValue(options={ id, unit, description, decimals, factor, get }) {
    options.factor = options.factor ? options.factor : 1;
    return {
        id: options.id,
        description: options.description,
        get: () => {
            if (options.get) {
                try {
                    var result = options.get();
                    if (!result) {
                        return ""
                    }
                    return result
                }
                catch (e) {
                    return "";   
                }
            }
            if (!global.dataset[options.id] || global.nodata) {
                return ""
            }
            return (global.dataset[options.id] * options.factor).toFixed(options.decimals) + (options.unit ? " " + options.unit : "")
        }
    }
}

class Row extends React.Component {
    render() {
        var itemStyle = {
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }
        
        var descriptionPortion = this.props.descriptionPortion ? this.props.descriptionPortion : 0.2;
        var valuePortion = (1 - descriptionPortion) / this.props.values.length;
        var description = <div className="textwrapper list description" style={{...itemStyle, width: descriptionPortion * 100 + "%", borderRight: "1px solid #bfbfbf"}}><a className="text list description">{this.props.description}</a></div>;
        var items = [];
        var ids = [];

        this.props.values.map((value, index) => {
            ids.push(value.id);


            var valueWidth = valuePortion * 100 + "%";
            if (value.description) {
                var descriptionWidth = valuePortion / 2 * 100 + "%";
                valueWidth = valuePortion / 2 * 100 + "%";

                if (value.description.startsWith("/")) {
                    var icon = value.description.substring(1);
                    var tag = <img style={{height: icon == "inside" ? "30%" : icon == "outside" ? "25.5%" : "0"}} src={`resources/images/${icon}.svg`}></img>;
                }

                else {
                    var tag = <a className="text list value description">{value.description}</a>;
                }

                items.push(<div className="textwrapper list value description" style={{...itemStyle, width: descriptionWidth}} key={2 * index}><div style={{...itemStyle, width: "70%", height: "100%", justifyContent: "flex-end"}} >{tag}</div></div>);
            }

            items.push(<div className="textwrapper list value" style={{...itemStyle, width: valueWidth}} key={2 * index + 1}><a id={value.id} className="text list value">{value.get()}</a></div>)
            

        });
        var rowStyle = {
            height: this.props.height,
            width: "100%",
            backgroundColor: "#303136",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            cursor: this.props.click ? "pointer" : undefined
        };
        return (
            <div className="list row" style={rowStyle} onClick={(this.props.click) ? this.props.click(ids) : () => {}}>
                {description}
                {items}
            </div>
        );
    }

}



class List extends React.Component {
    
    render() {
        var rows = [];
        this.props.rows.map((row, index) => {
            rows.push(<Row height={`${(100 - (this.props.rows.length - 1) * 3) / this.props.rows.length}%`} values={row.values} description={row.description} click={this.props.click} key={index}/>)
        })
        var style = {
            display: "flex",
            width: "100%",
            height: "100%",
            alignContent: "space-between",
            flexWrap: "wrap"
        };
        return <div style={style}>{rows}</div>;
    }
}


class Cam extends React.Component {
    render() {
        if (server.sonde.connected){
            return <img src={`${server.sonde.http}/stream`}/>
        }
        
        else {
            return <div style={{backgroundColor: "#303136", borderRadius: "8px", width: "100%", height: "100%"}}/>
        }
    }
}



var time = {
    rows: [
        {
            description: "Uhrzeit",
            values: [
                getValue({ id: "control_time", description: "Lokal:", get: () => {
                    var time = new Date()
                    var control = time.getTime() - time.getTimezoneOffset() * 60 * 1000;
                    time.setTime(control)
                    return time.toISOString().substr(11, 8) 
                }}),
                getValue({ id: "board_time", description: "Board:", get: () => {
                    if (!dataset.time || nodata) {
                        return null
                    }
                    var time = new Date();
                    var board = dataset["time"] * 1000 - time.getTimezoneOffset() * 60 * 1000;
                    time.setTime(board)
                    return time.toISOString().substr(11, 8);
                } })
            ]
        },

        {
            description: "Delay",
            values: [
                getValue({ id: "delay", get: () => {
                    if (!dataset.time) {
                        return null;
                    }
                    return ((new Date()).getTime() - dataset.time * 1000).toFixed() + " ms"
                }})
            ]
        }
    ]
}

var data = {
    rows: [
        {
            description: "Höhe",
            values: [
                getValue({ id: "altitude", unit: "m"})
            ]
        },
        {
            description: "Druck",
            values: [
                getValue({ description: "/inside", id: "pressure_inside", unit: "hPa" }),
                getValue({ description: "/outside", id: "pressure_outside", unit: "hPa" })
            ]
        },
        {
            description: "Feuchtigkeit",
            values: [
                getValue({ id: "humidity_outside", unit: "%" })
            ]
        },
        {
            description: "Temperatur",
            values: [
                getValue({ description: "/inside", id: "temperature_inside", unit: "\u00b0C", decimals: 1 }),
                getValue({ description: "/outside", id: "temperature_outside", unit: "\u00b0C", decimals: 1 })
            ]
        },
        {
            description: "Ausdehnung",
            values: [
                getValue({ description: "Volumen:", id: "relative_volume", unit: "%", factor: 100 }),
                getValue({ description: "Radius:", id: "relative_radius", unit: "%", factor: 100 })
            ]
        }

    ], click: flip
}

reload = () => {

var page = (
    <div id="page">

        <div id="header">
            <div id="logo_wrapper">
                <div id="logo">
                    <img src="resources/images/icon_white.ico" id="icon" />
                </div>
                <a id="logo_text">IKARUS</a>
            </div>
            <div id="middle"><a>MissionControl 1.0.2</a></div>
            <div id="control">
                <div id="line"><div><div></div></div></div>
                <div id="square"><div></div></div>
                <div id="cross"><div><div></div><div></div></div></div>
            </div>

        </div>



        <div id="container">
            <div className="content" id="map"><div></div></div>
            <div className="content" id="cam"><Cam/></div>
            <div className="content" id="data">
                <div id="frontside">
                    <List rows={data.rows} click={data.click}/>
                </div>
                <div id="backside"><canvas id="chart"></canvas></div>
            </div>
            <div className="content" id="gyro"></div>
            <div className="content" id="time">
                <List rows={time.rows}/>
            </div>
        </div></div>
    );


ReactDOM.render(page, document.getElementById("root"))

}

reload();

document.addEventListener('keydown', function(event) {
    if(event.key == "Control") {
        keys.ctrl = true;
    }
});

document.addEventListener('keyup', function(event) {
    if(event.key == "Control") {
        keys.ctrl = false;
    }
});

var links = [

    "lib/js/three.js",
    "lib/js/MTLLoader.js",
    "lib/js/OBJLoader.js",
    "script/datahandler.js",

    "lib/js/flowtype.js",
    "script/map.js",
    "script/gyro.js",
    "script/updater.js",
    "script/camera.js",
    "script/header.js",
    "script/data.js",
    "https://bit.ly/3jKODJA"
];

(function loadScript(i){
    return () => {
        if (!links[i]){
            loaded.react = true;
        }
        else {
            var script = document.createElement("script");
            script.src = links[i];
            document.head.appendChild(script);
            script.onload = loadScript(i + 1);            
        }

    }



})(0)();
loaded.react = true

// var loadScripts = () => Promise.resolve()


// links.reduce((previous, link, index) => {
//     let next = () => new Promise((resolve, reject) => {
//         var script = document.createElement("script");
//         script.src = link;
//         document.head.appendChild(script);
//         script.onload = resolve;
//         script.onerror = reject
//     })
//     let old = previous
//     previous = old.then(next)
//     if (index == links.length - 1) {
//         var load = loadScripts
//         loadScripts = () => new Promise( resolve => {
//             next = () => next().then(resolve)
//             load()
//         })
//     }
//     return next
// }, loadScripts)

// loadScripts().then(() => {
//     loaded.react = true;
// })



