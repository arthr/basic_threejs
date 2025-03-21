import * as THREE from "three";

export class AnimationController {
	constructor(model) {
		this.model = model;
		this.mixer = new THREE.AnimationMixer(model);
		this.actions = {};
		this.activeAction = null;
		this.previousAction = null;
	}

	setupAnimations(animations) {
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

		for (let i = 0; i < animations.length; i++) {
			const clip = animations[i];
			const action = this.mixer.clipAction(clip);
			this.actions[clip.name] = action;

			if (
				emotes.indexOf(clip.name) >= 0 ||
				states.indexOf(clip.name) >= 4
			) {
				action.clampWhenFinished = true;
				action.loop = THREE.LoopOnce;
			}
		}

		// Set default animation
		this.activeAction = this.actions["Walking"];
		this.activeAction.play();
	}

	fadeToAction(name, duration) {
		this.previousAction = this.activeAction;
		this.activeAction = this.actions[name];

		if (this.previousAction !== this.activeAction) {
			this.previousAction.fadeOut(duration);
		}

		this.activeAction
			.reset()
			.setEffectiveTimeScale(1)
			.setEffectiveWeight(1)
			.fadeIn(duration)
			.play();
	}

	update(deltaTime) {
		if (this.mixer) {
			this.mixer.update(deltaTime);
		}
	}

	addEventListener(event, callback) {
		this.mixer.addEventListener(event, callback);
	}

	removeEventListener(event, callback) {
		this.mixer.removeEventListener(event, callback);
	}

	getActions() {
		return this.actions;
	}

	getMixer() {
		return this.mixer;
	}
}
