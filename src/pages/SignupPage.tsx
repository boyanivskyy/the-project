import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../features/auth/AuthProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { toast } from "sonner";

export function SignupPage() {
	const { signup } = useAuth();
	const navigate = useNavigate();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await signup(fullName, email, password);
			toast.success("Account created successfully!");
		} catch (error: any) {
			setError("Email already in use");
			toast.error("Email already in use");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
			<Card className="w-full max-w-md p-8">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold">Create Account</h1>
					<p className="text-muted-foreground mt-2">
						Start managing your datarooms in <b>the projects</b>
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="fullName">Full Name</Label>
						<Input
							id="fullName"
							type="text"
							placeholder="John Doe"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							required
							disabled={isLoading}
						/>
					</div>

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
							minLength={6}
						/>
						<p className="text-xs text-muted-foreground">
							At least 6 characters
						</p>
					</div>

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading ? "Creating account..." : "Sign Up"}
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
							onClick={() => navigate("/login")}
						>
							Go to Sign In
						</Button>
					</div>
				)}

				<div className="mt-6 text-center text-sm">
					<span className="text-muted-foreground">
						Already have an account?{" "}
					</span>
					<Link
						to="/login"
						className="text-primary hover:underline font-medium"
					>
						Sign In
					</Link>
				</div>
			</Card>
		</div>
	);
}
