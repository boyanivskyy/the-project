import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

interface User {
	_id: Id<"users">;
	fullName: string;
	email: string;
	createdAt: number;
	updatedAt: number;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (
		fullName: string,
		email: string,
		password: string
	) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const loginMutation = useMutation(api.auth.login);
	const signupMutation = useMutation(api.auth.signup);

	// Load user from localStorage on mount
	useEffect(() => {
		try {
			const storedUser = localStorage.getItem("authUser");
			if (storedUser) {
				const parsedUser = JSON.parse(storedUser);
				// Validate the user object has required fields
				if (
					parsedUser &&
					parsedUser._id &&
					parsedUser.email &&
					parsedUser.fullName
				) {
					setUser(parsedUser);
				} else {
					// Invalid user data, clear it
					localStorage.removeItem("authUser");
				}
			}
		} catch (error) {
			console.error("Error loading user from localStorage:", error);
			localStorage.removeItem("authUser");
		} finally {
			setLoading(false);
		}
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const userData = await loginMutation({ email, password });
			const user = userData as User;
			setUser(user);
			localStorage.setItem("authUser", JSON.stringify(user));
			navigate("/");
		} catch (error) {
			throw error;
		}
	};

	const signup = async (
		fullName: string,
		email: string,
		password: string
	) => {
		try {
			const userData = await signupMutation({
				fullName,
				email,
				password,
			});
			const user = userData as User;
			setUser(user);
			localStorage.setItem("authUser", JSON.stringify(user));
			navigate("/");
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("authUser");
		navigate("/login");
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, signup, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
