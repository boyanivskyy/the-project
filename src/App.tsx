import { Outlet } from "react-router";
import { AuthProvider } from "./features/auth/AuthProvider";
import { Toaster } from "sonner";

export const App = () => {
	return (
		<AuthProvider>
			<Outlet />
			<Toaster position="bottom-right" />
		</AuthProvider>
	);
};

export default App;
