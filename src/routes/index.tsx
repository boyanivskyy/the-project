import type { RouteObject } from "react-router";
import { App } from "../App";
import { AppLayout } from "../components/layout/AppLayout";
import { HomePage } from "../pages/HomePage";
import { DataroomPage } from "../pages/DataroomPage";
import { FolderPage } from "../pages/FolderPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { homeLoader, dataroomLoader, folderLoader } from "./loaders";
import { GenericErrorBoundary, NotFoundErrorBoundary } from "./errorBoundaries";

/**
 * Route configuration for the application
 * Uses React Router's data mode with loaders and error boundaries
 */
export const routes: RouteObject[] = [
	{
		path: "/",
		element: <App />,
		errorElement: <GenericErrorBoundary />,
		children: [
			// Public routes
			{
				path: "login",
				element: <LoginPage />,
			},
			{
				path: "signup",
				element: <SignupPage />,
			},
			// Protected routes
			{
				path: "/",
				element: (
					<ProtectedRoute>
						<AppLayout />
					</ProtectedRoute>
				),
				children: [
					{
						index: true,
						element: <HomePage />,
						loader: homeLoader,
					},
					{
						path: "dataroom/:dataroomId",
						element: <DataroomPage />,
						loader: dataroomLoader,
						errorElement: <NotFoundErrorBoundary />,
					},
					{
						path: "dataroom/:dataroomId/folder/:folderId",
						element: <FolderPage />,
						loader: folderLoader,
						errorElement: <NotFoundErrorBoundary />,
					},
				],
			},
		],
	},
];
