import * as THREE from "three";

export class LightSetup {
	constructor(scene) {
		this.scene = scene;
		this.setupLights();
	}

	setupLights() {
		// Hemisphere light
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
		hemiLight.position.set(0, 20, 0);
		this.scene.add(hemiLight);

		// Directional light
		const dirLight = new THREE.DirectionalLight(0xffffff, 3);
		dirLight.position.set(0, 20, 10);
		this.scene.add(dirLight);
	}
}
