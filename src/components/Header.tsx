import "./Header.css";

interface HeaderProps {
	compact?: boolean;
	onNewAnalysis?: () => void;
}

export function Header({ compact, onNewAnalysis }: HeaderProps) {
	return (
		<header className={`header ${compact ? "compact" : ""}`}>
			<h1>slskd-stats</h1>
			{!compact ? (
				<p className="subtitle">
					Analyze your Soulseek transfers.db file in the browser
				</p>
			) : (
				onNewAnalysis && (
					<button
						type="button"
						className="new-analysis-btn"
						onClick={onNewAnalysis}
					>
						New Analysis
					</button>
				)
			)}
		</header>
	);
}
