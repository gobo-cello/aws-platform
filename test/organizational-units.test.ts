import {
	InvalidOrganizationalUnitIdError,
	parseOrganizationalUnitId,
} from "../lib/config/organizational-units";

describe("parseOrganizationalUnitId", () => {
	test("正しいOU IDを受け入れる", () => {
		expect(parseOrganizationalUnitId("ou-ab12-12345678")).toBe(
			"ou-ab12-12345678",
		);
	});

	test.each([
		undefined,
		null,
		"",
		"r-ab12",
		"123456789012",
		"ou-short",
		"OU-ab12-12345678",
	])("不正なOU IDを拒否する: %p", (value: unknown) => {
		expect(() => parseOrganizationalUnitId(value)).toThrow(
			InvalidOrganizationalUnitIdError,
		);
	});
});
