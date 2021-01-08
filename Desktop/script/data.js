//const chart = require("chart.js");



document.querySelector("#backside").addEventListener("click", () => {
    document.getElementById("frontside").setAttribute("style", "transform: rotateY(0deg);");
    document.getElementById("backside").setAttribute("style", "transform: rotateY(180deg);");
    document.querySelectorAll("#data .values.auxiliary > *").forEach((element) => {
        element.setAttribute("style", "border-radius: 8px; height: 17%; transition-delay: 0.5s;");
    });
    setTimeout(() => { chart.destroy() }, 500)
});


function spawnChart(ids) {
    var ctrl = keys.ctrl
    // db.each(`SELECT name FROM sqlite_master WHERE type='table' AND name = '${data.launch}'`, function (err, row) {
    // }, (err, count)=>{
    //     if (count == 0){
    //         db.run(`CREATE TABLE ${data.launch} (id INT, dt TEXT)`)
    //     }
    // });

    return () => {
        var raw = {};
        ids.map(id => {
            raw[id] = [];
        })

        var columns = ids.toString();
        db.each(`SELECT time, ${columns} FROM ${dataset.launch} ORDER BY time ASC`, function (err, row) {

            ids.map(id => {
                if (row.time && row[id]) {
                    raw[id].push({ value: row[id], time: row.time })
                }
            })


        }, function (err, count) {

            var datasets = [];


            function Color(index) {
                if (index <= 1) {
                    return ["#2083E4", "#D81B60"][index];
                }
                return "#D81B60";
            }




            ids.map(id => {
                var datapoints = [];
                if (!err) {
                    var chunks = [];
                    var chunk;

                    raw[id].map((entry, i) => {
                        if (!chunk) {
                            chunk = { start: entry.time, sum: entry.value, size: 1 };
                        }
                        else {
                            chunk.sum += entry.value;
                            chunk.size += 1;
                        }

                        if (entry.time - chunk.start >= chunkTime || i == raw[id].length - 1) {

                            chunk.value = chunk.sum / chunk.size;
                            chunk.time = (entry.time + chunk.start) / 2;
                            chunk.index = chunks.length;
                            chunks.push(chunk);
                            chunk = null;
                        }
                    })


                    if (chunks.length < 2) {
                        console.log("too few chunks!")
                    }

                    else if (chunks.length < recordCount || ctrl) {
                        datapoints = chunks;
                    }

                    else {
                        try {
                            function slope(a, b) {
                                return (chunks[b].value - chunks[a].value) / (chunks[b].time - chunks[a].time);
                            }

                            // console.log(chunks.length);

                            chunks.map((chunk, i) => {

                                if (i > 0 && i < chunks.length - 1) {
                                    if ((chunks[i - 1].value < chunk.value && chunks[i + 1].value < chunk.value) || (chunks[i - 1].value > chunk.value && chunks[i + 1].value > chunk.value)) {
                                        datapoints.push(chunk);
                                    }
                                }

                                if (i > 1 && i < chunks.length - 2) {
                                    if ((slope(i - 1, i) - slope(i - 2, i - 1) < 0 && slope(i + 2, i + 1) - slope(i + 1, i) > 0) || (slope(i - 1, i) - slope(i - 2, i - 1) > 0 && slope(i + 2, i + 1) - slope(i + 1, i) < 0)) {
                                        datapoints.push(chunk);
                                    }
                                }

                            })
                            // console.log("Datapoints before pushing first and last:")
                            // console.log(datapoints)
                            datapoints.push(chunks[chunks.length - 1])
                            datapoints.unshift(chunks[0])
                            // console.log("Datapoints after pushing first and last:")
                            // console.log(datapoints)

                            if (datapoints.length != recordCount) {
                                var distances = [];
                                datapoints.map((pt, i) => {

                                    pt.hspread = Math.abs((datapoints[i + 1] ? datapoints[i + 1].time : 0) - (datapoints[i - 1] ? datapoints[i - 1].time : 0))
                                    pt.vspread = Math.abs((datapoints[i + 1] ? datapoints[i + 1].value : 0) - (datapoints[i - 1] ? datapoints[i - 1].value : 0))
                                    if (i < datapoints.length - 1) {
                                        distances.push({ left: pt, right: datapoints[i + 1], width: datapoints[i + 1].time - pt.time, between: chunks.slice(pt.index + 1, datapoints[i + 1].index) })
                                    }

                                })

                                if (datapoints.length > recordCount) {
                                    while (datapoints.length > recordCount) {
                                        var pop = datapoints.map((pt, i) => {
                                            var spread = pt.vspread ** 2 + pt.hspread ** 2
                                            // spread = pt.hspread
                                            return { chunk: pt, spread: spread, index: i }
                                        })
                                            .reduce((min, a) => (a.spread < min.spread && a.chunk.index != 0 && a.chunk.index != chunks.length - 1) || min.chunk.index == 0 || min.chunk.index == chunks.lenght - 1 ? a : min)
                                        datapoints.splice(pop.index, 1)
                                    }
                                }

                                if (datapoints.length < recordCount) {
                                    while (datapoints.length < recordCount) {
                                        // console.log("Distances:");
                                        // console.log(distances);
                                        // console.log("Datapoints:");
                                        // console.log(datapoints);
                                        maxDistance = distances.length > 1 ? distances.reduce((max, a) => max.between.length == 0 ? a : a.width > max.width && a.between.length > 0 ? a : max) : distances[0];
                                        // console.log("maxDistance:");
                                        // console.log(maxDistance);

                                        if (maxDistance.between == []) {
                                            break
                                        }
                                        middle = maxDistance.between.length == 1 ? maxDistance.between[0] : maxDistance.between.map(c => {
                                            return { distanceToMiddle: Math.abs((maxDistance.right.time + maxDistance.left.time) / 2 - c.time), chunk: c }
                                        })
                                            .reduce((min, a) => a.distanceToMiddle < min.distanceToMiddle ? a : min)
                                            .chunk

                                        // console.log("middle:");
                                        // console.log(middle)
                                        datapoints.splice(datapoints.indexOf(maxDistance.right), 0, middle);

                                        distances.splice(distances.indexOf(maxDistance), 1)
                                        distances.push({ left: maxDistance.left, right: middle, width: middle.time - maxDistance.left.time, between: chunks.slice(maxDistance.left.index + 1, middle.index) })
                                        distances.push({ left: middle, right: maxDistance.right, width: maxDistance.right.time - middle.time, between: chunks.slice(middle.index + 1, maxDistance.right.index) })
                                    }


                                }
                            }
                        } catch (e) { console.log(e) }
                    }
                }
                else {
                    console.log(err)
                }
                var data = []
                datapoints.map(pt => {
                    data.push({ y: pt.value, t: new Date(1000 * pt.time) })
                })

                datasets.push(
                    {
                        label: getParameterDescription(id),
                        backgroundColor: Color(ids.indexOf(id)),
                        borderColor: Color(ids.indexOf(id)),
                        data: data,
                        fill: false
                    }
                );
            })








            var ctx = document.getElementById("chart").getContext('2d');
            chart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: [],
                    datasets: datasets
                },
                options: {
                    maintainAspectRatio: false,
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
