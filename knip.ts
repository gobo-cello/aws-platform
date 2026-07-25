import type { KnipConfig } from "knip";

const config: KnipConfig = {
	// tsx は cdk.json の "app" から呼ばれており package.json の scripts 経由ではないため、
	// entry・tsx依存ともに knip のプラグイン自動検出対象外となり、明示する。
	entry: ["bin/aws-platform.ts!"],
	project: ["bin/**/*.ts!", "lib/**/*.ts!", "test/**/*.ts"],
	ignoreDependencies: ["tsx"],
};

export default config;
