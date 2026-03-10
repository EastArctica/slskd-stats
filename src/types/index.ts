export interface GlobalStats {
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

export interface TopUserByFiles {
	username: string;
	fileCount: number;
}

export interface TopUserBySize {
	username: string;
	totalBytes: number;
	fileCount: number;
}

export interface AnalysisResult {
	global: GlobalStats;
	topByFiles: TopUserByFiles[];
	topBySize: TopUserBySize[];
}
