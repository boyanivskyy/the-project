/**
 * Converts an unknown error to a user-friendly message string
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
		return error.message || fallback;
	}
	if (typeof error === "string") {
		return error;
	}
	return fallback;
}
