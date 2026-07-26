import { CfnOutput, Fn, Stack, type StackProps } from "aws-cdk-lib";
import { HostedZone, NsRecord } from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface DnsStackProps extends StackProps {
	readonly apexDomainName: string;
	readonly blogSubdomainNameServers?: readonly string[] | undefined;
}

export class DnsStack extends Stack {
	public constructor(scope: Construct, id: string, props: DnsStackProps) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const zone = new HostedZone(this, "ApexHostedZone", {
			zoneName: props.apexDomainName,
			comment:
				"運用ドメインのapex hosted zone。各サブドメインは各accountのhosted zoneへNS delegationする。",
		});

		if (props.blogSubdomainNameServers !== undefined) {
			new NsRecord(this, "BlogSubdomainDelegation", {
				zone,
				recordName: "blog",
				values: [...props.blogSubdomainNameServers],
			});
		}

		applyPlatformTags(this, createPlatformTags("management"));

		new CfnOutput(this, "ApexHostedZoneId", {
			value: zone.hostedZoneId,
		});

		new CfnOutput(this, "ApexHostedZoneNameServers", {
			value: Fn.join(",", zone.hostedZoneNameServers ?? []),
			description: "お名前.com側のネームサーバー設定に登録する値",
		});
	}
}
