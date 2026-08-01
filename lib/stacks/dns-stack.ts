import { CfnOutput, Fn, Stack, type StackProps } from "aws-cdk-lib";
import {
	AaaaRecord,
	type AliasRecordTargetConfig,
	ARecord,
	CnameRecord,
	HostedZone,
	type IAliasRecordTarget,
	type IHostedZone,
	type IRecordSet,
	NsRecord,
	RecordTarget,
	TxtRecord,
} from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import type { Construct } from "constructs";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export interface DnsStackProps extends StackProps {
	readonly apexDomainName: string;
	readonly blogSubdomainNameServers?: readonly string[] | undefined;
	readonly googleSiteVerificationToken?: string | undefined;
	readonly apexLandingCloudFrontDomainName?: string | undefined;
	readonly apexLandingCertificateValidationRecordName?: string | undefined;
	readonly apexLandingCertificateValidationRecordValue?: string | undefined;
}

/**
 * apex landing page用CloudFront Distributionは別repo・別accountに存在するため、
 * IDistributionを取得できずCloudFrontTargetをそのまま使えない。
 * cross-accountのlive lookupや書き込み権限をこのrepoへ持ち込みたくないため、
 * あえてDistribution.fromDistributionAttributesも使わない。
 * CloudFrontのalias hosted zone IDはpartition内で固定のwell-known値であり、
 * aws-cdk-lib自身が公開しているCloudFrontTarget.CLOUDFRONT_ZONE_IDをそのまま
 * 参照することで、値をこのrepoへ複製しない。
 */
class CloudFrontDistributionAliasTarget implements IAliasRecordTarget {
	public constructor(private readonly distributionDomainName: string) {}

	public bind(
		_record: IRecordSet,
		_zone?: IHostedZone,
	): AliasRecordTargetConfig {
		return {
			hostedZoneId: CloudFrontTarget.CLOUDFRONT_ZONE_ID,
			dnsName: this.distributionDomainName,
		};
	}
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

		if (props.googleSiteVerificationToken !== undefined) {
			new TxtRecord(this, "GoogleSiteVerification", {
				zone,
				values: [
					`google-site-verification=${props.googleSiteVerificationToken}`,
				],
			});
		}

		if (props.apexLandingCloudFrontDomainName !== undefined) {
			// CloudFrontはA/AAAAの両方で応答するため、dual-stackで両方のaliasを作成する。
			const target = RecordTarget.fromAlias(
				new CloudFrontDistributionAliasTarget(
					props.apexLandingCloudFrontDomainName,
				),
			);
			new ARecord(this, "ApexLandingAliasRecord", { zone, target });
			new AaaaRecord(this, "ApexLandingAliasRecordIpv6", { zone, target });
		}

		if (
			props.apexLandingCertificateValidationRecordName !== undefined &&
			props.apexLandingCertificateValidationRecordValue !== undefined
		) {
			new CnameRecord(this, "ApexLandingCertificateValidation", {
				zone,
				recordName: props.apexLandingCertificateValidationRecordName,
				domainName: props.apexLandingCertificateValidationRecordValue,
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
