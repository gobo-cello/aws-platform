import type { KnipConfig } from "knip";

const config: KnipConfig = {
	// cdk.json の "app" から tsx 経由で実行される CDK エントリポイント。
	// package.json の scripts 経由ではないため tsx プラグインの自動検出対象外 → 明示する。
	entry: ["bin/aws-platform.ts!"],
	project: ["bin/**/*.ts!", "lib/**/*.ts!", "test/**/*.ts"],
	// tsx は cdk.json の "app" フィールドから呼ばれており、package.json の
	// scripts 経由ではないため tsx プラグインが使用を検出できない。
	ignoreDependencies: ["tsx"],
};

export default config;
