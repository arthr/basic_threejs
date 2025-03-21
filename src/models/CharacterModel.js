import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class CharacterModel {
	constructor(
		scene,
		onModelLoaded,
		modelPath = "/models/robot/RobotExpressive.glb"
	) {
		this.scene = scene;
		this.onModelLoaded = onModelLoaded;
		this.modelPath = modelPath;
		this.model = null;
		this.face = null;
	}

	load(onProgress) {
		const loader = new GLTFLoader();
		loader.load(
			this.modelPath,
			(gltf) => {
				this.model = gltf.scene;
				this.scene.add(this.model);
				this.face = this.model.getObjectByName("Head_4");

				if (this.onModelLoaded) {
					this.onModelLoaded(this.model, gltf.animations);
				}
			},
			// Função de progresso para feedback durante o carregamento
			(xhr) => {
				if (onProgress) {
					const percentComplete = (xhr.loaded / xhr.total) * 100;
					onProgress(percentComplete);
				}
			},
			(error) => {
				console.error("Erro ao carregar o modelo:", error);
			}
		);
	}

	getModel() {
		return this.model;
	}

	getFace() {
		return this.face;
	}
}
