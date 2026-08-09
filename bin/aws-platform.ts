#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import { loadPlatformConfiguration } from "../lib/config/environments";
import { DnsStack } from "../lib/stacks/dns-stack";
import { GithubDeployRoleStack } from "../lib/stacks/github-deploy-role-stack";

const app = new App();
const configuration = loadPlatformConfiguration();

new GithubDeployRoleStack(app, "ManagementGithubDeployRoleStack", {
	env: configuration.management,
	awsEnvironment: configuration.management,
	deploymentEnvironment: "management",
});

new DnsStack(app, "DnsStack", {
	env: configuration.management,
	apexDomainName: configuration.apexDomainName,
	blogSubdomainNameServers: configuration.blogSubdomainNameServers,
	suiteShuffleSubdomainNameServers:
		configuration.suiteShuffleSubdomainNameServers,
	googleSiteVerificationToken: configuration.googleSiteVerificationToken,
	apexLandingCloudFrontDomainName:
		configuration.apexLandingCloudFrontDomainName,
	apexLandingCertificateValidationRecordName:
		configuration.apexLandingCertificateValidationRecordName,
	apexLandingCertificateValidationRecordValue:
		configuration.apexLandingCertificateValidationRecordValue,
});
