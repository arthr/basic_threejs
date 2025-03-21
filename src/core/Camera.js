import * as THREE from "three";
import { OrbitControls } from "../core/OrbitControlsPatch.js";

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
		this.followMode = false;
		this.target = null;
		this.followOffset = new THREE.Vector3(0, 5, -15); // Offset da câmera em relação ao personagem
		this.followLerpFactor = 0.05; // Fator de suavização do movimento
		this.orbitRadius = 15; // Raio padrão para o modo orbital
		this.preferredAngle = new THREE.Vector3(); // Armazena o ângulo preferido do usuário
		this.cameraResetTimer = 0; // Timer para resetar a posição da câmera
		this.autoResetTime = 5; // Tempo em segundos para resetar a posição quando sem input
		this.lastUserInput = 0; // Timestamp do último input do usuário
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

	enableFollowMode(enabled, target = null) {
		this.followMode = enabled;
		this.target = target;

		if (this.controls && enabled && this.target) {
			// Configurar os controles para funcionar bem com o modo de seguimento
			this.controls.enableDamping = true;
			this.controls.dampingFactor = 0.1; // Aumenta suavização

			// Limite de rotação para evitar que a câmera fique de cabeça para baixo
			this.controls.minPolarAngle = THREE.MathUtils.degToRad(10);
			this.controls.maxPolarAngle = THREE.MathUtils.degToRad(80);

			// Limites de distância para manter o personagem visível
			this.controls.minDistance = 5;
			this.controls.maxDistance = 30;

			// Atualizamos o alvo dos controles para o personagem
			const targetPosition = new THREE.Vector3().copy(
				this.target.position
			);
			targetPosition.y += 1.5; // Alvo um pouco acima do personagem
			this.controls.target.copy(targetPosition);

			// Para o modo híbrido, armazenamos a posição atual da câmera
			if (this.controls.enabled) {
				this.saveCurrentCameraAngle();
			}

			this.controls.update();
		}
	}

	saveCurrentCameraAngle() {
		if (!this.target) return;

		// Salva o ângulo atual preferido pelo usuário
		const direction = new THREE.Vector3();
		direction
			.subVectors(this.camera.position, this.controls.target)
			.normalize();
		this.preferredAngle.copy(direction);

		// Marca o tempo do último input
		this.lastUserInput = Date.now() / 1000;
	}

	resetPosition() {
		this.camera.position.copy(this.initialPosition);
		this.camera.lookAt(this.initialLookAt);
		if (this.controls) this.controls.update();
	}

	update(deltaTime) {
		if (this.followMode && this.target) {
			if (this.controls && this.controls.enabled) {
				// Modo híbrido: segue o personagem mantendo o ângulo e distância escolhidos pelo usuário
				this.updateFollowCameraWithControls(deltaTime);
			} else {
				// Modo de seguimento normal (atrás do personagem)
				this.updateFollowCamera();
			}
		} else if (this.controls && this.controls.enabled) {
			this.controls.update();
		}
	}

	updateFollowCamera() {
		if (!this.target) return;

		// Posição desejada da câmera (atrás e acima do personagem)
		const targetPosition = new THREE.Vector3();

		// Obter a direção para onde o personagem está olhando
		const characterDirection = new THREE.Vector3(0, 0, -1);
		characterDirection.applyQuaternion(this.target.quaternion);

		// Calcular a posição da câmera com base na direção do personagem
		targetPosition
			.copy(this.target.position)
			.add(
				characterDirection.clone().multiplyScalar(-this.followOffset.z)
			)
			.add(new THREE.Vector3(0, this.followOffset.y, 0));

		// Suavizar a transição da câmera
		this.camera.position.lerp(targetPosition, this.followLerpFactor);

		// Fazer a câmera olhar para o personagem (um pouco acima da cabeça)
		const lookAtPosition = new THREE.Vector3().copy(this.target.position);
		lookAtPosition.y += 1.5; // Olhar para a cabeça do personagem
		this.camera.lookAt(lookAtPosition);
	}

	updateFollowCameraWithControls(deltaTime) {
		if (!this.target) return;

		// Quando o usuário move os controles, salvamos seu ângulo preferido
		if (this.controls.isMoving) {
			this.saveCurrentCameraAngle();
		}

		// Atualiza o alvo dos controles para seguir o personagem com suavização
		const targetPosition = new THREE.Vector3().copy(this.target.position);
		targetPosition.y += 1.5; // Altura dos olhos
		this.controls.target.lerp(targetPosition, this.followLerpFactor);

		// Verifica se já passou tempo suficiente desde o último input
		const currentTime = Date.now() / 1000;
		if (currentTime - this.lastUserInput > this.autoResetTime) {
			// Gradualmente retorna para trás do personagem
			this.returnToDefaultPosition(deltaTime);
		}

		this.controls.update();
	}

	returnToDefaultPosition(deltaTime) {
		if (!this.target) return;

		// Obtém a direção para onde o personagem está olhando
		const characterDirection = new THREE.Vector3(0, 0, 1);
		characterDirection.applyQuaternion(this.target.quaternion);

		// Calcula a posição padrão (atrás do personagem)
		const defaultDirection = characterDirection.clone().multiplyScalar(-1);
		defaultDirection.y = 0.3; // Adiciona um pouco de altura
		defaultDirection.normalize();

		// Interpola suavemente entre o ângulo atual e o ângulo padrão
		this.preferredAngle.lerp(defaultDirection, deltaTime * 0.5);

		// Aplica o novo ângulo à câmera mantendo a distância atual
		const currentDistance = this.camera.position.distanceTo(
			this.controls.target
		);
		const newPosition = new THREE.Vector3();
		newPosition
			.copy(this.controls.target)
			.add(this.preferredAngle.clone().multiplyScalar(currentDistance));

		this.camera.position.lerp(newPosition, deltaTime);
	}

	updateAspect() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	}

	get() {
		return this.camera;
	}
}
