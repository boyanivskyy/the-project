import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Helper function to check if user has required role for a dataroom
async function checkUserAccess(
	ctx: MutationCtx | QueryCtx,
	userId: any,
	dataroomId: any,
	requiredRole?: "owner" | "admin" | "editor" | "viewer"
) {
	const user = await ctx.db.get(userId as Id<"users">);
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

export const checkAccess = query({
	args: {
		userId: v.id("users"),
		dataroomId: v.id("datarooms"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			return null;
		}

		const access = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_dataroomId_userEmail", (q) =>
				q.eq("dataroomId", args.dataroomId).eq("userEmail", user.email)
			)
			.first();

		return access ? { role: access.role } : null;
	},
});

export const getMyDatarooms = query({
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

		// Filter out null values (deleted datarooms)
		return datarooms.filter((d) => d !== null);
	},
});

export const list = query({
	args: {
		userId: v.id("users"),
		dataroomId: v.id("datarooms"),
	},
	handler: async (ctx, args) => {
		// Check if user has admin or owner role
		await checkUserAccess(ctx, args.userId, args.dataroomId, "admin");

		// Get all access records for this dataroom
		const accessRecords = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_dataroomId", (q) =>
				q.eq("dataroomId", args.dataroomId)
			)
			.collect();

		return accessRecords;
	},
});

export const invite = mutation({
	args: {
		userId: v.id("users"),
		dataroomId: v.id("datarooms"),
		userEmail: v.string(),
		role: v.union(
			v.literal("admin"),
			v.literal("editor"),
			v.literal("viewer")
		),
	},
	handler: async (ctx, args) => {
		// Check if user has admin or owner role
		await checkUserAccess(ctx, args.userId, args.dataroomId, "admin");

		// Check if user already has access
		const existingAccess = await ctx.db
			.query("dataroomAccess")
			.withIndex("by_dataroomId_userEmail", (q) =>
				q
					.eq("dataroomId", args.dataroomId)
					.eq("userEmail", args.userEmail)
			)
			.first();

		if (existingAccess) {
			throw new Error("User already has access to this dataroom");
		}

		// Create access record
		const accessId = await ctx.db.insert("dataroomAccess", {
			dataroomId: args.dataroomId,
			userEmail: args.userEmail,
			role: args.role,
			invitedAt: Date.now(),
			invitedBy: args.userId,
		});

		// Schedule email notification
		await ctx.scheduler.runAfter(0, api.emails.sendInvitationEmail, {
			dataroomId: args.dataroomId,
			invitedByUserId: args.userId,
			userEmail: args.userEmail,
			role: args.role,
		});

		return accessId;
	},
});

export const updateRole = mutation({
	args: {
		userId: v.id("users"),
		accessId: v.id("dataroomAccess"),
		newRole: v.union(
			v.literal("admin"),
			v.literal("editor"),
			v.literal("viewer")
		),
	},
	handler: async (ctx, args) => {
		const access = await ctx.db.get(args.accessId);
		if (!access) {
			throw new Error("Access record not found");
		}

		// Can't change owner role
		if (access.role === "owner") {
			throw new Error("Cannot change owner role");
		}

		// Check if user has admin or owner role
		await checkUserAccess(ctx, args.userId, access.dataroomId, "admin");

		await ctx.db.patch(args.accessId, {
			role: args.newRole,
		});

		return args.accessId;
	},
});

export const removeAccess = mutation({
	args: {
		userId: v.id("users"),
		accessId: v.id("dataroomAccess"),
	},
	handler: async (ctx, args) => {
		const access = await ctx.db.get(args.accessId);
		if (!access) {
			throw new Error("Access record not found");
		}

		// Can't remove owner
		if (access.role === "owner") {
			throw new Error("Cannot remove owner access");
		}

		// Check if user has admin or owner role
		await checkUserAccess(ctx, args.userId, access.dataroomId, "admin");

		await ctx.db.delete(args.accessId);

		return args.accessId;
	},
});
