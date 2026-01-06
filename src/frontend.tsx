/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";
import "../styles/globals.css";

const convex = new ConvexReactClient(process.env.CONVEX_URL!);

const router = createBrowserRouter(routes);

const elem = document.getElementById("root")!;

const app = (
	<StrictMode>
		<ConvexProvider client={convex}>
			<RouterProvider router={router} />
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
