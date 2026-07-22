# aws-platform

`gobo-cello.com` を支えるAWS組織共通基盤のInfrastructure as Codeリポジトリです。

このリポジトリはpublicです。コード、設定、ドキュメント、Issue、Pull Requestなど、リポジトリ内のすべての情報は第三者から閲覧される前提で管理します。

## 目的

AWS Organizations配下の共通基盤、監査、セキュリティ、CI/CD認証基盤をAWS CDKで管理します。

ブログのアプリケーション、コンテンツ、ホスティング基盤とはライフサイクルやデプロイ先が異なるため、別リポジトリとして管理します。

## 管理対象

将来的に、次のリソースをこのリポジトリで管理します。

- CloudTrailログの一元管理
- Log Archive用S3 bucket
- CloudTrailログの暗号化と保持
- Organization Trail
- AWS Organizations全体を対象とするIAM Access Analyzer
- Service Control Policy
- GitHub ActionsとAWSのOIDC連携
- GitHub Actions用のIAM role
- 組織共通の監視および通知
- 共通ドメイン(`gobo-cello.com`)のRoute 53 Hosted Zoneとサブドメイン委譲の管理

実装されていない項目については、今後このリポジトリへ段階的に追加します。

## 管理対象外

次の情報およびリソースは、このリポジトリでは管理しません。

- AWS root userの認証情報
- IAM Identity Centerのユーザーおよび認証情報
- 個人のメールアドレスや電話番号
- AWSアカウントの代替連絡先
- ドメインレジストラの認証情報
- Password、API key、access token、private keyなどのsecret
- ブログのアプリケーションコード
- ブログ記事および画像
- ブログのワークロード用Infrastructure
- ドメインそのものの登録および更新

ブログのアプリケーション、コンテンツ、ワークロード用Infrastructureは、別のリポジトリで管理します。

## AWSアカウント構成

現在、次のAWSアカウントを使用します。

- Management account
- `log-archive`
- `blog-production`
- `blog-sandbox`

概念上の構成は次のとおりです。

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

実際のAWS account ID、Organization ID、メールアドレスなど、公開する必要のない環境固有情報はリポジトリへ保存しません。

## 認証方針

人間によるAWSへのアクセスにはIAM Identity Centerを使用します。

GitHub ActionsからAWSへのアクセスにはOpenID Connectを使用し、短時間のみ有効な一時認証情報を取得します。

長期的なAWS access keyは使用しません。

## Public repositoryとしての方針

このリポジトリには、公開されても問題のない情報だけを保存します。

次の情報を、コード、設定ファイル、ドキュメント、ログ、コメント、Issue、Pull Requestへ含めてはいけません。

- AWS access key
- AWS session token
- Password
- MFA seed
- Private key
- API key
- GitHub personal access token
- 個人のメールアドレスや電話番号
- AWS root userに関する情報
- その他のsecretまたは個人情報

環境固有の値が必要な場合は、次のいずれかを使用します。

- ローカルの環境変数
- GitHub Actions Variables
- GitHub Environment Variables
- GitHub Secrets
- AWS Systems Manager Parameter Store
- AWS Secrets Manager

AWS認証情報そのものはGitHub Secretsへ保存せず、OIDCを使用します。

## ディレクトリ構成

現時点では、`aws-cdk init` が生成した単一のCDK application構成を基本とします。

```text
aws-platform/
├── bin/
│   └── aws-platform.ts
├── lib/
│   ├── config/
│   │   ├── accounts.ts
│   │   └── tags.ts
│   └── aws-platform-stack.ts
├── test/
│   └── aws-platform.test.ts
├── docs/
│   ├── architecture.md
│   └── adr/
│       └── 0001-repository-boundary.md
├── .github/
│   └── copilot-instructions.md
├── .env.example
├── .gitignore
├── SECURITY.md
├── cdk.json
├── jest.config.js
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

実装対象が増えた場合に限り、次の責務へ分割します。

- `bin/`: CDK applicationのentry point
- `lib/stacks/`: AWS accountまたはdeployment boundaryごとのStack
- `lib/constructs/`: 複数のAWS resourceからなる論理的な機能単位
- `lib/config/`: secretを含まない環境設定
- `test/`: CDK templateおよびConstructのテスト

使用されていないStack、Construct、directory、設定ファイルは先行して作成しません。

## 開発環境

必要なtoolは次のとおりです。

- Git
- Node.js
- npm
- AWS CLI
- AWS CDK CLI

依存関係をインストールします。

```sh
npm ci
```

TypeScriptをcompileします。

```sh
npm run build
```

テストを実行します。

```sh
npm test
```

CloudFormation templateを生成します。

```sh
npx cdk synth
```

## 環境変数

必要な環境変数の一覧は `.env.example` を参照してください。

実値を含む `.env` や `.env.local` はGitへcommitしません。

例:

```dotenv
AWS_MANAGEMENT_ACCOUNT_ID=
AWS_LOG_ARCHIVE_ACCOUNT_ID=
AWS_BLOG_PRODUCTION_ACCOUNT_ID=
AWS_BLOG_SANDBOX_ACCOUNT_ID=
AWS_REGION=ap-northeast-1
```

AWS account IDは認証情報ではありませんが、このリポジトリでは公開する必要がないため、環境変数またはGitHub Variablesから渡します。

## AWS CLIプロファイル

人間によるAWSへのアクセスにはIAM Identity Center(AWS SSO)を使用し、長期的なAWS access keyは使用しません。

ローカルの `~/.aws/config` に、account・role単位でprofileを分けて設定します。実際のaccount IDやSSO start URLはリポジトリへ保存しないため、プレースホルダーで示します。

```ini
[profile management]
sso_session = gobo-cello
sso_account_id = 実際のManagement account ID
sso_role_name = AdministratorAccess
region = ap-northeast-1
output = json

[profile log-archive]
sso_session = gobo-cello
sso_account_id = 実際のLog Archive account ID
sso_role_name = AdministratorAccess
region = ap-northeast-1
output = json

[profile blog-production]
sso_session = gobo-cello
sso_account_id = 実際のProduction account ID
sso_role_name = AdministratorAccess
region = ap-northeast-1
output = json

[profile blog-sandbox]
sso_session = gobo-cello
sso_account_id = 実際のSandbox account ID
sso_role_name = AdministratorAccess
region = ap-northeast-1
output = json

[sso-session gobo-cello]
sso_start_url = 実際のSSO Start URL
sso_region = ap-northeast-1
sso_registration_scopes = sso:account:access
```

`aws sso login --profile <profile名>` でログインしてから、各`--profile`オプションでコマンドを実行します。

## Git運用

`main` branchは常にbuild、test、CDK synthが成功する状態を維持します。

変更は原則として作業branchで行い、Pull Requestを通じて`main`へmergeします。

Commit messageはConventional Commitsに従います。

```text
<type>(<scope>): <日本語の要約>
```

例:

```text
feat(cloudtrail): Log Archive用S3 bucketを追加
test(cloudtrail): bucket policyのテストを追加
docs(architecture): AWSアカウント構成を更新
chore(deps): AWS CDKを更新
```

## Security

脆弱性またはsecretの漏えいを発見した場合は、public Issueへ詳細を投稿しないでください。

対応方法については [`SECURITY.md`](./SECURITY.md) を参照してください。

## License

Licenseは別途決定します。Licenseを追加するまでは、著作権者から明示的に許可された範囲を除き、コードの利用、複製、変更、再配布は許諾されません。
