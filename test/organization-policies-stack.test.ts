import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { parseAwsAccountId } from "../lib/config/accounts";
import { parseKmsKeyArn } from "../lib/config/kms";
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

	test("SCPをまだOUへattachしない", () => {
		const policies = template.findResources("AWS::Organizations::Policy");

		for (const policy of Object.values(policies)) {
			expect(policy.Properties.TargetIds).toBeUndefined();
		}
	});

	test("Stack termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});
});
