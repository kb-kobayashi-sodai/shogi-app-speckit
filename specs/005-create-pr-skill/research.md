# Research: PR作成スキル

## Decision 1: スキル実装方式

- **Decision**: Claude 指示のみの SKILL.md ファイルとして実装。PowerShell スクリプトは新規作成しない
- **Rationale**: `gh pr create` は単純なコマンド呼び出しであり、スクリプト化するほどの複雑さがない。既存の `speckit-clarify`・`speckit-plan` 等と同様に Claude が直接ツールを呼び出す形式で十分
- **Alternatives considered**: `.specify/extensions/git/scripts/powershell/create-pr.ps1` を作成する案 → オーバーエンジニアリングと判断

## Decision 2: PRタイトル生成方法

- **Decision**: `git log --oneline HEAD...$(git merge-base HEAD main)` でコミット一覧を取得し、Claude が日本語タイトルに要約する
- **Rationale**: コミットメッセージが英語や混在でも、Claude が日本語に変換・要約できる。1コミットの場合はそのメッセージをそのまま使う
- **Alternatives considered**: `git diff --stat` から生成 → コミットメッセージの方が意図を反映しやすい

## Decision 3: PR本文テンプレート

- **Decision**: 以下の固定フォーマット（日本語）を使用する

```
## 概要
- [変更点の箇条書き]

## テスト計画
- [ ] [テスト項目]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

- **Rationale**: このリポジトリの既存PRが `## Summary` + `## Test plan` 形式を使っており、日本語版として統一する
- **Alternatives considered**: 自由フォーマット → レビュアーへの一貫性が低下する

## Decision 4: spec.md からの内容取得

- **Decision**: `.specify/feature.json` の `feature_directory` を読み、`{feature_directory}/spec.md` の冒頭（フィーチャー名 + User Scenarios の P1 ストーリー）を `## 概要` に追記する
- **Rationale**: レビュアーに設計意図を伝えるのに最低限の情報として十分
- **Alternatives considered**: spec.md 全文を含める → PR本文が長くなりすぎる

## Decision 5: ベースブランチ検出

- **Decision**: `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'` でデフォルトブランチを自動検出。取得失敗時は `main` にフォールバック
- **Rationale**: リポジトリの実際の設定に従うことで、`master` 等のケースにも対応できる
- **Alternatives considered**: 常に `main` 固定 → spec の Assumptions と一致するが柔軟性に欠ける
