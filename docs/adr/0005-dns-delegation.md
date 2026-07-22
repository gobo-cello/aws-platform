# 0005: gobo-cello.comのapex hosted zoneとサブドメイン委譲

- Status: Accepted
- Date: 2026-07-22

## Context

`gobo-cello.com`はお名前.comで登録済みで、現時点ではブログ以外の
用途(メール等)には使用していない。

ブログは`blog`リポジトリの`blog-production` accountで
`blog.gobo-cello.com`として公開する予定であり、将来的には
ブログ以外のサブドメイン(例: `api.gobo-cello.com`)が
別のAWS accountへ増えていくことも想定している。

## Decision

apex hosted zone(`gobo-cello.com`)は、このリポジトリが
Management accountに作成する。CloudTrail・IAM Access Analyzer・
SCPなど、既存の組織共通基盤と同じ置き場所とする。

各サービスのサブドメインは、apex hosted zoneから
NS delegationで各サービスのAWS accountへ委譲する。

```text
gobo-cello.com (apex hosted zone、Management account)
  └─ NS delegation → blog.gobo-cello.com (blog-production account所有)
```

apex hosted zone自体は、サブドメインのNS delegationレコード以外の
レコードを持たない。ドメインの実体・証明書・DNS検証は、
委譲先のサービスaccountが完全に自己完結して管理する。

これにより、将来別のサブドメインが増えても、apex側の変更は
NS delegationレコードの追加だけで済み、各サービスのaccountは
互いのhosted zoneへ書き込み権限を必要としない。

### 委譲するname serverの受け渡し方法

`blog.gobo-cello.com`のhosted zoneは`blog`リポジトリのCDKが
作成するため、そのname serverは`blog`リポジトリのCDK deploy完了後に
初めて分かる。この値は`BLOG_SUBDOMAIN_NAME_SERVERS`環境変数(カンマ区切り)
としてこのリポジトリへ渡し、`DnsStack`がNS delegationレコードを作成する。
この値が未設定の間は、delegationレコードを作成しない(apex hosted zoneの
作成自体は`blog`側の状態に依存させない)。

### DNSSECは見送る

DNSSECは鍵管理・KSKローテーションなど運用負荷が増える。
現時点でのリスクは小さく、個人ブログ規模での優先度は高くないため、
今回は設定を見送る。必要になった時点で改めて検討する。

### 既存レコードの移行は不要

`gobo-cello.com`は現時点でブログ以外の用途(メール等)で使用していない。
そのため、お名前.comのネームサーバーをRoute 53へ切り替える前に、
既存レコードをRoute 53側へ複製する作業は不要と判断した。

## Consequences

- お名前.comのネームサーバーをRoute 53の値へ切り替える作業は、
  レジストラでの手動作業であり、このリポジトリのCDKでは自動化できない。
- `blog`リポジトリ側のhosted zone作成 → name server取得 →
  このリポジトリへの環境変数設定 → 再deploy、という順序を踏む必要があり、
  1回のdeployでは完結しない。
- 将来`sandbox.blog.gobo-cello.com`を追加する場合も、
  `blog.gobo-cello.com`(blog-production所有)から`blog-sandbox` accountへ
  同じNS delegationパターンを一段再帰させる想定である
  (詳細は`blog`リポジトリのADRを参照)。
