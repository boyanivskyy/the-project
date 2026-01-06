import { Id, type Doc } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { deleteFolderRecursive } from "./folderUtils";

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
	args: { id: v.id("folders"), dataroomId: v.id("datarooms") },
	handler: async (ctx, args) => {
		const folder = await ctx.db.get(args.id);

		if (!folder || folder.dataroomId !== args.dataroomId) {
			throw new Error("Folder not found");
		}

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

export const getAllByDataroom = query({
	args: { dataroomId: v.id("datarooms") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("folders")
			.withIndex("by_dataroomId", (q) =>
				q.eq("dataroomId", args.dataroomId)
			)
			.collect();
	},
});

export const getBreadcrumbPath = query({
	args: {
		folderId: v.id("folders"),
		dataroomId: v.id("datarooms"),
	},
	handler: async (ctx, args) => {
		const path: Array<{ _id: string; name: string }> = [];
		let currentFolderId: Id<"folders"> | null = args.folderId;

		// Walk up the parent chain until we reach the root (parentFolderId is null)
		while (currentFolderId !== null) {
			const folder: Doc<"folders"> | null =
				await ctx.db.get(currentFolderId);
			if (!folder || folder.dataroomId !== args.dataroomId) {
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
	},
});
