import { App, assertions } from "aws-cdk-lib";
import { AwsPlatformStack } from "../lib/aws-platform-stack";

describe("AwsPlatformStack", () => {
	test("synthできる", () => {
		const app = new App();

		const stack = new AwsPlatformStack(app, "TestAwsPlatformStack", {
			env: {
				account: "123456789012",
				region: "ap-northeast-1",
			},
			environmentName: "management",
		});

		expect(() => assertions.Template.fromStack(stack)).not.toThrow();

		expect(stack.terminationProtection).toBe(true);
	});

	test("terminationProtection を明示的に false にした場合は尊重される", () => {
		const app = new App();

		const stack = new AwsPlatformStack(app, "TestAwsPlatformStack", {
			env: {
				account: "123456789012",
				region: "ap-northeast-1",
			},
			environmentName: "management",
			terminationProtection: false,
		});

		expect(stack.terminationProtection).toBe(false);
	});
});
