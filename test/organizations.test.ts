import { describe, expect, it, test } from "vitest";
import { parseAwsOrganizationId } from "../lib/config/organizations";

describe("parseAwsOrganizationId", () => {
	describe("正しいOrganization IDが与えられた場合", () => {
		it("そのまま受け入れる", () => {
			expect(parseAwsOrganizationId("o-1234567890")).toBe("o-1234567890");
		});
	});

	describe("不正な値が与えられた場合", () => {
		test.each([
			undefined,
			null,
			"",
			"1234567890",
			"o-short",
			"O-1234567890",
			"o-123456789_",
		])("エラーを投げる: %p", (value: unknown) => {
			expect(() => parseAwsOrganizationId(value)).toThrow();
		});
	});
});
