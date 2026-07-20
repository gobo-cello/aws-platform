# 0002: CloudTrailログを400日保持する

- Status: Accepted
- Date: 2026-07-20

## Context

Organization TrailのログをLog Archive accountのS3 bucketへ
集約している。

無期限保持は継続的なストレージコストを発生させる一方、
短すぎる保持期間はインシデント調査や年次確認を困難にする。

CloudTrail logは小さいobjectが多く、Storage Class transitionの
request費用やmetadata overheadがストレージ削減効果を上回る
可能性がある。

## Decision

CloudTrailログへ次のS3 Lifecycle policyを適用する。

- current versionを400日保持する
- noncurrent versionを30日保持する
- expired delete markerを削除する
- incomplete multipart uploadを7日後にabortする
- Storage Class transitionは設定しない

## Consequences

400日を超えたログは復元できない。

法令、契約、監査またはインシデント対応上の要件が変わった場合、
保持期間を再評価する必要がある。

ログ量と費用が増えた場合は、object sizeを考慮した
Storage Class transitionを再検討する。
