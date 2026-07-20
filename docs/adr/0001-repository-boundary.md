# 0001: platform と blog のリポジトリを分離する

- Status: Accepted
- Date: 2026-07-19

## Context

AWS organizationのplatformとblog workloadは、lifecycle、deployment target、
failure domainが異なる。

## Decision

organization-level infrastructureは`gobo-cello-aws-platform`で管理する。

blog applicationとそのworkload infrastructureは、別の
`gobo-cello-blog`リポジトリで管理する。

## Consequences

- platformの変更はblogを自動的にdeployしない。
- blogの障害はsecurityおよびloggingの変更をブロックしない。
- 共有infrastructureは、リポジトリ間で明示的なinterfaceを必要とする。
