import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { parseAwsAccountId } from "../lib/config/accounts";
import { parseEmailAddress } from "../lib/config/email";
import { SecurityMonitoringStack } from "../lib/stacks/security-monitoring-stack";

describe("SecurityMonitoringStack", () => {
	const app = new App();

	const sourceStack = new Stack(app, "SourceStack", {
		env: {
			account: "111111111111",
			region: "ap-northeast-1",
		},
	});

	const logGroup = new LogGroup(sourceStack, "CloudTrailLogGroup");

	const stack = new SecurityMonitoringStack(
		app,
		"TestSecurityMonitoringStack",
		{
			env: {
				account: "111111111111",
				region: "ap-northeast-1",
			},
			cloudTrailLogGroup: logGroup,
			logArchiveAccountId: parseAwsAccountId("222222222222"),
			notificationEmail: parseEmailAddress("security@example.com"),
		},
	);

	const template = Template.fromStack(stack);

	test("SNS topicとemail subscriptionを作成する", () => {
		template.resourceCountIs("AWS::SNS::Topic", 1);
		template.hasResourceProperties("AWS::SNS::Subscription", {
			Protocol: "email",
			Endpoint: "security@example.com",
		});
	});

	test("4つのmetric filterを作成する", () => {
		template.resourceCountIs("AWS::Logs::MetricFilter", 4);
	});

	test("4つのCloudWatch alarmを作成する", () => {
		template.resourceCountIs("AWS::CloudWatch::Alarm", 4);
	});

	test("alarmは5分間に1件で発報する", () => {
		template.hasResourceProperties("AWS::CloudWatch::Alarm", {
			Threshold: 1,
			EvaluationPeriods: 1,
			DatapointsToAlarm: 1,
			TreatMissingData: "notBreaching",
			ComparisonOperator: "GreaterThanOrEqualToThreshold",
			AlarmActions: Match.anyValue(),
		});
	});

	test("termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});
});
