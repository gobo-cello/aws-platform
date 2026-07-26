import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { parseAwsAccountId } from "../lib/config/accounts";
import { DnsStack } from "../lib/stacks/dns-stack";

describe("DnsStack", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
	});
	const template = Template.fromStack(stack);

	it("apex hosted zoneを作成する", () => {
		template.resourceCountIs("AWS::Route53::HostedZone", 1);
		template.hasResourceProperties("AWS::Route53::HostedZone", {
			Name: "example.com.",
		});
	});

	it("Stack termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});

	describe("blogSubdomainNameServersが未指定の場合", () => {
		it("NS delegationレコードを作成しない", () => {
			template.resourceCountIs("AWS::Route53::RecordSet", 0);
		});
	});
});

describe("DnsStack (blogSubdomainNameServers指定時)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
		blogSubdomainNameServers: ["ns-1.awsdns-00.com", "ns-2.awsdns-00.org"],
	});
	const template = Template.fromStack(stack);

	it("blog宛のNS delegationレコードを作成する", () => {
		template.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "blog.example.com.",
			Type: "NS",
			ResourceRecords: Match.arrayEquals([
				"ns-1.awsdns-00.com",
				"ns-2.awsdns-00.org",
			]),
		});
	});
});
