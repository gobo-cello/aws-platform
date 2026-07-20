import { RemovalPolicy } from "aws-cdk-lib";

export const resourceRemovalPolicies = {
	persistent: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
	replaceable: RemovalPolicy.DESTROY,
} as const;

export type ResourceLifecycle = keyof typeof resourceRemovalPolicies;

export function removalPolicyFor(lifecycle: ResourceLifecycle): RemovalPolicy {
	return resourceRemovalPolicies[lifecycle];
}
