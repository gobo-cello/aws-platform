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

describe("DnsStack (googleSiteVerificationToken指定時)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
		googleSiteVerificationToken: "abcdefg1234567",
	});
	const template = Template.fromStack(stack);

	it("apex宛にsite verification用のTXTレコードを作成する", () => {
		template.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "example.com.",
			Type: "TXT",
			ResourceRecords: Match.arrayEquals([
				'"google-site-verification=abcdefg1234567"',
			]),
		});
	});
});

describe("DnsStack (googleSiteVerificationToken未指定の場合)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
	});
	const template = Template.fromStack(stack);

	it("TXTレコードを作成しない", () => {
		template.resourceCountIs("AWS::Route53::RecordSet", 0);
	});
});

describe("DnsStack (apexLandingCloudFrontDomainName指定時)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
		apexLandingCloudFrontDomainName: "d111111abcdef8.cloudfront.net",
	});
	const template = Template.fromStack(stack);

	it("apex宛にCloudFront alias用のAレコードを作成する", () => {
		template.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "example.com.",
			Type: "A",
			AliasTarget: Match.objectLike({
				HostedZoneId: "Z2FDTNDATAQYW2",
				DNSName: "d111111abcdef8.cloudfront.net",
			}),
		});
	});

	it("apex宛にCloudFront alias用のAAAAレコードを作成する", () => {
		template.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "example.com.",
			Type: "AAAA",
			AliasTarget: Match.objectLike({
				HostedZoneId: "Z2FDTNDATAQYW2",
				DNSName: "d111111abcdef8.cloudfront.net",
			}),
		});
	});
});

describe("DnsStack (apexLandingCloudFrontDomainName未指定の場合)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
	});
	const template = Template.fromStack(stack);

	it("CloudFront alias用のレコードを作成しない", () => {
		template.resourceCountIs("AWS::Route53::RecordSet", 0);
	});
});

describe("DnsStack (apexLandingCertificateValidationRecordName/Value指定時)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
		apexLandingCertificateValidationRecordName: "_abc123.example.com.",
		apexLandingCertificateValidationRecordValue: "_xyz789.acm-validations.aws.",
	});
	const template = Template.fromStack(stack);

	it("apex宛に証明書検証用のCNAMEレコードを作成する", () => {
		template.hasResourceProperties("AWS::Route53::RecordSet", {
			Name: "_abc123.example.com.",
			Type: "CNAME",
			ResourceRecords: Match.arrayEquals(["_xyz789.acm-validations.aws."]),
		});
	});
});

describe("DnsStack (apexLandingCertificateValidationRecordNameのみ指定時)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
		apexLandingCertificateValidationRecordName: "_abc123.example.com.",
	});
	const template = Template.fromStack(stack);

	it("証明書検証用のCNAMEレコードを作成しない", () => {
		template.resourceCountIs("AWS::Route53::RecordSet", 0);
	});
});

describe("DnsStack (apexLandingCertificateValidationRecordValueのみ指定時)", () => {
	const app = new App();
	const stack = new DnsStack(app, "TestDnsStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
		apexDomainName: "example.com",
		apexLandingCertificateValidationRecordValue: "_xyz789.acm-validations.aws.",
	});
	const template = Template.fromStack(stack);

	it("証明書検証用のCNAMEレコードを作成しない", () => {
		template.resourceCountIs("AWS::Route53::RecordSet", 0);
	});
});
