import { describe, expect, it, test } from "vitest";
import { parseKmsKeyArn } from "../lib/config/kms";

describe("parseKmsKeyArn", () => {
	describe("正しいKMS key ARNが与えられた場合", () => {
		it("そのまま受け入れる", () => {
			const arn =
				"arn:aws:kms:ap-northeast-1:222222222222:" +
				"key/12345678-1234-1234-1234-123456789012";

			expect(parseKmsKeyArn(arn)).toBe(arn);
		});
	});

	describe("不正な値が与えられた場合", () => {
		test.each([
			undefined,
			null,
			"",
			"not-an-arn",
			"arn:aws:kms:ap-northeast-1:222:key/test",
		])("エラーを投げる: %p", (value: unknown) => {
			expect(() => parseKmsKeyArn(value)).toThrow();
		});
	});
});
