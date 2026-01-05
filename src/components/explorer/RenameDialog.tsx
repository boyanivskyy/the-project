import { useState, useEffect } from "react";
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
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { validateFileName } from "../../lib/validation";
import { type Folder, type File } from "../../types";

interface RenameDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: Folder | File | null;
	type: "folder" | "file";
}

export function RenameDialog({
	open,
	onOpenChange,
	item,
	type,
}: RenameDialogProps) {
	const [name, setName] = useState("");
	const updateFolder = useMutation(api.folders.update);
	const updateFile = useMutation(api.files.update);

	useEffect(() => {
		if (item) {
			setName(item.name);
		}
	}, [item]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!item) return;

		const validation = validateFileName(name);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		try {
			if (type === "folder") {
				await updateFolder({ id: item._id, name: name.trim() });
			} else {
				await updateFile({ id: item._id, name: name.trim() });
			}
			toast.success(`${type === "folder" ? "Folder" : "File"} renamed successfully`);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : `Failed to rename ${type}`
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename {type === "folder" ? "Folder" : "File"}</DialogTitle>
					<DialogDescription>
						Enter a new name for this {type}.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								autoFocus
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Rename</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
