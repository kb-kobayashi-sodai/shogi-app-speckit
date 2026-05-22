# Implementation Plan: PR作成スキル

**Branch**: `005-create-pr-skill` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/005-create-pr-skill/spec.md`

## Summary

フィーチャーブランチの実装完了後に `/speckit-git-pr` コマンドで GitHub PR を自動作成するスキルを実装する。コミット履歴から日本語タイトル・本文（`## 概要` + `## テスト計画`）を生成し、`gh` CLI で PR を作成する。`--draft` / `--preview` オプションをサポートする。

## Technical Context

**Language/Version**: Markdown（SKILL.md）+ PowerShell（スクリプトなし）  
**Primary Dependencies**: GitHub CLI (`gh`)、git  
**Storage**: N/A  
**Testing**: 手動テスト（フィーチャーブランチでの実行確認）  
**Target Platform**: Windows (PowerShell) / macOS・Linux (Bash)  
**Project Type**: Claude Code skill（`.claude/skills/` に配置する Markdown ファイル）  
**Performance Goals**: PR 作成完了まで 10 秒以内  
**Constraints**: `gh` CLI が認証済みであることを前提とする  
**Scale/Scope**: 1 スキルファイル（`skill.md`）のみ

## Constitution Check

Constitution は未記入（テンプレート状態）のため、ゲートチェックをスキップ。

## Project Structure

### Documentation (this feature)

```text
specs/005-create-pr-skill/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── skill-interface.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
.claude/skills/
└── speckit-git-pr/
    └── skill.md         # 新規作成するスキルファイル
```

**Structure Decision**: 既存の `speckit-git-commit`・`speckit-git-feature` と同じ `.claude/skills/{name}/skill.md` 構造を採用。PowerShell スクリプトは不要（`gh` CLI を Claude が直接呼び出す）。

## 実装方針

### skill.md の構成

```markdown
---
frontmatter（name, description, compatibility, metadata）
---

# PR を作成する

## User Input
$ARGUMENTS（--draft / --preview フラグ）

## 前提条件チェック
1. git コマンド確認
2. gh コマンド確認
3. 現在ブランチ取得（main/デフォルトブランチなら中断）
4. ベースブランチ取得（gh repo view → フォールバック main）
5. 既存オープン PR チェック
6. コミット存在チェック（git log HEAD...base）

## リモートプッシュ
- git push -u origin HEAD（未プッシュの場合）

## PR 内容生成
- タイトル: git log から日本語要約
- 本文: ## 概要 + ## テスト計画（日本語）
- spec.md 存在時: feature_directory から読み込み概要追記

## PR 作成 / プレビュー
- --preview: 内容表示のみ
- --draft: gh pr create --draft
- 通常: gh pr create
- 成功時: URL 出力
```

### PR 本文生成ルール

1. `git log --oneline HEAD...$(git merge-base HEAD {base})` でコミット一覧取得
2. コミットが1件 → そのメッセージをタイトルに（日本語に変換）
3. コミットが複数件 → Claude が要約して日本語タイトルを生成
4. `## 概要` セクション: コミット一覧を箇条書きに変換
5. `## テスト計画` セクション: 変更内容から推定したテスト項目を生成
6. spec.md が存在する場合: フィーチャー名と P1 ストーリー概要を `## 概要` に追加
