import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import { Card } from "../ui/card";
import { type Dataroom } from "../../types";

interface DataroomCardProps {
	dataroom: Dataroom;
}

export function DataroomCard({ dataroom }: DataroomCardProps) {
	return (
		<Link to={`/dataroom/${dataroom._id}`}>
			<Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-primary/10 rounded-lg">
						<Folder className="h-6 w-6 text-primary" />
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-lg truncate">
							{dataroom.name}
						</h3>
						<p className="text-sm text-muted-foreground">
							{new Date(dataroom.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			</Card>
		</Link>
	);
}
