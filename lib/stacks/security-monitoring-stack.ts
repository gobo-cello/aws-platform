import { CfnOutput, Duration, Stack, type StackProps } from "aws-cdk-lib";
import {
	Alarm,
	ComparisonOperator,
	Metric,
	TreatMissingData,
} from "aws-cdk-lib/aws-cloudwatch";
import { SnsAction } from "aws-cdk-lib/aws-cloudwatch-actions";
import {
	FilterPattern,
	type ILogGroup,
	MetricFilter,
} from "aws-cdk-lib/aws-logs";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import type { Construct } from "constructs";
import type { AwsAccountId } from "../config/accounts";
import type { EmailAddress } from "../config/email";
import {
	securityMetricDefinitions,
	securityMetricNamespace,
} from "../config/security-monitoring";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface SecurityMonitoringStackProps extends StackProps {
	readonly cloudTrailLogGroup: ILogGroup;
	readonly logArchiveAccountId: AwsAccountId;
	readonly notificationEmail: EmailAddress;
}

export class SecurityMonitoringStack extends Stack {
	public constructor(
		scope: Construct,
		id: string,
		props: SecurityMonitoringStackProps,
	) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const notificationTopic = new Topic(this, "SecurityNotifications", {
			displayName: "AWS security notifications",
		});

		notificationTopic.addSubscription(
			new EmailSubscription(props.notificationEmail),
		);

		for (const definition of securityMetricDefinitions) {
			const filterPattern = definition.filterPattern.replaceAll(
				"__LOG_ARCHIVE_ACCOUNT_ID__",
				props.logArchiveAccountId,
			);

			new MetricFilter(this, `${definition.id}MetricFilter`, {
				logGroup: props.cloudTrailLogGroup,
				filterPattern: FilterPattern.literal(filterPattern),
				metricNamespace: securityMetricNamespace,
				metricName: definition.metricName,
				metricValue: "1",
			});

			const metric = new Metric({
				namespace: securityMetricNamespace,
				metricName: definition.metricName,
				statistic: "Sum",
				period: Duration.minutes(5),
			});

			const alarm = new Alarm(this, `${definition.id}Alarm`, {
				metric,
				threshold: 1,
				evaluationPeriods: 1,
				datapointsToAlarm: 1,
				comparisonOperator:
					ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
				treatMissingData: TreatMissingData.NOT_BREACHING,
				alarmDescription: definition.description,
			});

			alarm.addAlarmAction(new SnsAction(notificationTopic));
		}

		applyPlatformTags(this, createPlatformTags("management"));

		new CfnOutput(this, "SecurityNotificationTopicArn", {
			value: notificationTopic.topicArn,
		});
	}
}
