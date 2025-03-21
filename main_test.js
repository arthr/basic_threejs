import * as THREE from "three";

import Stats from "three/addons/libs/stats.module.js";
import GUI from "lil-gui";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let character, mixer;

const container = document.createElement("div");
document.body.appendChild(container);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

window.addEventListener("resize", (e) => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// stats
const stats = new Stats();
container.appendChild(stats.dom);

// clock
const clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	1,
	1000
);
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 3, 16);
controls.update();

controls.enablePan = true;
controls.minPolarAngle = THREE.MathUtils.degToRad(45);
controls.maxPolarAngle = THREE.MathUtils.degToRad(75);
controls.minDistance = 10;
controls.maxDistance = 100;
controls.enableDamping = true;

// lights

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(0, 20, 10);
scene.add(dirLight);

// ground

const geometry = new THREE.PlaneGeometry(200, 200, 20, 20);
geometry.rotateX(-Math.PI / 2);

const material = new THREE.MeshPhongMaterial({
	color: 0xcbcbcb,
	depthWrite: false,
});
const ground = new THREE.Mesh(geometry, material);
scene.add(ground);

// grid
const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);

// model
const api = { state: "Walking" };
const loader = new GLTFLoader();

let animations;

loader.load(
	"models/robot/RobotExpressive.glb",
	function (gltf) {
		character = gltf.scene;
		mixer = new THREE.AnimationMixer(character);
		mixer
			.clipAction(
				THREE.AnimationUtils.subclip(gltf.animations[0], "idle", 0, 221)
			)
			.setDuration(6)
			.play(); //0
		mixer
			.clipAction(
				THREE.AnimationUtils.subclip(
					gltf.animations[0],
					"run",
					222,
					244
				)
			)
			.setDuration(0.7)
			.play(); //1
		mixer._actions[0].enabled = true;
		mixer._actions[1].enabled = false;
		scene.add(character);
	},
	undefined,
	function (e) {
		console.error(e);
	}
);

function animate() {
	//animation update
	const clockDelta = clock.getDelta();
	if (mixer) {
		mixer.update(clockDelta);
	}
	renderer.render(scene, camera);
}

const gui = new GUI();
gui.add(document, "title");
