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
		};
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
				});

			cameraFolder
				.add(
					{ resetCamera: () => this.camera.resetPosition() },
					"resetCamera"
				)
				.name("Reset Camera");

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
