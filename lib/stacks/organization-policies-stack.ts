import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import { CfnPolicy } from "aws-cdk-lib/aws-organizations";
import type { Construct } from "constructs";
import { createCdkCloudFormationExecutionRoleArn } from "../config/cdk-bootstrap";
import {
	createLogArchiveProtectionPolicy,
	denyCloudTrailTamperingPolicy,
} from "../config/cloudtrail-guardrails";
import type { AwsEnvironment } from "../config/environments";
import type { KmsKeyArn } from "../config/kms";
import type { S3BucketName } from "../config/s3";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface OrganizationPoliciesStackProps extends StackProps {
	readonly logArchiveEnvironment: AwsEnvironment;
	readonly cloudTrailLogBucketName: S3BucketName;
	readonly cloudTrailKmsKeyArn: KmsKeyArn;
}

export class OrganizationPoliciesStack extends Stack {
	public constructor(
		scope: Construct,
		id: string,
		props: OrganizationPoliciesStackProps,
	) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const deploymentRoleArn = createCdkCloudFormationExecutionRoleArn(
			props.logArchiveEnvironment.account,
			props.logArchiveEnvironment.region,
		);

		const denyCloudTrailTampering = new CfnPolicy(
			this,
			"DenyCloudTrailTampering",
			{
				name: "DenyCloudTrailTampering",
				description:
					"Prevents member accounts from stopping or modifying CloudTrail logging.",
				type: "SERVICE_CONTROL_POLICY",
				content: denyCloudTrailTamperingPolicy,
			},
		);

		const protectCloudTrailLogArchive = new CfnPolicy(
			this,
			"ProtectCloudTrailLogArchive",
			{
				name: "ProtectCloudTrailLogArchive",
				description:
					"Protects the centralized CloudTrail S3 bucket and KMS key from destructive changes.",
				type: "SERVICE_CONTROL_POLICY",
				content: createLogArchiveProtectionPolicy({
					bucketName: props.cloudTrailLogBucketName,
					kmsKeyArn: props.cloudTrailKmsKeyArn,
					deploymentRoleArn,
				}),
			},
		);

		applyPlatformTags(this, createPlatformTags("management"));

		new CfnOutput(this, "DenyCloudTrailTamperingPolicyId", {
			value: denyCloudTrailTampering.attrId,
		});

		new CfnOutput(this, "ProtectCloudTrailLogArchivePolicyId", {
			value: protectCloudTrailLogArchive.attrId,
		});
	}
}
