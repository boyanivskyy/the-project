import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { useManageAccessDialog } from "../../stores/dialogs/useManageAccessDialog";
import { useAuth } from "../../features/auth/AuthProvider";
import { toast } from "sonner";
import { Mail, Trash2, UserPlus } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { toUserMessage } from "../../lib/errors/toUserMessage";

export function ManageAccessDialog() {
	const { user } = useAuth();
	const { isOpen, dataroomId, dataroomName, onClose } =
		useManageAccessDialog();
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");
	const [isInviting, setIsInviting] = useState(false);

	const accessList = useQuery(
		api.dataroomAccess.list,
		isOpen && dataroomId && user ? { dataroomId, userId: user._id } : "skip"
	);

	const inviteMutation = useMutation(api.dataroomAccess.invite);
	const updateRoleMutation = useMutation(api.dataroomAccess.updateRole);
	const removeAccessMutation = useMutation(api.dataroomAccess.removeAccess);

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!dataroomId || !user) return;

		setIsInviting(true);
		try {
			await inviteMutation({
				userId: user._id,
				dataroomId,
				userEmail: email,
				role,
			});
			toast.success(`Invitation sent to ${email}`);
			setEmail("");
			setRole("viewer");
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to send invitation"));
		} finally {
			setIsInviting(false);
		}
	};

	const handleUpdateRole = async (
		accessId: Id<"dataroomAccess">,
		newRole: "admin" | "editor" | "viewer"
	) => {
		if (!user) return;

		try {
			await updateRoleMutation({
				userId: user._id,
				accessId,
				newRole,
			});
			toast.success("Role updated");
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to update role"));
		}
	};

	const handleRemoveAccess = async (
		accessId: Id<"dataroomAccess">,
		userEmail: string
	) => {
		if (!user) return;

		try {
			await removeAccessMutation({
				userId: user._id,
				accessId,
			});
			toast.success(`Removed access for ${userEmail}`);
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to remove access"));
		}
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "owner":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
			case "admin":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "editor":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "viewer":
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Manage Access - {dataroomName}</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Invite Form */}
					<div className="border rounded-lg p-4">
						<h3 className="text-sm font-medium mb-4 flex items-center gap-2">
							<UserPlus className="h-4 w-4" />
							Invite User
						</h3>
						<form onSubmit={handleInvite} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									placeholder="user@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									disabled={isInviting}
								/>
							</div>

							<div className="space-y-2 w-full">
								<Label htmlFor="role">Access Level</Label>
								<Select
									value={role}
									onValueChange={(value: any) =>
										setRole(value)
									}
									disabled={isInviting}
								>
									<SelectTrigger id="role" className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="viewer">
											Viewer - Can only view files
										</SelectItem>
										<SelectItem value="editor">
											Editor - Can view and edit files
										</SelectItem>
										<SelectItem value="admin">
											Admin - Can manage access and edit
											files
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Button
								type="submit"
								disabled={isInviting}
								className="w-full"
							>
								<Mail className="mr-2 h-4 w-4" />
								{isInviting ? "Sending..." : "Send Invitation"}
							</Button>
						</form>
					</div>

					{/* Access List */}
					<div className="border rounded-lg p-4">
						<h3 className="text-sm font-medium mb-4">
							Users with Access ({accessList?.length || 0})
						</h3>
						<div className="space-y-2">
							{accessList === undefined ? (
								<p className="text-sm text-muted-foreground">
									Loading...
								</p>
							) : accessList.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No users yet. Invite someone above!
								</p>
							) : (
								accessList.map((access) => (
									<div
										key={access._id}
										className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<p className="text-sm font-medium truncate">
													{access.userEmail}
												</p>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(access.role)}`}
												>
													{access.role}
												</span>
											</div>
											<p className="text-xs text-muted-foreground">
												Invited{" "}
												{new Date(
													access.invitedAt
												).toLocaleDateString()}
											</p>
										</div>

										<div className="flex items-center gap-2">
											{access.role !== "owner" && (
												<>
													<Select
														value={access.role}
														onValueChange={(
															value: any
														) =>
															handleUpdateRole(
																access._id,
																value
															)
														}
													>
														<SelectTrigger className="w-[130px] h-8">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="viewer">
																Viewer
															</SelectItem>
															<SelectItem value="editor">
																Editor
															</SelectItem>
															<SelectItem value="admin">
																Admin
															</SelectItem>
														</SelectContent>
													</Select>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
														onClick={() =>
															handleRemoveAccess(
																access._id,
																access.userEmail
															)
														}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</>
											)}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
