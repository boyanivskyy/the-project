import { Outlet } from "react-router";
import { AuthProvider } from "./providers/AuthProvider";

export const App = () => {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
};

export default App;
