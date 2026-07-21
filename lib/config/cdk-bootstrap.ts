import type { AwsAccountId } from "./accounts";
import type { AwsRegion } from "./environments";

declare const iamRoleArnBrand: unique symbol;

export type IamRoleArn = string & {
	readonly [iamRoleArnBrand]: "IamRoleArn";
};

export function createCdkCloudFormationExecutionRoleArn(
	accountId: AwsAccountId,
	region: AwsRegion,
): IamRoleArn {
	return (`arn:aws:iam::${accountId}:role/` +
		`cdk-hnb659fds-cfn-exec-role-${accountId}-${region}`) as IamRoleArn;
}
