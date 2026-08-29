# aws-platform

`example.com` を支えるAWS組織共通基盤のInfrastructure as Codeリポジトリです。

このリポジトリはpublicです。コード、設定、ドキュメント、Issue、Pull Requestなど、リポジトリ内のすべての情報は第三者から閲覧される前提で管理します。

## 目的

AWS Organizations配下の共通基盤、監査、セキュリティ、CI/CD認証基盤、共通ドメインのDNSをAWS CDKで管理します。

各ワークロード(ブログ、Suite Shuffle、apexランディングページ)のアプリケーション、コンテンツ、ワークロード用インフラストラクチャとは、ライフサイクルとfailure domainが異なるため、別リポジトリとして管理します。

## 管理対象

### 実装済み

- 共通ドメイン(`example.com`)のapex Route 53 hosted zoneと、各サービス用サブドメインへのNS委譲(`DnsStack`)
- apexランディングページ向けのA/AAAA aliasレコードとACM証明書検証レコード(`DnsStack`。詳細は[ADR 0006](docs/adr/0006-apex-landing-page-exception.md))
- GitHub ActionsとAWSのOIDC連携、および`management` account用のDeploy Role(`ManagementGithubDeployRoleStack`)

### 設計済み・未実装

次の項目はADRで設計を確定していますが、まだCDKスタックは実装していません。

- CloudTrail Organization Trailと`log-archive` accountでのログ一元管理・暗号化・保持([ADR 0002](docs/adr/0002-cloudtrail-log-retention.md))
- Service Control Policyによるガードレール([ADR 0003](docs/adr/0003-cloudtrail-scp-guardrails.md))
- セキュリティイベントのCloudWatch Alarm・SNS通知([ADR 0004](docs/adr/0004-security-cloudwatch-notifications.md))
- AWS Organizations全体を対象とするIAM Access Analyzer
- `log-archive` account用のDeploy Role(`LogArchiveGithubDeployRoleStack`)

設計の全体像は [`docs/architecture.md`](docs/architecture.md) を参照してください。

## 管理対象外

次の情報およびリソースは、このリポジトリでは管理しません。

- AWS root userの認証情報
- IAM Identity Centerのユーザーおよび認証情報
- 個人のメールアドレスや電話番号
- AWSアカウントの代替連絡先
- ドメインレジストラの認証情報、ドメインそのものの登録および更新
- Password、API key、access token、private keyなどのsecret
- 各ワークロード(ブログ、Suite Shuffle、apexランディングページ)のアプリケーションコード、コンテンツ、ワークロード用インフラストラクチャ

各ワークロードは、それぞれの `blog` / `suite-shuffle` / `landing` リポジトリで管理します。このリポジトリは、それらへ提供するアカウント構成、ログ基盤、apex hosted zoneとサブドメインのNS委譲を扱います。

## AWSアカウント構成

このリポジトリが対象とするAWS Organizationsの構成は次のとおりです。

```text
AWS Organizations
├── Management account
├── Security OU
│   └── log-archive
├── Production OU
│   ├── blog-production
│   └── suite-shuffle-production
└── Sandbox OU
    ├── blog-sandbox
    └── suite-shuffle-sandbox
```

現時点でCDKがデプロイするのは `management` account のみです。各アカウントの責務は [`docs/architecture.md`](docs/architecture.md) を参照してください。

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

ルート直下の単一npm packageとして、AWS CDK applicationを管理します。

```text
aws-platform/
├── bin/
│   └── aws-platform.ts          # CDK application entry point。全スタックをここで定義する
├── lib/
│   ├── config/                  # 環境変数のparseと検証(secretは含まない)
│   └── stacks/                  # CDK Stack定義
├── test/                        # Vitestによるテスト
├── docs/
│   ├── architecture.md          # 設計の全体像
│   └── adr/                     # Architecture Decision Record
├── scripts/
│   └── actionlint.sh            # GitHub Actions workflowのlint
├── .claude/rules/               # ファイル・パス単位でのAI向け作業方針
├── .env.example                 # 必要な環境変数の一覧
├── biome.json                   # formatter / linter設定
├── knip.ts                      # 未使用コード検出設定
├── lefthook.yml                 # git hook設定
├── cdk.json
├── package.json
└── tsconfig.json
```

`bin/aws-platform.ts` はデプロイ対象の指定に関わらず全スタックを構築します。「このスタックはこの環境変数を使わない」という前提は置けません。

