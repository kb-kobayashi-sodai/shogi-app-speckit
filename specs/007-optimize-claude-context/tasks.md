# Tasks: Claude コンテキスト最適化によるトークン削減

**Input**: Design documents from `specs/007-optimize-claude-context/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: US1（CLAUDE.md編集）→ US2（rules/ファイル削減）→ 検証

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可（異なるファイル、依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2）

---

## Phase 1: User Story 1 - CLAUDE.md から完了済みフィーチャー参照を削除 (Priority: P1) 🎯 MVP

**Goal**: CLAUDE.mdをSpecKitマーカーのみに整理し、毎セッションの無駄なplan.md読み込みを排除する

**Independent Test**: CLAUDE.mdを開いてSpecKitマーカー間の内容が空であることを確認できる

- [x] T001 [US1] CLAUDE.md の `<!-- SPECKIT START -->` と `<!-- SPECKIT END -->` マーカー間にある plan.md 参照の3行を削除し、マーカー間を空にする（CLAUDE.md）

**Checkpoint**: CLAUDE.mdがSpecKitマーカー2行のみになっていることを確認する

---

## Phase 2: User Story 2 - .claude/rules/ ファイルの削減 (Priority: P2)

**Goal**: 4つのrulesファイルの構成を維持しながら、各ファイル内の冗長な目的文・参考例セクションを削除してトークン量を削減する

**Independent Test**: 各ファイルの行数が削減され、かつルール本体（TypeScript規則・命名規則等）が保持されていることを確認できる

### frontend-code-rule.md（56行 → ~41行）

- [x] T002 [P] [US2] frontend-code-rule.md の `## 目的` セクション（ヘッダー行 + 説明文1行）を削除する（.claude/rules/frontend-code-rule.md）
- [x] T003 [US2] frontend-code-rule.md の `### このプロジェクト固有の命名例（参考）` セクション全体（ヘッダー含む約10行）を削除する（.claude/rules/frontend-code-rule.md）※T002完了後に実施

### frontend-web-directory.md（70行 → ~48行）

- [x] T004 [P] [US2] frontend-web-directory.md の `## 目的` セクション（ヘッダー行 + 説明文1行）を削除する（.claude/rules/frontend-web-directory.md）
- [x] T005 [US2] frontend-web-directory.md の `### このプロジェクトの実際の構造（参考）` セクション全体（ヘッダー含む約22行のファイルツリー）を削除する（.claude/rules/frontend-web-directory.md）※T004完了後に実施

### frontend-web-react-rule.md（47行 → ~39行）

- [x] T006 [P] [US2] frontend-web-react-rule.md の `## 目的` セクション（ヘッダー行 + 説明文1行）を削除する（.claude/rules/frontend-web-react-rule.md）
- [x] T007 [US2] frontend-web-react-rule.md の `### このプロジェクトのコンポーネント設計パターン（参考）` セクション全体（ヘッダー含む約6行）を削除する（.claude/rules/frontend-web-react-rule.md）※T006完了後に実施

### frontend-web-test-rule.md（50行 → ~42行）

- [x] T008 [P] [US2] frontend-web-test-rule.md の `## 目的` セクション（ヘッダー行 + 説明文1行）を削除する（.claude/rules/frontend-web-test-rule.md）
- [x] T009 [US2] frontend-web-test-rule.md の `### このプロジェクト固有のテストパターン（参考）` セクション全体（ヘッダー含む約6行）を削除する（.claude/rules/frontend-web-test-rule.md）※T008完了後に実施

**Checkpoint**: 4ファイル全ての削減が完了し、各ファイルのルール本体が保持されていることを確認する

---

## Phase 3: 検証

**Purpose**: quickstart.md の手順に従い削減結果を定量・定性両面で確認する

- [x] T010 quickstart.md の検証ステップに従い各ファイルの行数を確認し、合計≤182行（20%削減達成）であることを記録する（specs/007-optimize-claude-context/quickstart.md参照）
- [x] T011 [P] 4つのrulesファイルを読み、コーディング規則・命名規則・ディレクトリ規則・テスト規則の本質的な項目が保持されていることを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US1)**: 即座に開始可能 — 他のタスクに依存なし
- **Phase 2 (US2)**: Phase 1 と並列実行可能
- **Phase 3 (検証)**: Phase 1・2 完了後に実施

### User Story Dependencies

- **US1**: 依存なし — 即座に開始可能
- **US2**: 依存なし — US1と並列実行可能

### Within Phase 2

- T002, T004, T006, T008 は異なるファイルを操作するため並列実行可能
- T003はT002完了後、T005はT004完了後、T007はT006完了後、T009はT008完了後に実施

### Parallel Opportunities

```
# Phase 1 と Phase 2 を同時開始:
T001 (CLAUDE.md)
T002 + T004 + T006 + T008 (各ファイルの目的セクション削除 — 並列可)

# 目的セクション削除完了後:
T003 + T005 + T007 + T009 (各ファイルの参考例セクション削除 — 並列可)

# 全削減完了後:
T010 + T011 (検証 — 並列可)
```

---

## Implementation Strategy

### MVP（US1のみ）

1. T001: CLAUDE.md をSpecKitマーカーのみに整理
2. **検証**: CLAUDE.md が空マーカーになっていることを確認
3. 即座にトークン削減効果が得られる

### Full Delivery

1. T001 (US1) と T002〜T009 (US2) を並列実施
2. T010〜T011 で定量・定性検証
3. 合計228行 → ~172行（約25%削減）を達成

---

## Notes

- [P] = 異なるファイル操作のため並列実行可
- 各タスクは独立してコミット可能
- US1だけでも即座にトークン削減効果あり（MVPとして独立成立）
- 削除対象は「参考例・目的文」のみ。ルール本体（規約・禁止事項）は一切削除しない
