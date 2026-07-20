import type { AwsAccountId } from "./accounts";
import type { AwsRegion } from "./environments";

declare const cloudTrailArnBrand: unique symbol;

export type CloudTrailArn = string & {
	readonly [cloudTrailArnBrand]: "CloudTrailArn";
};

export const organizationTrailName = "OrganizationTrail" as const;

export function createOrganizationTrailArn(
	managementAccountId: AwsAccountId,
	region: AwsRegion,
): CloudTrailArn {
	return [
		"arn",
		"aws",
		"cloudtrail",
		region,
		managementAccountId,
		`trail/${organizationTrailName}`,
	].join(":") as CloudTrailArn;
}
