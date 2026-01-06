import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const signup = mutation({
	args: {
		fullName: v.string(),
		email: v.string(),
		password: v.string(),
	},
	handler: async (ctx, args) => {
		// Check if user with this email already exists
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.first();

		if (existingUser) {
			throw new Error("User with this email already exists");
		}

		const now = Date.now();
		const userId = await ctx.db.insert("users", {
			fullName: args.fullName,
			email: args.email,
			password: args.password,
			createdAt: now,
			updatedAt: now,
		});

		const user = await ctx.db.get(userId);
		if (!user) {
			throw new Error("Failed to create user");
		}

		// Return user without password
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	},
});

export const login = mutation({
	args: {
		email: v.string(),
		password: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.first();

		if (!user) {
			throw new Error("Invalid email or password");
		}

		if (user.password !== args.password) {
			throw new Error("Invalid email or password");
		}

		// Return user without password
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	},
});

export const getUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) {
			return null;
		}

		// Return user without password
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword;
	},
});
