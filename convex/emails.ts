import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const sendInvitationEmail = action({
	args: {
		dataroomId: v.id("datarooms"),
		invitedByUserId: v.id("users"),
		userEmail: v.string(),
		role: v.union(
			v.literal("owner"),
			v.literal("admin"),
			v.literal("editor"),
			v.literal("viewer")
		),
	},
	handler: async (ctx, args) => {
		// Get dataroom details
		const dataroom = await ctx.runQuery(api.datarooms.get, {
			id: args.dataroomId,
		});

		// Get inviter details
		const inviter = await ctx.runQuery(api.auth.getUser, {
			userId: args.invitedByUserId,
		});

		// Mock email - log to console
		console.log("\n==============================================");
		console.log("📧 INVITATION EMAIL");
		console.log("==============================================");
		console.log(`To: ${args.userEmail}`);
		console.log(`From: ${inviter?.fullName} <${inviter?.email}>`);
		console.log(`Subject: You've been invited to access "${dataroom?.name}"`);
		console.log("\n----------------------------------------------");
		console.log(`Hello,\n`);
		console.log(
			`${inviter?.fullName} has invited you to access the dataroom "${dataroom?.name}" with ${args.role} permissions.\n`
		);
		console.log(`Your access level: ${args.role.toUpperCase()}`);
		console.log("\nWhat you can do:");

		const permissions = {
			owner: [
				"✓ View all files and folders",
				"✓ Edit and upload files",
				"✓ Manage user access",
				"✓ Delete the dataroom",
			],
			admin: [
				"✓ View all files and folders",
				"✓ Edit and upload files",
				"✓ Manage user access",
			],
			editor: ["✓ View all files and folders", "✓ Edit and upload files"],
			viewer: ["✓ View all files and folders"],
		};

		permissions[args.role].forEach((perm) => console.log(`  ${perm}`));

		console.log("\n----------------------------------------------");
		console.log(
			"To access the dataroom, please sign in or create an account at:"
		);
		console.log("http://localhost:3000/login");
		console.log("\nBest regards,");
		console.log("The Dataroom Team");
		console.log("==============================================\n");

		return { success: true };
	},
});
