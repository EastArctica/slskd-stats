import type { GlobalStats } from "../types";
import { StatsCard } from "./StatsCard";
import "./GlobalStats.css";

interface GlobalStatsComponentProps {
	stats: GlobalStats;
}

export function GlobalStatsSection({ stats }: GlobalStatsComponentProps) {
	return (
		<section className="stats-section">
			<h3>Global Statistics</h3>
			<div className="stats-grid">
				<StatsCard title="Downloads" stats={stats.downloads} type="downloads" />
				<StatsCard title="Uploads" stats={stats.uploads} type="uploads" />
			</div>

			<div className="ratio-card">
				<span className="ratio-label">Upload/Download Ratio</span>
				<span className="ratio-value">
					{stats.ratio !== null ? `${stats.ratio.toFixed(2)}x` : "N/A"}
				</span>
			</div>
		</section>
	);
}
