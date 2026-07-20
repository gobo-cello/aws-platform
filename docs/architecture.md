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

## CDK naming policy

### Stack names

`stackName` は原則として指定しない。

Stackは`App`直下に配置し、Construct IDから生成される
CloudFormation Stack名を使用する。

例:

- `LogArchiveStack`
- `OrganizationTrailStack`

### Construct IDs

Construct IDはPascalCaseで、resourceの責務を表す安定した名前にする。

例:

- `CloudTrailLogs`
- `CloudTrailKey`
- `OrganizationTrail`

Construct IDはCloudFormation Logical IDの生成に影響するため、
deploy後は安易に変更しない。

### Physical resource names

`bucketName`、`roleName`、`keyAlias`などのphysical nameは、
外部interfaceとして固定する必要がある場合を除き指定しない。

AWS CDKとCloudFormationによる自動生成を優先する。

### Exceptions

次の場合のみphysical nameの明示を検討する。

- AWS外部のsystemから名前で参照される
- cross-account policyで安定した名前が必要
- service仕様上、名前による参照が不可避
- 運用手順に安定したidentifierが必要

明示する場合は、理由をADRまたはcode commentに記録する。
