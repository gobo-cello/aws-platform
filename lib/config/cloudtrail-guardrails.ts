import type { IamRoleArn } from "./cdk-bootstrap";
import type { KmsKeyArn } from "./kms";
import type { S3BucketName } from "./s3";
import type { ServiceControlPolicyDocument } from "./service-control-policy";

export const denyCloudTrailTamperingPolicy = {
	Version: "2012-10-17",
	Statement: [
		{
			Sid: "DenyCloudTrailTampering",
			Effect: "Deny",
			Action: [
				"cloudtrail:DeleteTrail",
				"cloudtrail:StopLogging",
				"cloudtrail:UpdateTrail",
				"cloudtrail:PutEventSelectors",
				"cloudtrail:PutInsightSelectors",
			],
			Resource: "*",
		},
	],
} as const satisfies ServiceControlPolicyDocument;

export interface LogArchiveGuardrailProps {
	readonly bucketName: S3BucketName;
	readonly kmsKeyArn: KmsKeyArn;
	readonly deploymentRoleArn: IamRoleArn;
}

export function createLogArchiveProtectionPolicy(
	props: LogArchiveGuardrailProps,
): ServiceControlPolicyDocument {
	const bucketArn = `arn:aws:s3:::${props.bucketName}`;
	const objectArn = `${bucketArn}/*`;

	const deploymentRoleException = {
		ArnNotEquals: {
			"aws:PrincipalArn": props.deploymentRoleArn,
		},
	} as const;

	return {
		Version: "2012-10-17",
		Statement: [
			{
				Sid: "DenyCloudTrailLogObjectDeletion",
				Effect: "Deny",
				Action: ["s3:DeleteObject", "s3:DeleteObjectVersion"],
				Resource: objectArn,
				Condition: deploymentRoleException,
			},
			{
				Sid: "DenyCloudTrailBucketDeletion",
				Effect: "Deny",
				Action: ["s3:DeleteBucket"],
				Resource: bucketArn,
				Condition: deploymentRoleException,
			},
			{
				Sid: "DenyCloudTrailBucketSecurityChanges",
				Effect: "Deny",
				Action: [
					"s3:DeleteBucketEncryption",
					"s3:DeleteBucketLifecycle",
					"s3:DeleteBucketOwnershipControls",
					"s3:DeleteBucketPolicy",
					"s3:DeletePublicAccessBlock",
					"s3:PutBucketEncryption",
					"s3:PutBucketLifecycleConfiguration",
					"s3:PutBucketOwnershipControls",
					"s3:PutBucketPolicy",
					"s3:PutBucketVersioning",
					"s3:PutPublicAccessBlock",
				],
				Resource: bucketArn,
				Condition: deploymentRoleException,
			},
			{
				Sid: "DenyCloudTrailKmsKeyDestruction",
				Effect: "Deny",
				Action: [
					"kms:DisableKey",
					"kms:PutKeyPolicy",
					"kms:ScheduleKeyDeletion",
				],
				Resource: props.kmsKeyArn,
				Condition: deploymentRoleException,
			},
		],
	};
}
