import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { deleteFolderRecursive } from "./folderUtils";

export const list = query({
	handler: async (ctx) => {
		return await ctx.db
			.query("datarooms")
			.withIndex("by_createdAt")
			.order("desc")
			.collect();
	},
});

export const get = query({
	args: { id: v.id("datarooms") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: { name: v.string() },
	handler: async (ctx, args) => {
		const now = Date.now();
		return await ctx.db.insert("datarooms", {
			name: args.name,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("datarooms"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const dataroom = await ctx.db.get(args.id);
		if (!dataroom) {
			throw new Error("Dataroom not found");
		}
		await ctx.db.patch(args.id, {
			name: args.name,
			updatedAt: Date.now(),
		});
		return args.id;
	},
});

export const remove = mutation({
	args: { id: v.id("datarooms") },
	handler: async (ctx, args) => {
		// Delete all folders in this dataroom
		const folders = await ctx.db
			.query("folders")
			.withIndex("by_dataroomId", (q) => q.eq("dataroomId", args.id))
			.collect();

		for (const folder of folders) {
			// Recursively delete folder and its contents
			await deleteFolderRecursive(ctx, folder._id);
		}

		// Delete all files in this dataroom (root level)
		const files = await ctx.db
			.query("files")
			.withIndex("by_dataroomId", (q) => q.eq("dataroomId", args.id))
			.collect();

		for (const file of files) {
			await ctx.db.delete(file._id);
			await ctx.storage.delete(file.storageId);
		}

		// Delete the dataroom
		await ctx.db.delete(args.id);
		return args.id;
	},
});

export const getItemCount = query({
	args: { id: v.id("datarooms") },
	handler: async (ctx, args) => {
		const folders = await ctx.db
			.query("folders")
			.withIndex("by_dataroomId", (q) => q.eq("dataroomId", args.id))
			.collect();

		const files = await ctx.db
			.query("files")
			.withIndex("by_dataroomId", (q) => q.eq("dataroomId", args.id))
			.collect();

		return {
			folders: folders.length,
			files: files.length,
			total: folders.length + files.length,
		};
	},
});
