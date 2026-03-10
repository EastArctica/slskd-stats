import type { AnalysisResult } from "../types";
import { formatBytes, formatNumber } from "../utils/format";
import { GlobalStatsSection } from "./GlobalStats";
import {
	TopUsersByFilesTable,
	TopUsersBySizeTable,
	TopUploadersByFilesTable,
	TopUploadersBySizeTable,
} from "./TopUsersTable";
import { SearchableUsersTable } from "./SearchableUsersTable";
import { TransferStates } from "./TransferStates";
import { FileExtensions } from "./FileExtensions";
import "./Results.css";

interface ResultsProps {
	result: AnalysisResult;
}

export function Results({ result }: ResultsProps) {
	return (
		<div className="results">
			<section className="stats-section global-stats-compact">
				<GlobalStatsSection stats={result.global} />
			</section>

			<TransferStates states={result.transferStates} />

			<div className="stats-row">
				<TopUsersByFilesTable users={result.topByFiles} />
				<TopUsersBySizeTable users={result.topBySize} />
			</div>

			<div className="stats-row">
				<TopUploadersByFilesTable users={result.topUploadersByFiles} />
				<TopUploadersBySizeTable users={result.topUploadersBySize} />
			</div>

			<section className="stats-section">
				<h3>File Statistics</h3>
				<div className="file-stats-grid">
					<div className="file-stat-card">
						<span className="file-stat-label">Average File Size</span>
						<span className="file-stat-value">
							{formatBytes(result.averageFileSize)}
						</span>
					</div>
					<div className="file-stat-card">
						<span className="file-stat-label">Unique Files</span>
						<span className="file-stat-value">
							{formatNumber(result.uniqueFiles)}
						</span>
					</div>
				</div>
			</section>

			<FileExtensions extensions={result.topExtensions} />

			<SearchableUsersTable users={result.allUsers} />
		</div>
	);
}
