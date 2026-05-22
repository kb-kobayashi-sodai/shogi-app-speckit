---
name: speckit-git-pr
description: GitHub PRを自動作成するスキル。コミット履歴から日本語タイトル・本文（## 概要 + ## テスト計画）を生成してPRを作成する。--draft / --preview オプションをサポート。
compatibility: Requires git and GitHub CLI (gh) to be installed and authenticated
metadata:
  author: local
  source: local
---

# PR を作成する

## User Input

```text
$ARGUMENTS
```

サポートするフラグ:

- `--preview`: PR 内容を表示するだけで実際には作成しない
- `--draft`: ドラフト PR として作成する

フラグなしで実行した場合は通常の PR を作成する。

## 前提条件チェック

以下の順序で確認を行い、問題があれば即座に処理を中断する。

### 1. git コマンド確認

```bash
git rev-parse --is-inside-work-tree
```

失敗した場合: `エラー: Gitリポジトリが見つかりません` と表示して終了する。

### 2. gh コマンド確認

```bash
gh --version
```

失敗した場合: `エラー: gh コマンドが必要です。GitHub CLI をインストールしてください（https://cli.github.com）` と表示して終了する。

### 3. カレントブランチ取得

```bash
git branch --show-current
```

取得した値を `CURRENT_BRANCH` として保持する。

### 4. デフォルトブランチ取得

```bash
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

失敗した場合は `main` を `BASE_BRANCH` として使用する。成功した場合はその値を `BASE_BRANCH` として使用する。

### 5. ブランチ検証

`CURRENT_BRANCH` が `BASE_BRANCH` と同じ場合:
`エラー: フィーチャーブランチ上で実行してください（現在: {CURRENT_BRANCH}）` と表示して終了する。

### 6. コミット存在チェック

```bash
git merge-base HEAD {BASE_BRANCH}
```

で共通祖先コミット（`MERGE_BASE`）を取得し、

```bash
git log --oneline HEAD...{MERGE_BASE}
```

を実行する。コミットが1件も表示されない場合:
`エラー: {BASE_BRANCH} との差分がありません。コミットを追加してください` と表示して終了する。

コミット一覧を `COMMITS` として保持する（各行が1コミット）。

### 7. 既存オープン PR チェック

```bash
gh pr list --head {CURRENT_BRANCH} --state open --json url --jq '.[0].url'
```

結果が空でない場合:
`エラー: 既存のPRがあります: {url}` と表示して終了する（二重作成を防ぐ）。

## Spec 読み込み（オプション）

`.specify/feature.json` が存在するか確認する。

**存在しない場合**: このセクションをスキップし、`SPEC_CONTEXT` を空とする。

**存在する場合**: ファイルを読み込み `feature_directory` の値を取得する。`{feature_directory}/spec.md` を読み込み、以下を抽出する:

- `FEATURE_NAME`: `# Feature Specification:` 以降のフィーチャー名（例: `PR作成スキル`）
- `P1_SUMMARY`: `### User Story 1` セクション直下の最初の段落（ストーリーの説明文）

抽出した値を `SPEC_CONTEXT` として保持する。

## リモートプッシュ

```bash
git status --porcelain -b
```

でリモートトラッキング状態を確認する。

- ブランチにリモートトラッキングがない場合、またはローカルがリモートより進んでいる場合:

  ```bash
  git push -u origin HEAD
  ```

  を実行する。失敗した場合は `エラー: リモートへのプッシュに失敗しました: {エラー内容}` と表示して終了する。

- 既にリモートと同期済みの場合: プッシュをスキップする。

## PR 内容生成

### タイトル生成

`COMMITS` の内容を参照してタイトルを生成する:

- **コミットが1件**: そのコミットメッセージを日本語に変換・要約してタイトルとする（元が英語の場合は日本語に翻訳する）
- **コミットが複数件**: 全コミットメッセージを参照し、変更の主旨を表す簡潔な日本語タイトルを生成する（50字以内推奨）

生成したタイトルを `PR_TITLE` として保持する。

### 本文生成

以下のフォーマットで PR 本文を生成する（全項目を日本語で出力する）:

```
## 概要
{SPEC_CONTEXT が存在する場合のみ、以下の2行を先頭に追加する:}
**フィーチャー**: {FEATURE_NAME}
{P1_SUMMARY}

- {COMMITS の各コミットメッセージを日本語の箇条書きに変換する（英語なら翻訳する）}

## テスト計画
- [ ] {変更内容から推定したテスト項目（具体的に）}
- [ ] {変更内容から推定したテスト項目（具体的に）}
- [ ] {変更内容から推定したテスト項目（具体的に）}

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

`SPEC_CONTEXT` が存在しない場合は「フィーチャー」行と `P1_SUMMARY` を省略する。

生成した本文を `PR_BODY` として保持する。

## PR 作成 / プレビュー

`$ARGUMENTS` を解析して `--preview` と `--draft` フラグの有無を確認する。

### `--preview` フラグがある場合

以下のフォーマットで内容を出力し、処理を終了する（PR は作成しない）:

```
## PR プレビュー

**タイトル**: {PR_TITLE}

**本文**:
---
{PR_BODY}
---

PR を作成するには --preview を外して再実行してください。
```

### `--preview` フラグがない場合（通常 / ドラフトモード）

`gh pr create` を実行する。body の改行を正しく渡すため、以下のいずれかの方法でコマンドを実行する:

**通常モード** (`--draft` なし):

```bash
gh pr create --title "{PR_TITLE}" --body "$(cat <<'EOF'
{PR_BODY}
EOF
)" --base {BASE_BRANCH}
```

**ドラフトモード** (`--draft` あり):

```bash
gh pr create --title "{PR_TITLE}" --body "$(cat <<'EOF'
{PR_BODY}
EOF
)" --base {BASE_BRANCH} --draft
```

**成功時**: `PR を作成しました: {PR_URL}` を出力する。

**失敗時**:
- `gh auth` に関するエラーの場合: `エラー: GitHub 認証に失敗しました: {エラー内容}` と表示して終了する
- その他のエラー: `エラー: PR 作成に失敗しました: {エラー内容}` と表示して終了する
