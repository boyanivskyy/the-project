import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
	args: {
		dataroomId: v.id("datarooms"),
		folderId: v.union(v.id("folders"), v.null()),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("files")
			.withIndex("by_dataroomId_folderId", (q) =>
				q
					.eq("dataroomId", args.dataroomId)
					.eq("folderId", args.folderId)
			)
			.collect();
	},
});

export const get = query({
	args: { id: v.id("files") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	},
});

export const getUrl = query({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		return await ctx.storage.getUrl(args.storageId);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		dataroomId: v.id("datarooms"),
		folderId: v.union(v.id("folders"), v.null()),
		storageId: v.id("_storage"),
		mimeType: v.string(),
		size: v.number(),
	},
	handler: async (ctx, args) => {
		// Validate file type (only PDF)
		if (args.mimeType !== "application/pdf") {
			throw new Error("Only PDF files are supported");
		}

		// Check for duplicate name
		const existing = await ctx.db
			.query("files")
			.withIndex("by_dataroomId_folderId", (q) =>
				q
					.eq("dataroomId", args.dataroomId)
					.eq("folderId", args.folderId)
			)
			.filter((q) => q.eq(q.field("name"), args.name))
			.first();

		if (existing) {
			throw new Error("A file with this name already exists");
		}

		const now = Date.now();
		return await ctx.db.insert("files", {
			name: args.name,
			dataroomId: args.dataroomId,
			folderId: args.folderId,
			storageId: args.storageId,
			mimeType: args.mimeType,
			size: args.size,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("files"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.id);
		if (!file) {
			throw new Error("File not found");
		}

		// Check for duplicate name in the same location
		const existing = await ctx.db
			.query("files")
			.withIndex("by_dataroomId_folderId", (q) =>
				q
					.eq("dataroomId", file.dataroomId)
					.eq("folderId", file.folderId)
			)
			.filter((q) =>
				q.and(
					q.eq(q.field("name"), args.name),
					q.neq(q.field("_id"), args.id)
				)
			)
			.first();

		if (existing) {
			throw new Error("A file with this name already exists");
		}

		await ctx.db.patch(args.id, {
			name: args.name,
			updatedAt: Date.now(),
		});
		return args.id;
	},
});

export const remove = mutation({
	args: { id: v.id("files") },
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.id);
		if (!file) {
			throw new Error("File not found");
		}

		await ctx.storage.delete(file.storageId);
		await ctx.db.delete(args.id);
		return args.id;
	},
});

export const generateUploadUrl = mutation({
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	},
});
