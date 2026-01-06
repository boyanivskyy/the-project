import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
	isCollapsed: boolean;
	expandedItems: string[];
	toggleCollapsed: () => void;
	toggleExpanded: (id: string) => void;
	setExpanded: (id: string, expanded: boolean) => void;
	isExpanded: (id: string) => boolean;
}

export const useSidebarStore = create<SidebarState>()(
	persist(
		(set, get) => ({
			isCollapsed: false,
			expandedItems: [],

			toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

			toggleExpanded: (id: string) =>
				set((state) => {
					const items = state.expandedItems;
					const isCurrentlyExpanded = items.includes(id);
					return {
						expandedItems: isCurrentlyExpanded
							? items.filter((item) => item !== id)
							: [...items, id],
					};
				}),

			setExpanded: (id: string, expanded: boolean) =>
				set((state) => {
					const items = state.expandedItems;
					const isCurrentlyExpanded = items.includes(id);
					if (expanded && !isCurrentlyExpanded) {
						return { expandedItems: [...items, id] };
					}
					if (!expanded && isCurrentlyExpanded) {
						return { expandedItems: items.filter((item) => item !== id) };
					}
					return state;
				}),

			isExpanded: (id: string) => get().expandedItems.includes(id),
		}),
		{ name: "sidebar-storage" }
	)
);
