import * as THREE from "three";

export class CharacterController {
	constructor(model, animationController) {
		this.model = model;
		this.animationController = animationController;
		this.keys = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			sprint: false,
			jump: false,
		};
		this.baseSpeed = 5.0;
		this.sprintMultiplier = 1.8;
		this.moveSpeed = this.baseSpeed;
		this.rotationSpeed = 20.0; // Aumentado para uma rotação mais responsiva
		this.smoothRotation = 0.5; // Valor para suavização da rotação
		this.currentRotationSpeed = 0; // Para controlar a aceleração da rotação
		this.direction = new THREE.Vector3();
		this.rotationTarget = new THREE.Quaternion();

		// Configurações de pulo
		this.jumpHeight = 2.0;
		this.gravity = 30.0;
		this.verticalVelocity = 0;
		this.isJumping = false;
		this.jumpCooldown = 0;

		this.setupInputListeners();
	}

	setupInputListeners() {
		// Utilizando bind para manter o contexto correto do this
		this.onKeyDownBound = this.onKeyDown.bind(this);
		this.onKeyUpBound = this.onKeyUp.bind(this);

		document.addEventListener("keydown", this.onKeyDownBound);
		document.addEventListener("keyup", this.onKeyUpBound);
	}

	onKeyDown(event) {
		switch (event.code) {
			case "KeyW":
				this.keys.forward = true;
				break;
			case "KeyS":
				this.keys.backward = true;
				break;
			case "KeyA":
				this.keys.left = true;
				break;
			case "KeyD":
				this.keys.right = true;
				break;
			case "ShiftLeft":
			case "ShiftRight":
				this.keys.sprint = true;
				break;
			case "Space":
				// Só permite pular se não estiver já pulando e se o cooldown terminou
				if (!this.isJumping && this.jumpCooldown <= 0) {
					this.keys.jump = true;
					this.isJumping = true;
					this.verticalVelocity = Math.sqrt(
						2 * this.gravity * this.jumpHeight
					);
				}
				break;
		}
	}

	onKeyUp(event) {
		switch (event.code) {
			case "KeyW":
				this.keys.forward = false;
				break;
			case "KeyS":
				this.keys.backward = false;
				break;
			case "KeyA":
				this.keys.left = false;
				break;
			case "KeyD":
				this.keys.right = false;
				break;
			case "ShiftLeft":
			case "ShiftRight":
				this.keys.sprint = false;
				break;
			case "Space":
				this.keys.jump = false;
				break;
		}
	}

	update(deltaTime) {
		// Atualiza a velocidade de movimento com base no sprint
		this.moveSpeed = this.keys.sprint
			? this.baseSpeed * this.sprintMultiplier
			: this.baseSpeed;

		// Determina se há movimento horizontal
		const isMoving =
			this.keys.forward ||
			this.keys.backward ||
			this.keys.left ||
			this.keys.right;

		// Processa o pulo e a gravidade
		this.updateJump(deltaTime);

		// Atualiza animação com base no movimento e estado
		this.updateAnimation(isMoving);

		if (isMoving) {
			// Calcula direção de movimento
			this.direction.set(0, 0, 0);
			if (this.keys.forward) this.direction.z -= 1;
			if (this.keys.backward) this.direction.z += 1;
			if (this.keys.left) this.direction.x -= 1;
			if (this.keys.right) this.direction.x += 1;

			// Normaliza para movimento consistente em diagonais
			if (this.direction.lengthSq() > 0) {
				this.direction.normalize();
			}

			// Move o personagem
			this.model.position.x +=
				this.direction.x * this.moveSpeed * deltaTime;
			this.model.position.z +=
				this.direction.z * this.moveSpeed * deltaTime;

			// Rotaciona o personagem na direção do movimento com rotação suavizada
			if (this.direction.lengthSq() > 0) {
				const angle = Math.atan2(this.direction.x, this.direction.z);

				// Calcula a diferença atual entre a rotação do modelo e o alvo
				const currentYRotation = this.getYRotation(
					this.model.quaternion
				);
				let rotationDiff = angle - currentYRotation;

				// Ajusta a diferença para sempre escolher o caminho mais curto na rotação
				if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
				if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

				// Aplica suavização na velocidade de rotação
				this.currentRotationSpeed = THREE.MathUtils.lerp(
					this.currentRotationSpeed,
					Math.abs(rotationDiff) * this.rotationSpeed,
					this.smoothRotation
				);

				// Limita a velocidade máxima de rotação
				const maxRotationSpeed = this.rotationSpeed * deltaTime;
				const rotationAmount = Math.min(
					this.currentRotationSpeed * deltaTime,
					maxRotationSpeed
				);

				// Aplica a rotação na direção correta
				const step = Math.sign(rotationDiff) * rotationAmount;

				// Cria um novo quaternion para a rotação alvo
				this.rotationTarget.setFromAxisAngle(
					new THREE.Vector3(0, 1, 0),
					currentYRotation + step
				);

				// Aplica a rotação ao modelo
				this.model.quaternion.copy(this.rotationTarget);
			}
		} else {
			// Reduz a velocidade de rotação quando parado
			this.currentRotationSpeed = THREE.MathUtils.lerp(
				this.currentRotationSpeed,
				0,
				0.1
			);
		}
	}

	updateJump(deltaTime) {
		// Atualiza o contador de cooldown do pulo
		if (this.jumpCooldown > 0) {
			this.jumpCooldown -= deltaTime;
		}

		// Aplica gravidade
		this.verticalVelocity -= this.gravity * deltaTime;

		// Atualiza a posição vertical
		this.model.position.y += this.verticalVelocity * deltaTime;

		// Verifica se o personagem chegou ao chão
		if (this.model.position.y <= 0 && this.verticalVelocity < 0) {
			this.model.position.y = 0;
			this.verticalVelocity = 0;

			if (this.isJumping) {
				this.isJumping = false;
				// Define um pequeno cooldown entre pulos
				this.jumpCooldown = 0.2;
			}
		}
	}

	// Função auxiliar para extrair a rotação Y de um quaternion
	getYRotation(quaternion) {
		const euler = new THREE.Euler().setFromQuaternion(quaternion, "YXZ");
		return euler.y;
	}

	updateAnimation(isMoving) {
		// Define a animação com base no estado atual
		let targetAnimation = "Idle";

		if (this.isJumping) {
			targetAnimation = "Jump";
		} else if (isMoving) {
			if (this.keys.sprint) {
				targetAnimation = "Running";
			} else {
				targetAnimation = "Walking";
			}
		}

		// Só altera a animação se for diferente da atual
		if (
			this.animationController.getActions()[targetAnimation] &&
			this.animationController.activeAction !==
				this.animationController.getActions()[targetAnimation]
		) {
			const transitionTime = this.isJumping ? 0.1 : 0.2; // Transição mais rápida para pulo
			this.animationController.fadeToAction(
				targetAnimation,
				transitionTime
			);
		}
	}

	dispose() {
		// Remove os event listeners quando não precisar mais do controlador
		document.removeEventListener("keydown", this.onKeyDownBound);
		document.removeEventListener("keyup", this.onKeyUpBound);
	}
}
