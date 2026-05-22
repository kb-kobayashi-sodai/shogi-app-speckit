# Tasks: レビュー・コーディングスキルの追加

**Input**: Design documents from `/specs/003-review-coding-skills/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/skills.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可（異なるファイル・依存なし）
- **[US1/US2]**: 対応するユーザーストーリー

---

## Phase 1: Setup（ディレクトリ作成）

**Purpose**: スキル・ルール用ディレクトリを作成する

- [x] T001 新規ディレクトリを作成: `.claude/rules/`、`.claude/skills/frontend-web-coding/`、`.claude/skills/frontend-web-review/`

---

## Phase 2: Foundational（全ストーリーの前提となるルールファイル）

**Purpose**: 両スキルが参照する共通ルールファイル4点を作成する。US1・US2 の実装に必要。

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装を開始できない

- [x] T002 [P] `.claude/rules/frontend-web-directory.md` を新規作成: 将棋アプリのディレクトリ構成ルールを記述する。`src/game/`（ゲームロジック・型・定数）、`src/components/<Name>/<Name>.tsx`（サブディレクトリ構成）、`src/hooks/`（カスタムフック）の構成を明記し、`src/` 直下への直接配置禁止・Workers セクション不要を反映する
- [x] T003 [P] `.claude/rules/frontend-code-rule.md` を新規作成: TypeScript/JS コーディング規約を記述する。`any`型禁止・戻り値型明示・インポート順序・命名規則（camelCase/PascalCase/UPPER_SNAKE_CASE）を含め、SpecKit 開発フロー（`tasks.md` タスク範囲確認）セクションを追加する。命名例は将棋アプリの実際のコード（`isComputerThinking`, `selectedPosition`, `BOARD_SIZE` 等）を使用する
- [x] T004 [P] `.claude/rules/frontend-web-react-rule.md` を新規作成: React コンポーネント設計規約を記述する。関数コンポーネントのみ・Props型定義必須・`useEffect` 最小化・副作用クリーンアップ・イベントハンドラ命名（`on` プレフィックス）を含める。プロジェクト固有パターン例は将棋アプリのもの（`useGame` フック・`Board → Cell` 親子関係・`useComputerPlayer`）を使用する
- [x] T005 [P] `.claude/rules/frontend-web-test-rule.md` を新規作成: Vitest / @testing-library/react のテスト規約を記述する。振る舞い軸のテスト・`describe`/`it` 構造・`getByRole` 優先・`src/game/` 純粋関数のユニットテスト・`useGame` フックの `renderHook` テストパターンを含める

**Checkpoint**: 4つのルールファイルが揃い、スキルから参照可能な状態

---

## Phase 3: User Story 1 - コーディングルールに沿った実装 (Priority: P1) 🎯 MVP

**Goal**: `/frontend-web-coding` を呼び出すと、ルール確認サマリーを表示してからルール準拠のコードを生成できる

**Independent Test**: `/frontend-web-coding` を呼び出してコンポーネント追加を依頼し、「コーディングルール確認済み（計N項目）。重点：...」サマリーが表示されてから実装が始まり、生成コードが `any` 型不使用・適切なディレクトリ配置・関数コンポーネントの各規約を満たすことを確認する

### Implementation for User Story 1

- [x] T006 [US1] `.claude/skills/frontend-web-coding/SKILL.md` を新規作成: YAMLフロントマター（`name: frontend-web-coding`, `description: コーディング前にルールを確認してからコードを書く`, `user-invocable: true`, `disable-model-invocation: false`）と、事前確認ステップ（`@.claude/rules/frontend-web-directory.md`・`@.claude/rules/frontend-code-rule.md`・`@.claude/rules/frontend-web-react-rule.md` の3ファイル読み込み＋確認済みルール総数・主要5点の提示）およびコーディング手順（チェックポイント6項目：SpecKit範囲・ディレクトリ・型安全・命名・React・マジックナンバー）を実装する

**Checkpoint**: `/frontend-web-coding` が動作し、US1 単体でMVPとして成立。

---

## Phase 4: User Story 2 - ルールに基づくコードレビュー (Priority: P2)

**Goal**: `/frontend-web-review` を呼び出すと、4ステップのレビュー（ディレクトリ・コーディング・テスト・リファクタリング）が実行され、問題があれば実際に修正される

**Independent Test**: `/frontend-web-review` を呼び出して現在の `src/` コードをレビューし、「レビュールール確認済み（計N項目）。重点：...」サマリー後に4セクションの結果が出力され、問題箇所の修正が実施されることを確認する

### Implementation for User Story 2

- [x] T007 [US2] `.claude/skills/frontend-web-review/SKILL.md` を新規作成: YAMLフロントマター（`name: frontend-web-review`, `description: レビュー前にルールを確認してからコードレビューを行う`, `user-invocable: true`, `disable-model-invocation: false`）と、事前確認ステップ（4ルールファイル読み込み＋確認済みルール総数・主要5点の提示）およびレビュー手順4ステップ（① ディレクトリ構成: 新規ファイル配置・命名規則確認 ② コーディングルール: `any`型・戻り値型・インポート順・関数コンポーネント・Props型・`useEffect`依存配列・マジックナンバー確認 ③ テストルール: 変更機能に対応するテスト有無・クエリ適切性・説明文明確性・エッジケースカバレッジ確認 ④ リファクタリング: DRY・単一責務・派生値・未使用変数・条件分岐・繰り返しパターン・命名確認）を実装する。問題が見つかった場合は指摘にとどめず実際にリファクタリングを実施する旨を明記する

**Checkpoint**: US1 + US2 が動作し、コーディング前のルール確認とコードレビューが両方使用可能になる。

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Phase 1 (Setup)**: 依存なし — 即開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後 — **US1・US2 をブロック**
- **Phase 3 (US1)**: Phase 2 完了後
- **Phase 4 (US2)**: Phase 2 完了後（US1 と並行可能）

### ユーザーストーリー内タスク依存関係

**US1**: T006 は T002・T003・T004 完了後（参照先ルールファイルが必要）

**US2**: T007 は T002・T003・T004・T005 完了後（参照先ルールファイル4点が必要）

---

## Parallel Example: Phase 2（Foundational）

```bash
# T002・T003・T004・T005 は独立した新規ファイル — 並行実行可
Task: T002 - .claude/rules/frontend-web-directory.md 新規作成
Task: T003 - .claude/rules/frontend-code-rule.md 新規作成
Task: T004 - .claude/rules/frontend-web-react-rule.md 新規作成
Task: T005 - .claude/rules/frontend-web-test-rule.md 新規作成
# T006 は T002・T003・T004 完了後
# T007 は T002・T003・T004・T005 完了後
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（T002–T005）
3. Phase 3: US1 完了（T006）
4. **STOP & VALIDATE**: `/frontend-web-coding` を呼び出して動作確認

### Incremental Delivery

1. Phase 1 + 2 → ルールファイル完成
2. Phase 3 (US1) → コーディングスキル動作 → デモ可能（MVP）
3. Phase 4 (US2) → レビュースキル動作 → 全機能完成

---

## Notes

- `[P]` タスクは異なるファイル・依存関係なしで並行実行可能
- ルールファイルの内容は othello-app-speckit の対応ファイルをベースに将棋アプリ固有情報に置き換える（research.md の Decision 1〜4 参照）
- 合計タスク数: **7タスク**（T001–T007）
