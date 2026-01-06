import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		fullName: v.string(),
		email: v.string(),
		password: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_email", ["email"]),

	datarooms: defineTable({
		name: v.string(),
		ownerId: v.id("users"),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_createdAt", ["createdAt"]),

	dataroomAccess: defineTable({
		dataroomId: v.id("datarooms"),
		userEmail: v.string(),
		role: v.union(
			v.literal("owner"),
			v.literal("admin"),
			v.literal("editor"),
			v.literal("viewer")
		),
		invitedAt: v.number(),
		invitedBy: v.id("users"),
	})
		.index("by_dataroomId", ["dataroomId"])
		.index("by_userEmail", ["userEmail"])
		.index("by_dataroomId_userEmail", ["dataroomId", "userEmail"]),

	folders: defineTable({
		name: v.string(),
		dataroomId: v.id("datarooms"),
		parentFolderId: v.union(v.id("folders"), v.null()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_dataroomId", ["dataroomId"])
		.index("by_parentFolderId", ["parentFolderId"])
		.index("by_dataroomId_parentFolderId", [
			"dataroomId",
			"parentFolderId",
		]),

	files: defineTable({
		name: v.string(),
		dataroomId: v.id("datarooms"),
		folderId: v.union(v.id("folders"), v.null()),
		storageId: v.id("_storage"),
		mimeType: v.string(),
		size: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_dataroomId", ["dataroomId"])
		.index("by_folderId", ["folderId"])
		.index("by_dataroomId_folderId", ["dataroomId", "folderId"]),
});
