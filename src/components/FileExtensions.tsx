import type { FileExtension } from "../types";
import { formatBytes, formatNumber } from "../utils/format";
import "./FileExtensions.css";

interface FileExtensionsProps {
	extensions: FileExtension[];
}

export function FileExtensions({ extensions }: FileExtensionsProps) {
	const totalFiles = extensions.reduce((sum, ext) => sum + ext.count, 0);

	return (
		<section className="stats-section">
			<h3>File Types</h3>
			<div className="extensions-grid">
				{extensions.map((ext) => {
					const percentage = totalFiles > 0 ? (ext.count / totalFiles) * 100 : 0;
	
					return (
						<div key={ext.extension} className="extension-card">
							<div className="extension-header">
								<span className="extension-name">.{ext.extension}</span>
								<span className="extension-count">
									{formatNumber(ext.count)}
								</span>
							</div>
							<div className="extension-bar-container">
								<div
									className="extension-bar"
									style={{ width: `${percentage}%` }}
								/>
							</div>
							<div className="extension-details">
								<span className="extension-percentage">
									{percentage.toFixed(1)}%
								</span>
								<span className="extension-size">
									{formatBytes(ext.totalBytes)}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
