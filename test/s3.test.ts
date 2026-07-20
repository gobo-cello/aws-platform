import { InvalidS3BucketNameError, parseS3BucketName } from "../lib/config/s3";

describe("parseS3BucketName", () => {
	test("正しいS3 bucket名を受け入れる", () => {
		expect(parseS3BucketName("logarchivestack-cloudtraillogs-example")).toBe(
			"logarchivestack-cloudtraillogs-example",
		);
	});

	test.each([
		undefined,
		null,
		"",
		"ABCD",
		"-invalid",
		"invalid-",
		"invalid..bucket",
	])("不正な値を拒否する: %p", (value: unknown) => {
		expect(() => parseS3BucketName(value)).toThrow(InvalidS3BucketNameError);
	});
});
