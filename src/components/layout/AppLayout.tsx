import { Outlet } from "react-router";
import { Header } from "../Header";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { DialogProvider } from "../providers/DialogProvider";

export function AppLayout() {
	return (
		<div className="h-screen bg-background flex flex-col overflow-hidden">
			<Header />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 flex flex-col overflow-hidden">
					<div className="container mx-auto px-4 py-8 flex-1 flex flex-col overflow-hidden">
						<ErrorBoundary>
							<Outlet />
						</ErrorBoundary>
					</div>
				</main>
			</div>
			<Toaster position="bottom-right" />
			<DialogProvider />
		</div>
	);
}
