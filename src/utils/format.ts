export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const unit = units[Math.min(i, units.length - 1)];
	const value = bytes / Math.pow(1024, i);
	return `${value.toFixed(2)} ${unit}`;
}

export function formatNumber(num: number): string {
	return num.toLocaleString();
}
