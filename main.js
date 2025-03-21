import { App } from "./src/app/App.js";

// Inicia a aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
	const app = new App();
	app.init();
});
