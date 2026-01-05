import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./pages/HomePage";
import { DataroomPage } from "./pages/DataroomPage";
import { FolderPage } from "./pages/FolderPage";

export function App() {
	return (
		<AppLayout>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/dataroom/:dataroomId" element={<DataroomPage />} />
				<Route
					path="/dataroom/:dataroomId/folder/:folderId"
					element={<FolderPage />}
				/>
			</Routes>
		</AppLayout>
	);
}

export default App;
