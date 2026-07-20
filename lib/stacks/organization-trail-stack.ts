import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import { CfnTrail } from "aws-cdk-lib/aws-cloudtrail";
import type { Construct } from "constructs";
import { organizationTrailName } from "../config/cloudtrail";
import type { KmsKeyArn } from "../config/kms";
import type { AwsOrganizationId } from "../config/organizations";
import type { S3BucketName } from "../config/s3";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface OrganizationTrailStackProps extends StackProps {
	readonly organizationId: AwsOrganizationId;
	readonly logBucketName: S3BucketName;
	readonly kmsKeyArn: KmsKeyArn;
}

export class OrganizationTrailStack extends Stack {
	public constructor(
		scope: Construct,
		id: string,
		props: OrganizationTrailStackProps,
	) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const trail = new CfnTrail(this, "OrganizationTrail", {
			trailName: organizationTrailName,

			isLogging: true,
			isOrganizationTrail: true,
			isMultiRegionTrail: true,
			includeGlobalServiceEvents: true,
			enableLogFileValidation: true,

			s3BucketName: props.logBucketName,
			kmsKeyId: props.kmsKeyArn,

			eventSelectors: [
				{
					includeManagementEvents: true,
					readWriteType: "All",
				},
			],
		});

		applyPlatformTags(this, createPlatformTags("management"));

		new CfnOutput(this, "OrganizationTrailArn", {
			value: trail.attrArn,
		});
	}
}
