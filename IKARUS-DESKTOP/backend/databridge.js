//!!! Für Livestream muss Programm neu gestartet, nicht nur neu geladen werden!!!

var {spawn, exec} = require('child_process');

//Python-Pfad
new Promise((resolve)=>{
    exec('python -c "import sys; print(sys.executable)"', function(error, stdout, stderr){
        if(error){
            console.error(error, stderr)
        }
        path = stdout.replaceAll("\\", "/");
        resolve(path.slice(0, path.length - 2)) } );
}).then((python)=>{


//downlink
var downlink = spawn(python, ['backend/downlink.py']);

downlink.stdout.on('data', (data) => {
    dataset = JSON.parse(data.toString())
    update();
});
    
downlink.on("exit", function(code, signal){
    console.error("Downlink has stopped with code " + code.toString() + ".");
});
downlink.stderr.on('data', (data)=>{
    console.error("An error occured with downlink:\n" + data.toString());
});


//uplink
var uplink = spawn(python, ['backend/uplink.py']);

//uplink.unref();

uplink.stdout.on('data', (msg) => {
    console.log(msg.toString());
});

uplink.on("exit", function(code, signal){
    console.error("Uplink has stopped with code " + code.toString() + ".");
});
uplink.stderr.on('data', (data)=>{
    console.error("An error occured with uplink:\n" + data.toString());
});



})

