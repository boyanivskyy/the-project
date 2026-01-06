import { useState } from "react";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { validateFileName } from "../../lib/validation";
import { useCreateFolderDialog } from "../../stores/dialogs/useCreateFolderDialog";
import { toUserMessage } from "../../lib/errors/toUserMessage";

export const CreateFolderDialog = () => {
	const { isOpen, payload, close } = useCreateFolderDialog();
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!payload?.mutation || !payload.dataroomId) return;

		const validation = validateFileName(name);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		try {
			await payload.mutation({
				name: name.trim(),
				dataroomId: payload.dataroomId,
				parentFolderId: payload.parentFolderId || null,
			});
			toast.success("Folder created successfully");
			setName("");
			close();
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to create folder"));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{payload?.title || "Create New Folder"}
					</DialogTitle>
					<DialogDescription>
						{payload?.description ||
							"Enter a name for the new folder."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Folder Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="My Folder"
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={close}
						>
							Cancel
						</Button>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
