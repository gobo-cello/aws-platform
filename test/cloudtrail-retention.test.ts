import { cloudTrailRetentionPolicy } from "../lib/config/cloudtrail-retention";

describe("cloudTrailRetentionPolicy", () => {
	test("監査ログを400日保持する", () => {
		expect(cloudTrailRetentionPolicy.currentVersionRetentionDays).toBe(400);
	});

	test("noncurrent versionを30日後に削除する", () => {
		expect(cloudTrailRetentionPolicy.noncurrentVersionRetentionDays).toBe(30);
	});

	test("未完了multipart uploadを7日後にabortする", () => {
		expect(
			cloudTrailRetentionPolicy.incompleteMultipartUploadRetentionDays,
		).toBe(7);
	});
});
