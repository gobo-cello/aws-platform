import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { parseAwsAccountId } from "../lib/config/accounts";
import { parseKmsKeyArn } from "../lib/config/kms";
import { parseAwsOrganizationId } from "../lib/config/organizations";
import { parseS3BucketName } from "../lib/config/s3";
import { OrganizationTrailStack } from "../lib/stacks/organization-trail-stack";

describe("OrganizationTrailStack", () => {
	const app = new App();

	const stack = new OrganizationTrailStack(app, "TestOrganizationTrailStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		organizationId: parseAwsOrganizationId("o-1234567890"),
		logBucketName: parseS3BucketName("example-cloudtrail-log-bucket"),
		kmsKeyArn: parseKmsKeyArn(
			"arn:aws:kms:ap-northeast-1:" +
				"222222222222:key/" +
				"12345678-1234-1234-1234-" +
				"123456789012",
		),
	});

	const template = Template.fromStack(stack);

	test("Organization Trailを構成する", () => {
		template.hasResourceProperties("AWS::CloudTrail::Trail", {
			TrailName: "OrganizationTrail",
			IsLogging: true,
			IsOrganizationTrail: true,
			IsMultiRegionTrail: true,
			IncludeGlobalServiceEvents: true,
			EnableLogFileValidation: true,
			S3BucketName: "example-cloudtrail-log-bucket",
			KMSKeyId:
				"arn:aws:kms:ap-northeast-1:" +
				"222222222222:key/" +
				"12345678-1234-1234-1234-" +
				"123456789012",
			EventSelectors: [
				{
					IncludeManagementEvents: true,
					ReadWriteType: "All",
				},
			],
		});
	});

	test("Data eventsを設定しない", () => {
		template.hasResourceProperties("AWS::CloudTrail::Trail", {
			EventSelectors: [
				Match.not(
					Match.objectLike({
						DataResources: Match.anyValue(),
					}),
				),
			],
		});
	});

	test("Stack termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});

	test("CloudWatch Logsへ配信する", () => {
		template.hasResourceProperties("AWS::CloudTrail::Trail", {
			CloudWatchLogsLogGroupArn: Match.anyValue(),
			CloudWatchLogsRoleArn: Match.anyValue(),
		});
	});

	test("CloudWatch Logsのretentionを90日にする", () => {
		template.hasResourceProperties("AWS::Logs::LogGroup", {
			RetentionInDays: 90,
		});
	});

	test("CloudTrailだけがLog Groupへ書き込めるroleを作成する", () => {
		template.hasResourceProperties("AWS::IAM::Role", {
			AssumeRolePolicyDocument: Match.objectLike({
				Statement: Match.arrayWith([
					Match.objectLike({
						Effect: "Allow",
						Principal: { Service: "cloudtrail.amazonaws.com" },
						Action: "sts:AssumeRole",
					}),
				]),
			}),
		});
	});

	test("CloudTrailへLog Group書き込みだけを許可する", () => {
		template.hasResourceProperties("AWS::IAM::Policy", {
			PolicyDocument: Match.objectLike({
				Statement: Match.arrayWith([
					Match.objectLike({
						Effect: "Allow",
						Action: Match.arrayWith([
							"logs:CreateLogStream",
							"logs:PutLogEvents",
						]),
					}),
				]),
			}),
		});
	});
});
