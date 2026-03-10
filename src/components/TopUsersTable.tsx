import type { TopUserByFiles, TopUserBySize } from "../types";
import { formatBytes, formatNumber } from "../utils/format";
import "./TopUsersTable.css";

interface TopUsersByFilesTableProps {
	users: TopUserByFiles[];
}

export function TopUsersByFilesTable({ users }: TopUsersByFilesTableProps) {
	return (
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
						{users.map((user, index) => (
							<tr key={user.username}>
								<td className="rank">{index + 1}</td>
								<td className="username">{user.username}</td>
								<td className="number">{formatNumber(user.fileCount)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

interface TopUsersBySizeTableProps {
	users: TopUserBySize[];
}

export function TopUsersBySizeTable({ users }: TopUsersBySizeTableProps) {
	return (
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
						{users.map((user, index) => (
							<tr key={user.username}>
								<td className="rank">{index + 1}</td>
								<td className="username">{user.username}</td>
								<td className="number">{formatBytes(user.totalBytes)}</td>
								<td className="number">{formatNumber(user.fileCount)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