## 開発環境

必要なtoolは次のとおりです。バージョンは `.node-version` を参照してください。

- Git
- Node.js
- npm
- AWS CLI
- AWS CDK CLI(`npx cdk` で実行するため、グローバルインストールは必須ではありません)

依存関係をインストールします。

```sh
npm ci
```

主なコマンドは次のとおりです。

```sh
npm run build            # tscでコンパイル
npm test                 # Vitestでテスト
npm run check            # Biomeでformat / lint(safe fixあり)
npm run knip             # 未使用コード検出
npm run knip:production   # 本番依存のみを対象とした未使用コード検出
npx cdk synth            # CloudFormation templateを生成
```

## 環境変数

必要な環境変数の一覧と説明は [`.env.example`](.env.example) を参照してください。実値を含む `.env` や `.env.local` はGitへcommitしません。

`AWS_MANAGEMENT_ACCOUNT_ID` と `APEX_DOMAIN_NAME` は必須です。サブドメインのname server(`BLOG_SUBDOMAIN_NAME_SERVERS` など)や apexランディングページ関連の値は、対応するリポジトリ側のリソース作成後に設定する任意項目です。未設定の間、`DnsStack` は対応するレコードを作成しません。

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

[sso-session gobo-cello]
sso_start_url = 実際のSSO Start URL
sso_region = ap-northeast-1
sso_registration_scopes = sso:account:access
```

`aws sso login --profile <profile名>` でログインしてから、各`--profile`オプションでコマンドを実行します。

## デプロイ

このリポジトリは、GitHub Actions(`.github/workflows/deploy.yml`)による自動デプロイを使用します。手動での`cdk deploy`は初回セットアップを除いて行いません。

`main`への`bin/**`・`lib/**`の変更が起点となり、`management` GitHub Environmentで`ManagementGithubDeployRoleStack`と`DnsStack`をデプロイします。`management` accountはOrganizations・SCP・IAM Access Analyzer・DNSなど組織全体に影響するため、GitHub Environmentのprotection ruleでデプロイ前に人による承認を必須にしています。

### GitHub ActionsとAWSの認証

GitHub ActionsからAWSへの認証にはOIDCを使用します。account単位のOIDC ProviderとDeploy Roleを`ManagementGithubDeployRoleStack`が作成し、Deploy RoleはCDK bootstrapが作成するrole(`deploy-role`・`file-publishing-role`・`lookup-role`)への`sts:AssumeRole`のみを許可します。実際のリソース作成はこれらのbootstrap roleとCloudFormation実行roleが担います。設計の詳細は [`docs/architecture.md`](docs/architecture.md) の「GitHub Actions Deploy Role」を参照してください。

### 初回セットアップ

自動デプロイが機能するためには、次の手順を一度だけ手動で行う必要があります。

1. `management` accountで`cdk bootstrap`が実行済みであることを確認する
2. ローカルから`ManagementGithubDeployRoleStack`を手動で`cdk deploy`し、出力された`GithubDeployRoleArn`を控える
3. GitHubリポジトリに`management` Environmentを作成し、控えたRole ARNをEnvironment Variables(`AWS_MANAGEMENT_DEPLOY_ROLE_ARN`)として登録する
4. `management` Environmentにrequired reviewersを設定する

## Git運用

`main` branchは常にbuild、test、CDK synthが成功する状態を維持します。

変更は原則として作業branchで行い、Pull Requestを通じて`main`へmergeします。PRのCI(`.github/workflows/pr-ci-gate.yml`)はbuild・test・CDK synth・Biome・Knip・actionlintを実行します。

Commit messageはConventional Commitsに従います。

```text
<type>(<scope>): <日本語の要約>
```

例:

```text
feat(dns): apexランディングページ向けのaliasレコードを追加
test(dns): NS委譲レコードのテストを追加
docs(architecture): AWSアカウント構成を更新
chore(deps): AWS CDKを更新
```

## Security

脆弱性またはsecretの漏えいを発見した場合は、public Issueへ詳細を投稿しないでください。

対応方法については [`SECURITY.md`](./SECURITY.md) を参照してください。

## License

Licenseは別途決定します。Licenseを追加するまでは、著作権者から明示的に許可された範囲を除き、コードの利用、複製、変更、再配布は許諾されません。
