import { CfnOutput, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { Effect, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Key } from "aws-cdk-lib/aws-kms";
import {
	BlockPublicAccess,
	Bucket,
	BucketEncryption,
	ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";
import type { AwsAccountId } from "../config/accounts";
import { createOrganizationTrailArn } from "../config/cloudtrail";
import type { AwsOrganizationId } from "../config/organizations";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface LogArchiveStackProps extends StackProps {
	readonly managementAccountId: AwsAccountId;
	readonly organizationId: AwsOrganizationId;
}

export class LogArchiveStack extends Stack {
	public constructor(
		scope: Construct,
		id: string,
		props: LogArchiveStackProps,
	) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const region = Stack.of(this).region;

		const trailArn = createOrganizationTrailArn(
			props.managementAccountId,
			region as "ap-northeast-1",
		);

		const cloudTrailPrincipal = new ServicePrincipal(
			"cloudtrail.amazonaws.com",
		);

		const encryptionKey = new Key(this, "CloudTrailKey", {
			description: "Encrypts centralized AWS CloudTrail logs",
			enableKeyRotation: true,
			removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
		});

		encryptionKey.addToResourcePolicy(
			new PolicyStatement({
				sid: "AllowCloudTrailEncryptLogs",
				effect: Effect.ALLOW,
				principals: [cloudTrailPrincipal],
				actions: ["kms:GenerateDataKey*"],
				resources: ["*"],
				conditions: {
					StringEquals: {
						"aws:SourceArn": trailArn,
					},
					StringLike: {
						"kms:EncryptionContext:aws:cloudtrail:arn": `arn:aws:cloudtrail:*:${props.managementAccountId}:trail/*`,
					},
				},
			}),
		);

		encryptionKey.addToResourcePolicy(
			new PolicyStatement({
				sid: "AllowCloudTrailDescribeKey",
				effect: Effect.ALLOW,
				principals: [cloudTrailPrincipal],
				actions: ["kms:DescribeKey"],
				resources: ["*"],
				conditions: {
					StringEquals: {
						"aws:SourceArn": trailArn,
					},
				},
			}),
		);

		encryptionKey.addToResourcePolicy(
			new PolicyStatement({
				sid: "AllowCloudTrailDecrypt",
				effect: Effect.ALLOW,
				principals: [cloudTrailPrincipal],
				actions: ["kms:Decrypt"],
				resources: ["*"],
				conditions: {
					StringEquals: {
						"aws:SourceArn": trailArn,
					},
				},
			}),
		);

		const logBucket = new Bucket(this, "CloudTrailLogs", {
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			minimumTLSVersion: 1.2,
			versioned: true,
			objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
			encryption: BucketEncryption.KMS,
			encryptionKey,
			removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
		});

		logBucket.addToResourcePolicy(
			new PolicyStatement({
				sid: "AWSCloudTrailAclCheck20150319",
				effect: Effect.ALLOW,
				principals: [cloudTrailPrincipal],
				actions: ["s3:GetBucketAcl"],
				resources: [logBucket.bucketArn],
				conditions: {
					StringEquals: {
						"aws:SourceArn": trailArn,
					},
				},
			}),
		);

		logBucket.addToResourcePolicy(
			new PolicyStatement({
				sid: "AWSCloudTrailWrite20150319",
				effect: Effect.ALLOW,
				principals: [cloudTrailPrincipal],
				actions: ["s3:PutObject"],
				resources: [
					logBucket.arnForObjects(`AWSLogs/${props.managementAccountId}/*`),
				],
				conditions: {
					StringEquals: {
						"aws:SourceArn": trailArn,
						"s3:x-amz-acl": "bucket-owner-full-control",
					},
				},
			}),
		);

		logBucket.addToResourcePolicy(
			new PolicyStatement({
				sid: "AWSCloudTrailOrganizationWrite20150319",
				effect: Effect.ALLOW,
				principals: [cloudTrailPrincipal],
				actions: ["s3:PutObject"],
				resources: [
					logBucket.arnForObjects(`AWSLogs/${props.organizationId}/*`),
				],
				conditions: {
					StringEquals: {
						"aws:SourceArn": trailArn,
						"s3:x-amz-acl": "bucket-owner-full-control",
					},
				},
			}),
		);

		applyPlatformTags(this, createPlatformTags("security"));

		new CfnOutput(this, "CloudTrailLogBucketName", {
			value: logBucket.bucketName,
		});

		new CfnOutput(this, "CloudTrailKmsKeyArn", {
			value: encryptionKey.keyArn,
		});
	}
}
