import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let earthRadius= 6378; //radius of sphere1(Earth)
  
const loader = new THREE.TextureLoader();
const mainSphere = new THREE.SphereGeometry(earthRadius, 256, 256);
const bigSphere = new THREE.SphereGeometry(earthRadius*1.1, 256, 256);
const marker = new THREE.TorusGeometry(earthRadius*0.01,earthRadius*0.005);

const sphereP = [
    new THREE.SphereGeometry(earthRadius, 256,256, 0,Math.PI),
    new THREE.SphereGeometry(earthRadius, 256,256, Math.PI,Math.PI)
];
// marker.rotateX(Math.PI/2);

// const textureimg = loader.load('images/new_koppen.png');
// const textureimg = loader.load('images/bluemarble_big.png');
// const textureimg = loader.load('images/bm_p2.jpg');
const texture_l = loader.load('images/bm_p2_l.png');
const texture_r = loader.load('images/bm_p2_r.png');
// const texturebump = loader.load('images/new_elevation.png');
const bump_l = loader.load('images/elevation_l.png');
const bump_r = loader.load('images/elevation_r.png');
// const texturew = loader.load('images/water.jpg');
const water_l = loader.load('images/water_l.png');
const water_r = loader.load('images/water_r.png');
const texturecity = loader.load('images/city.png');
// textureimg.minFilter = THREE.LinearFilter;
const borders = loader.load('images/new_borders.png');

function earthMapMat(texture, bump=null, water=null) {
    const material = new THREE.MeshPhongMaterial();
    material.map = texture;
    // material.displacementMap = texturebump;
    // material.displacementScale = earthRadius*0.1;
    material.bumpMap = bump;
    material.bumpScale = bump ? earthRadius*0.003 : null;
    material.specularMap = water;
    material.specular = new THREE.Color(0xeeeeee);
    material.shininess = 3;
    material.wireframe = false;
    return material;
}
// const material = earthMapMat(textureimg);
const material_l = earthMapMat(texture_l, bump_l, water_l);
const material_r = earthMapMat(texture_r, bump_r, water_r);
const borderMat = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaMap: borders,
    color: new THREE.Color(255,255,50),
    depthTest: false,
    blending: THREE.AdditiveBlending
});
const bordermesh = new THREE.Mesh(mainSphere, borderMat);

const markerMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0, 255, 1),
});
const redMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(255, 0, 0)
});

const citym = new THREE.MeshLambertMaterial({
    transparent: true,
    alphaMap: texturecity,
    color: new THREE.Color(250, 230, 200),
    depthTest: false,
    blending: THREE.AdditiveBlending,
    // bumpMap: texturebump,
    // bumpScale: earthRadius*0.03
});
const citymesh = new THREE.Mesh(mainSphere, citym);
citymesh.layers.set(1);

const myMarker = new THREE.Mesh(marker, redMat);
myMarker.position.set(0, 0, 0);
const markers = [
    myMarker
];
myMarker.layers.set(2);

function setMarker(m, lat, long, R=earthRadius) {
    let theta = Math.PI/2 - lat*Math.PI/180.0;
    let phi = -long*Math.PI/180.0;
    m.position.set(R*Math.sin(theta)*Math.cos(phi), R*Math.cos(theta), R*Math.sin(theta)*Math.sin(phi));
    m.lookAt(0,0,0);
}
function addMarker(lat, long) {
    let m = new THREE.Mesh(marker, markerMat);
    markers.push(m);
    setMarker(m, lat, long);
    scene.add(m);
    m.layers.set(2);
    return m;
}

let my_lat = 0;
let my_long = 0;
navigator.geolocation.getCurrentPosition((p) => {
    console.log(p);
    my_lat = p.coords.latitude;
    my_long = p.coords.longitude;
    setMarker(myMarker, p.coords.latitude, p.coords.longitude, earthRadius*1.001);
}, null);

// Setup renderer
const renderer = new THREE.WebGLRenderer();
console.log(renderer.capabilities.maxTextureSize);
renderer.capabilities.maxTextureSize *= 4;
console.log(renderer.capabilities.maxTextureSize);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viz').appendChild(renderer.domElement);

// Setup scene
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const light = new THREE.DirectionalLight(0xffffff, 1.5);
const light2 = new THREE.DirectionalLight(0xffffff, 0.01);
light.mapSize = (2,2);
light2.layers.set(1);
// light.castShadow = true;
// light.shadow.camera.far = earthRadius*5;

