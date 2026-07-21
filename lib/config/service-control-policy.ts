export interface ServiceControlPolicyStatement {
	readonly Sid: string;
	readonly Effect: "Deny";
	readonly Action: readonly string[];
	readonly Resource: string | readonly string[];
	readonly Condition?: Readonly<
		Record<string, Readonly<Record<string, string | readonly string[]>>>
	>;
}

export interface ServiceControlPolicyDocument {
	readonly Version: "2012-10-17";
	readonly Statement: readonly ServiceControlPolicyStatement[];
}
