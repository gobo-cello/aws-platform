export interface SecurityMetricDefinition {
	readonly id: string;
	readonly metricName: string;
	readonly description: string;
	readonly filterPattern: string;
}

export const securityMetricNamespace = "AwsPlatform/Security";

export const securityMetricDefinitions = [
	{
		id: "CloudTrailTampering",
		metricName: "CloudTrailTamperingCount",
		description: "CloudTrail logging or selectors were modified.",
		filterPattern:
			'{ ($.eventSource = "cloudtrail.amazonaws.com") && ' +
			'(($.eventName = "StopLogging") || ' +
			'($.eventName = "DeleteTrail") || ' +
			'($.eventName = "UpdateTrail") || ' +
			'($.eventName = "PutEventSelectors") || ' +
			'($.eventName = "PutInsightSelectors")) }',
	},
	{
		id: "OrganizationsChanges",
		metricName: "OrganizationsChangeCount",
		description: "AWS Organizations or SCP configuration changed.",
		filterPattern:
			'{ ($.eventSource = "organizations.amazonaws.com") && ' +
			'(($.eventName = "CreatePolicy") || ' +
			'($.eventName = "UpdatePolicy") || ' +
			'($.eventName = "DeletePolicy") || ' +
			'($.eventName = "AttachPolicy") || ' +
			'($.eventName = "DetachPolicy") || ' +
			'($.eventName = "CreateOrganizationalUnit") || ' +
			'($.eventName = "UpdateOrganizationalUnit") || ' +
			'($.eventName = "DeleteOrganizationalUnit") || ' +
			'($.eventName = "MoveAccount") || ' +
			'($.eventName = "EnableAWSServiceAccess") || ' +
			'($.eventName = "DisableAWSServiceAccess")) }',
	},
	{
		id: "RootUserActivity",
		metricName: "RootUserActivityCount",
		description: "AWS account root user was used.",
		filterPattern:
			'{ ($.userIdentity.type = "Root") && ' +
			"($.userIdentity.invokedBy NOT EXISTS) && " +
			'($.eventType != "AwsServiceEvent") }',
	},
	{
		id: "LogArchiveTampering",
		metricName: "LogArchiveTamperingCount",
		description:
			"Destructive S3 or KMS operation was attempted in the Log Archive account.",
		filterPattern:
			'{ ($.recipientAccountId = "__LOG_ARCHIVE_ACCOUNT_ID__") && ' +
			'(($.eventName = "DeleteObject") || ' +
			'($.eventName = "DeleteObjects") || ' +
			'($.eventName = "DeleteBucket") || ' +
			'($.eventName = "DeleteBucketPolicy") || ' +
			'($.eventName = "DeleteBucketEncryption") || ' +
			'($.eventName = "DeleteBucketLifecycle") || ' +
			'($.eventName = "PutBucketPolicy") || ' +
			'($.eventName = "PutBucketVersioning") || ' +
			'($.eventName = "PutBucketEncryption") || ' +
			'($.eventName = "DisableKey") || ' +
			'($.eventName = "ScheduleKeyDeletion") || ' +
			'($.eventName = "PutKeyPolicy")) }',
	},
] as const satisfies readonly SecurityMetricDefinition[];
