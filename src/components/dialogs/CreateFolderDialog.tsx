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

export const CreateFolderDialog = () => {
	const { isOpen, initialValues, onClose } = useCreateFolderDialog();
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!initialValues.mutation || !initialValues.dataroomId) return;

		const validation = validateFileName(name);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		try {
			await initialValues.mutation({
				name: name.trim(),
				dataroomId: initialValues.dataroomId,
				parentFolderId: initialValues.parentFolderId,
			});
			toast.success("Folder created successfully");
			setName("");
			onClose();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create folder"
			);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{initialValues.title || "Create New Folder"}
					</DialogTitle>
					<DialogDescription>
						{initialValues.description ||
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
							onClick={onClose}
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
