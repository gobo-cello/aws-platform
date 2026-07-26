import { describe, expect, it, test } from "vitest";
import { parseEmailAddress } from "../lib/config/email";

describe("parseEmailAddress", () => {
	describe("正しいメールアドレスが与えられた場合", () => {
		it("そのまま受け入れる", () => {
			expect(parseEmailAddress("security@example.com")).toBe(
				"security@example.com",
			);
		});
	});

	describe("不正な値が与えられた場合", () => {
		test.each([undefined, null, "", "not-an-email", "@example.com", "user@"])(
			"エラーを投げる: %p",
			(value: unknown) => {
				expect(() => parseEmailAddress(value)).toThrow();
			},
		);
	});
});
