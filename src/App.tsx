import { Outlet } from "react-router";
import { AuthProvider } from "./features/auth/AuthProvider";
import { Toaster } from "sonner";

export const App = () => {
	return (
		<AuthProvider>
			<Outlet />
			<Toaster position="bottom-right" richColors />
		</AuthProvider>
	);
};

export default App;
