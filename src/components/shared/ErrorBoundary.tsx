import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";
import { toUserMessage } from "../../lib/errors/toUserMessage";

interface ErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}

/**
 * Fallback UI component displayed when an error is caught
 */
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
	const userMessage = toUserMessage(
		error,
		"Something went wrong. Please try again."
	);

	const handleGoHome = () => {
		window.location.href = "/";
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] p-8">
			<AlertTriangle className="h-12 w-12 text-destructive mb-4" />
			<h2 className="text-2xl font-semibold mb-2">
				Something went wrong
			</h2>
			<p className="text-muted-foreground mb-6 text-center max-w-md">
				{userMessage}
			</p>
			<div className="flex gap-3">
				<Button onClick={resetErrorBoundary} variant="outline">
					Try Again
				</Button>
				<Button onClick={handleGoHome}>Go Home</Button>
			</div>
		</div>
	);
}

interface Props {
	children: React.ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error Boundary component that catches errors in the component tree
 * and displays a fallback UI instead of crashing the app.
 * Uses react-error-boundary library for better React compatibility.
 */
export function ErrorBoundary({ children, onError }: Props) {
	const handleError = (
		error: Error,
		errorInfo: { componentStack: string }
	) => {
		// Log error for debugging
		console.error("Error caught by ErrorBoundary:", error, errorInfo);

		// Show toast notification
		const message = toUserMessage(
			error,
			"Something went wrong. Please try again."
		);
		toast.error(message);

		// Call optional error handler
		if (onError) {
			onError(error, errorInfo as React.ErrorInfo);
		}
	};

	return (
		<ReactErrorBoundary
			FallbackComponent={ErrorFallback}
			onError={handleError}
			onReset={() => {
				// Reset logic is handled by resetErrorBoundary in ErrorFallback
			}}
		>
			{children}
		</ReactErrorBoundary>
	);
}
