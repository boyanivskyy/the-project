import { Link } from "react-router";
import { SearchInput } from "./SearchInput";
import { ThemeToggle } from "./shared/ThemeToggle";
import { useAuth } from "../providers/AuthProvider";
import { User, LogOut } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export const Header = () => {
	const { user, logout } = useAuth();

	return (
		<div className="bg-background/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
			<div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4">
				{/* Mobile layout: title and button on top row, search below */}
				<div className="md:hidden flex flex-col gap-4">
					<div className="flex justify-between items-center">
						<Link
							to="/"
							className="text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
						>
							the project
						</Link>
						<div className="flex items-center gap-2">
							<ThemeToggle />
							{user && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<User className="h-5 w-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium leading-none">
													{user.fullName}
												</p>
												<p className="text-xs leading-none text-muted-foreground">
													{user.email}
												</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={logout}>
											<LogOut className="mr-2 h-4 w-4" />
											<span>Log out</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
					<div className="w-full">
						<SearchInput />
					</div>
				</div>
				{/* Desktop layout: 3-column grid */}
				<div className="hidden md:grid md:grid-cols-3 items-center gap-4">
					<Link
						to="/"
						className="text-2xl font-bold hover:opacity-80 transition-opacity"
					>
						the project
					</Link>
					<div className="flex justify-center">
						<SearchInput className="md:max-w-[516px]" />
					</div>
					<div className="flex justify-end items-center gap-2">
						<ThemeToggle />
						{user && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm">
										<User className="mr-2 h-4 w-4" />
										{user.fullName}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{user.fullName}
											</p>
											<p className="text-xs leading-none text-muted-foreground">
												{user.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={logout}>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
