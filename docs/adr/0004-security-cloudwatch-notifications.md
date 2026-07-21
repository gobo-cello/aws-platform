# 0004: セキュリティ関連のCloudWatch通知を設定する

- Status: Accepted
- Date: 2026-07-22

## Context

ADR 0003で、SCPはManagement accountのprincipalには適用できず、
Management accountの保護はIAM最小権限・CDK管理・
termination protection・監視通知で補完するとした。

この「監視通知」を実装する必要がある。

Organization TrailはこれまでS3配信のみで、CloudWatch Logsへの
配信が設定されておらず、CloudWatch Alarmを組む経路が無かった。

## Decision

Organization Trailの配信先にCloudWatch Logsを追加する。

- Log GroupのretentionはS3(400日、ADR 0002)より短い90日とする。
  CloudWatch Logsは検知と短期調査のための基盤とし、
  長期保持はS3が担う。
- CloudTrailが書き込むIAM Roleは、対象Log Groupの
  log-streamへの`logs:CreateLogStream`・`logs:PutLogEvents`
  のみに限定する。

Log Groupへ次の4種類のMetric Filter・Alarmを設定し、
共通のSNS Topicへ通知する。重要度が高く、誤検知が
比較的少ないものへ絞る。

- CloudTrailの停止・削除・設定変更
- AWS Organizations・SCPの変更
- root userの利用
- Log ArchiveのS3・KMSに対する破壊操作
  (`recipientAccountId`でlog-archive accountへ限定する)

検知対象は、このリポジトリが管理するresourceに関連する範囲へ限定する。
VPC・Security Group・NACLなどこのリポジトリが管理しないresourceの
アラームは含めない。IAM policyの変更やMFA未使用のConsoleサインインも、
IAM Identity Centerのユーザーを含めこのリポジトリが管理しない領域に
関わるため対象に含めない。汎用的なUnauthorized API呼び出しの検知も、
誤検知が多く今回選定した「重要度が高く誤検知が少ない」基準に
合わないため見送る。

IAM Access Analyzerの新規findingの通知は、今回のスコープに含めない。
CloudTrailベースの検知とは仕組みが異なり(EventBridge経由)、
別の変更として扱う。

SNS Topicへは、実際にemail subscriptionを作成する。
通知先メールアドレスの実値はGitへ保存せず、
`SECURITY_NOTIFICATION_EMAIL`環境変数から受け取る。
account IDやOU IDと同様に、実値そのものではなく
値の受け渡し経路をCDKで管理する。

## Consequences

デプロイ後、通知先メールアドレスへSNSから購読確認メールが届く。
受信者が確認リンクを開くまでは通知が配信されない。

CloudWatch Logsの90日分の保持コストが新たに発生する。
S3の400日保持と役割を分けているため、両者の保持期間は
連動して変更しない。

将来IAM policy変更やAccess Analyzer findingなど検知対象を
広げる場合は、`lib/config/security-monitoring.ts`へ定義を
追加するか、別のstackとして切り出すかを別途判断する。
