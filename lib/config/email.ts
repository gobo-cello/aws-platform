declare const emailAddressBrand: unique symbol;

export type EmailAddress = string & {
	readonly [emailAddressBrand]: "EmailAddress";
};

export class InvalidEmailAddressError extends Error {
	public constructor(value: unknown) {
		super(`Invalid email address: ${String(value)}`);
		this.name = "InvalidEmailAddressError";
	}
}

export function parseEmailAddress(value: unknown): EmailAddress {
	if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
		throw new InvalidEmailAddressError(value);
	}

	return value as EmailAddress;
}
