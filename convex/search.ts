import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Helper function to check user access
async function checkUserAccess(
	ctx: any,
	userId: string,
	dataroomId: string
) {
	const user = await ctx.db.get(userId);
	if (!user) {
		throw new Error("User not found");
	}

	const access = await ctx.db
		.query("dataroomAccess")
		.withIndex("by_dataroomId_userEmail", (q) =>
			q.eq("dataroomId", dataroomId).eq("userEmail", user.email)
		)
		.first();

	if (!access) {
		throw new Error("Access denied");
	}

	return access;
}

// Helper function to build folder path
async function buildFolderPath(
	ctx: any,
	folderId: Id<"folders">,
	dataroomId: Id<"datarooms">
): Promise<Array<{ _id: string; name: string }>> {
	const path: Array<{ _id: string; name: string }> = [];
	let currentFolderId: Id<"folders"> | null = folderId;

	// Walk up the parent chain until we reach the root
	while (currentFolderId !== null) {
		const folder = await ctx.db.get(currentFolderId);
		if (!folder || folder.dataroomId !== dataroomId) {
			break;
		}

		// Add to beginning of array so we get root-to-leaf order
		path.unshift({
			_id: folder._id,
			name: folder.name,
		});

		currentFolderId = folder.parentFolderId;
	}

	return path;
}

export type SearchResult = {
	type: "dataroom" | "folder" | "file";
	id: string;
	name: string;
	path: string; // Full path string for display (e.g., "Dataroom > Folder > Subfolder")
	dataroomId: Id<"datarooms">;
	folderId: Id<"folders"> | null;
	role?: "owner" | "admin" | "editor" | "viewer";
};

export const searchAll = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args): Promise<SearchResult[]> => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		const results: SearchResult[] = [];

		// Get all access records for this user's email
		const accessRecords = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_userEmail", (q) => q.eq("userEmail", user.email))
			.collect();

		// Process each dataroom the user has access to
		for (const access of accessRecords) {
			const dataroom = await ctx.db.get(access.dataroomId);
			if (!dataroom) continue; // Skip deleted datarooms

			// Add dataroom to results
			results.push({
				type: "dataroom",
				id: dataroom._id,
				name: dataroom.name,
				path: dataroom.name,
				dataroomId: dataroom._id,
				folderId: null,
				role: access.role,
			});

			// Get all folders in this dataroom
			const folders = await ctx.db
				.query("folders")
				.withIndex("by_dataroomId", (q) =>
					q.eq("dataroomId", dataroom._id)
				)
				.collect();

			// Process each folder and build its path
			for (const folder of folders) {
				const folderPath = await buildFolderPath(
					ctx,
					folder._id,
					dataroom._id
				);

				// Build path string: "Dataroom > Folder > Subfolder"
				const pathParts = [dataroom.name, ...folderPath.map((f) => f.name)];
				const pathString = pathParts.join(" > ");

				results.push({
					type: "folder",
					id: folder._id,
					name: folder.name,
					path: pathString,
					dataroomId: dataroom._id,
					folderId: folder._id,
				});
			}

			// Get all files in this dataroom
			const files = await ctx.db
				.query("files")
				.withIndex("by_dataroomId", (q) =>
					q.eq("dataroomId", dataroom._id)
				)
				.collect();

			// Process each file and build its path
			for (const file of files) {
				let pathString = dataroom.name;

				// If file is in a folder, build the folder path
				if (file.folderId) {
					const folderPath = await buildFolderPath(
						ctx,
						file.folderId,
						dataroom._id
					);
					const pathParts = [
						dataroom.name,
						...folderPath.map((f) => f.name),
					];
					pathString = pathParts.join(" > ");
				}

				results.push({
					type: "file",
					id: file._id,
					name: file.name,
					path: pathString,
					dataroomId: dataroom._id,
					folderId: file.folderId,
				});
			}
		}

		return results;
	},
});
