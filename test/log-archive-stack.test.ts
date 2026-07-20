import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { parseAwsAccountId } from "../lib/config/accounts";
import { parseAwsOrganizationId } from "../lib/config/organizations";
import { LogArchiveStack } from "../lib/stacks/log-archive-stack";

describe("LogArchiveStack", () => {
	const app = new App();

	const stack = new LogArchiveStack(app, "TestLogArchiveStack", {
		env: {
			account: parseAwsAccountId("222222222222"),
			region: "ap-northeast-1",
		},
		managementAccountId: parseAwsAccountId("111111111111"),
		organizationId: parseAwsOrganizationId("o-1234567890"),
	});

	const template = Template.fromStack(stack);

	test("KMS key rotationを有効にする", () => {
		template.hasResourceProperties("AWS::KMS::Key", {
			EnableKeyRotation: true,
		});
	});

	test("KMS keyを削除・置換時に保持する", () => {
		template.hasResource("AWS::KMS::Key", {
			DeletionPolicy: "RetainExceptOnCreate",
			UpdateReplacePolicy: "Retain",
		});
	});

	test("S3 bucketを安全に構成する", () => {
		template.hasResourceProperties("AWS::S3::Bucket", {
			VersioningConfiguration: {
				Status: "Enabled",
			},
			BucketEncryption: Match.objectLike({
				ServerSideEncryptionConfiguration: Match.arrayWith([
					Match.objectLike({
						ServerSideEncryptionByDefault: Match.objectLike({
							SSEAlgorithm: "aws:kms",
						}),
					}),
				]),
			}),
			PublicAccessBlockConfiguration: {
				BlockPublicAcls: true,
				BlockPublicPolicy: true,
				IgnorePublicAcls: true,
				RestrictPublicBuckets: true,
			},
			OwnershipControls: {
				Rules: [
					{
						ObjectOwnership: "BucketOwnerEnforced",
					},
				],
			},
		});
	});

	test("CloudTrailログのLifecycle policyを設定する", () => {
		template.hasResourceProperties("AWS::S3::Bucket", {
			LifecycleConfiguration: {
				Rules: Match.arrayWith([
					Match.objectLike({
						Id: "ExpireCloudTrailLogs",
						Status: "Enabled",
						Prefix: "AWSLogs/",
						ExpirationInDays: 400,
						NoncurrentVersionExpiration: {
							NoncurrentDays: 30,
						},
						AbortIncompleteMultipartUpload: {
							DaysAfterInitiation: 7,
						},
					}),
					Match.objectLike({
						Id: "RemoveExpiredDeleteMarkers",
						Status: "Enabled",
						Prefix: "AWSLogs/",
						ExpiredObjectDeleteMarker: true,
					}),
				]),
			},
		});
	});

	test("CloudTrailのorganization pathを許可する", () => {
		template.hasResourceProperties("AWS::S3::BucketPolicy", {
			PolicyDocument: Match.objectLike({
				Statement: Match.arrayWith([
					Match.objectLike({
						Sid: "AWSCloudTrailOrganizationWrite20150319",
						Principal: {
							Service: "cloudtrail.amazonaws.com",
						},
						Action: "s3:PutObject",
						Condition: Match.objectLike({
							StringEquals: Match.objectLike({
								"aws:SourceArn":
									"arn:aws:cloudtrail:ap-northeast-1:111111111111:trail/OrganizationTrail",
								"s3:x-amz-acl": "bucket-owner-full-control",
							}),
						}),
					}),
				]),
			}),
		});
	});

	test("Stack termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});
});
