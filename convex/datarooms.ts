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
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		// Get all access records for this user's email
		const accessRecords = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_userEmail", (q) => q.eq("userEmail", user.email))
			.collect();

		// Fetch the actual dataroom details
		const datarooms = await Promise.all(
			accessRecords.map(async (access) => {
				const dataroom = await ctx.db.get(access.dataroomId);
				if (!dataroom) return null;
				return {
					...dataroom,
					role: access.role,
				};
			})
		);

		// Filter out null values (deleted datarooms) and sort by creation date
		return datarooms
			.filter((d) => d !== null)
			.sort((a, b) => b.createdAt - a.createdAt);
	},
});

export const get = query({
	args: { id: v.id("datarooms"), userId: v.id("users") },
	handler: async (ctx, args) => {
		// Check if user has access
		await checkUserAccess(ctx, args.userId, args.id);
		return await ctx.db.get(args.id);
	},
});

export const create = mutation({
	args: { name: v.string(), userId: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			throw new Error("User not found");
		}

		// Check if a dataroom with the same name (case-insensitive) already exists for this user
		const accessRecords = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_userEmail", (q) => q.eq("userEmail", user.email))
			.collect();

		const existingDatarooms = await Promise.all(
			accessRecords.map(async (access) => {
				const dataroom = await ctx.db.get(access.dataroomId);
				return dataroom;
			})
		);

		const normalizedNewName = args.name.toLowerCase();
		const duplicateDataroom = existingDatarooms.find(
			(dataroom) =>
				dataroom && dataroom.name.toLowerCase() === normalizedNewName
		);

		if (duplicateDataroom) {
			throw new Error(
				`A dataroom with the name "${duplicateDataroom.name}" already exists`
			);
		}

		const now = Date.now();
		const dataroomId = await ctx.db.insert("datarooms", {
			name: args.name,
			ownerId: args.userId,
			createdAt: now,
			updatedAt: now,
		});

		// Create owner access record
		await ctx.db.insert("dataroomAccess", {
			dataroomId,
			userEmail: user.email,
			role: "owner",
			invitedAt: now,
			invitedBy: args.userId,
		});

		return dataroomId;
	},
});

export const update = mutation({
	args: {
		id: v.id("datarooms"),
		name: v.string(),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		// Check if user has editor or higher permissions
		await checkUserAccess(ctx, args.userId, args.id, "editor");

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
	args: { id: v.id("datarooms"), userId: v.id("users") },
	handler: async (ctx, args) => {
		// Check if user is owner
		await checkUserAccess(ctx, args.userId, args.id, "owner");

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

		// Delete all access records
		const accessRecords = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_dataroomId", (q) => q.eq("dataroomId", args.id))
			.collect();

		for (const access of accessRecords) {
			await ctx.db.delete(access._id);
		}

		// Delete the dataroom
		await ctx.db.delete(args.id);
		return args.id;
	},
});

export const getItemCount = query({
	args: { id: v.id("datarooms"), userId: v.id("users") },
	handler: async (ctx, args) => {
		// Check if user has access
		await checkUserAccess(ctx, args.userId, args.id);

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
