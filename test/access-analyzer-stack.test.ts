import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { parseAwsAccountId } from "../lib/config/accounts";
import { AccessAnalyzerStack } from "../lib/stacks/access-analyzer-stack";

describe("AccessAnalyzerStack", () => {
	const app = new App();

	const stack = new AccessAnalyzerStack(app, "TestAccessAnalyzerStack", {
		env: {
			account: parseAwsAccountId("111111111111"),
			region: "ap-northeast-1",
		},
	});

	const template = Template.fromStack(stack);

	test("Organization external access analyzerを作成する", () => {
		template.hasResourceProperties("AWS::AccessAnalyzer::Analyzer", {
			Type: "ORGANIZATION",
		});
	});

	test("Analyzer名を固定しない", () => {
		const analyzers = template.findResources("AWS::AccessAnalyzer::Analyzer");

		const [analyzer] = Object.values(analyzers);
		if (!analyzer) {
			throw new Error("AWS::AccessAnalyzer::Analyzer リソースが見つかりません");
		}

		expect(analyzer.Properties.AnalyzerName).toBeUndefined();
	});

	test("archive ruleを初期設定しない", () => {
		const analyzers = template.findResources("AWS::AccessAnalyzer::Analyzer");

		const [analyzer] = Object.values(analyzers);
		if (!analyzer) {
			throw new Error("AWS::AccessAnalyzer::Analyzer リソースが見つかりません");
		}

		expect(analyzer.Properties.ArchiveRules).toBeUndefined();
	});

	test("Stack termination protectionを有効にする", () => {
		expect(stack.terminationProtection).toBe(true);
	});
});
