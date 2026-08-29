---
paths:
  - "lib/config/*.ts"
  - ".env.example"
  - ".github/workflows/*.yml"
---

# 環境変数を追加・変更する際に確認するファイル

- `lib/config/*.ts`: 環境変数のparse処理
- `.env.example`: ローカル開発用の一覧
- `.github/workflows/deploy.yml`: 全ての`cdk deploy`ステップのenv。`bin/aws-platform.ts`はターゲットのstackに関わらず全stackを構築するため、「このstackはこの環境変数を使わないから不要」という判断はできない
- `.github/workflows/pr-ci-gate.yml`: `cdk-synth`ジョブのenv
