import { describe, expect, it, test } from "vitest";
import {
	parseGoogleSiteVerificationToken,
	parseNameServers,
} from "../lib/config/dns";

describe("parseNameServers", () => {
	describe("カンマ区切りの文字列が与えられた場合", () => {
		it("name serverの配列に変換する", () => {
			expect(parseNameServers("ns-1.awsdns-00.com,ns-2.awsdns-00.org")).toEqual(
				["ns-1.awsdns-00.com", "ns-2.awsdns-00.org"],
			);
		});

		it("各要素の前後の空白をtrimする", () => {
			expect(
				parseNameServers(" ns-1.awsdns-00.com , ns-2.awsdns-00.org "),
			).toEqual(["ns-1.awsdns-00.com", "ns-2.awsdns-00.org"]);
		});
	});

	describe("空要素を含む値が与えられた場合", () => {
		test.each(["", "ns-1.awsdns-00.com,", ",ns-1.awsdns-00.com"])(
			"エラーを投げる: %p",
			(value: string) => {
				expect(() => parseNameServers(value)).toThrow();
			},
		);
	});
});

describe("parseGoogleSiteVerificationToken", () => {
	it("空でない文字列をそのまま返す", () => {
		expect(parseGoogleSiteVerificationToken("abcdefg1234567")).toBe(
			"abcdefg1234567",
		);
	});

	it("空文字列が与えられた場合エラーを投げる", () => {
		expect(() => parseGoogleSiteVerificationToken("")).toThrow();
	});
});
