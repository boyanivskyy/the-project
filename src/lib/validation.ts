export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const validateFileName = (
	name: string
): { valid: boolean; error?: string } => {
	if (!name.trim()) {
		return { valid: false, error: "Name cannot be empty" };
	}
	if (name.length > 255) {
		return { valid: false, error: "Name is too long (max 255 characters)" };
	}
	// Check for invalid characters
	const invalidChars = /[<>:"/\\|?*]/;
	if (invalidChars.test(name)) {
		return { valid: false, error: "Name contains invalid characters" };
	}
	return { valid: true };
};
