class InvalidApexDomainNameError extends Error {
	public constructor(value: unknown) {
		super(`Invalid apex domain name: ${String(value)}`);
		this.name = "InvalidApexDomainNameError";
	}
}

export function parseApexDomainName(value: unknown): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new InvalidApexDomainNameError(value);
	}

	return value;
}

class InvalidNameServersError extends Error {
	public constructor(value: unknown) {
		super(`Invalid name servers: ${String(value)}`);
		this.name = "InvalidNameServersError";
	}
}

export function parseNameServers(value: string): readonly string[] {
	const nameServers = value.split(",").map((entry) => entry.trim());

	if (
		nameServers.length === 0 ||
		nameServers.some((entry) => entry.length === 0)
	) {
		throw new InvalidNameServersError(value);
	}

	return nameServers;
}

class InvalidGoogleSiteVerificationTokenError extends Error {
	public constructor(value: unknown) {
		super(`Invalid Google site verification token: ${String(value)}`);
		this.name = "InvalidGoogleSiteVerificationTokenError";
	}
}

export function parseGoogleSiteVerificationToken(value: unknown): string {
	if (
		typeof value !== "string" ||
		value.length === 0 ||
		value.includes("google-site-verification=")
	) {
		throw new InvalidGoogleSiteVerificationTokenError(value);
	}

	return value;
}

class InvalidCloudFrontDomainNameError extends Error {
	public constructor(value: unknown) {
		super(`Invalid CloudFront domain name: ${String(value)}`);
		this.name = "InvalidCloudFrontDomainNameError";
	}
}

export function parseCloudFrontDomainName(value: unknown): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new InvalidCloudFrontDomainNameError(value);
	}

	return value;
}

class InvalidCertificateValidationRecordNameError extends Error {
	public constructor(value: unknown) {
		super(`Invalid certificate validation record name: ${String(value)}`);
		this.name = "InvalidCertificateValidationRecordNameError";
	}
}

export function parseCertificateValidationRecordName(value: unknown): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new InvalidCertificateValidationRecordNameError(value);
	}

	return value;
}

class InvalidCertificateValidationRecordValueError extends Error {
	public constructor(value: unknown) {
		super(`Invalid certificate validation record value: ${String(value)}`);
		this.name = "InvalidCertificateValidationRecordValueError";
	}
}

export function parseCertificateValidationRecordValue(value: unknown): string {
	if (typeof value !== "string" || value.length === 0) {
		throw new InvalidCertificateValidationRecordValueError(value);
	}

	return value;
}
