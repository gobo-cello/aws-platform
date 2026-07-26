import { describe, expect, it } from "vitest";
import { cloudTrailRetentionPolicy } from "../lib/config/cloudtrail-retention";

describe("cloudTrailRetentionPolicy", () => {
	it("監査ログを400日保持する", () => {
		expect(cloudTrailRetentionPolicy.currentVersionRetentionDays).toBe(400);
	});

	it("noncurrent versionを30日後に削除する", () => {
		expect(cloudTrailRetentionPolicy.noncurrentVersionRetentionDays).toBe(30);
	});

	it("未完了multipart uploadを7日後にabortする", () => {
		expect(
			cloudTrailRetentionPolicy.incompleteMultipartUploadRetentionDays,
		).toBe(7);
	});
});
