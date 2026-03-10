import { useState, useMemo } from "react";
import type { UserStats } from "../types";
import { formatBytes, formatNumber } from "../utils/format";
import "./SearchableUsersTable.css";

interface SearchableUsersTableProps {
	users: UserStats[];
}

type SortColumn = "username" | "dlBytes" | "ulBytes" | "ratio";

function getSortIndicator(
	column: SortColumn,
	sortBy: SortColumn,
	sortDesc: boolean,
) {
	if (sortBy !== column) return <span className="sort-indicator">↕</span>;
	return <span className="sort-indicator active">{sortDesc ? "↓" : "↑"}</span>;
}

export function SearchableUsersTable({ users }: SearchableUsersTableProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<SortColumn>("dlBytes");
	const [sortDesc, setSortDesc] = useState(true);

	const filteredAndSortedUsers = useMemo(() => {
		const filtered = users.filter((user) =>
			user.username.toLowerCase().includes(searchTerm.toLowerCase()),
		);

		filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "username": {
					comparison = a.username.localeCompare(b.username);
					break;
				}
				case "dlBytes": {
					comparison = a.downloadBytes - b.downloadBytes;
					break;
				}
				case "ulBytes": {
					comparison = a.uploadBytes - b.uploadBytes;
					break;
				}
				case "ratio": {
					const aRatio = a.ratio ?? -1;
					const bRatio = b.ratio ?? -1;
					comparison = aRatio - bRatio;
					break;
				}
			}
			return sortDesc ? -comparison : comparison;
		});

		return filtered;
	}, [users, searchTerm, sortBy, sortDesc]);

	const handleSort = (column: SortColumn) => {
		if (sortBy === column) {
			setSortDesc(!sortDesc);
		} else {
			setSortBy(column);
			setSortDesc(true);
		}
	};

	return (
		<section className="stats-section">
			<h3>All Users ({formatNumber(users.length)})</h3>
			<div className="search-container">
				<input
					type="text"
					placeholder="Search users..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="search-input"
				/>
				<span className="search-count">
					{formatNumber(filteredAndSortedUsers.length)} results
				</span>
			</div>
			<div className="table-container scrollable">
				<table className="data-table users-table">
					<thead>
						<tr>
							<th
								className="sortable"
								onClick={() => handleSort("username")}
							>
								Username {getSortIndicator("username", sortBy, sortDesc)}
							</th>
							<th
								className="sortable number"
								onClick={() => handleSort("dlBytes")}
							>
								Downloaded {getSortIndicator("dlBytes", sortBy, sortDesc)}
							</th>
							<th className="number">DL Files</th>
							<th
								className="sortable number"
								onClick={() => handleSort("ulBytes")}
							>
								Uploaded {getSortIndicator("ulBytes", sortBy, sortDesc)}
							</th>
							<th className="number">UL Files</th>
							<th
								className="sortable number"
								onClick={() => handleSort("ratio")}
							>
								Ratio {getSortIndicator("ratio", sortBy, sortDesc)}
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredAndSortedUsers.map((user) => (
							<tr key={user.username}>
								<td className="username">{user.username}</td>
								<td className="number">{formatBytes(user.downloadBytes)}</td>
								<td className="number">
									{formatNumber(user.downloadFiles)}
								</td>
								<td className="number">{formatBytes(user.uploadBytes)}</td>
								<td className="number">{formatNumber(user.uploadFiles)}</td>
								<td
									className={`number ${user.ratio !== null && user.ratio >= 1 ? "good-ratio" : user.ratio !== null && user.ratio < 0.5 ? "bad-ratio" : ""}`}
								>
									{user.ratio !== null ? `${user.ratio.toFixed(2)}x` : "N/A"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