const mapMats = [
    material_l,
    material_r
];
for (let i = 0; i < sphereP.length; i++) {
    scene.add(new THREE.Mesh(sphereP[i], mapMats[i]));
}
scene.add(light);
// scene.add(earthmesh);
scene.add(light2);
scene.add(citymesh);
scene.add(myMarker);
// scene.add(waterMesh);
scene.add(bordermesh);

const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 10, 20000);
camera.position.set(1425,8000,-6160); //This is for demo
camera.lookAt(0,0,0);
camera.updateProjectionMatrix();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.minDistance=earthRadius*1.005;
controls.maxDistance=earthRadius*3.5;
controls.enableDamping=true;
controls.dampingFactor=0.05;
controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
};

let t = 0;
const L_R = 10;
renderer.autoClear = false;
let dec = 0;
let playing = false;

function animate() {
    let cameraP = controls.object.position;
    markers.forEach((m) => {
        let mX = cameraP.x - m.position.x;
        let mY = cameraP.y - m.position.y;
        let mZ = cameraP.z - m.position.z;
        let cameraR = Math.sqrt(mX*mX + mY*mY + mZ*mZ);
        let mScale = cameraR/earthRadius * (1+0.2*Math.cos(t/2000));
        m.scale.set(mScale,mScale,mScale)
    });
    if (viewingMPhi > Math.PI/8) {
        viewingMPhi -= 0.001+0.04*(viewingMPhi-Math.PI/8);
        viewMarker(myMarker, viewingMPhi);
    }

    renderer.clear();
    for (let l = 0; l <= 2; l++) {
        camera.layers.set(l);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    }

    controls.update();
    dec = -23.5*Math.cos((t-t_sol2023)/(86400*365.2422)*(2*Math.PI));
    let phi = t/86400 * 2*Math.PI;
    let theta = Math.PI/2 - dec*Math.PI/180.0;
    light.position.set(L_R*Math.cos(phi)*Math.sin(theta), L_R*Math.cos(theta), L_R*Math.sin(phi)*Math.sin(theta));
    light2.position.set(-L_R*Math.cos(phi)*Math.sin(theta), -L_R*Math.cos(theta), -L_R*Math.sin(phi)*Math.sin(theta));
    // light.position.set(0, 0, 3);
    if (playing)
        t += 25*10;
    requestAnimationFrame(animate);
}

controls.enableKeys = false;
// controls.listenToKeyEvents(window);
const dsol2023 = new Date("December 22, 2023 03:27 UTC").getTime();
let t_sol2023 = 0;
function setToNow() {
    let time = Date.now() - dsol2023;
    console.log(time);
    let years = time/(365.2422*86400*1000);
    let days = (Date.now()%(86400*1000))/(86400*1000);
    t = 86400*(days+0.5);
    t_sol2023 = t - time/1000;
    console.log(years, (t-t_sol2023)/86400/365.2422);
    dec = -23.5*Math.cos((t-t_sol2023)/(86400*365.2422)*(2*Math.PI));
    console.log(dec);
    console.log(years);
    console.log(days);
}
function viewMarker(m, dphi) {
    let theta = Math.PI/2 - my_lat*Math.PI/180 + Math.PI/8;
    let phi = -my_long*Math.PI/180 - dphi;
    controls.minDistance = earthRadius*0.05;
    controls.object.position.set(
        m.position.x + earthRadius*0.3*Math.sin(theta)*Math.cos(phi),
        m.position.y + earthRadius*0.3*Math.cos(theta),
        m.position.z + earthRadius*0.3*Math.sin(theta)*Math.sin(phi)
    );
}
let viewingMPhi = Math.PI/8;
function handleKey(e) {
    console.log(e);
    if (e.code === 'Space') {
        playing = !playing;
        // if (!playing)
            // setToNow();
    }
    if (e.code === 'KeyA') {
        console.log("looking");
        viewingMPhi = Math.PI/6;
        controls.target.set(myMarker.position.x, myMarker.position.y, myMarker.position.z);
    }
    if (e.code === 'KeyC') {
        controls.minDistance = earthRadius*1.005;
        controls.target.set(0,0,0);
    }
    if (e.code === 'KeyN') {
        setToNow();
        playing = false;
    }
    if (e.code === 'KeyB') {
        bordermesh.visible = !bordermesh.visible;
    }
}
document.onkeydown = handleKey;
setToNow();

animate();