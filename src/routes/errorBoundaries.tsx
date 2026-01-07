import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router";
import { Button } from "../components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { toUserMessage } from "../lib/errors/toUserMessage";

/**
 * Base error fallback UI component for route errors
 */
const ErrorFallback = ({ error }: { error: unknown }) => {
	const navigate = useNavigate();
	const message = toUserMessage(
		error,
		"Something went wrong. Please try again."
	);

	const logoutErrors = ["Access denied", "User not found"];

	const handleGoHome = () => {
		alert(message);

		if (logoutErrors.includes(message)) {
			localStorage.removeItem("authUser");
			window.location.href = "/login";
			return;
		}
		navigate("/");
	};

	const handleReset = () => {
		if (logoutErrors.includes(message)) {
			localStorage.removeItem("authUser");
		}
		window.location.reload();
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-8">
			<AlertTriangle className="h-12 w-12 text-destructive mb-4" />
			<h2 className="text-2xl font-semibold mb-2">
				Something went wrong
			</h2>
			<p className="text-muted-foreground mb-6 text-center max-w-md">
				{message}
			</p>
			<div className="flex gap-3">
				<Button onClick={handleReset} variant="outline">
					Try Again
				</Button>
				<Button onClick={handleGoHome}>Go Home</Button>
			</div>
		</div>
	);
};

/**
 * Route error boundary that uses React Router's useRouteError hook
 * This is the base component that all route error boundaries should use
 */
export const RouteErrorBoundary = () => {
	const error = useRouteError();

	// Log error for debugging
	console.error("Route error caught:", error);

	// Show toast notification
	const message = toUserMessage(
		error,
		"Something went wrong. Please try again."
	);
	toast.error(message);

	return <ErrorFallback error={error} />;
};

/**
 * Error boundary specifically for 404 errors (invalid IDs)
 * Used for dataroom and folder routes
 */
export const NotFoundErrorBoundary = () => {
	return <RouteErrorBoundary />;
};

/**
 * Generic error boundary for catching all other route errors
 * Used as the top-level error boundary
 */
export const GenericErrorBoundary = () => {
	return <RouteErrorBoundary />;
};
