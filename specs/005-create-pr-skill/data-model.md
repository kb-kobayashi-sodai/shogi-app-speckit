# Data Model: PR作成スキル

## エンティティ

### PullRequest

| フィールド | 型 | 説明 | バリデーション |
|-----------|-----|------|--------------|
| title | string | PR タイトル（日本語） | 空文字不可、100文字以内推奨 |
| body | string | PR 本文（Markdown） | `## 概要` + `## テスト計画` セクション必須 |
| base_branch | string | マージ先ブランチ | `gh repo view` で取得、失敗時 `main` |
| head_branch | string | 現在のフィーチャーブランチ | `git branch --show-current` |
| is_draft | boolean | ドラフトPRフラグ | デフォルト `false` |

### SpecArtifact（オプション）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| feature_directory | string | `specs/NNN-feature-name` |
| spec_path | string | `{feature_directory}/spec.md` |
| feature_name | string | spec.md の `# Feature Specification:` 以降のタイトル |
| p1_summary | string | User Story 1 の冒頭説明文 |

## 状態遷移

```
[初期状態]
  ↓ 前提条件チェック（Git / gh / ブランチ / コミット / 既存PR）
[検証済み]
  ↓ リモートプッシュ（未プッシュの場合のみ）
[プッシュ済み]
  ↓ PR 内容生成（コミット履歴 + オプション spec 読み込み）
[内容生成済み]
  ↓ --preview の場合は表示して終了
  ↓ gh pr create 実行
[PR 作成済み] → URL 出力
```

## エラー状態

| 条件 | メッセージ例 | 動作 |
|------|------------|------|
| git コマンドなし |「エラー: Gitリポジトリが見つかりません」 | 中断 |
| gh コマンドなし |「エラー: gh コマンドが必要です。GitHub CLI をインストールしてください（https://cli.github.com）」 | 中断 |
| main ブランチで実行 | 「フィーチャーブランチ上で実行してください（現在: main）」 | 中断 |
| コミットなし / main と差分なし | 「main との差分がありません。コミットを追加してください」 | 中断 |
| 既存オープン PR あり | 「既存のPRがあります: {URL}」 | 中断（URL 表示） |
| gh 認証エラー | 「GitHub 認証に失敗しました: {エラー内容}」 | 中断 |
| GitHub API エラー | 「PR 作成に失敗しました: {エラー内容}」 | 中断 |
