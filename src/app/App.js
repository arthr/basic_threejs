import * as THREE from "three";
import { Camera } from "../core/Camera.js";
import { Scene } from "../core/Scene.js";
import { Renderer } from "../core/Renderer.js";
import { LightSetup } from "../lights/LightSetup.js";
import { CharacterModel } from "../models/CharacterModel.js";
import { AnimationController } from "../animation/AnimationController.js";
import { GuiController } from "../ui/GuiController.js";

export class App {
	constructor() {
		this.container = null;
		this.clock = new THREE.Clock();
	}

	init() {
		// Criar container
		this.container = document.createElement("div");
		document.body.appendChild(this.container);

		// Inicializar componentes principais
		this.camera = new Camera();
		this.scene = new Scene();
		this.renderer = new Renderer(this.container);

		// Configurar luzes
		new LightSetup(this.scene.get());

		// Carregar modelo do personagem
		this.characterModel = new CharacterModel(
			this.scene.get(),
			this.onModelLoaded.bind(this)
		);
		this.characterModel.load();

		// Configurar eventos
		window.addEventListener("resize", this.onWindowResize.bind(this));

		// Configurar loop de animação
		this.renderer.setAnimationLoop(this.animate.bind(this));
	}

	onModelLoaded(model, animations) {
		this.animationController = new AnimationController(model);
		this.animationController.setupAnimations(animations);

		const face = this.characterModel.getFace();
		this.guiController = new GuiController(
			this.container,
			this.animationController,
			face,
			this.camera
		);
		this.guiController.setup();
	}

	onWindowResize() {
		this.camera.updateAspect();
		this.renderer.updateSize();
	}

	animate() {
		const deltaTime = this.clock.getDelta();

		if (this.animationController) {
			this.animationController.update(deltaTime);
		}

		this.renderer.render(this.scene.get(), this.camera.get());
	}
}
