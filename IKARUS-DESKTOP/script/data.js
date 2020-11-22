//const chart = require("chart.js");




document.querySelector("#backside").addEventListener("click", () => {
    document.getElementById("frontside").setAttribute("style", "transform: rotateY(0deg);");
    document.getElementById("backside").setAttribute("style", "transform: rotateY(180deg);");
    document.querySelectorAll("#data .values.auxiliary > *").forEach((element) => {
        element.setAttribute("style", "border-radius: 8px; height: 17%; transition-delay: 0.5s;");
    });
    setTimeout(()=>{chart.destroy()}, 500)
});


function spawnChart(ids) {
    return () => {

        var raw = {};
        const recordCount = 20;
        var columns = commafy(ids);
        db.each(`SELECT time, ${columns} FROM ${launch} ORDER BY time ASC`, function (err, row) {
            for (var id of ids){
                if (!raw[id]) raw[id] = {value: [], time: []};
                raw[id].value.push(row[id]);
                raw[id].time.push(row.time);
            }
            
        }, function (err, count) {
            var datasets = [];
            for (id of ids) {
                var data = [];
                const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

                if (raw[id].value.length < recordCount) {
                    step = 1;
                }
                else {
                    var step = Math.floor(raw[id].value.length / recordCount);
                }

                for (var i = 0; i < raw[id].value.length; i += step) {
                    data.push({ y: arrAvg(raw[id].value.slice(i, i + step)), t: new Date(1000 * arrAvg(raw[id].time.slice(i, i + step))) }); //interpolierung noch ändern: avg von ca 20 aber diese 20er in größeren Abständen
                }

                datasets.push(
                    {
                        label: id,
                        backgroundColor: "#2083E4",
                        borderColor: "#2083E4",
                        data: data,
                        fill: false
                    }
                );
            }

            
            var ctx = document.getElementById("chart").getContext('2d');

            chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: datasets
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
                                maxTicksLimit: 10,
                                maxRotation: 0
                            }

                        }]
                    }
                }
            });

        });
    }
}
