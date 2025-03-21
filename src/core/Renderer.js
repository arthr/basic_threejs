import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";

export class Renderer {
	constructor(container) {
		this.container = container;
		this.stats = new Stats();
		this.setupRenderer();
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(this.renderer.domElement);
		this.container.appendChild(this.stats.dom);
	}

	setAnimationLoop(callback) {
		this.renderer.setAnimationLoop(callback);
	}

	updateSize() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	render(scene, camera) {
		this.renderer.render(scene, camera);
		this.stats.update();
	}

	get() {
		return this.renderer;
	}
}
