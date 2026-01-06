import { useEffect, useState } from "react";
import { RenameDialog } from "../dialogs/RenameDialog";
import { DeleteConfirmDialog } from "../dialogs/DeleteConfirmDialog";
import { CreateFolderDialog } from "../dialogs/CreateFolderDialog";
import { UploadFileDialog } from "../dialogs/UploadFileDialog";
import { CreateDataroomDialog } from "../dialogs/CreateDataroomDialog";
import { ManageAccessDialog } from "../dialogs/ManageAccessDialog";

export const DialogProvider = () => {
	const [isMounted, setIsMounted] = useState(false);

	// NOTE: useEffect is called when we need it so no hydration error that smth is missing
	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	return (
		<>
			<RenameDialog />
			<DeleteConfirmDialog />
			<CreateFolderDialog />
			<UploadFileDialog />
			<CreateDataroomDialog />
			<ManageAccessDialog />
		</>
	);
};
