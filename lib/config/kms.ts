declare const kmsKeyArnBrand: unique symbol;

export type KmsKeyArn = string & {
	readonly [kmsKeyArnBrand]: "KmsKeyArn";
};

export class InvalidKmsKeyArnError extends Error {
	public constructor(value: unknown) {
		super(`Invalid KMS key ARN: ${String(value)}`);
		this.name = "InvalidKmsKeyArnError";
	}
}

export function parseKmsKeyArn(value: unknown): KmsKeyArn {
	if (
		typeof value !== "string" ||
		!/^arn:aws:kms:[a-z0-9-]+:\d{12}:key\/[0-9a-f-]{36}$/.test(value)
	) {
		throw new InvalidKmsKeyArnError(value);
	}

	return value as KmsKeyArn;
}
