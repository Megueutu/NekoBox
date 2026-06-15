import "./style.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./core/firebase.js";
import { loginApp } from "./pages/login.js";
import { hubApp } from "./pages/hub.js";

const app = document.querySelector("#app");

function normalizePath(pathname) {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}

	return pathname;
}

function renderPage(user) {
	const pathname = normalizePath(window.location.pathname);
	const page = user ? hubApp : loginApp;

	if (user && pathname !== "/hub") {
		window.history.replaceState({}, "", "/hub");
	}

	if (!user && pathname !== "/") {
		window.history.replaceState({}, "", "/");
	}

	app.replaceChildren(page());
}

window.addEventListener("popstate", () => renderPage(auth.currentUser));

onAuthStateChanged(auth, (user) => {
	renderPage(user);
});
