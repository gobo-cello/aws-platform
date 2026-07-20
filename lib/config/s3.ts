declare const s3BucketNameBrand: unique symbol;

export type S3BucketName = string & {
	readonly [s3BucketNameBrand]: "S3BucketName";
};

export class InvalidS3BucketNameError extends Error {
	public constructor(value: unknown) {
		super(`Invalid S3 bucket name: ${String(value)}`);
		this.name = "InvalidS3BucketNameError";
	}
}

export function parseS3BucketName(value: unknown): S3BucketName {
	if (
		typeof value !== "string" ||
		value.length < 3 ||
		value.length > 63 ||
		!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(value) ||
		value.includes("..")
	) {
		throw new InvalidS3BucketNameError(value);
	}

	return value as S3BucketName;
}
