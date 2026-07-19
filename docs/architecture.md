# アーキテクチャ

## AWS Organization 構成

```text
AWS Organizations
├── Management account
├── Security OU
│   └── log-archive
├── Production OU
│   └── blog-production
└── Sandbox OU
    └── blog-sandbox
```

## 責務

### Management account

* AWS Organizations
* IAM Identity Center
* 請求とコスト管理
* 組織レベルでのサービス統合
* Organization Trail の所有

### log-archive

* 監査ログの一元管理
* CloudTrail ログの暗号化
* ログの保持

### blog-production

* 本番ブログのワークロード

### blog-sandbox

* 開発・検証用のワークロード

## リポジトリの境界

このリポジトリは、組織レベルのプラットフォーム基盤を管理します。

ブログのアプリケーション、コンテンツ、ワークロード用インフラストラクチャは、別のリポジトリで管理します。
