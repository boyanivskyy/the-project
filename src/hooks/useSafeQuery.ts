import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { FunctionReference } from "convex/server";
import { isValidConvexId } from "../lib/convexUtils";

/**
 * Validates query arguments to check for invalid Convex IDs.
 * Returns true if args are valid, false otherwise.
 */
function validateQueryArgs(args: any): boolean {
	if (!args || args === "skip") {
		return true;
	}

	// Check all string values that might be IDs
	for (const key in args) {
		const value = args[key];
		// Skip null values (they're valid)
		if (value === null || value === undefined) {
			continue;
		}
		if (typeof value === "string" && value.length > 0) {
			// If it looks like it could be an ID (starts with lowercase letter), validate it
			if (/^[a-z]/.test(value) && !isValidConvexId(value)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Safe wrapper around useQuery that handles errors gracefully.
 *
 * This hook validates IDs before calling useQuery. If IDs are invalid,
 * it skips the query and shows a toast notification. Errors are displayed
 * as toast notifications instead of crashing the UI.
 *
 * Note: This hook should be used with an Error Boundary as a safety net
 * to catch any errors that slip through.
 *
 * @param query - The Convex query function reference
 * @param args - Arguments to pass to the query (can be "skip" or an object)
 * @returns The query result, loading state, and error state
 */
export function useSafeQuery<Query extends FunctionReference<"query">>(
	query: Query,
	args: Query["_args"] | "skip" = "skip"
): {
	data: ReturnType<typeof useQuery<Query>>;
	isLoading: boolean;
	error: Error | null;
} {
	const errorRef = useRef<Error | null>(null);
	const hasShownErrorRef = useRef(false);

	// Validate args before calling useQuery
	const isValid = validateQueryArgs(args);

	// Show error toast if args are invalid (only once)
	useEffect(() => {
		if (!isValid && args !== "skip" && !hasShownErrorRef.current) {
			toast.error(
				"The requested resource was not found. Please check the URL."
			);
			hasShownErrorRef.current = true;
		}
	}, [isValid, args]);

	// If args are invalid, skip the query
	const shouldSkip = !isValid && args !== "skip";

	// Call useQuery - errors will be caught by Error Boundary
	const data = useQuery(query, shouldSkip ? "skip" : args);

	// Reset error state when query succeeds
	useEffect(() => {
		if (data !== undefined) {
			errorRef.current = null;
			hasShownErrorRef.current = false;
		}
	}, [data]);

	const isLoading = data === undefined && isValid;
	const error = shouldSkip
		? new Error("Invalid query arguments")
		: errorRef.current;

	return {
		data,
		isLoading,
		error,
	};
}
