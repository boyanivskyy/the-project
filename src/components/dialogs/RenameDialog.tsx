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
import { toUserMessage } from "../../lib/errors/toUserMessage";

export function RenameDialog() {
	const { isOpen, payload, close } = useRenameDialog();
	const [name, setName] = useState("");

	useEffect(() => {
		if (payload?.name) {
			setName(payload.name);
		}
	}, [payload?.name]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!payload?.mutation || !payload.id) return;

		const validation = validateFileName(name);
		if (!validation.valid) {
			toast.error(validation.error);
			return;
		}

		try {
			await payload.mutation({
				id: payload.id,
				name: name.trim(),
			});
			toast.success("Renamed successfully");
			close();
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to rename"));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{payload?.title || "Rename"}
					</DialogTitle>
					<DialogDescription>
						{payload?.description ||
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
							onClick={close}
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
