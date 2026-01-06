import { Outlet } from "react-router";
import { AuthProvider } from "./features/auth/AuthProvider";

export const App = () => {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
};

export default App;
