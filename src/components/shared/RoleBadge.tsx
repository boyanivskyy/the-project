import { Crown, Shield, Edit, Eye } from "lucide-react";
import { type UserRole } from "../../types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";

interface RoleBadgeProps {
	role: UserRole;
	size?: "default" | "small";
	className?: string;
	showLabel?: boolean;
}

const roleConfig: Record<
	UserRole,
	{
		icon: typeof Crown;
		label: string;
		description: string;
		color: string;
		bgColor: string;
	}
> = {
	owner: {
		icon: Crown,
		label: "Owner",
		description:
			"Full access. Can delete the dataroom and manage all settings.",
		color: "text-amber-600 dark:text-amber-500",
		bgColor: "bg-amber-100 dark:bg-amber-950",
	},
	admin: {
		icon: Shield,
		label: "Admin",
		description:
			"Can manage access, rename, and organize content. Cannot delete the dataroom.",
		color: "text-purple-600 dark:text-purple-500",
		bgColor: "bg-purple-100 dark:bg-purple-950",
	},
	editor: {
		icon: Edit,
		label: "Editor",
		description:
			"Can upload, edit, and organize files and folders. Cannot manage access.",
		color: "text-blue-600 dark:text-blue-500",
		bgColor: "bg-blue-100 dark:bg-blue-950",
	},
	viewer: {
		icon: Eye,
		label: "Viewer",
		description: "Can view and download files. Cannot make changes.",
		color: "text-gray-600 dark:text-gray-400",
		bgColor: "bg-gray-100 dark:bg-gray-800",
	},
};

export function RoleBadge({
	role,
	size = "default",
	className,
	showLabel = false,
}: RoleBadgeProps) {
	const config = roleConfig[role];
	const Icon = config.icon;

	const sizeClasses = {
		default: "h-5 w-5 p-1.5",
		small: "h-4 w-4 p-1",
	};

	const iconSizeClasses = {
		default: "h-full w-full",
		small: "h-3 w-3",
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={cn(
							"inline-flex items-center justify-center rounded-md",
							config.bgColor,
							config.color,
							showLabel ? "gap-1.5 px-2 py-1" : sizeClasses[size],
							className
						)}
					>
						<Icon
							className={cn(
								showLabel
									? iconSizeClasses[size]
									: "h-full w-full"
							)}
						/>
						{showLabel && (
							<span className="text-xs font-medium whitespace-nowrap">
								{config.label}
							</span>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className="space-y-1">
						<p className="font-semibold">{config.label}</p>
						<p className="text-xs text-muted-foreground">
							{config.description}
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
