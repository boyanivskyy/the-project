import { useState, useEffect } from "react";
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
import { useRenameDialog } from "../../stores/dialogs/useRenameDialog";

export function RenameDialog() {
	const { isOpen, initialValues, onClose } = useRenameDialog();
	const [name, setName] = useState("");

	useEffect(() => {
		if (initialValues.name) {
			setName(initialValues.name);
		}
	}, [initialValues.name]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!initialValues.mutation || !initialValues.id) return;

		const validation = validateFileName(name);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		try {
			await initialValues.mutation({
				id: initialValues.id,
				name: name.trim(),
			});
			toast.success("Renamed successfully");
			onClose();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to rename"
			);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{initialValues.title || "Rename"}
					</DialogTitle>
					<DialogDescription>
						{initialValues.description ||
							"Enter a new name for this item."}
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
							onClick={onClose}
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
