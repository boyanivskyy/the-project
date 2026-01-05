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

interface CreateDataroomDialogProps {
	trigger?: React.ReactNode;
}

export function CreateDataroomDialog({
	trigger,
}: CreateDataroomDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const createDataroom = useMutation(api.datarooms.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Please enter a dataroom name");
			return;
		}

		try {
			await createDataroom({ name: name.trim() });
			toast.success("Dataroom created successfully");
			setName("");
			setOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create dataroom"
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button>Create Dataroom</Button>}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Dataroom</DialogTitle>
					<DialogDescription>
						Create a new dataroom to organize your documents and folders.
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
