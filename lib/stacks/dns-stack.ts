import { CfnOutput, Fn, Stack, type StackProps } from "aws-cdk-lib";
import { HostedZone, NsRecord } from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";
import { apexDomainName } from "../config/dns";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface DnsStackProps extends StackProps {
	readonly blogSubdomainNameServers?: readonly string[] | undefined;
}

export class DnsStack extends Stack {
	public constructor(scope: Construct, id: string, props: DnsStackProps) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const zone = new HostedZone(this, "ApexHostedZone", {
			zoneName: apexDomainName,
			comment:
				"gobo-cello.comのapex hosted zone。各サブドメインは各accountのhosted zoneへNS delegationする。",
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
