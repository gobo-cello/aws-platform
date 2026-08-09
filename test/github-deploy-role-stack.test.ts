import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { parseAwsAccountId } from "../lib/config/accounts";
import type { PlatformDeployEnvironment } from "../lib/config/environments";
import { GithubDeployRoleStack } from "../lib/stacks/github-deploy-role-stack";

function synthesize(deploymentEnvironment: PlatformDeployEnvironment) {
	const app = new App();
	const awsEnvironment = {
		account: parseAwsAccountId("111111111111"),
		region: "ap-northeast-1" as const,
	};

	const stack = new GithubDeployRoleStack(
		app,
		`Test${deploymentEnvironment}Stack`,
		{
			env: awsEnvironment,
			awsEnvironment,
			deploymentEnvironment,
		},
	);

	return { stack, template: Template.fromStack(stack) };
}

describe.each<PlatformDeployEnvironment>(["management"])(
	"GithubDeployRoleStack(%s)",
	(deploymentEnvironment) => {
		const { stack, template } = synthesize(deploymentEnvironment);

		it("GitHub Actions用のOIDC providerを1つ作成する", () => {
			template.resourceCountIs("AWS::IAM::OIDCProvider", 1);
			template.hasResourceProperties("AWS::IAM::OIDCProvider", {
				Url: "https://token.actions.githubusercontent.com",
				ClientIdList: ["sts.amazonaws.com"],
			});
		});

		it(`sub claimを${deploymentEnvironment}環境に限定したtrust policyを作成する`, () => {
			template.hasResourceProperties("AWS::IAM::Role", {
				AssumeRolePolicyDocument: Match.objectLike({
					Statement: Match.arrayWith([
						Match.objectLike({
							Action: "sts:AssumeRoleWithWebIdentity",
							Effect: "Allow",
							Condition: {
								StringEquals: {
									"token.actions.githubusercontent.com:aud":
										"sts.amazonaws.com",
								},
								StringLike: {
									"token.actions.githubusercontent.com:sub": `repo:gobo-cello@*/aws-platform@*:environment:${deploymentEnvironment}`,
								},
							},
						}),
					]),
				}),
			});
		});

		it("CDK bootstrapのdeploy-role・file-publishing-role・lookup-roleへのAssumeRoleのみ許可する", () => {
			template.hasResourceProperties("AWS::IAM::Policy", {
				PolicyDocument: Match.objectLike({
					Statement: Match.arrayWith([
						Match.objectLike({
							Effect: "Allow",
							Action: "sts:AssumeRole",
							Resource: [
								"arn:aws:iam::111111111111:role/cdk-hnb659fds-deploy-role-111111111111-ap-northeast-1",
								"arn:aws:iam::111111111111:role/cdk-hnb659fds-file-publishing-role-111111111111-ap-northeast-1",
								"arn:aws:iam::111111111111:role/cdk-hnb659fds-lookup-role-111111111111-ap-northeast-1",
							],
						}),
					]),
				}),
			});
		});

		it("Stack termination protectionを有効にする", () => {
			expect(stack.terminationProtection).toBe(true);
		});
	},
);
