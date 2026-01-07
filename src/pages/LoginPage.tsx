import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../features/auth/AuthProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { toUserMessage } from "../lib/errors/toUserMessage";

export function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await login(email, password);
			toast.success("Successfully logged in!");
		} catch (error) {
			const errorMessage = toUserMessage(error, "Failed to login");
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
			<Card className="w-full max-w-md p-8">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold">Welcome Back</h1>
					<p className="text-muted-foreground mt-2">
						Sign in to access your datarooms in <b>the projects</b>
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? "Signing in..." : "Sign In"}
					</Button>
				</form>

				{error && (
					<div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
						<p className="text-sm text-muted-foreground mb-3">
							{error}
						</p>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => navigate("/signup")}
						>
							Go to Sign Up
						</Button>
					</div>
				)}

				<div className="mt-6 text-center text-sm">
					<span className="text-muted-foreground">
						Don't have an account?{" "}
					</span>
					<Link
						to="/signup"
						className="text-primary hover:underline font-medium"
					>
						Sign Up
					</Link>
				</div>
			</Card>
		</div>
	);
}
