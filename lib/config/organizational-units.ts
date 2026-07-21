declare const organizationalUnitIdBrand: unique symbol;

export type OrganizationalUnitId = string & {
	readonly [organizationalUnitIdBrand]: "OrganizationalUnitId";
};

export class InvalidOrganizationalUnitIdError extends Error {
	public constructor(value: unknown) {
		super(`Invalid organizational unit ID: ${String(value)}`);
		this.name = "InvalidOrganizationalUnitIdError";
	}
}

export function parseOrganizationalUnitId(
	value: unknown,
): OrganizationalUnitId {
	if (
		typeof value !== "string" ||
		!/^ou-[a-z0-9]{4,32}-[a-z0-9]{8,32}$/.test(value)
	) {
		throw new InvalidOrganizationalUnitIdError(value);
	}

	return value as OrganizationalUnitId;
}
