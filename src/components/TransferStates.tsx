import type { TransferStates as TransferStatesType } from "../types";
import { formatNumber } from "../utils/format";
import "./TransferStates.css";

interface TransferStatesProps {
	states: TransferStatesType;
}

interface StateRowProps {
	label: string;
	downloads: number;
	uploads: number;
	color: string;
}

function StateRow({ label, downloads, uploads, color }: StateRowProps) {
	return (
		<div className="state-row" style={{ borderLeftColor: color }}>
			<span className="state-label">{label}</span>
			<div className="state-values">
				<span className="state-value downloads">{formatNumber(downloads)}</span>
				<span className="state-divider">/</span>
				<span className="state-value uploads">{formatNumber(uploads)}</span>
			</div>
		</div>
	);
}

export function TransferStates({ states }: TransferStatesProps) {
	return (
		<section className="stats-section">
			<h3>Transfer States (DL/UL)</h3>
			<div className="states-grid">
				<StateRow
					label="Completed"
					downloads={states.completed.downloads}
					uploads={states.completed.uploads}
					color="var(--upload-color)"
				/>
				<StateRow
					label="Failed"
					downloads={states.failed.downloads}
					uploads={states.failed.uploads}
					color="var(--error-color)"
				/>
				<StateRow
					label="Cancelled"
					downloads={states.cancelled.downloads}
					uploads={states.cancelled.uploads}
					color="var(--warning-color)"
				/>
				<StateRow
					label="In Progress"
					downloads={states.inProgress.downloads}
					uploads={states.inProgress.uploads}
					color="var(--primary-color)"
				/>
			</div>
		</section>
	);
}
