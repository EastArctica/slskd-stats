import type { GlobalStats } from "../types";
import { StatsCard } from "./StatsCard";

interface GlobalStatsComponentProps {
	stats: GlobalStats;
}

export function GlobalStatsSection({ stats }: GlobalStatsComponentProps) {
	return (
		<div className="global-stats-grid">
			<StatsCard title="Downloads" stats={stats.downloads} type="downloads" />
			<StatsCard title="Uploads" stats={stats.uploads} type="uploads" />
			<div className="ratio-badge">
				<span className="ratio-badge-label">Ratio</span>
				<span className="ratio-badge-value">
					{stats.ratio !== null ? `${stats.ratio.toFixed(2)}x` : "N/A"}
				</span>
			</div>
		</div>
	);
}
