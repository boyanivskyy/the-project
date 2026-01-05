import { Header } from "../Header";
import { Toaster } from "sonner";

interface AppLayoutProps {
	children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<main className="container mx-auto px-4 py-8">{children}</main>
			<Toaster position="top-right" />
		</div>
	);
}
