declare const awsOrganizationIdBrand: unique symbol;

export type AwsOrganizationId = string & {
	readonly [awsOrganizationIdBrand]: "AwsOrganizationId";
};

export class InvalidAwsOrganizationIdError extends Error {
	public constructor(value: unknown) {
		super(`Invalid AWS organization ID: ${String(value)}`);
		this.name = "InvalidAwsOrganizationIdError";
	}
}

export function parseAwsOrganizationId(value: unknown): AwsOrganizationId {
	if (typeof value !== "string" || !/^o-[a-z0-9]{10,32}$/.test(value)) {
		throw new InvalidAwsOrganizationIdError(value);
	}

	return value as AwsOrganizationId;
}
