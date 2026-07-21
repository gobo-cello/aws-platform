import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { parseAwsAccountId } from "../lib/config/accounts";
import { parseKmsKeyArn } from "../lib/config/kms";
import { parseOrganizationalUnitId } from "../lib/config/organizational-units";
import { parseS3BucketName } from "../lib/config/s3";
import { OrganizationPoliciesStack } from "../lib/stacks/organization-policies-stack";

describe("OrganizationPoliciesStack", () => {
	const app = new App();

	const stack = new OrganizationPoliciesStack(
		app,
		"TestOrganizationPoliciesStack",
		{
			env: {
				account: parseAwsAccountId("111111111111"),
				region: "ap-northeast-1",
			},
			logArchiveEnvironment: {
				account: parseAwsAccountId("222222222222"),
				region: "ap-northeast-1",
			},
			cloudTrailLogBucketName: parseS3BucketName(
				"example-cloudtrail-log-bucket",
			),
			cloudTrailKmsKeyArn: parseKmsKeyArn(
				"arn:aws:kms:ap-northeast-1:" +
					"222222222222:key/" +
					"12345678-1234-1234-1234-" +
					"123456789012",
			),
			securityOuId: parseOrganizationalUnitId("ou-ab12-security1"),
			productionOuId: parseOrganizationalUnitId("ou-ab12-product01"),
			sandboxOuId: parseOrganizationalUnitId("ou-ab12-sandbox01"),
		},
	);

	const template = Template.fromStack(stack);

	test("2つのSCPを作成する", () => {
		template.resourceCountIs("AWS::Organizations::Policy", 2);
	});

	test("CloudTrail改変防止SCPを作成する", () => {
		template.hasResourceProperties("AWS::Organizations::Policy", {
			Name: "DenyCloudTrailTampering",
			Type: "SERVICE_CONTROL_POLICY",
			Content: Match.objectLike({
				Version: "2012-10-17",
			}),
		});
	});

	test("Log Archive保護SCPを作成する", () => {
		template.hasResourceProperties("AWS::Organizations::Policy", {
			Name: "ProtectCloudTrailLogArchive",
			Type: "SERVICE_CONTROL_POLICY",
		});
	});

	test("CloudTrail改変防止SCPを3つのOUへattachする", () => {
		template.hasResourceProperties("AWS::Organizations::Policy", {
			Name: "DenyCloudTrailTampering",
			TargetIds: [
				"ou-ab12-security1",
				"ou-ab12-product01",
				"ou-ab12-sandbox01",
			],
		});
	});

	test("Log Archive保護SCPをSecurity OUだけへattachする", () => {
		template.hasResourceProperties("AWS::Organizations::Policy", {
			Name: "ProtectCloudTrailLogArchive",
			TargetIds: ["ou-ab12-security1"],
		});
	});

	test("Stack termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});
});
