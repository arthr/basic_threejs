import GUI from "lil-gui";

export class GuiController {
	constructor(container, animationController, face, camera) {
		this.gui = new GUI();
		this.container = container;
		this.animationController = animationController;
		this.face = face;
		this.camera = camera;
		this.api = {
			state: "Walking",
			cameraControls: false,
			followCamera: false,
		};
		this.target = null;
	}

	setCharacterTarget(target) {
		this.target = target;
	}

	setup() {
		const states = [
			"Idle",
			"Walking",
			"Running",
			"Dance",
			"Death",
			"Sitting",
			"Standing",
		];
		const emotes = ["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp"];

		// States folder
		const statesFolder = this.gui.addFolder("States");
		const clipCtrl = statesFolder.add(this.api, "state").options(states);

		clipCtrl.onChange(() => {
			this.animationController.fadeToAction(this.api.state, 0.5);
		});

		statesFolder.open();

		// Emotes folder
		const emoteFolder = this.gui.addFolder("Emotes");

		for (let i = 0; i < emotes.length; i++) {
			this.createEmoteCallback(emotes[i], emoteFolder);
		}

		emoteFolder.open();

		// Expressions folder
		if (this.face) {
			const expressions = Object.keys(this.face.morphTargetDictionary);
			const expressionFolder = this.gui.addFolder("Expressions");

			for (let i = 0; i < expressions.length; i++) {
				expressionFolder
					.add(this.face.morphTargetInfluences, i, 0, 1, 0.01)
					.name(expressions[i]);
			}

			expressionFolder.open();
		}

		// Camera controls folder
		if (this.camera) {
			const cameraFolder = this.gui.addFolder("Camera Controls");

			cameraFolder
				.add(this.api, "cameraControls")
				.name("Enable Controls")
				.onChange((value) => {
					if (!this.camera.controls)
						this.camera.initControls(this.container);
					this.camera.enableControls(value);

					if (value && this.api.followCamera) {
						// Atualiza o modo de seguimento para usar o novo estado dos controles
						this.camera.enableFollowMode(true, this.target);
					}
				});

			cameraFolder
				.add(this.api, "followCamera")
				.name("Follow Camera")
				.onChange((value) => {
					// Se os controles estiverem habilitados, continuam habilitados
					if (this.api.cameraControls && !this.camera.controls) {
						this.camera.initControls(this.container);
					}

					this.camera.enableFollowMode(value, this.target);
				});

			// Adicionar controle para o tempo de auto reset da câmera
			if ("autoResetTime" in this.camera) {
				cameraFolder
					.add(this.camera, "autoResetTime", 1, 10)
					.name("Auto Reset (s)")
					.onChange((value) => {
						this.camera.autoResetTime = value;
					});
			}

			cameraFolder
				.add(
					{ resetCamera: () => this.camera.resetPosition() },
					"resetCamera"
				)
				.name("Reset Camera");

			// Descrição do modo híbrido
			cameraFolder
				.add({ info: "" }, "info")
				.name("Modo Híbrido: Controles + Seguimento")
				.disable();

			cameraFolder.open();
		}
	}

	createEmoteCallback(name, folder) {
		this.api[name] = () => {
			this.animationController.fadeToAction(name, 0.2);
			this.animationController.addEventListener(
				"finished",
				this.restoreState.bind(this)
			);
		};

		folder.add(this.api, name);
	}

	restoreState() {
		this.animationController.removeEventListener(
			"finished",
			this.restoreState.bind(this)
		);
		this.animationController.fadeToAction(this.api.state, 0.2);
	}
}
