export const accountEnvironmentVariables = {
	management: "AWS_MANAGEMENT_ACCOUNT_ID",
	logArchive: "AWS_LOG_ARCHIVE_ACCOUNT_ID",
	blogProduction: "AWS_BLOG_PRODUCTION_ACCOUNT_ID",
	blogSandbox: "AWS_BLOG_SANDBOX_ACCOUNT_ID",
} as const;

export type AccountName = keyof typeof accountEnvironmentVariables;
