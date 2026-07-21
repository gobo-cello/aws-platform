# 0003: CloudTrail監査基盤をSCPで保護する

- Status: Accepted
- Date: 2026-07-20

## Context

Organization Trailの停止や設定縮小、Log Archive bucket内の
監査ログ削除をmember accountのadministratorからも防ぐ必要がある。

SCPはManagement accountのprincipalには適用されない。

## Decision

2つのSCPを作成する。

1. DenyCloudTrailTampering
   - CloudTrailの停止、削除、設定変更を拒否する
   - Security、Production、Sandbox OUを対象とする

2. ProtectCloudTrailLogArchive
   - CloudTrail S3 bucketとKMS keyの破壊的変更を拒否する
   - Security OUだけを対象とする

Log Archive resourceの正規更新を可能にするため、
log-archive accountのCDK CloudFormation execution roleのみ
拒否対象から除外する。

SCP作成とOUへの適用は別の変更として行う。

## Consequences

Management accountが所有するOrganization Trailそのものは、
SCPでは保護できない。

Management accountの保護は、IAM最小権限、CDK管理、
termination protection、CloudTrail監視通知で補完する。

SCP適用後、Log Archive resourceを手動操作することはできない。
変更は原則としてCDK経由で行う。
