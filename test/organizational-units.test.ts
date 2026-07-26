import { describe, expect, it, test } from "vitest";
import {
	InvalidOrganizationalUnitIdError,
	parseOrganizationalUnitId,
} from "../lib/config/organizational-units";

describe("parseOrganizationalUnitId", () => {
	describe("正しいOU IDが与えられた場合", () => {
		it("そのまま受け入れる", () => {
			expect(parseOrganizationalUnitId("ou-ab12-12345678")).toBe(
				"ou-ab12-12345678",
			);
		});
	});

	describe("不正な値が与えられた場合", () => {
		test.each([
			undefined,
			null,
			"",
			"r-ab12",
			"123456789012",
			"ou-short",
			"OU-ab12-12345678",
		])("InvalidOrganizationalUnitIdErrorを投げる: %p", (value: unknown) => {
			expect(() => parseOrganizationalUnitId(value)).toThrow(
				InvalidOrganizationalUnitIdError,
			);
		});
	});
});
