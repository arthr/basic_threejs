import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Patch para adicionar detecção de movimento aos OrbitControls
const originalHandleMouseMoveRotate =
	OrbitControls.prototype.handleMouseMoveRotate;
const originalHandleMouseMoveDolly =
	OrbitControls.prototype.handleMouseMoveDolly;
const originalHandleMouseMovePan = OrbitControls.prototype.handleMouseMovePan;
const originalHandleTouchMoveRotate =
	OrbitControls.prototype.handleTouchMoveRotate;
const originalHandleTouchMoveDolly =
	OrbitControls.prototype.handleTouchMoveDolly;
const originalHandleTouchMovePan = OrbitControls.prototype.handleTouchMovePan;

OrbitControls.prototype.handleMouseMoveRotate = function () {
	this.isMoving = true;
	originalHandleMouseMoveRotate.apply(this, arguments);
};

OrbitControls.prototype.handleMouseMoveDolly = function () {
	this.isMoving = true;
	originalHandleMouseMoveDolly.apply(this, arguments);
};

OrbitControls.prototype.handleMouseMovePan = function () {
	this.isMoving = true;
	originalHandleMouseMovePan.apply(this, arguments);
};

OrbitControls.prototype.handleTouchMoveRotate = function () {
	this.isMoving = true;
	originalHandleTouchMoveRotate.apply(this, arguments);
};

OrbitControls.prototype.handleTouchMoveDolly = function () {
	this.isMoving = true;
	originalHandleTouchMoveDolly.apply(this, arguments);
};

OrbitControls.prototype.handleTouchMovePan = function () {
	this.isMoving = true;
	originalHandleTouchMovePan.apply(this, arguments);
};

// Adiciona um listener para reset do estado de movimento
window.addEventListener("mouseup", () => {
	const controls = document.querySelectorAll(".orbit-controls");
	controls.forEach((control) => {
		if (control.__orbitControls) {
			control.__orbitControls.isMoving = false;
		}
	});
});

window.addEventListener("touchend", () => {
	const controls = document.querySelectorAll(".orbit-controls");
	controls.forEach((control) => {
		if (control.__orbitControls) {
			control.__orbitControls.isMoving = false;
		}
	});
});

export { OrbitControls };
