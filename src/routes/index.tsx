import type { RouteObject } from "react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { HomePage } from "../pages/HomePage";
import { DataroomPage } from "../pages/DataroomPage";
import { FolderPage } from "../pages/FolderPage";
import { homeLoader, dataroomLoader, folderLoader } from "./loaders";
import {
	GenericErrorBoundary,
	NotFoundErrorBoundary,
} from "./errorBoundaries";

/**
 * Route configuration for the application
 * Uses React Router's data mode with loaders and error boundaries
 */
export const routes: RouteObject[] = [
	{
		path: "/",
		element: <AppLayout />,
		errorElement: <GenericErrorBoundary />,
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
];
