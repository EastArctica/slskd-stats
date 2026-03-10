import { formatBytes, formatNumber } from "../utils/format";
import "./StatsCard.css";

interface TransferStats {
	count: number;
	size: number;
	transferred: number;
	users: number;
}

interface StatsCardProps {
	title: string;
	stats: TransferStats;
	type: "downloads" | "uploads";
}

export function StatsCard({ title, stats, type }: StatsCardProps) {
	const averageSize = stats.count > 0 ? stats.size / stats.count : 0;

	return (
		<div className={`stat-card ${type}`}>
			<h4>{title}</h4>
			<div className="stat-row">
				<span className="stat-label">Files:</span>
				<span className="stat-value">{formatNumber(stats.count)}</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">Size:</span>
				<span className="stat-value">{formatBytes(stats.size)}</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">Transferred:</span>
				<span className="stat-value">{formatBytes(stats.transferred)}</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">Unique users:</span>
				<span className="stat-value">{formatNumber(stats.users)}</span>
			</div>
			{stats.count > 0 && (
				<div className="stat-row">
					<span className="stat-label">Avg size:</span>
					<span className="stat-value">{formatBytes(averageSize)}</span>
				</div>
			)}
		</div>
	);
}
