import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { parseAwsAccountId } from "../lib/config/accounts";
import { DnsStack } from "../lib/stacks/dns-stack";

describe("DnsStack", () => {
	test("apex hosted zoneを作成する", () => {
		const app = new App();
		const stack = new DnsStack(app, "TestDnsStack", {
			env: {
				account: parseAwsAccountId("111111111111"),
				region: "ap-northeast-1",
			},
		});
		const template = Template.fromStack(stack);

		template.resourceCountIs("AWS::Route53::HostedZone", 1);
		template.hasResourceProperties("AWS::Route53::HostedZone", {
			Name: "gobo-cello.com.",
		});
	});

	test("blogSubdomainNameServersが未指定の場合はNS delegationレコードを作成しない", () => {
		const app = new App();
		const stack = new DnsStack(app, "TestDnsStack", {
			env: {
				account: parseAwsAccountId("111111111111"),
				region: "ap-northeast-1",
			},
		});
		const template = Template.fromStack(stack);

		template.resourceCountIs("AWS::Route53::RecordSet", 0);
	});

	test("blogSubdomainNameServersが指定された場合はblog宛のNS delegationレコードを作成する", () => {
		const app = new App();
		const stack = new DnsStack(app, "TestDnsStack", {
			env: {
				account: parseAwsAccountId("111111111111"),
				region: "ap-northeast-1",
			},
			blogSubdomainNameServers: ["ns-1.awsdns-00.com", "ns-2.awsdns-00.org"],
		});
		const template = Template.fromStack(stack);

		template.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "blog.gobo-cello.com.",
			Type: "NS",
			ResourceRecords: Match.arrayEquals([
				"ns-1.awsdns-00.com",
				"ns-2.awsdns-00.org",
			]),
		});
	});

	test("Stack termination protectionを有効にする", () => {
		const app = new App();
		const stack = new DnsStack(app, "TestDnsStack", {
			env: {
				account: parseAwsAccountId("111111111111"),
				region: "ap-northeast-1",
			},
		});

		expect(stack.terminationProtection).toBe(true);
	});
});
