i = 0;
var rotations = {
    "x": undefined,
    "y": undefined,
    "z": undefined

}

var container = document.getElementById('gyro');

function width() {
    return container.offsetWidth;
}


function height() {
    return container.offsetHeight;
}

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x303136);

var camera = new THREE.PerspectiveCamera(75, width() / height(), 0.1, 1000);
camera.position.z = 5;

var light = new THREE.DirectionalLight('#ffffff', 0.9);
light.position.set(-20, 0, 100);
scene.add(light);

renderer = new THREE.WebGLRenderer();
renderer.setSize(width(), height());
container.appendChild(renderer.domElement);

//Object
//.obj und .mtl Datei kann lokal nicht ausgelesen werden
let cube;

function render() {
    requestAnimationFrame(render);

    if (cube) {
        cube.rotation.x = rotations["x"];
        cube.rotation.y = 3.14159 / 4 * 0;


        cube.rotation.z = rotations["y"];
    }

    renderer.render(scene, camera);

}

render()

window.addEventListener("resize", () => {
    camera.aspect = width() / height();
    renderer.setSize(width(), height());
    camera.updateProjectionMatrix();
})





const OBJLoader = new THREE.OBJLoader();
const MTLLoader = new THREE.MTLLoader();

new Promise((resolve) => {
    MTLLoader.load('https://raw.githubusercontent.com/TiiimmyTurner/IKARUS/master/Desktop/resources/blender-files/sonde.mtl', (materials) => {
        resolve(materials);
    })
}).then((materials) => {
    materials.preload(); //optional
    OBJLoader.setMaterials(materials);
    OBJLoader.load('https://raw.githubusercontent.com/TiiimmyTurner/IKARUS/master/Desktop/resources/blender-files/sonde.obj', object => {
        cube = object;
        scene.add(object);
        loaded.gyro = true
    })
})

