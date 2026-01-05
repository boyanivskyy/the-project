/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "../styles/globals.css";

const convex = new ConvexReactClient(process.env.CONVEX_URL!);

const elem = document.getElementById("root")!;
const app = (
	<StrictMode>
		<ConvexProvider client={convex}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ConvexProvider>
	</StrictMode>
);

if (import.meta.hot) {
	// With hot module reloading, `import.meta.hot.data` is persisted.
	const root = (import.meta.hot.data.root ??= createRoot(elem));
	root.render(app);
} else {
	// The hot module reloading API is not available in production.
	createRoot(elem).render(app);
}
