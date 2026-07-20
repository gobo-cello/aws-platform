import { InvalidKmsKeyArnError, parseKmsKeyArn } from "../lib/config/kms";

describe("parseKmsKeyArn", () => {
	test("正しいKMS key ARNを受け入れる", () => {
		const arn =
			"arn:aws:kms:ap-northeast-1:222222222222:" +
			"key/12345678-1234-1234-1234-123456789012";

		expect(parseKmsKeyArn(arn)).toBe(arn);
	});

	test.each([
		undefined,
		null,
		"",
		"not-an-arn",
		"arn:aws:kms:ap-northeast-1:222:key/test",
	])("不正な値を拒否する: %p", (value: unknown) => {
		expect(() => parseKmsKeyArn(value)).toThrow(InvalidKmsKeyArnError);
	});
});
