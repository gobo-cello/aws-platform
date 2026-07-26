import { describe, expect, it, test } from "vitest";
import { parseS3BucketName } from "../lib/config/s3";

describe("parseS3BucketName", () => {
	describe("正しいS3 bucket名が与えられた場合", () => {
		it("そのまま受け入れる", () => {
			expect(parseS3BucketName("logarchivestack-cloudtraillogs-example")).toBe(
				"logarchivestack-cloudtraillogs-example",
			);
		});
	});

	describe("不正な値が与えられた場合", () => {
		test.each([
			undefined,
			null,
			"",
			"ABCD",
			"-invalid",
			"invalid-",
			"invalid..bucket",
		])("エラーを投げる: %p", (value: unknown) => {
			expect(() => parseS3BucketName(value)).toThrow();
		});
	});
});
