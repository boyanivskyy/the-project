import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router";
import { Button } from "../components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * Maps errors to user-friendly messages
 */
const getErrorMessage = (error: unknown): string => {
	// Handle Response errors from loaders
	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			return "The requested resource was not found. Please check the URL.";
		}
		return error.statusText || "An error occurred. Please try again.";
	}

	// Handle Error objects
	if (error instanceof Error) {
		// Check for ArgumentValidationError
		if (
			error.name === "ArgumentValidationError" ||
			error.message.includes("ArgumentValidationError") ||
			error.message.includes("does not match validator")
		) {
			return "The requested resource was not found. Please check the URL.";
		}

		// Check for ConvexError (application errors)
		if (error.name === "ConvexError" || (error as any).data) {
			return error.message || "An error occurred. Please try again.";
		}

		// Network errors
		if (
			error.message.includes("network") ||
			error.message.includes("fetch") ||
			error.message.includes("Failed to fetch")
		) {
			return "Unable to connect. Please check your internet connection.";
		}

		return error.message || "Something went wrong. Please try again.";
	}

	// Generic error
	return "Something went wrong. Please try again.";
};

/**
 * Base error fallback UI component for route errors
 */
const ErrorFallback = ({ error }: { error: unknown }) => {
	const navigate = useNavigate();
	const message = getErrorMessage(error);

	const handleGoHome = () => {
		navigate("/");
	};

	const handleReset = () => {
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
	const message = getErrorMessage(error);
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
