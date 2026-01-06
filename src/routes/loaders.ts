import type { LoaderFunctionArgs } from "react-router";
import { isValidConvexId } from "@/lib/convexUtils";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Loader for home route - no validation needed
 */
export function homeLoader() {
	return null;
}

/**
 * Loader for dataroom route - validates dataroomId parameter
 * Throws Response with 404 status if validation fails
 */
export function dataroomLoader({ params }: LoaderFunctionArgs) {
	const { dataroomId } = params;

	if (!dataroomId || !isValidConvexId(dataroomId)) {
		throw new Response("Invalid dataroom ID", { status: 404 });
	}

	return { dataroomId: dataroomId as Id<"datarooms"> };
}

/**
 * Loader for folder route - validates both dataroomId and folderId parameters
 * Throws Response with 404 status if validation fails
 */
export function folderLoader({ params }: LoaderFunctionArgs) {
	const { dataroomId, folderId } = params;

	if (!dataroomId || !isValidConvexId(dataroomId)) {
		throw new Response("Invalid dataroom ID", { status: 404 });
	}

	if (!folderId || !isValidConvexId(folderId)) {
		throw new Response("Invalid folder ID", { status: 404 });
	}

	return {
		dataroomId: dataroomId as Id<"datarooms">,
		folderId: folderId as Id<"folders">,
	};
}
