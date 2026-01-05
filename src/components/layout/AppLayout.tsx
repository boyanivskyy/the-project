import { Header } from "../Header";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
	children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 overflow-y-auto">
					<div className="container mx-auto px-4 py-8">
						{children}
					</div>
				</main>
			</div>
			<Toaster position="top-right" />
		</div>
	);
}
