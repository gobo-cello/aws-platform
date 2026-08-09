import { type AwsAccountId, parseAwsAccountId } from "./accounts";
import {
	parseApexDomainName,
	parseCertificateValidationRecordName,
	parseCertificateValidationRecordValue,
	parseCloudFrontDomainName,
	parseGoogleSiteVerificationToken,
	parseNameServers,
} from "./dns";

const supportedAwsRegions = ["ap-northeast-1"] as const;

export type AwsRegion = (typeof supportedAwsRegions)[number];

export interface AwsEnvironment {
	readonly account: AwsAccountId;
	readonly region: AwsRegion;
}

const platformDeployEnvironments = ["management"] as const;

export type PlatformDeployEnvironment =
	(typeof platformDeployEnvironments)[number];

export interface PlatformConfiguration {
	readonly management: AwsEnvironment;
	readonly apexDomainName: string;
	readonly blogSubdomainNameServers?: readonly string[] | undefined;
	readonly suiteShuffleSubdomainNameServers?: readonly string[] | undefined;
	readonly googleSiteVerificationToken?: string | undefined;
	readonly apexLandingCloudFrontDomainName?: string | undefined;
	readonly apexLandingCertificateValidationRecordName?: string | undefined;
	readonly apexLandingCertificateValidationRecordValue?: string | undefined;
}

class MissingEnvironmentVariableError extends Error {
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

	const suiteShuffleSubdomainNameServersValue = readOptionalEnvironmentVariable(
		"SUITE_SHUFFLE_SUBDOMAIN_NAME_SERVERS",
	);
	const suiteShuffleSubdomainNameServers =
		suiteShuffleSubdomainNameServersValue === undefined
			? undefined
			: parseNameServers(suiteShuffleSubdomainNameServersValue);

	const googleSiteVerificationTokenValue = readOptionalEnvironmentVariable(
		"GOOGLE_SITE_VERIFICATION_TOKEN",
	);
	const googleSiteVerificationToken =
		googleSiteVerificationTokenValue === undefined
			? undefined
			: parseGoogleSiteVerificationToken(googleSiteVerificationTokenValue);

	const apexLandingCloudFrontDomainNameValue = readOptionalEnvironmentVariable(
		"APEX_LANDING_CLOUDFRONT_DOMAIN_NAME",
	);
	const apexLandingCloudFrontDomainName =
		apexLandingCloudFrontDomainNameValue === undefined
			? undefined
			: parseCloudFrontDomainName(apexLandingCloudFrontDomainNameValue);

	const apexLandingCertificateValidationRecordNameValue =
		readOptionalEnvironmentVariable("APEX_LANDING_CERT_VALIDATION_RECORD_NAME");
	const apexLandingCertificateValidationRecordName =
		apexLandingCertificateValidationRecordNameValue === undefined
			? undefined
			: parseCertificateValidationRecordName(
					apexLandingCertificateValidationRecordNameValue,
				);

	const apexLandingCertificateValidationRecordValueValue =
		readOptionalEnvironmentVariable(
			"APEX_LANDING_CERT_VALIDATION_RECORD_VALUE",
		);
	const apexLandingCertificateValidationRecordValue =
		apexLandingCertificateValidationRecordValueValue === undefined
			? undefined
			: parseCertificateValidationRecordValue(
					apexLandingCertificateValidationRecordValueValue,
				);

	return {
		management: {
			account: parseAwsAccountId(
				readRequiredEnvironmentVariable("AWS_MANAGEMENT_ACCOUNT_ID"),
			),
			region,
		},
		apexDomainName: parseApexDomainName(
			readRequiredEnvironmentVariable("APEX_DOMAIN_NAME"),
		),
		blogSubdomainNameServers,
		suiteShuffleSubdomainNameServers,
		googleSiteVerificationToken,
		apexLandingCloudFrontDomainName,
		apexLandingCertificateValidationRecordName,
		apexLandingCertificateValidationRecordValue,
	} satisfies PlatformConfiguration;
}
