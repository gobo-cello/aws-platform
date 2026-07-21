#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import { loadPlatformConfiguration } from "../lib/config/environments";
import { AccessAnalyzerStack } from "../lib/stacks/access-analyzer-stack";
import { LogArchiveStack } from "../lib/stacks/log-archive-stack";
import { OrganizationPoliciesStack } from "../lib/stacks/organization-policies-stack";
import { OrganizationTrailStack } from "../lib/stacks/organization-trail-stack";

const app = new App();
const configuration = loadPlatformConfiguration();

new LogArchiveStack(app, "LogArchiveStack", {
	env: configuration.logArchive,
	managementAccountId: configuration.management.account,
	organizationId: configuration.organizationId,
});

new OrganizationTrailStack(app, "OrganizationTrailStack", {
	env: configuration.management,
	organizationId: configuration.organizationId,
	logBucketName: configuration.cloudTrailDestination.bucketName,
	kmsKeyArn: configuration.cloudTrailDestination.kmsKeyArn,
});

new AccessAnalyzerStack(app, "AccessAnalyzerStack", {
	env: configuration.management,
});

new OrganizationPoliciesStack(app, "OrganizationPoliciesStack", {
	env: configuration.management,
	logArchiveEnvironment: configuration.logArchive,
	cloudTrailLogBucketName: configuration.cloudTrailDestination.bucketName,
	cloudTrailKmsKeyArn: configuration.cloudTrailDestination.kmsKeyArn,
});
