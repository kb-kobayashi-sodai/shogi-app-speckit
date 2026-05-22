# Tasks: PR作成スキル

**Input**: Design documents from `specs/005-create-pr-skill/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Organization**: タスクはユーザーストーリー単位で整理されており、各ストーリーは独立して実装・テスト可能です。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: 対応するユーザーストーリー（US1/US2/US3）
- 全タスクに具体的なファイルパスを記載

---

## Phase 1: Setup（共通基盤）

**Purpose**: スキルディレクトリの作成

- [x] T001 `.claude/skills/speckit-git-pr/` ディレクトリを作成する

---

## Phase 2: Foundational（全ストーリー共通の前提処理）

**Purpose**: 全ユーザーストーリーで使用する前提条件チェック・エラー処理の基盤。この Phase が完了するまでユーザーストーリーの実装を開始しない。

**⚠️ CRITICAL**: ここで定義するエラーメッセージは `contracts/skill-interface.md` および `data-model.md` のエラー状態テーブルと一致させること

- [x] T002 `.claude/skills/speckit-git-pr/skill.md` にフロントマター（name, description, compatibility, metadata）と基本見出し構造を作成する
- [x] T003 `.claude/skills/speckit-git-pr/skill.md` に「前提条件チェック」セクションを追加する（git コマンド確認 / gh コマンド確認 / カレントブランチ取得 / デフォルトブランチ取得（`gh repo view --json defaultBranchRef` → 失敗時 `main` にフォールバック）/ main・デフォルトブランチでの実行検知と中断 / コミット存在チェック（`git log HEAD...$(git merge-base HEAD {base})` で差分がなければ中断）/ 既存オープン PR チェック（`gh pr list --head {branch} --state open`）と URL 表示して中断）
- [x] T004 [P] `.claude/skills/speckit-git-pr/skill.md` にエラー出力フォーマット定義を追記する（`エラー: {エラーメッセージ}` 形式。`contracts/skill-interface.md` のエラー出力フォーマットに準拠）

**Checkpoint**: 前提条件チェックが全パターンで正しく動作することを確認してから次へ進む

---

## Phase 3: User Story 1 - 現在ブランチからPRを自動作成する (Priority: P1) 🎯 MVP

**Goal**: `/speckit-git-pr` 1コマンドでリモートプッシュ〜PR作成〜URL表示が完結する

**Independent Test**: フィーチャーブランチで `/speckit-git-pr` を実行し、GitHub に PR が作成されて URL が出力されることを確認

### Implementation for User Story 1

- [x] T005 [US1] `.claude/skills/speckit-git-pr/skill.md` に「リモートプッシュ」セクションを追加する（`git push -u origin HEAD` でプッシュが必要かどうかを判定し、必要な場合のみ実行する）
- [x] T006 [US1] `.claude/skills/speckit-git-pr/skill.md` に「PR内容生成」セクションを追加する（`git log --oneline HEAD...$(git merge-base HEAD {base})` でコミット一覧取得 / コミット1件の場合はそのメッセージを日本語タイトルに / 複数件の場合は Claude が日本語で要約してタイトル生成）
- [x] T007 [US1] `.claude/skills/speckit-git-pr/skill.md` の「PR内容生成」セクションに本文テンプレートを追加する（`## 概要`（コミット一覧を箇条書きに変換）+ `## テスト計画`（変更内容から推定したテスト項目をチェックリスト形式で生成）+ `🤖 Generated with [Claude Code](https://claude.com/claude-code)` フッター。全項目を日本語で出力）
- [x] T008 [US1] `.claude/skills/speckit-git-pr/skill.md` に「PR作成」セクションを追加する（`gh pr create --title "{title}" --body "{body}" --base {base}` を実行し、成功時に `PR を作成しました: {URL}` を出力する）

**Checkpoint**: フィーチャーブランチで `/speckit-git-pr` を実行し PR が作成されること（US1 完了）

---

## Phase 4: User Story 2 - PR内容のプレビューと確認 (Priority: P2)

**Goal**: `--preview` でPR内容を確認でき、`--draft` でドラフトPRを作成できる

**Independent Test**: `--preview` 実行でPRが作成されずに内容だけ表示されること / `--draft` 実行でドラフトPRとして作成されること

### Implementation for User Story 2

- [x] T009 [US2] `.claude/skills/speckit-git-pr/skill.md` の「User Input」セクションに `--preview` / `--draft` フラグの解説を追加し、「PR作成」セクションを分岐させる（`--preview` 指定時は `contracts/skill-interface.md` のプレビュー出力フォーマットで表示して処理終了。`--draft` 指定時は `gh pr create --draft` を使用）

