//const chart = require("chart.js");

document.querySelectorAll("#data .value, #data .merged").forEach((element) => {

    element.addEventListener("click", ((self) => {
        return () => {
            document.getElementById("value_side").setAttribute("style", "transform: rotateY(180deg);");
            document.getElementById("backside").setAttribute("style", "transform: rotateY(360deg);");


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

            setTimeout(spawnChart(self.firstElementChild.id), 250);
        };
    })(element));

});

document.querySelector("#backside").addEventListener("click", () => {
    document.getElementById("value_side").setAttribute("style", "transform: rotateY(0deg);");
    document.getElementById("backside").setAttribute("style", "transform: rotateY(180deg);");
    document.querySelectorAll("#data .values.auxiliary > *").forEach((element) => {
        element.setAttribute("style", "border-radius: 8px; height: 17%; transition-delay: 0.5s;");
    });
    setTimeout(()=>{chart.destroy()}, 500)
});


function spawnChart(name) {
    return () => {

        var value = [];
        var time = [];
        const recordCount = 20;
        //console.log(`SELECT time,${name} FROM ${launch}`);
        db.each(`SELECT time,${name} FROM ${launch} ORDER BY time ASC`, function (err, row) {
            value.push(row[name]);
            time.push(row.time);
        }, function (err, count) {
            var data = [];
            const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
            if (value.length < recordCount){
                step = 1;
            }
            else {
                var step = Math.floor(value.length / recordCount); 
            }

            for(var i = 0; i < value.length; i += step){
                data.push({y: arrAvg(value.slice(i, i + step)), t: new Date(1000 * arrAvg(time.slice(i, i + step)))}); //interpolierung noch ändern: avg von ca 20 aber diese 20er in größeren Abständen
            }
            console.log(data);

            var ctx = document.getElementById("chart").getContext('2d');

            chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: [{
                        label: name,
                        backgroundColor: "#2083E4",
                        borderColor: "#2083E4",
                        data: data,
                        fill: false
                    }]
                },
                options: {
                    hover: {
                        mode: "nearest",
                        intersect: false
                    },
                    scales: {
                        yAxes: [{
                            stacked: false
                        }],
                        xAxes: [{
                            display: true,
                            type: "time",
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 12,
                                maxRotation: 0
                            }

                        }]
                    }
                }
            });

        });
    }
}
