import * as THREE from "three";

export class Scene {
	constructor() {
		this.scene = new THREE.Scene();
		this.setupBackground();
		this.setupGround();
	}

	setupBackground() {
		this.scene.background = new THREE.Color(0xe0e0e0);
		this.scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);
	}

	setupGround() {
		// Ground plane
		const mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(2000, 2000),
			new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
		);
		mesh.rotation.x = -Math.PI / 2;
		this.scene.add(mesh);

		// Grid helper
		const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		this.scene.add(grid);
	}

	add(object) {
		this.scene.add(object);
	}

	get() {
		return this.scene;
	}
}
