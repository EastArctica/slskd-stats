import type { AnalysisResult } from "../types";
import { GlobalStatsSection } from "./GlobalStats";
import { TopUsersByFilesTable, TopUsersBySizeTable } from "./TopUsersTable";
import "./Results.css";

interface ResultsProps {
	result: AnalysisResult;
	fileName: string | null;
	onAnalyzeAnother: () => void;
}

export function Results({ result, fileName, onAnalyzeAnother }: ResultsProps) {
	return (
		<div className="results">
			<div className="results-header">
				<h2>Analysis Results</h2>
				{fileName && <p className="file-name">{fileName}</p>}
				<button
					type="button"
					className="analyze-new"
					onClick={onAnalyzeAnother}
				>
					Analyze Another File
				</button>
			</div>

			<GlobalStatsSection stats={result.global} />
			<TopUsersByFilesTable users={result.topByFiles} />
			<TopUsersBySizeTable users={result.topBySize} />
		</div>
	);
}
