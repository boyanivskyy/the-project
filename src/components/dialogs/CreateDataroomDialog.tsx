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
import { useCreateDataroomDialog } from "../../stores/dialogs/useCreateDataroomDialog";
import { toUserMessage } from "../../lib/errors/toUserMessage";

export const CreateDataroomDialog = () => {
	const { isOpen, payload, close } = useCreateDataroomDialog();
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!payload?.mutation) return;

		if (!name.trim()) {
			toast.error("Please enter a dataroom name");
			return;
		}

		try {
			await payload.mutation({ name: name.trim() });
			toast.success("Dataroom created successfully");
			setName("");
			close();
		} catch (error) {
			toast.error(toUserMessage(error, "Failed to create dataroom"));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{payload?.title || "Create New Dataroom"}
					</DialogTitle>
					<DialogDescription>
						{payload?.description ||
							"Create a new dataroom to organize your documents and folders."}
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
								placeholder="My Dataroom"
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
