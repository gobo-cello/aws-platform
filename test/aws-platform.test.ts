import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { AwsPlatformStack } from "../lib/aws-platform-stack";

describe("AwsPlatformStack", () => {
	test("synthesizes an empty template before platform resources are added", () => {
		const app = new cdk.App();
		const stack = new AwsPlatformStack(app, "TestAwsPlatformStack");

		expect(() => Template.fromStack(stack)).not.toThrow();
	});
});
