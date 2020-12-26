import React from 'react';
import ReactDOM from 'react-dom';

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

function getValue(options={ id, unit, description, decimals, factor, get }) {
    options.factor = options.factor ? options.factor : 1;
    return {
        id: options.id,
        description: options.description,
        get: options.get ? options.get : () => {
            return (global.dataset[options.id] * options.factor).toFixed(options.decimals) + (options.unit ? " " + options.unit : "")
        }
    }
}

class Row extends React.Component {
    render() {
        itemStyle = {
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }
        
        var descriptionPortion = this.props.descriptionPortion ? this.props.descriptionPortion : 0.2;
        var valuePortion = (1 - descriptionPortion) / this.props.values.length;
        var description = <div style={Object.assign(itemStyle, {width: descriptionPortion * 100 + "%"})} className="description"><a className="description_text">{this.props.description}</a></div>;
        var items = [];
        var ids = [];

        this.props.values.map((value, index) => {
            ids.push(value.id);
            if (this.props.values.length == 1) {
                var kind = "merged";
            }
            else {
                var kind = "value";
            }



            if (value.description) {
                if (value.description.startsWith("/")) {
                    var icon = value.description.substring(1);
                    var tag = <img src={`resources/images/${icon}.svg`} className={icon}></img>;
                }

                else {
                    var tag = <a>{value.description}</a>;
                }

                items.push(<div className="icon_box_box" key={2 * index}><div className="icon_box">{tag}</div></div>);
            }

            
            items.push(<div className={kind} key={2 * index + 1}><a className="value_text" id={value.id}>{value.get()}</a></div>)
            
        });
        var style = {
            height: this.props.height,
            width: "100%",
            backgroundColor: "#303136",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        };
        return (
            <div style={style} className="dataline" onClick={(this.props.click) ? this.props.click(ids) : () => {}}>
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
            justifyContent: "center",
            flexWrap: "wrap"
        };
        return <div style={style} className="values">{rows}</div>;
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
                    return (new Date()).getTime() - dataset.time * 1000 + " ms"
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
            <div className="content" id="cam"><img src={VIDEOSTREAM}/></div>
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

/*,*/
var links = [
    "lib/js/three.js",
    "lib/js/MTLLoader.js",
    "lib/js/OBJLoader.js",
    "backend/databridge.js",

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
        if (!links[i]) return;
        var script = document.createElement("script");
        script.src = links[i];
        document.head.appendChild(script);
        script.onload = loadScript(i + 1);
        //document.head.insertBefore(script, document.head.firstChild);
    }



})(0)();


