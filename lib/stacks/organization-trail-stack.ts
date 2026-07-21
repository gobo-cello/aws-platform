import { CfnOutput, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { CfnTrail } from "aws-cdk-lib/aws-cloudtrail";
import {
	Effect,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import { organizationTrailName } from "../config/cloudtrail";
import type { KmsKeyArn } from "../config/kms";
import type { AwsOrganizationId } from "../config/organizations";
import type { S3BucketName } from "../config/s3";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface OrganizationTrailStackProps extends StackProps {
	readonly organizationId: AwsOrganizationId;
	readonly logBucketName: S3BucketName;
	readonly kmsKeyArn: KmsKeyArn;
}

export class OrganizationTrailStack extends Stack {
	public readonly cloudTrailLogGroup: LogGroup;

	public constructor(
		scope: Construct,
		id: string,
		props: OrganizationTrailStackProps,
	) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		this.cloudTrailLogGroup = new LogGroup(this, "CloudTrailLogGroup", {
			retention: RetentionDays.THREE_MONTHS,
			removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
		});

		const cloudTrailToCloudWatchLogsRole = new Role(
			this,
			"CloudTrailToCloudWatchLogsRole",
			{
				assumedBy: new ServicePrincipal("cloudtrail.amazonaws.com"),
			},
		);

		cloudTrailToCloudWatchLogsRole.addToPolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
				resources: [this.cloudTrailLogGroup.logGroupArn],
			}),
		);

		const trail = new CfnTrail(this, "OrganizationTrail", {
			trailName: organizationTrailName,

			isLogging: true,
			isOrganizationTrail: true,
			isMultiRegionTrail: true,
			includeGlobalServiceEvents: true,
			enableLogFileValidation: true,

			s3BucketName: props.logBucketName,
			kmsKeyId: props.kmsKeyArn,

			cloudWatchLogsLogGroupArn: this.cloudTrailLogGroup.logGroupArn,
			cloudWatchLogsRoleArn: cloudTrailToCloudWatchLogsRole.roleArn,

			eventSelectors: [
				{
					includeManagementEvents: true,
					readWriteType: "All",
				},
			],
		});

		trail.node.addDependency(cloudTrailToCloudWatchLogsRole);

		applyPlatformTags(this, createPlatformTags("management"));

		new CfnOutput(this, "OrganizationTrailArn", {
			value: trail.attrArn,
		});

		new CfnOutput(this, "CloudTrailLogGroupName", {
			value: this.cloudTrailLogGroup.logGroupName,
		});
	}
}
