#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import { loadPlatformConfiguration } from "../lib/config/environments";
import { LogArchiveStack } from "../lib/stacks/log-archive-stack";

const app = new App();
const configuration = loadPlatformConfiguration();

new LogArchiveStack(app, "LogArchiveStack", {
	env: configuration.logArchive,
	managementAccountId: configuration.management.account,
	organizationId: configuration.organizationId,
});
