import { useState, useCallback, useRef } from "react";
import initSqlJs from "sql.js";
import "./App.css";

interface GlobalStats {
	downloads: {
		count: number;
		size: number;
		transferred: number;
		users: number;
	};
	uploads: {
		count: number;
		size: number;
		transferred: number;
		users: number;
	};
	ratio: number | null;
}

interface TopUserByFiles {
	username: string;
	fileCount: number;
}

interface TopUserBySize {
	username: string;
	totalBytes: number;
	fileCount: number;
}

interface AnalysisResult {
	global: GlobalStats;
	topByFiles: TopUserByFiles[];
	topBySize: TopUserBySize[];
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	const unit = units[Math.min(i, units.length - 1)];
	const value = bytes / Math.pow(1024, i);
	return `${value.toFixed(2)} ${unit}`;
}

function formatNumber(num: number): string {
	return num.toLocaleString();
}

export default function App() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const analyzeDatabase = useCallback(async (file: File) => {
		setIsLoading(true);
		setError(null);
		setFileName(file.name);

		try {
			const SQL = await initSqlJs({});

			const arrayBuffer = await file.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			const db = new SQL.Database(uint8Array);

			// Global stats - Downloads
			const dlQuery = `
        SELECT 
          COUNT(*),
          COALESCE(SUM(Size), 0),
          COALESCE(SUM(BytesTransferred), 0),
          COUNT(DISTINCT Username)
        FROM Transfers
        WHERE Direction = 'Download'
          AND State = 48
          AND Username IS NOT NULL
      `;
			const dlResult = db.exec(dlQuery);
			const dlData = dlResult[0]?.values[0] || [0, 0, 0, 0];

			// Global stats - Uploads
			const ulQuery = `
        SELECT 
          COUNT(*),
          COALESCE(SUM(Size), 0),
          COALESCE(SUM(BytesTransferred), 0),
          COUNT(DISTINCT Username)
        FROM Transfers
        WHERE Direction = 'Upload'
          AND State = 48
          AND Username IS NOT NULL
      `;
			const ulResult = db.exec(ulQuery);
			const ulData = ulResult[0]?.values[0] || [0, 0, 0, 0];

			// Top 10 users by number of files downloaded
			const topFilesQuery = `
        SELECT 
          Username,
          COUNT(*) as file_count
        FROM Transfers
        WHERE Direction = 'Download'
          AND State = 48
          AND Username IS NOT NULL
        GROUP BY Username
        ORDER BY file_count DESC
        LIMIT 10
      `;
			const topFilesResult = db.exec(topFilesQuery);
			const topByFiles: TopUserByFiles[] = (
				topFilesResult[0]?.values || []
			).map((row) => ({
				username: row[0] as string,
				fileCount: row[1] as number,
			}));

			// Top 10 users by MB downloaded
			const topSizeQuery = `
        SELECT 
          Username,
          COALESCE(SUM(Size), 0) as total_bytes,
          COUNT(*) as file_count
        FROM Transfers
        WHERE Direction = 'Download'
          AND State = 48
          AND Username IS NOT NULL
        GROUP BY Username
        ORDER BY total_bytes DESC
        LIMIT 10
      `;
			const topSizeResult = db.exec(topSizeQuery);
			const topBySize: TopUserBySize[] = (topSizeResult[0]?.values || []).map(
				(row) => ({
					username: row[0] as string,
					totalBytes: row[1] as number,
					fileCount: row[2] as number,
				}),
			);

			db.close();

			const dlSize = Number(dlData[1]);
			const ulSize = Number(ulData[1]);

			setResult({
				global: {
					downloads: {
						count: Number(dlData[0]),
						size: dlSize,
						transferred: Number(dlData[2]),
						users: Number(dlData[3]),
					},
					uploads: {
						count: Number(ulData[0]),
						size: ulSize,
						transferred: Number(ulData[2]),
						users: Number(ulData[3]),
					},
					ratio: dlSize > 0 ? ulSize / dlSize : null,
				},
				topByFiles,
				topBySize,
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to analyze database",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				analyzeDatabase(file);
			}
		},
		[analyzeDatabase],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files?.[0];
			if (file && file.name.endsWith(".db")) {
				analyzeDatabase(file);
			}
		},
		[analyzeDatabase],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	return (
		<div className="app">
			<header className="header">
				<h1>slskd-stats</h1>
				<p className="subtitle">
					Analyze your Soulseek transfers.db file in the browser
				</p>
			</header>

			<main className="main">
				{!result && !isLoading && (
					<button
						type="button"
						className={`upload-area ${isDragging ? "dragging" : ""}`}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onClick={handleUploadClick}
					>
						<div className="upload-content">
							<svg
								className="upload-icon"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<p className="upload-text">
								<strong>Click to upload</strong> or drag and drop
							</p>
							<p className="upload-hint">transfers.db file</p>
							<input
								ref={fileInputRef}
								type="file"
								accept=".db"
								onChange={handleFileChange}
								className="file-input"
							/>
						</div>
					</button>
				)}

				{isLoading && (
					<div className="loading">
						<div className="spinner"></div>
						<p>Analyzing database...</p>
					</div>
				)}

				{error && (
					<div className="error">
						<p>Error: {error}</p>
						<button
							type="button"
							onClick={() => {
								setError(null);
								setFileName(null);
							}}
						>
							Try Again
						</button>
					</div>
				)}

				{result && (
					<div className="results">
						<div className="results-header">
							<h2>Analysis Results</h2>
							{fileName && <p className="file-name">{fileName}</p>}
							<button
								type="button"
								className="analyze-new"
								onClick={() => {
									setResult(null);
									setFileName(null);
								}}
							>
								Analyze Another File
							</button>
						</div>

						<section className="stats-section">
							<h3>Global Statistics</h3>
							<div className="stats-grid">
								<div className="stat-card downloads">
									<h4>Downloads</h4>
									<div className="stat-row">
										<span className="stat-label">Files:</span>
										<span className="stat-value">
											{formatNumber(result.global.downloads.count)}
										</span>
									</div>
									<div className="stat-row">
										<span className="stat-label">Size:</span>
										<span className="stat-value">
											{formatBytes(result.global.downloads.size)}
										</span>
									</div>
									<div className="stat-row">
										<span className="stat-label">Transferred:</span>
										<span className="stat-value">
											{formatBytes(result.global.downloads.transferred)}
										</span>
									</div>
									<div className="stat-row">
										<span className="stat-label">Unique users:</span>
										<span className="stat-value">
											{formatNumber(result.global.downloads.users)}
										</span>
									</div>
									{result.global.downloads.count > 0 && (
										<div className="stat-row">
											<span className="stat-label">Avg size:</span>
											<span className="stat-value">
												{formatBytes(
													result.global.downloads.size /
														result.global.downloads.count,
												)}
											</span>
										</div>
									)}
								</div>

								<div className="stat-card uploads">
									<h4>Uploads</h4>
									<div className="stat-row">
										<span className="stat-label">Files:</span>
										<span className="stat-value">
											{formatNumber(result.global.uploads.count)}
										</span>
									</div>
									<div className="stat-row">
										<span className="stat-label">Size:</span>
										<span className="stat-value">
											{formatBytes(result.global.uploads.size)}
										</span>
									</div>
									<div className="stat-row">
										<span className="stat-label">Transferred:</span>
										<span className="stat-value">
											{formatBytes(result.global.uploads.transferred)}
										</span>
									</div>
									<div className="stat-row">
										<span className="stat-label">Unique users:</span>
										<span className="stat-value">
											{formatNumber(result.global.uploads.users)}
										</span>
									</div>
									{result.global.uploads.count > 0 && (
										<div className="stat-row">
											<span className="stat-label">Avg size:</span>
											<span className="stat-value">
												{formatBytes(
													result.global.uploads.size /
														result.global.uploads.count,
												)}
											</span>
										</div>
									)}
								</div>
							</div>

							<div className="ratio-card">
								<span className="ratio-label">Upload/Download Ratio</span>
								<span className="ratio-value">
									{result.global.ratio !== null
										? `${result.global.ratio.toFixed(2)}x`
										: "N/A"}
								</span>
							</div>
						</section>

						<section className="stats-section">
							<h3>Top 10 Users by Files Downloaded</h3>
							<div className="table-container">
								<table className="data-table">
									<thead>
										<tr>
											<th>Rank</th>
											<th>Username</th>
											<th>Files</th>
										</tr>
									</thead>
									<tbody>
										{result.topByFiles.map((user, index) => (
											<tr key={user.username}>
												<td className="rank">{index + 1}</td>
												<td className="username">{user.username}</td>
												<td className="number">
													{formatNumber(user.fileCount)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>

						<section className="stats-section">
							<h3>Top 10 Users by Data Downloaded</h3>
							<div className="table-container">
								<table className="data-table">
									<thead>
										<tr>
											<th>Rank</th>
											<th>Username</th>
											<th>Size</th>
											<th>Files</th>
										</tr>
									</thead>
									<tbody>
										{result.topBySize.map((user, index) => (
											<tr key={user.username}>
												<td className="rank">{index + 1}</td>
												<td className="username">{user.username}</td>
												<td className="number">
													{formatBytes(user.totalBytes)}
												</td>
												<td className="number">
													{formatNumber(user.fileCount)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					</div>
				)}
			</main>

			<footer className="footer">
				<p>Data stays in your browser - no files are uploaded to any server</p>
			</footer>
		</div>
	);
}
