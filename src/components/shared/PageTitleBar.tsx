import { ReactNode } from "react";

interface PageTitleBarProps {
	title: string;
	actions?: ReactNode;
}

/**
 * Reusable page header with title and action buttons
 */
export function PageTitleBar({ title, actions }: PageTitleBarProps) {
	return (
		<div className="flex justify-between items-center mb-6">
			<h2 className="text-2xl font-semibold">{title}</h2>
			{actions && <div className="flex gap-2">{actions}</div>}
		</div>
	);
}
