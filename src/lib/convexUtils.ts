/**
 * Utility functions for working with Convex IDs and validation
 */

/**
 * Validates if a string matches the Convex ID format.
 * Convex IDs typically start with a lowercase letter followed by alphanumeric characters.
 * Pattern: /^[a-z][a-z0-9]*$/
 */
export function isValidConvexId(id: string | null | undefined): boolean {
	if (!id || typeof id !== "string") {
		return false;
	}
	// Convex IDs start with a lowercase letter and contain only lowercase letters and numbers
	return /^[a-z][a-z0-9]*$/.test(id);
}
