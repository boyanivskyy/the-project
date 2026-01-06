import { Id, type Doc } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { deleteFolderRecursive } from "./folderUtils";

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
		.withIndex("by_dataroomId_userEmail", (q: any) =>
			q.eq("dataroomId", dataroomId).eq("userEmail", user.email)
		)
		.first();

	if (!access) {
		throw new Error("Access denied");
	}

	// Check if user has required role
	if (requiredRole) {
		const roleHierarchy = {
			owner: 4,
			admin: 3,
			editor: 2,
			viewer: 1,
		};
		const userRoleLevel =
			roleHierarchy[access.role as keyof typeof roleHierarchy];
		const requiredRoleLevel =
			roleHierarchy[requiredRole as keyof typeof roleHierarchy];

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
		parentFolderId: v.union(v.id("folders"), v.null()),
	},
	handler: async (ctx, args) => {
		// Check if user has access to dataroom
		await checkUserAccess(ctx, args.userId, args.dataroomId);

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
	args: {
		id: v.id("folders"),
		dataroomId: v.id("datarooms"),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		// Check if user has access to dataroom
		await checkUserAccess(ctx, args.userId, args.dataroomId);

		const folder = await ctx.db.get(args.id);

		if (!folder || folder.dataroomId !== args.dataroomId) {
			throw new Error("Folder not found");
		}

		return await ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: {
		userId: v.id("users"),
		name: v.string(),
		dataroomId: v.id("datarooms"),
		parentFolderId: v.union(v.id("folders"), v.null()),
	},
	handler: async (ctx, args) => {
		// Check if user has editor permissions
		await checkUserAccess(ctx, args.userId, args.dataroomId, "editor");

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
		userId: v.id("users"),
		id: v.id("folders"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const folder = await ctx.db.get(args.id);
		if (!folder) {
			throw new Error("Folder not found");
		}

		// Check if user has editor permissions
		await checkUserAccess(ctx, args.userId, folder.dataroomId, "editor");

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
	args: { userId: v.id("users"), id: v.id("folders") },
	handler: async (ctx, args) => {
		const folder = await ctx.db.get(args.id);
		if (!folder) {
			throw new Error("Folder not found");
		}

		// Check if user has editor permissions
		await checkUserAccess(ctx, args.userId, folder.dataroomId, "editor");

		// Recursively delete all subfolders and files
		await deleteFolderRecursive(ctx, args.id);
		return args.id;
	},
});

export const getItemCount = query({
	args: { userId: v.id("users"), id: v.id("folders") },
	handler: async (ctx, args) => {
		const folder = await ctx.db.get(args.id);
		if (!folder) {
			throw new Error("Folder not found");
		}

		// Check if user has access
		await checkUserAccess(ctx, args.userId, folder.dataroomId);

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
	args: { userId: v.id("users"), dataroomId: v.id("datarooms") },
	handler: async (ctx, args) => {
		// Check if user has access
		await checkUserAccess(ctx, args.userId, args.dataroomId);

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
		userId: v.id("users"),
		folderId: v.id("folders"),
		dataroomId: v.id("datarooms"),
	},
	handler: async (ctx, args) => {
		// Check if user has access
		await checkUserAccess(ctx, args.userId, args.dataroomId);

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
