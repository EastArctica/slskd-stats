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

export interface UserStats {
	username: string;
	downloadFiles: number;
	downloadBytes: number;
	uploadFiles: number;
	uploadBytes: number;
	ratio: number | null;
}

export interface TransferStates {
	completed: { downloads: number; uploads: number };
	failed: { downloads: number; uploads: number };
	cancelled: { downloads: number; uploads: number };
	inProgress: { downloads: number; uploads: number };
}

export interface FileExtension {
	extension: string;
	count: number;
	totalBytes: number;
}

export interface AnalysisResult {
	global: GlobalStats;
	topByFiles: TopUserByFiles[];
	topBySize: TopUserBySize[];
	topUploadersByFiles: TopUserByFiles[];
	topUploadersBySize: TopUserBySize[];
	allUsers: UserStats[];
	transferStates: TransferStates;
	topExtensions: FileExtension[];
	averageFileSize: number;
	uniqueFiles: number;
}
