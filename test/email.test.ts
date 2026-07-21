import {
	InvalidEmailAddressError,
	parseEmailAddress,
} from "../lib/config/email";

describe("parseEmailAddress", () => {
	test("正しいメールアドレスを受け入れる", () => {
		expect(parseEmailAddress("security@example.com")).toBe(
			"security@example.com",
		);
	});

	test.each([undefined, null, "", "not-an-email", "@example.com", "user@"])(
		"不正な値を拒否する: %p",
		(value: unknown) => {
			expect(() => parseEmailAddress(value)).toThrow(InvalidEmailAddressError);
		},
	);
});
