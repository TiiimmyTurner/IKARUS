import React from 'react';
import ReactDOM from 'react-dom';

function flip(ids) {
    return () => {
        document.getElementById("frontside").setAttribute("style", "transform: rotateY(180deg);");
        document.getElementById("backside").setAttribute("style", "transform: rotateY(360deg); height: 100%; width: 100%;");
    
        

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
    
        setTimeout(spawnChart(ids), 250);
    }
    
}

class Row extends React.Component {
    render() {
        var description = <div className="description"><a className="description_text">{this.props.description}</a></div>;
        var values = [];
        var ids = [];
        for (var value of this.props.values) {
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

                values.push(<div className="icon_box_box"><div className="icon_box">{tag}</div></div>);
            }

            values.push(<div className={kind}><a className="value_text" id={value.id}></a></div>)
        }
        return (
            <div style={{height: `${this.props.height}`}} className="dataline" onClick={(this.props.click) ? this.props.click(ids) : () => {}}>
                {description}
                {values}
            </div>
        );
    }

}

class List extends React.Component {
    
    render() {
        var rows = [];
        for (var row of this.props.rows) {
            rows.push(<Row height={`${(100 - (this.props.rows.length - 1) * 3) / this.props.rows.length}%`} values={row.values} description={row.description} click={this.props.click}/>)
        }
        return <div className="values">{rows}</div>;
    }
}







var time = (
    <List rows={[
        {
            description: "Uhrzeit",
            values: [
                { id: "control_time", description: "Lokal:" },
                { id: "board_time", description: "Board:" }
            ]
        },

        {
            description: "Delay",
            values: [
                { id: "delay"}
            ]
        }
    ]} />
);


var data = (
    <List rows={[
        {
            description: "Höhe",
            values: [
                { id: "altitude" }
            ]
        },
        {
            description: "Druck",
            values: [
                { description: "/inside", id: "pressure_inside" },
                { description: "/outside", id: "pressure_outside" }
            ]
        },
        {
            description: "Feuchtigkeit",
            values: [
                { description: "/inside", id: "humidity_inside" },
                { description: "/outside", id: "humidity_outside" }
            ]
        },
        {
            description: "Temperatur",
            values: [
                { description: "/inside", id: "temperature_inside" },
                { description: "/outside", id: "temperature_outside" }
            ]
        },
        {
            description: "Ausdehnung",
            values: [
                { description: "Volumen:", id: "relative_volume" },
                { description: "Radius:", id: "relative_radius" }
            ]
        }

    ]} click={flip} />
);

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
            <div className="content" id="cam"><img /></div>
            <div className="content" id="data">
                <div id="frontside">
                    {data}
                    <div className="values auxiliary" id=""><div className="dataline"></div><div className="dataline"></div><div className="dataline"></div><div className="dataline"></div><div className="dataline"></div></div>
                </div>
                <div id="backside"><canvas id="chart"></canvas></div>
            </div>
            <div className="content" id="gyro"></div>
            <div className="content" id="time">
                {time}
            </div>
        </div></div>
    );

ReactDOM.render(page, document.getElementById("root"));

/*,*/
var links = [

    "lib/js/MTLLoader.js",
    "lib/js/OBJLoader.js",
    "backend/declarations.js",
    "backend/databridge.js",

    "script/map.js",
    "script/gyro.js",
    "script/updater.js",
    "script/camera.js",
    "script/header.js",
    "script/data.js",
    "https://bit.ly/3jKODJA"
]

for (var i = 0; i < links.length; i++){
    var script = document.createElement("script");
    script.src = links[i];
    document.head.appendChild(script);
} 


