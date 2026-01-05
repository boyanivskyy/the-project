import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
	args: {
		dataroomId: v.id("datarooms"),
		parentFolderId: v.union(v.id("folders"), v.null()),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("folders")
			.withIndex("by_dataroomId_parentFolderId", (q) =>
				q
					.eq("dataroomId", args.dataroomId)
					.eq("parentFolderId", args.parentFolderId)
			)
			.collect();
	},
});

export const get = query({
	args: { id: v.id("folders") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		dataroomId: v.id("datarooms"),
		parentFolderId: v.union(v.id("folders"), v.null()),
	},
	handler: async (ctx, args) => {
		// Check for duplicate name
		const existing = await ctx.db
			.query("folders")
			.withIndex("by_dataroomId_parentFolderId", (q) =>
				q
					.eq("dataroomId", args.dataroomId)
					.eq("parentFolderId", args.parentFolderId)
			)
			.filter((q) => q.eq(q.field("name"), args.name))
			.first();

		if (existing) {
			throw new Error("A folder with this name already exists");
		}

		const now = Date.now();
		return await ctx.db.insert("folders", {
			name: args.name,
			dataroomId: args.dataroomId,
			parentFolderId: args.parentFolderId,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("folders"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const folder = await ctx.db.get(args.id);
		if (!folder) {
			throw new Error("Folder not found");
		}

		// Check for duplicate name in the same location
		const existing = await ctx.db
			.query("folders")
			.withIndex("by_dataroomId_parentFolderId", (q) =>
				q
					.eq("dataroomId", folder.dataroomId)
					.eq("parentFolderId", folder.parentFolderId)
			)
			.filter((q) =>
				q.and(
					q.eq(q.field("name"), args.name),
					q.neq(q.field("_id"), args.id)
				)
			)
			.first();

		if (existing) {
			throw new Error("A folder with this name already exists");
		}

		await ctx.db.patch(args.id, {
			name: args.name,
			updatedAt: Date.now(),
		});
		return args.id;
	},
});

export const remove = mutation({
	args: { id: v.id("folders") },
	handler: async (ctx, args) => {
		const folder = await ctx.db.get(args.id);
		if (!folder) {
			throw new Error("Folder not found");
		}

		// Recursively delete all subfolders and files
		await deleteFolderRecursive(ctx, args.id);
		return args.id;
	},
});

// Helper function to recursively delete folders
async function deleteFolderRecursive(
	ctx: any,
	folderId: any
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

export const getItemCount = query({
	args: { id: v.id("folders") },
	handler: async (ctx, args) => {
		const folders = await ctx.db
			.query("folders")
			.withIndex("by_parentFolderId", (q) =>
				q.eq("parentFolderId", args.id)
			)
			.collect();

		const files = await ctx.db
			.query("files")
			.withIndex("by_folderId", (q) => q.eq("folderId", args.id))
			.collect();

		return {
			folders: folders.length,
			files: files.length,
			total: folders.length + files.length,
		};
	},
});
