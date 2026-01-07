/**
 * Cleans up a raw error message by removing Convex metadata and technical details
 *
 * @param message - The raw error message
 * @returns A cleaned, user-friendly message
 */
function cleanConvexError(message: string): string {
	// Pattern 1: "Server Error Uncaught Error: {MESSAGE} at handler"
	// Captures the actual error message between "Error:" and "at handler"
	let match = message.match(
		/Server Error Uncaught Error:\s*(.+?)\s+at handler/
	);
	if (match && match[1]) {
		return match[1].trim();
	}

	// Pattern 2: "Uncaught Error: {MESSAGE} at"
	// Handles simpler error formats
	match = message.match(/Uncaught Error:\s*(.+?)\s+at\s/);
	if (match && match[1]) {
		return match[1].trim();
	}

	// Pattern 3: Remove [CONVEX ...] and [Request ID: ...] prefixes
	// Handles cases where the error might not have the full format
	let cleaned = message
		.replace(/\[CONVEX [MQ]\([^\]]+\)\]\s*/g, "")
		.replace(/\[Request ID:[^\]]+\]\s*/g, "")
		.replace(/Server Error Uncaught Error:\s*/g, "")
		.replace(/Uncaught Error:\s*/g, "");

	// Pattern 4: Remove file paths and line numbers
	// Example: "at handler (../convex/folders.ts:116:14)" or "at async handler (...)"
	cleaned = cleaned.replace(/\s+at\s+\w+\s*\([^)]+\)/g, "");
	cleaned = cleaned.replace(/\s+at\s+async\s+\w+\s*\([^)]+\)/g, "");

	// Pattern 5: Remove "Called by client" suffix
	cleaned = cleaned.replace(/\s+Called by client\s*$/g, "");

	// Extract just "Error: {message}" if present
	const errorMatch = cleaned.match(/Error:\s*(.+)/);
	if (errorMatch && errorMatch[1]) {
		return errorMatch[1].trim();
	}

	return cleaned.trim();
}

/**
 * Maps technical error messages to user-friendly versions
 *
 * @param message - The cleaned error message
 * @returns A more user-friendly version if mapping exists, otherwise the original
 */
function enhanceErrorMessage(message: string): string {
	const mappings: Record<string, string> = {
		"Access denied": "You don't have permission to access this resource",
		"Insufficient permissions":
			"You don't have permission to perform this action",
		"File not found": "The file you're looking for doesn't exist",
		"Folder not found": "The folder you're looking for doesn't exist",
		"Dataroom not found": "The dataroom you're looking for doesn't exist",
	};

	return mappings[message] || message;
}

/**
 * Converts an unknown error to a user-friendly message string
 *
 * This function handles Convex errors by stripping technical metadata like:
 * - [CONVEX M(...)] prefixes
 * - [Request ID: ...] identifiers
 * - File paths and line numbers
 * - "Called by client" suffixes
 *
 * @param error - The error to convert (can be Error, string, or unknown)
 * @param fallback - Fallback message if error cannot be converted
 * @returns A user-friendly error message
 */
export function toUserMessage(
	error: unknown,
	fallback = "An unexpected error occurred"
): string {
	if (error instanceof Error) {
		const message = error.message;

		// Check if this is a Convex error format
		if (message.includes("CONVEX") || message.includes("Server Error")) {
			const cleaned = cleanConvexError(message);
			return enhanceErrorMessage(cleaned) || fallback;
		}

		// Handle network errors
		if (
			message.includes("network") ||
			message.includes("fetch") ||
			message.includes("Failed to fetch")
		) {
			return "Unable to connect. Please check your internet connection.";
		}

		// Handle argument validation errors
		if (
			error.name === "ArgumentValidationError" ||
			message.includes("ArgumentValidationError") ||
			message.includes("does not match validator")
		) {
			return "Resource not found. Please check the URL.";
		}

		return enhanceErrorMessage(message) || fallback;
	}

	if (typeof error === "string") {
		// Clean string errors that might have Convex format
		if (error.includes("CONVEX") || error.includes("Server Error")) {
			const cleaned = cleanConvexError(error);
			return enhanceErrorMessage(cleaned) || fallback;
		}
		return error;
	}

	return fallback;
}
