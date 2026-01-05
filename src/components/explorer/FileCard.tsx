import { File, MoreVertical } from "lucide-react";
import { Card } from "../ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { type File as FileType } from "../../types";
import { formatFileSize } from "../../lib/validation";

interface FileCardProps {
	file: FileType;
	onPreview: () => void;
	onRename: () => void;
	onDelete: () => void;
}

export function FileCard({
	file,
	onPreview,
	onRename,
	onDelete,
}: FileCardProps) {
	return (
		<Card className="p-4 hover:shadow-md transition-shadow group">
			<div className="flex items-center gap-4">
				<button
					onClick={onPreview}
					className="flex-1 flex items-center gap-4 min-w-0 text-left"
				>
					<div className="p-3 bg-destructive/10 rounded-lg shrink-0">
						<File className="h-6 w-6 text-destructive" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-medium truncate">{file.name}</h3>
						<p className="text-xs text-muted-foreground">
							{formatFileSize(file.size)} •{" "}
							{new Date(file.createdAt).toLocaleDateString()}
						</p>
					</div>
				</button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="opacity-0 group-hover:opacity-100 transition-opacity"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onPreview}>Preview</DropdownMenuItem>
						<DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
						<DropdownMenuItem onClick={onDelete} className="text-destructive">
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</Card>
	);
}
