export interface CloudTrailRetentionPolicy {
	readonly currentVersionRetentionDays: number;
	readonly noncurrentVersionRetentionDays: number;
	readonly incompleteMultipartUploadRetentionDays: number;
}

export const cloudTrailRetentionPolicy = {
	currentVersionRetentionDays: 400,
	noncurrentVersionRetentionDays: 30,
	incompleteMultipartUploadRetentionDays: 7,
} as const satisfies CloudTrailRetentionPolicy;
