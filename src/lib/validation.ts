export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Formats a timestamp into a user-friendly date string
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (e.g., "Jan 7, 2026" or "2 hours ago" for recent dates)
 */
export const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInMs = now.getTime() - date.getTime();
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	// For times within the last 24 hours, show relative time
	if (diffInMinutes < 1) {
		return "Just now";
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
	} else if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
	} else if (diffInDays < 7) {
		return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
	}

	// For older dates, show formatted date
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

/**
 * Extracts the file format/type from mimeType or file extension
 *
 * @param mimeType - The MIME type of the file (e.g., "application/pdf")
 * @param fileName - The name of the file (used as fallback)
 * @returns Uppercase file format (e.g., "PDF", "DOCX", "TXT")
 */
export const getFileFormat = (mimeType: string, fileName: string): string => {
	// Map common MIME types to user-friendly formats
	const mimeTypeMap: Record<string, string> = {
		"application/pdf": "PDF",
		"application/msword": "DOC",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			"DOCX",
		"application/vnd.ms-excel": "XLS",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
			"XLSX",
		"application/vnd.ms-powerpoint": "PPT",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation":
			"PPTX",
		"text/plain": "TXT",
		"text/csv": "CSV",
		"image/jpeg": "JPEG",
		"image/png": "PNG",
		"image/gif": "GIF",
		"image/svg+xml": "SVG",
		"application/zip": "ZIP",
		"application/x-rar-compressed": "RAR",
	};

	// Try to get format from MIME type
	if (mimeTypeMap[mimeType]) {
		return mimeTypeMap[mimeType];
	}

	// Fallback: extract extension from filename
	const extensionMatch = fileName.match(/\.([^.]+)$/);
	if (extensionMatch && extensionMatch[1]) {
		return extensionMatch[1].toUpperCase();
	}

	// Default fallback
	return "FILE";
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
