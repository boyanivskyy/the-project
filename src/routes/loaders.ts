import { LoaderFunctionArgs } from "react-router";
import { isValidConvexId } from "@/lib/convexUtils";

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

	return { dataroomId };
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

	return { dataroomId, folderId };
}
