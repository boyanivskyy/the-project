import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to check user access
async function checkUserAccess(
	ctx: any,
	userId: string,
	dataroomId: string,
	requiredRole?: "owner" | "admin" | "editor" | "viewer"
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

	// Check if user has required role
	if (requiredRole) {
		const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
		const userRoleLevel = roleHierarchy[access.role];
		const requiredRoleLevel = roleHierarchy[requiredRole];

		if (userRoleLevel < requiredRoleLevel) {
			throw new Error("Insufficient permissions");
		}
	}

	return access;
}

export const list = query({
	args: {
		userId: v.id("users"),
		dataroomId: v.id("datarooms"),
		folderId: v.union(v.id("folders"), v.null()),
	},
	handler: async (ctx, args) => {
		// Check if user has access
		await checkUserAccess(ctx, args.userId, args.dataroomId);

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
	args: { userId: v.id("users"), id: v.id("files") },
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.id);
		if (!file) {
			throw new Error("File not found");
		}

		// Check if user has access
		await checkUserAccess(ctx, args.userId, file.dataroomId);

		return file;
	},
});

export const getUrl = query({
	args: { userId: v.id("users"), storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		// Note: For better security, you might want to check file ownership here
		// For now, assuming if user has the storageId, they have access
		return await ctx.storage.getUrl(args.storageId);
	},
});

export const create = mutation({
	args: {
		userId: v.id("users"),
		name: v.string(),
		dataroomId: v.id("datarooms"),
		folderId: v.union(v.id("folders"), v.null()),
		storageId: v.id("_storage"),
		mimeType: v.string(),
		size: v.number(),
	},
	handler: async (ctx, args) => {
		// Check if user has editor permissions
		await checkUserAccess(ctx, args.userId, args.dataroomId, "editor");

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
		userId: v.id("users"),
		id: v.id("files"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.id);
		if (!file) {
			throw new Error("File not found");
		}

		// Check if user has editor permissions
		await checkUserAccess(ctx, args.userId, file.dataroomId, "editor");

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
	args: { userId: v.id("users"), id: v.id("files") },
	handler: async (ctx, args) => {
		const file = await ctx.db.get(args.id);
		if (!file) {
			throw new Error("File not found");
		}

		// Check if user has editor permissions
		await checkUserAccess(ctx, args.userId, file.dataroomId, "editor");

		await ctx.storage.delete(file.storageId);
		await ctx.db.delete(args.id);
		return args.id;
	},
});

export const generateUploadUrl = mutation({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		// Verify user exists
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		return await ctx.storage.generateUploadUrl();
	},
});
