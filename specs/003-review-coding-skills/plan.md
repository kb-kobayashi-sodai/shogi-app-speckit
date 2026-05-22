# Implementation Plan: レビュー・コーディングスキルの追加

**Branch**: `003-review-coding-skills` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/003-review-coding-skills/spec.md`

## Summary

将棋アプリ専用の `/frontend-web-coding`（コーディング前ルール確認）と `/frontend-web-review`（4ステップコードレビュー）スキルを追加する。othello-app-speckit の同名スキルをベースに、将棋アプリのディレクトリ構造（`src/game/`, `src/components/<Name>/<Name>.tsx`）に合わせたルールファイル4点を `.claude/rules/` に作成し、各スキルから参照する。

## Technical Context

**Language/Version**: Markdown + YAML frontmatter（スキル・ルールファイル）  
**Primary Dependencies**: Claude Code スキルシステム（`.claude/skills/`、`.claude/rules/`）  
**Storage**: N/A（静的ファイル）  
**Testing**: N/A（スキルは静的ドキュメント — 動作確認は手動呼び出し）  
**Target Platform**: Claude Code CLI / VSCode Extension  
**Project Type**: Developer tooling（スキル定義ファイル群）  
**Performance Goals**: N/A  
**Constraints**: othello-app-speckit との構造的一貫性を維持する  
**Scale/Scope**: ファイル6点（ルール4点 + スキル2点）

## Constitution Check

**Status**: 将棋アプリの constitution.md は未定義（テンプレートのみ）のため、具体的なゲートは存在しない。

| ゲート | ステータス | 備考 |
|--------|-----------|------|
| 静的ファイル追加のみ | ✅ PASS | ビルド・デプロイ影響なし |
| 既存コードへの破壊的変更なし | ✅ PASS | 新規ファイル追加のみ |

## Project Structure

### Documentation (this feature)

```text
specs/003-review-coding-skills/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── skills.md        # Phase 1 output
└── tasks.md             # /speckit-tasks コマンドで生成
```

### Source Code (repository root)

```text
.claude/
├── rules/                         # 新規作成
│   ├── frontend-web-directory.md  # ディレクトリ・ファイル命名規則（将棋アプリ固有）
│   ├── frontend-code-rule.md      # TypeScript/JSコーディング規約 + SpecKit開発フロー
│   ├── frontend-web-react-rule.md # Reactコンポーネント設計規約
│   └── frontend-web-test-rule.md  # テスト規約（Vitest / @testing-library/react）
└── skills/
    ├── frontend-web-coding/        # 新規作成
    │   └── SKILL.md               # コーディングスキル（ルール3点参照）
    └── frontend-web-review/        # 新規作成
        └── SKILL.md               # レビュースキル（ルール4点参照）
```

**Structure Decision**: `.claude/` 以下に `rules/` ディレクトリを新設し、`skills/` 以下に2スキルを追加する。これは othello-app-speckit と同一のレイアウトであり、SpecKit プロジェクト間での一貫性を保つ。

---

## ルールファイルの内容設計

### `frontend-web-directory.md`

将棋アプリのディレクトリ構造を正確に反映する。

**主要ルール**:
- `src/game/` — ゲームロジック・型定義・定数（Reactに依存しない純粋TS）
- `src/components/<ComponentName>/` — UIコンポーネント（サブディレクトリ構成）
- `src/hooks/` — カスタムフック
- ファイル命名: Reactコンポーネントは PascalCase、フックは `use` + camelCase
- `src/` 直下への直接配置禁止

**othello との差分**:
- `src/utils/` → `src/game/`
- `src/types/`, `src/constants/` → `src/game/types.ts`, `src/game/constants.ts` に統合
- `src/workers/` セクション削除（将棋アプリはWorker未使用）
- コンポーネントはサブディレクトリ構成（`Board/Board.tsx`）を明記

### `frontend-code-rule.md`

othello 版の内容をベースに、プロジェクト固有の命名例を将棋アプリのものに置き換える。

**変更箇所**:
- 命名例を将棋アプリの実際のコード（`isComputerThinking`, `selectedPosition`, `currentPlayer`, `BOARD_SIZE`）に置き換える
- SpecKit 開発フローセクション（tasks.md タスク範囲確認）を維持する
- `src/constants/` 参照を `src/game/constants.ts` に修正

### `frontend-web-react-rule.md`

othello 版の内容をベースに、プロジェクト固有のパターン例を将棋アプリのものに置き換える。

**変更箇所**:
- コンポーネント設計パターン例を `useGame` → 将棋の `useGame`、`Board → Cell` 等に置き換える
- `useAI`, `useHint` 等の othello 固有例を将棋アプリ（`useComputerPlayer` 等）に置き換える

### `frontend-web-test-rule.md`

othello 版の内容をベースに、テスト対象を将棋アプリのファイルに置き換える。

**変更箇所**:
- `src/utils/othello.ts` → `src/game/gameEngine.ts`, `src/game/legalMoves.ts` 等
- `src/game/` 以下の純粋関数をユニットテストで網羅する方針を記載
- `useGame` フックのテストパターンを記載

---

## スキルファイルの内容設計

### `frontend-web-coding/SKILL.md`

**Frontmatter**: `name: frontend-web-coding`, `user-invocable: true`

**ワークフロー**:
1. 事前確認: 3ルールファイルを読み込み、確認済み総数と主要5点を提示
2. コーディング: チェックポイント6項目（SpecKit範囲・ディレクトリ・型安全・命名・React・マジックナンバー）を確認してから実装

### `frontend-web-review/SKILL.md`

**Frontmatter**: `name: frontend-web-review`, `user-invocable: true`

**ワークフロー**:
1. 事前確認: 4ルールファイルを読み込み、確認済み総数と主要5点を提示
2. ステップ1: ディレクトリ構成チェック
3. ステップ2: コーディングルールチェック
4. ステップ3: テストルールチェック
5. ステップ4: リファクタリング（問題があれば実施）

## Complexity Tracking

なし（静的ファイル追加のみ、憲法違反なし）
