import { type AwsAccountId, parseAwsAccountId } from "./accounts";

export const supportedAwsRegions = ["ap-northeast-1"] as const;

export type AwsRegion = (typeof supportedAwsRegions)[number];

export interface AwsEnvironment {
	readonly account: AwsAccountId;
	readonly region: AwsRegion;
}

export interface PlatformEnvironments {
	readonly management: AwsEnvironment;
	readonly logArchive: AwsEnvironment;
}

export class MissingEnvironmentVariableError extends Error {
	public constructor(name: string) {
		super(`Required environment variable is missing: ${name}`);
		this.name = "MissingEnvironmentVariableError";
	}
}

function readRequiredEnvironmentVariable(name: string): string {
	const value: string | undefined = process.env[name];

	if (value === undefined || value.length === 0) {
		throw new MissingEnvironmentVariableError(name);
	}

	return value;
}

export function loadPlatformEnvironments(): PlatformEnvironments {
	const region: AwsRegion = "ap-northeast-1";

	return {
		management: {
			account: parseAwsAccountId(
				readRequiredEnvironmentVariable("AWS_MANAGEMENT_ACCOUNT_ID"),
			),
			region,
		},
		logArchive: {
			account: parseAwsAccountId(
				readRequiredEnvironmentVariable("AWS_LOG_ARCHIVE_ACCOUNT_ID"),
			),
			region,
		},
	} satisfies PlatformEnvironments;
}
