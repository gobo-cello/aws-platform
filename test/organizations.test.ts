import {
	InvalidAwsOrganizationIdError,
	parseAwsOrganizationId,
} from "../lib/config/organizations";

describe("parseAwsOrganizationId", () => {
	test("正しいOrganization IDを受け入れる", () => {
		expect(parseAwsOrganizationId("o-1234567890")).toBe("o-1234567890");
	});

	test.each([
		undefined,
		null,
		"",
		"1234567890",
		"o-short",
		"O-1234567890",
		"o-123456789_",
	])("不正な値を拒否する: %p", (value: unknown) => {
		expect(() => parseAwsOrganizationId(value)).toThrow(
			InvalidAwsOrganizationIdError,
		);
	});
});