**Checkpoint**: `--preview` で内容表示のみ、`--draft` でドラフトPR作成が確認できること（US2 完了）

---

## Phase 5: User Story 3 - specキットの成果物をPR本文に反映 (Priority: P3)

**Goal**: `.specify/feature.json` があれば spec.md のフィーチャー名と P1 概要が `## 概要` に自動追記される

**Independent Test**: `specs/005-create-pr-skill/spec.md` が存在する状態で `/speckit-git-pr --preview` を実行し、PR本文にフィーチャー名「PR作成スキル」と P1 ストーリー概要が含まれることを確認

### Implementation for User Story 3

- [x] T010 [US3] `.claude/skills/speckit-git-pr/skill.md` に「Spec 読み込み」セクションを追加する（`.specify/feature.json` を読み込み `feature_directory` を取得。ファイルが存在しない場合はこのセクションをスキップ。存在する場合は `{feature_directory}/spec.md` を読み込み、`# Feature Specification:` 以降のフィーチャー名と最初のユーザーストーリー（P1）の説明文を抽出する）
- [x] T011 [US3] `.claude/skills/speckit-git-pr/skill.md` の「PR内容生成」セクションを更新し、Spec 読み込みで取得したフィーチャー名と P1 概要を `## 概要` の先頭に追記するロジックを追加する

**Checkpoint**: spec.md 存在時と不在時の両方でPR本文が正しく生成されること（US3 完了）

---

## Phase 6: Polish & 横断的関心事

**Purpose**: 全ストーリーに影響する品質・整合性確認

- [x] T012 [P] `.claude/skills/speckit-git-pr/skill.md` の全エラーメッセージが `data-model.md` のエラー状態テーブルおよび `contracts/skill-interface.md` のエラー出力フォーマットと一致することを確認し、差異があれば修正する
- [x] T013 現在のブランチ `005-create-pr-skill` 上で `/speckit-git-pr --preview` を実行して動作確認する

---

## Dependencies & Execution Order

### Phase 依存関係

- **Setup (Phase 1)**: 依存なし — 即開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 — 全ユーザーストーリーをブロック
- **User Story 1 (Phase 3)**: Phase 2 完了後に開始
- **User Story 2 (Phase 4)**: Phase 3 完了後に開始（プレビュー・ドラフトは US1 の PR作成ロジックに依存）
- **User Story 3 (Phase 5)**: Phase 2 完了後に開始（US1 と独立して実装可能）
- **Polish (Phase 6)**: 全ストーリー完了後

### ユーザーストーリー依存関係

- **US1 (P1)**: Phase 2 完了後に開始可能。他ストーリーへの依存なし
- **US2 (P2)**: US1 の PR 作成ロジック（T008）完了後に開始（`--preview` / `--draft` は作成ロジックを拡張するため）
- **US3 (P3)**: Phase 2 完了後に独立して開始可能（US1/US2 と並列作業可能）

### ストーリー内の順序

- T002 → T003 → T004（Foundational は順序どおり）
- T005 → T006 → T007 → T008（US1 は順序どおり）
- T009（US2 は T008 の後）
- T010 → T011（US3 は順序どおり）

### 並列実行機会

- T003 と T004 は同セクションに書くが、T004 は T003 と独立して書ける部分
- T010, T011（US3）は T005〜T009 と並列で作業可能
- T012 は T013 と並列実行可能

---

## Parallel Example: User Story 1

```bash
# US1 の実装タスクを並列で開始（T005 完了後）:
Task: "T006: PR内容生成セクションをskill.mdに追加"
Task: "T005: リモートプッシュセクションをskill.mdに追加"  # ← まず T005 を完了

# US3 は US1 と並列で作業可能:
Task: "T010: Spec読み込みセクションをskill.mdに追加"
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（全ストーリーをブロック）
3. Phase 3: User Story 1 完了
4. **STOP & VALIDATE**: `/speckit-git-pr` でPRが作成されることを確認
5. 必要であればここでデプロイ / デモ実施

### Incremental Delivery

1. Setup + Foundational → 基盤完成
2. US1 → PR自動作成が動作 → MVP!
3. US2 → プレビュー + ドラフト対応
4. US3 → spec.md 統合
5. Polish → 品質確認

---

## Notes

- [P] タスク = 異なるファイルまたは独立したセクション、依存なし
- [Story] ラベルはタスクを spec.md のユーザーストーリーにトレースするためのもの
- 全成果物は `.claude/skills/speckit-git-pr/skill.md` の1ファイル
- タスクごとに skill.md を保存し、セクション単位で動作確認を行う
- エラーメッセージは `data-model.md` のエラー状態テーブルを参照して統一する
