import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { validateFileName } from "../../lib/validation";

interface CreateFolderDialogProps {
	dataroomId: Id<"datarooms">;
	parentFolderId?: Id<"folders"> | null;
	trigger?: React.ReactNode;
}

export function CreateFolderDialog({
	dataroomId,
	parentFolderId = null,
	trigger,
}: CreateFolderDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const createFolder = useMutation(api.folders.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validation = validateFileName(name);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		try {
			await createFolder({
				name: name.trim(),
				dataroomId,
				parentFolderId,
			});
			toast.success("Folder created successfully");
			setName("");
			setOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create folder"
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button>New Folder</Button>}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Folder</DialogTitle>
					<DialogDescription>
						Enter a name for the new folder.
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
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
