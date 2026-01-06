import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useThemeStore } from "../../stores/themeStore";

export function ThemeToggle() {
	const { theme, toggleTheme } = useThemeStore();

	// Sync theme class to DOM
	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			{theme === "light" ? (
				<Moon className="h-5 w-5" />
			) : (
				<Sun className="h-5 w-5" />
			)}
		</Button>
	);
}
