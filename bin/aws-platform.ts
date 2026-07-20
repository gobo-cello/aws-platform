#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import { AwsPlatformStack } from "../lib/aws-platform-stack";
import { loadPlatformEnvironments } from "../lib/config/environments";

const app = new App();
const environments = loadPlatformEnvironments();

new AwsPlatformStack(app, "AwsPlatformStack", {
	env: environments.management,
	environmentName: "management",
});
