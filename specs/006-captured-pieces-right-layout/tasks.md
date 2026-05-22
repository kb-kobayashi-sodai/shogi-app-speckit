# Tasks: 持ち駒エリアの右配置・縦並び・スクロール対応

**Input**: Design documents from `/specs/006-captured-pieces-right-layout/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 3列レイアウトを収容するための基盤調整

> **調査結果**: DOM 順序（gote→board→sente）と縦並び（flex-direction: column）はすでに実装済み。
> 唯一の前提変更は `.app` の max-width 拡大のみ。

- [x] T001 `.app` の max-width を `700px` から `900px` に変更する `src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 本機能は CSS のみの変更のため、この Phase は不要。Phase 1 完了でユーザーストーリー実装に進める。

**Checkpoint**: T001 完了後、全ユーザーストーリーの実装を開始できる

---

## Phase 3: User Story 1 - 盤面右側で持ち駒を確認する (Priority: P1) 🎯 MVP

**Goal**: 先手の持ち駒が将棋盤の右側、後手の持ち駒が左側に配置されて表示される

**Independent Test**: `npm run dev` でアプリを起動し、対局画面で盤面左右に持ち駒エリアが並んでいることを目視確認できる

### Implementation for User Story 1

- [x] T002 [US1] `npm run dev` を実行し、先手（右）・後手（左）の持ち駒配置が正しいことをブラウザで確認する
- [x] T003 [US1] ウィンドウ幅を 750px〜900px に変更し、3列が折り返さず横一列を維持することを確認する

**Checkpoint**: 先手持ち駒が右、後手持ち駒が左に表示されていることを確認 → User Story 1 完了

---

## Phase 4: User Story 2 - 縦に並んだ持ち駒を識別する (Priority: P2)

**Goal**: 持ち駒エリア内の駒が縦方向に1行=1駒種（駒アイコン＋枚数）で並んで表示される

**Independent Test**: 複数種類の持ち駒がある状態で、持ち駒エリア内を目視確認し、駒が縦に並んでいることを確認できる

### Implementation for User Story 2

- [x] T004 [US2] 持ち駒が縦並び（`flex-direction: column`）・1行=1駒種になっていることをブラウザで目視確認する（実装済みの検証）
- [x] T005 [US2] 歩を複数枚持っている状態で「歩 ×N」形式の枚数表示が正しく出ることを確認する

**Checkpoint**: 駒が縦に整列し、枚数が表示されることを確認 → User Story 2 完了

---

## Phase 5: User Story 3 - 持ち駒が多い場合もスクロールして全て確認する (Priority: P3)

**Goal**: 持ち駒エリアの高さが将棋盤の半分を超えた場合にエリア内スクロールが有効になる

**Independent Test**: 7種類すべての持ち駒がある状態を作り、持ち駒エリアがスクロール可能になっていることを確認できる

### Implementation for User Story 3

- [x] T006 [US3] `.captured-pieces` に `max-height: calc(9 * var(--cell-size) / 2)` を追加する `src/index.css`
- [x] T007 [US3] `.captured-pieces` に `overflow-y: auto` を追加する `src/index.css`
- [x] T008 [US3] 持ち駒が少ない通常状態でスクロールバーが表示されないことを確認する
- [x] T009 [US3] 持ち駒が多い状態（7種類）を再現し、エリア内スクロールで全持ち駒が確認できることを確認する

**Checkpoint**: スクロール動作を確認 → User Story 3 完了

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: レイアウト変更後の副作用確認

- [x] T010 [P] 駒移動アニメーションが正常に動作することを確認する（`boardRef`・`senteCapturedRef`・`goteCapturedRef` の座標取得が正確か）
- [x] T011 [P] モバイル表示（max-width: 600px）がスコープ外の変更で影響を受けていないことを確認する
- [x] T012 持ち駒が0枚の場合に「なし」表示となりレイアウトが崩れないことを確認する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし → 即座に開始可能
- **User Stories (Phase 3〜5)**: Phase 1（T001）完了後に開始可能
  - Phase 3 → Phase 4 → Phase 5 の順、または並行実施可能
- **Polish (Phase 6)**: Phase 3〜5 完了後

### User Story Dependencies

- **US1 (P1)**: Phase 1 完了後に開始可能
- **US2 (P2)**: Phase 1 完了後に開始可能（US1 に依存しない）
- **US3 (P3)**: Phase 1 完了後に開始可能（US1・US2 に依存しない）

### Parallel Opportunities

- T002, T004, T006 は同一ファイル（`src/index.css`）への変更だが互いに干渉しない
- T010 と T011 は独立して確認可能

---

## Parallel Example: 全タスク同時実装（1人で実施の場合）

```
T001 (max-width 変更)
  ↓
T006 + T007 (max-height + overflow-y を同時に追加)
  ↓
T002 + T003 + T004 + T005 + T008 + T009 (ブラウザで一括確認)
  ↓
T010 + T011 + T012 (副作用確認)
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. Complete Phase 1: T001（max-width 変更）
2. Complete Phase 3: T002, T003（ブラウザ確認）
3. **STOP and VALIDATE**: 先手右・後手左の配置を確認
4. デモ可能

### Incremental Delivery

1. Phase 1 + Phase 3 → 左右配置を確認（MVP）
2. Phase 4 → 縦並びを確認（実装済み確認のみ）
3. Phase 5 → スクロール機能追加・確認
4. Phase 6 → 副作用確認

---

## Notes

- 本機能は `src/index.css` への CSS 追加2件（max-width, max-height + overflow-y）が実装の全量
- アニメーション refs（boardRef, senteCapturedRef, goteCapturedRef）は CSS 変更の影響を受けない
- モバイルレイアウト（`@media (max-width: 600px)`）はスコープ外のため変更しない
- [P] tasks = 異なるファイルまたは独立した確認作業
