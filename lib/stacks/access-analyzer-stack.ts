import { CfnOutput, Stack, type StackProps } from "aws-cdk-lib";
import { CfnAnalyzer } from "aws-cdk-lib/aws-accessanalyzer";
import type { Construct } from "constructs";
import { applyPlatformTags, createPlatformTags } from "../config/tags";

export class AccessAnalyzerStack extends Stack {
	public constructor(scope: Construct, id: string, props: StackProps) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		const analyzer = new CfnAnalyzer(
			this,
			"OrganizationExternalAccessAnalyzer",
			{
				type: "ORGANIZATION",
			},
		);

		applyPlatformTags(this, createPlatformTags("management"));

		new CfnOutput(this, "AnalyzerArn", {
			value: analyzer.attrArn,
		});
	}
}
