import { Tags } from "aws-cdk-lib";
import type { IConstruct } from "constructs";

export const deploymentEnvironments = ["management", "security"] as const;

export type DeploymentEnvironment = (typeof deploymentEnvironments)[number];

export interface PlatformTags {
	readonly Owner: string;
	readonly ManagedBy: "AWS-CDK";
	readonly Repository: "gobo-cello/aws-platform";
	readonly Workload: "aws-platform";
	readonly Environment: DeploymentEnvironment;
}

const commonTags = {
	Owner: "gobo-cello",
	ManagedBy: "AWS-CDK",
	Repository: "gobo-cello/aws-platform",
	Workload: "aws-platform",
} as const satisfies Omit<PlatformTags, "Environment">;

export function createPlatformTags(
	environment: DeploymentEnvironment,
): PlatformTags {
	return {
		...commonTags,
		Environment: environment,
	};
}

export function applyPlatformTags(scope: IConstruct, tags: PlatformTags): void {
	for (const [key, value] of Object.entries(tags)) {
		Tags.of(scope).add(key, value);
	}
}
