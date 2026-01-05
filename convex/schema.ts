import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	datarooms: defineTable({
		name: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("by_createdAt", ["createdAt"]),

	folders: defineTable({
		name: v.string(),
		dataroomId: v.id("datarooms"),
		parentFolderId: v.union(v.id("folders"), v.null()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_dataroomId", ["dataroomId"])
		.index("by_parentFolderId", ["parentFolderId"])
		.index("by_dataroomId_parentFolderId", ["dataroomId", "parentFolderId"]),

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
