import { useState, useEffect } from "react";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";
const EXPANDED_ITEMS_KEY = "sidebar-expanded-items";

export function useSidebarState() {
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
		return saved ? JSON.parse(saved) : false;
	});

	const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
		const saved = localStorage.getItem(EXPANDED_ITEMS_KEY);
		return saved ? new Set(JSON.parse(saved)) : new Set();
	});

	useEffect(() => {
		localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isCollapsed));
	}, [isCollapsed]);

	useEffect(() => {
		localStorage.setItem(
			EXPANDED_ITEMS_KEY,
			JSON.stringify(Array.from(expandedItems))
		);
	}, [expandedItems]);

	const toggleCollapsed = () => {
		setIsCollapsed((prev) => !prev);
	};

	const toggleExpanded = (id: string) => {
		setExpandedItems((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const isExpanded = (id: string) => {
		return expandedItems.has(id);
	};

	const setExpanded = (id: string, expanded: boolean) => {
		setExpandedItems((prev) => {
			const next = new Set(prev);
			if (expanded) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	};

	return {
		isCollapsed,
		toggleCollapsed,
		expandedItems,
		toggleExpanded,
		isExpanded,
		setExpanded,
	};
}
