import { parseAwsAccountId } from "../lib/config/accounts";
import { createCdkCloudFormationExecutionRoleArn } from "../lib/config/cdk-bootstrap";
import {
	createLogArchiveProtectionPolicy,
	denyCloudTrailTamperingPolicy,
} from "../lib/config/cloudtrail-guardrails";
import { parseKmsKeyArn } from "../lib/config/kms";
import { parseS3BucketName } from "../lib/config/s3";

describe("CloudTrail SCP guardrails", () => {
	test("CloudTrail停止と設定変更を拒否する", () => {
		const statement = denyCloudTrailTamperingPolicy.Statement[0];

		expect(statement.Action).toEqual(
			expect.arrayContaining([
				"cloudtrail:DeleteTrail",
				"cloudtrail:StopLogging",
				"cloudtrail:UpdateTrail",
				"cloudtrail:PutEventSelectors",
				"cloudtrail:PutInsightSelectors",
			]),
		);
	});

	test("Log Archive resourceを特定resourceへ限定する", () => {
		const logArchiveAccountId = parseAwsAccountId("222222222222");

		const deploymentRoleArn = createCdkCloudFormationExecutionRoleArn(
			logArchiveAccountId,
			"ap-northeast-1",
		);

		const policy = createLogArchiveProtectionPolicy({
			bucketName: parseS3BucketName("example-cloudtrail-log-bucket"),
			kmsKeyArn: parseKmsKeyArn(
				"arn:aws:kms:ap-northeast-1:" +
					"222222222222:key/" +
					"12345678-1234-1234-1234-" +
					"123456789012",
			),
			deploymentRoleArn,
		});

		expect(policy.Statement).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					Action: expect.arrayContaining([
						"s3:DeleteObject",
						"s3:DeleteObjectVersion",
					]),
					Resource: "arn:aws:s3:::example-cloudtrail-log-bucket/*",
				}),
				expect.objectContaining({
					Action: expect.arrayContaining([
						"kms:DisableKey",
						"kms:ScheduleKeyDeletion",
					]),
					Resource:
						"arn:aws:kms:ap-northeast-1:" +
						"222222222222:key/" +
						"12345678-1234-1234-1234-" +
						"123456789012",
				}),
			]),
		);
	});

	test("CDK CloudFormation execution roleだけを例外にする", () => {
		const accountId = parseAwsAccountId("222222222222");

		const deploymentRoleArn = createCdkCloudFormationExecutionRoleArn(
			accountId,
			"ap-northeast-1",
		);

		const policy = createLogArchiveProtectionPolicy({
			bucketName: parseS3BucketName("example-cloudtrail-log-bucket"),
			kmsKeyArn: parseKmsKeyArn(
				"arn:aws:kms:ap-northeast-1:" +
					"222222222222:key/" +
					"12345678-1234-1234-1234-" +
					"123456789012",
			),
			deploymentRoleArn,
		});

		for (const statement of policy.Statement) {
			expect(statement.Condition).toEqual({
				ArnNotEquals: {
					"aws:PrincipalArn": deploymentRoleArn,
				},
			});
		}
	});
});
