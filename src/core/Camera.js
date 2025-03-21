import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class Camera {
	constructor() {
		this.camera = new THREE.PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		this.initialPosition = new THREE.Vector3(-5, 3, 10);
		this.initialLookAt = new THREE.Vector3(0, 2, 0);
		this.controls = null;
		this.domElement = null;
		this.setup();
	}

	setup() {
		this.camera.position.copy(this.initialPosition);
		this.camera.lookAt(this.initialLookAt);
	}

	initControls(domElement) {
		this.domElement = domElement;
		this.controls = new OrbitControls(this.camera, domElement);
		this.controls.enablePan = true;
		this.controls.minPolarAngle = THREE.MathUtils.degToRad(25);
		this.controls.maxPolarAngle = THREE.MathUtils.degToRad(85);
		this.controls.minDistance = 10;
		this.controls.maxDistance = 100;
		this.controls.enableDamping = true;

		// Define o target dos controles para ser o mesmo ponto para onde a câmera olha inicialmente
		this.controls.target.copy(this.initialLookAt);

		this.controls.update();
	}

	destroyControls() {
		if (this.controls) {
			this.controls.dispose();
			this.controls = null;
		}
	}

	enableControls(enabled) {
		if (enabled) {
			// Se estiver habilitando e os controles não existirem, recrie-os
			if (!this.controls && this.domElement) {
				this.initControls(this.domElement);
			}
		} else {
			// Se estiver desabilitando, destrua os controles para liberar memória
			this.resetPosition();
			this.destroyControls();
		}
	}

	resetPosition() {
		this.camera.position.copy(this.initialPosition);
		this.camera.lookAt(this.initialLookAt);
		if (this.controls) this.controls.update();
	}

	update() {
		if (this.controls && this.controls.enabled) {
			this.controls.update();
		}
	}

	updateAspect() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}

	get() {
		return this.camera;
	}
}
