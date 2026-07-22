import { type AwsAccountId, parseAwsAccountId } from "./accounts";
import { parseNameServers } from "./dns";
import { type EmailAddress, parseEmailAddress } from "./email";
import { type KmsKeyArn, parseKmsKeyArn } from "./kms";
import {
	type OrganizationalUnitId,
	parseOrganizationalUnitId,
} from "./organizational-units";
import {
	type AwsOrganizationId,
	parseAwsOrganizationId,
} from "./organizations";
import { parseS3BucketName, type S3BucketName } from "./s3";

export const supportedAwsRegions = ["ap-northeast-1"] as const;

export type AwsRegion = (typeof supportedAwsRegions)[number];

export interface AwsEnvironment {
	readonly account: AwsAccountId;
	readonly region: AwsRegion;
}

export interface OrganizationalUnits {
	readonly security: OrganizationalUnitId;
	readonly production: OrganizationalUnitId;
	readonly sandbox: OrganizationalUnitId;
}

export interface PlatformConfiguration {
	readonly organizationId: AwsOrganizationId;
	readonly organizationalUnits: OrganizationalUnits;
	readonly management: AwsEnvironment;
	readonly logArchive: AwsEnvironment;
	readonly cloudTrailDestination: CloudTrailDestination;
	readonly securityNotificationEmail: EmailAddress;
	readonly blogSubdomainNameServers?: readonly string[] | undefined;
}

export interface CloudTrailDestination {
	readonly bucketName: S3BucketName;
	readonly kmsKeyArn: KmsKeyArn;
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

function readOptionalEnvironmentVariable(name: string): string | undefined {
	const value: string | undefined = process.env[name];

	return value === undefined || value.length === 0 ? undefined : value;
}

export function loadPlatformConfiguration(): PlatformConfiguration {
	const region: AwsRegion = "ap-northeast-1";

	const blogSubdomainNameServersValue = readOptionalEnvironmentVariable(
		"BLOG_SUBDOMAIN_NAME_SERVERS",
	);
	const blogSubdomainNameServers =
		blogSubdomainNameServersValue === undefined
			? undefined
			: parseNameServers(blogSubdomainNameServersValue);

	return {
		organizationId: parseAwsOrganizationId(
			readRequiredEnvironmentVariable("AWS_ORGANIZATION_ID"),
		),
		organizationalUnits: {
			security: parseOrganizationalUnitId(
				readRequiredEnvironmentVariable("AWS_SECURITY_OU_ID"),
			),
			production: parseOrganizationalUnitId(
				readRequiredEnvironmentVariable("AWS_PRODUCTION_OU_ID"),
			),
			sandbox: parseOrganizationalUnitId(
				readRequiredEnvironmentVariable("AWS_SANDBOX_OU_ID"),
			),
		},
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
		cloudTrailDestination: {
			bucketName: parseS3BucketName(
				readRequiredEnvironmentVariable("AWS_CLOUDTRAIL_LOG_BUCKET_NAME"),
			),
			kmsKeyArn: parseKmsKeyArn(
				readRequiredEnvironmentVariable("AWS_CLOUDTRAIL_KMS_KEY_ARN"),
			),
		},
		securityNotificationEmail: parseEmailAddress(
			readRequiredEnvironmentVariable("SECURITY_NOTIFICATION_EMAIL"),
		),
		blogSubdomainNameServers,
	} satisfies PlatformConfiguration;
}
