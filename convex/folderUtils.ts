import { Id } from "./_generated/dataModel";
import { type MutationCtx } from "./_generated/server";

// Helper function to recursively delete folders
export async function deleteFolderRecursive(
	ctx: MutationCtx,
	folderId: Id<"folders">
): Promise<void> {
	// Delete all subfolders
	const subfolders = await ctx.db
		.query("folders")
		.withIndex("by_parentFolderId", (q) => q.eq("parentFolderId", folderId))
		.collect();

	for (const subfolder of subfolders) {
		await deleteFolderRecursive(ctx, subfolder._id);
	}

	// Delete all files in this folder
	const files = await ctx.db
		.query("files")
		.withIndex("by_folderId", (q) => q.eq("folderId", folderId))
		.collect();

	for (const file of files) {
		await ctx.db.delete(file._id);
		await ctx.storage.delete(file.storageId);
	}

	// Delete the folder itself
	await ctx.db.delete(folderId);
}
