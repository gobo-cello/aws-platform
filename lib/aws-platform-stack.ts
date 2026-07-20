import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import {
	applyPlatformTags,
	createPlatformTags,
	type DeploymentEnvironment,
} from "./config/tags";

export interface AwsPlatformStackProps extends StackProps {
	readonly environmentName: DeploymentEnvironment;
}

export class AwsPlatformStack extends Stack {
	public constructor(
		scope: Construct,
		id: string,
		props: AwsPlatformStackProps,
	) {
		super(scope, id, {
			...props,
			terminationProtection: true,
		});

		applyPlatformTags(this, createPlatformTags(props.environmentName));
	}
}
