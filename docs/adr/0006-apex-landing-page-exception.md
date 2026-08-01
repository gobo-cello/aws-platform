# 0006: apex landing pageのための、apex hosted zoneへの直接レコード追加

- Status: Accepted
- Date: 2026-08-01
- Note: [0005](0005-dns-delegation.md)の「apex hosted zone自体は、サブドメインの
  NS delegationレコード以外のレコードを持たない」という原則を、本ADRで述べる
  範囲に限り上書きする。

## Context

`example.com`のapexには現在A/AAAAレコードが存在せず、何も配信されていない。
apex直下に静的なランディングページを配置するため、新規`landing`リポジトリを
作成することにした。

`blog`リポジトリは`blog.example.com`という自分専用のhosted zoneを
NS delegationで受け取っているため、そのzone内で完結してCloudFront向け
aliasレコードやACM証明書検証用レコードを作成できる。しかし`landing`が
配信する対象は apex そのものであり、NS delegationは「zoneを丸ごと譲渡する」
仕組みであるため、apex自体をdelegationすることはできない
(delegationするとapex hosted zoneの実体を明け渡すことになり、
このリポジトリがapex hosted zoneを所有し続けるという前提と矛盾する)。

## Decision

`landing`リポジトリはRoute 53 hosted zoneを一切所有しない。
かわりに、ACM証明書は`CertificateValidation.fromDns()`(hosted zone引数なし)
で発行し、DNS検証レコードとCloudFront Distributionのドメイン名を
`aws-platform`へ手動連携する。`aws-platform`の`DnsStack`が、
[0005](0005-dns-delegation.md)が委譲用に導入した`BLOG_SUBDOMAIN_NAME_SERVERS`
と同じ「値を環境変数経由で手動連携する」パターンを踏襲し、
apex hosted zone内に以下の3種類のoptionalなレコードを直接作成する。

- `APEX_LANDING_CLOUDFRONT_DOMAIN_NAME`: apex宛のCloudFront alias
  A/AAAAレコード(dual-stack)
- `APEX_LANDING_CERT_VALIDATION_RECORD_NAME` /
  `APEX_LANDING_CERT_VALIDATION_RECORD_VALUE`: ACM証明書のDNS検証用
  CNAMEレコード

これにより、0005が定めた「apex hosted zoneはNS delegationレコード
以外を持たない」という原則を、`landing`リポジトリのために限定的に
上書きする。この例外はレコードの種類・用途を上記の3つに限定し、
それ以外のサービスがapex zoneへ直接レコードを追加することは想定しない
(新たなサービスがapex以外の場所で配信する場合は、引き続き0005の
NS delegationパターンを使う)。

### CloudFront alias targetの実装方法

CloudFront Distributionは`landing`リポジトリの別AWS accountに存在し、
`aws-platform`側からは`IDistribution`を取得できない。検討した選択肢は
以下の3つ。

1. **採用: 手動実装した`IAliasRecordTarget`** — CloudFrontのalias用
   hosted zone ID(`Z2FDTNDATAQYW2`)はpartition内で固定のwell-known値であり、
   `aws-cdk-lib`自身が`CloudFrontTarget.CLOUDFRONT_ZONE_ID`として公開している
   定数を参照する。ドメイン名1つだけを手動連携すればよく、cross-accountの
   live lookupやIAM書き込み権限をこのリポジトリへ持ち込まない。
2. **不採用: `Distribution.fromDistributionAttributes` + 本物の`CloudFrontTarget`**
   — attribute importなのでAPI呼び出しは発生せず動作はするが、
   `CloudFrontTarget.bind()`が実際には参照しない`distributionId`まで
   手動連携する値に加える必要があり、構造的に不要な値を運用に持ち込むため
   見送った。
3. **不採用: `CrossAccountZoneDelegationRecord`(cross-account IAM委譲)**
   — 親zoneのaccountが子accountに`route53:ChangeResourceRecordSets`を
   grantする仕組みであり、0005が明示的に禁じている
   「リポジトリ間で互いのhosted zoneへの書き込み権限を持たない」
   という原則に反するため採用しない。

## Consequences

- `landing`リポジトリのCDK deployと`aws-platform`のCDK deployの間で、
  値の手動連携が2往復発生する(ACM証明書検証レコード、CloudFront
  ドメイン名)。`BLOG_SUBDOMAIN_NAME_SERVERS`の1往復よりも運用手順が増える。
- `landing`はhosted zoneを持たないため、`blog`リポジトリのCDK構成
  (`DnsStack`+`HostingStack`)と異なり、`CertificateStack`+`HostingStack`
  という2つのstackのみで構成される。
- 将来apex以外の場所にサービスを追加する場合は、0005のNS delegation
  パターンを優先する。apexへの直接レコード追加は本ADRで認めた
  3種類のレコードに限定し、安易に広げない。
