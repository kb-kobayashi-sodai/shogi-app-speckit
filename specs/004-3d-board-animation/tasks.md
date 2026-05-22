# Tasks: 将棋盤・駒の立体表示とリアルアニメーション

**Input**: Design documents from `/specs/004-3d-board-animation/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: 4つのユーザーストーリー（US1-US4）を中心に構成。US1（3D CSS）は Foundational と並行可能、US2-US4はアニメーション状態機械（Foundational）完了後に進める。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可能（別ファイル、依存なし）
- **[Story]**: 対応ユーザーストーリー（US1〜US4）

---

## Phase 2: Foundational — アニメーション状態機械

**Purpose**: US2・US3・US4 の前提となる型定義・reducer 変更。US1（CSS のみ）は並行して進められる。

**⚠️ CRITICAL**: US2 以降の実装はこの Phase の完了が必要。US1 は並行可。

- [x] T001 `src/game/types.ts` に `AnimationTarget` 型（`{ type: 'cell'; position: Position } | { type: 'captured'; owner: Player }`）を追加する
- [x] T002 `src/game/types.ts` に `PendingAnimation` インターフェース（id, kind, piece, from, to, move, captureAnimation?）を追加し、`GameState` に `animationQueue: PendingAnimation[]` と `isAnimating: boolean` フィールドを追加する
- [x] T003 `src/hooks/useGame.ts` の `GameAction` 型に `QUEUE_ANIMATION`・`ANIMATION_START`・`ANIMATION_COMPLETE` アクションを追加し、`createInitialGameState` の初期値に `animationQueue: []`, `isAnimating: false` を設定する
- [x] T004 `src/hooks/useGame.ts` の `reducer` に新アクションのハンドラーを追加する（QUEUE_ANIMATION: キューに追加、ANIMATION_START: isAnimating true、ANIMATION_COMPLETE: processMove 呼び出し + キューから除去 + isAnimating false）、さらに `CELL_CLICK`/`CAPTURED_PIECE_CLICK` の冒頭に `if (state.isAnimating) return state` ガードを追加する

**Checkpoint**: 型エラーがなく既存テストがすべてパスすること

---

## Phase 3: User Story 1 — 立体的な将棋盤と駒の表示 (Priority: P1) 🎯 MVP

**Goal**: ゲームを開くだけで将棋盤と駒が立体的に見え、既存のすべての操作が引き続き動作する

**Independent Test**: `npm run dev` で起動し、盤面が斜め俯瞰で木目調・立体感のある見た目になっており、駒が五角形の立体形状で表示され、クリック操作でゲームが正常にプレイできること

### Implementation for User Story 1

- [x] T005 [US1] `src/index.css` の `.board-wrapper` に `perspective: 800px` を設定し、`.board-container`（または既存の `.board` ラッパー）に `transform: rotateX(18deg)` と `transform-style: preserve-3d` を追加して斜め俯瞰を実現する
- [x] T006 [P] [US1] `src/index.css` の `.board` の `background` を木目調の線形グラデーション（`#dcb67a` ベース、木目を模した縞）に変更し、盤外枠（`.board-wrapper` または `.board-container` の after 疑似要素）に盤の厚みを示す濃い茶色のボックスシャドウまたは下辺を追加する
- [x] T007 [P] [US1] `src/index.css` に `.piece` の `clip-path: polygon(50% 0%, 95% 30%, 80% 100%, 20% 100%, 5% 30%)` を追加して駒を五角形にする。また `transform: rotateX(-18deg)` を追加して駒がカメラ正面を向くよう counter-rotate する
- [x] T008 [P] [US1] `src/index.css` の `.piece` に木目調グラデーション（`background: linear-gradient(...)`）と五角形に沿った影（`filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.5))`）を追加する。また `.piece--sente` と `.piece--gote` の見た目を木の色合いで区別できるよう調整する
- [x] T009 [US1] `src/components/Board/Board.tsx` に `boardRef: RefObject<HTMLDivElement>` prop を追加し（contracts/components.md 参照）、盤グリッドの div に ref を接続する。`src/App.tsx` で `boardRef` を `useRef` で作成して `Board` に渡す
- [x] T010 [US1] `src/components/Board/Piece.tsx` に `isAnimating?: boolean` prop を追加し、`isAnimating === true` のとき `opacity: 0` になるよう `className` または `style` を設定する（アニメーション中に元位置の駒を非表示にするため）
- [ ] T011 [US1] ブラウザで動作確認する：盤が斜め俯瞰で立体的に見えるか、駒が五角形の立体形状か、後手の駒が 180 度回転した状態で立体感を保って表示されるか、クリック操作が正常に動作するか

**Checkpoint**: `npm run test` が全パスし、ブラウザで US1 の Acceptance Scenarios を満たすこと

---

## Phase 4: User Story 2 — 駒移動のリアルなアニメーション (Priority: P2)

**Goal**: 駒クリック→移動先クリックで駒が放物線を描いてアニメーション移動する

**Independent Test**: 駒を選択して移動先をクリックすると、駒が元の位置から持ち上がり弧を描いて目的地に着地し（0.3〜0.6 秒）、アニメーション中はクリックが無効で完了後に次の手が打てること

### Implementation for User Story 2

- [x] T012 [US2] `src/components/Board/AnimatingPiece.tsx` を新規作成する（contracts/components.md の Props 定義に従い、`useEffect` 内で `element.animate([{ transform: 'translate(0,0) translateZ(0px)' }, { transform: '...', offset: 0.5 }, { transform: '...' }], { duration, easing: 'ease-in-out' })` を実行し、`anim.finished.then(onComplete)` でコールバックを呼ぶ。マウント時に開始、アンマウント時にキャンセル）
- [x] T013 [US2] `src/hooks/useAnimation.ts` を新規作成する（contracts/hooks.md の型定義に従い、`state.animationQueue` と `state.isAnimating` を監視し、キューに追加されたら `boardRef`/`capturedRef` から `getBoundingClientRect()` で座標計算し `ANIMATION_START` を dispatch、`currentAnimation`・`animatingFromRect`・`animatingToRect` を返す）
- [x] T014 [US2] `src/App.tsx` で `useAnimation(state, dispatch, { boardRef, senteCapturedRef, goteCapturedRef })` を呼び出し、`senteCapturedRef`・`goteCapturedRef` を `useRef` で作成する。`useAnimation` の戻り値（currentAnimation, fromRect, toRect）を `Board` または `AnimatingPiece` に渡せるよう管理する
- [x] T015 [US2] `src/components/Board/Board.tsx` に `currentAnimation`・`animatingFromRect`・`animatingToRect`・`animationDuration` prop を追加し、アニメーション中のとき `<AnimatingPiece>` を `position: fixed` のオーバーレイとして描画する。アニメーション中の駒マス（from 位置）の `<Piece>` には `isAnimating={true}` を渡す
- [x] T016 [US2] `src/components/CapturedPieces/CapturedPieces.tsx` に `capturedRef?: RefObject<HTMLDivElement>` prop を追加し、持ち駒エリアのコンテナ div に ref を接続する。`src/App.tsx` で `senteCapturedRef`・`goteCapturedRef` を渡す
- [x] T017 [US2] `src/hooks/useGame.ts` の `CELL_CLICK` ハンドラーで合法手移動の場合、`processMove` を即時呼び出すのではなく `dispatch({ type: 'QUEUE_ANIMATION', payload: pendingAnimation })` を呼ぶよう変更する（board 更新は `ANIMATION_COMPLETE` 後に行われる）。コンピュータの `COMPUTER_MOVE` アクションも同様に QUEUE_ANIMATION に変更する

**Checkpoint**: 人間の手もコンピュータの手も駒が放物線アニメーションで移動し、アニメーション中はクリックが無効になること

---

## Phase 5: User Story 3 — 持ち駒打ちのアニメーション (Priority: P3)

**Goal**: 持ち駒を選択して盤上に打つと、持ち駒エリアから目的地まで駒がアニメーション移動する

**Independent Test**: 持ち駒を選択→空きマスをクリックで、持ち駒エリアから盤上に向かって駒がアニメーションし、完了後に盤上に配置されること

### Implementation for User Story 3

- [x] T018 [US3] `src/hooks/useGame.ts` の `CELL_CLICK` ハンドラーで `selectedCapturedPiece` による打ち込みの場合も `QUEUE_ANIMATION` を dispatch するよう変更する（from が `{ type: 'captured', owner: currentPlayer }`、to が `{ type: 'cell', position: clickedPos }` の PendingAnimation を生成）
- [x] T019 [US3] `src/hooks/useAnimation.ts` で `from.type === 'captured'` の場合に `capturedRef`（sente/gote）から始点 DOMRect を取得するロジックを追加する
- [ ] T020 [US3] `src/components/Board/AnimatingPiece.tsx` で持ち駒エリアからの `from` 座標にも対応できるよう `startRect`（持ち駒エリアの DOMRect）を正しく受け取ってアニメーションを実行できることを確認し、必要に応じてアニメーション軌跡（arc の高さ）を調整する

**Checkpoint**: 持ち駒打ちでも駒がアニメーションし、US2 の移動アニメーションが引き続き動作すること

---

## Phase 6: User Story 4 — 成りダイアログとアニメーション (Priority: P4)

**Goal**: 「成る」を選択したとき、駒が裏返るフリップアニメーションが再生される

**Independent Test**: 駒を敵陣まで移動させて「成る」を選択すると、駒が Y 軸でフリップするアニメーションが再生され、成り駒の文字が表示されること

### Implementation for User Story 4

- [x] T021 [US4] `src/index.css` に `.piece--flipping` 用の `@keyframes piece-flip { 0% { transform: rotateY(0deg); } 50% { transform: rotateY(90deg); } 100% { transform: rotateY(0deg); } }` を追加し、`.piece--flipping` クラスに適用する
- [x] T022 [US4] `src/hooks/useAnimation.ts` または `src/hooks/useGame.ts` で `ANIMATION_COMPLETE` 後に `move.promoted === true` の場合（成り移動）、対象マスの `<Piece>` に `.piece--flipping` クラスを短時間付与するロジックを追加する（`pendingPromotion` フローとの調整が必要）
- [x] T023 [US4] `src/components/Board/Piece.tsx` に `isFlipping?: boolean` prop を追加し、`isFlipping` が true のとき `.piece--flipping` クラスを付与する。アニメーション完了後（`onAnimationEnd`）にフラグをリセットする

**Checkpoint**: 成り選択後にフリップアニメーションが再生され、US1〜US3 の動作が引き続き正常であること

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: アクセシビリティ対応・エッジケース確認・全体品質保証

- [x] T024 [P] `src/index.css` に `@media (prefers-reduced-motion: reduce)` ブロックを追加し、アニメーション duration と transition-duration を `0ms` に設定する（ゲームロジックへの影響なし）
- [x] T025 [P] `src/hooks/useGame.ts` の `RESIGN` アクションハンドラーで `isAnimating === true` の場合でもゲームを終了できるよう、アニメーションキューをクリアし `isAnimating: false` にリセットする処理を追加する
- [ ] T026 `src/App.tsx` の `ThinkingOverlay` とアニメーションの共存を確認する（コンピュータ思考中 `isComputerThinking` と `isAnimating` が同時に true になった場合の挙動を手動確認）
- [ ] T027 全 Acceptance Scenarios を手動テストする（spec.md の US1〜US4 の各シナリオ・Edge Cases を確認し、`npm run test` が全パスすること）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: 既存コード前提 — US1 と並行可能
- **US1 (Phase 3)**: Foundational と並行可能（CSS のみ、型変更不要）
- **US2 (Phase 4)**: Foundational（Phase 2）+ US1（Phase 3）の完了が必要
- **US3 (Phase 5)**: US2（Phase 4）の完了が必要
- **US4 (Phase 6)**: US2（Phase 4）の完了が必要（US3 とは独立）
- **Polish (Phase 7)**: 実装したいすべての US Phase 完了後

### User Story Dependencies

- **US1 (P1)**: Foundational と並行可能。CSS のみ
- **US2 (P2)**: Foundational + US1 の後。T012〜T017 は順番に
- **US3 (P3)**: US2 の後（AnimatingPiece と useAnimation を再利用）
- **US4 (P4)**: US2 の後（US3 とは独立して進行可能）

### Parallel Opportunities

- T001〜T004（Foundational）と T005〜T008（US1 CSS）は並行可能
- T006・T007・T008 は別セレクターで並行可能 [P]
- T012（AnimatingPiece）と T013（useAnimation）は別ファイルで並行可能
- T024（reduced-motion）と T025（resign edge case）は並行可能 [P]

---

## Parallel Example: User Story 1

```bash
# Foundational と US1 CSS を並行して開始
Task T001: "src/game/types.ts に AnimationTarget を追加"
Task T005: "src/index.css に perspective 傾きを追加"

# US1 CSS タスクを並行
Task T006: "src/index.css に木目グラデーション追加"
Task T007: "src/index.css に駒の五角形 clip-path 追加"
Task T008: "src/index.css にグラデーション・shadow 追加"
```

## Parallel Example: User Story 2

```bash
# AnimatingPiece と useAnimation は別ファイルで並行可能
Task T012: "src/components/Board/AnimatingPiece.tsx を作成"
Task T013: "src/hooks/useAnimation.ts を作成"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational（T001〜T004）
2. Complete Phase 3: US1（T005〜T011）
3. **STOP and VALIDATE**: ブラウザで立体将棋盤を確認
4. `npm run test` 全パス確認

### Incremental Delivery

1. Foundational + US1 → 3D ビジュアル完成（デモ可能）
2. US2 → 移動アニメーション追加（デモ可能）
3. US3 → 持ち駒打ちアニメーション追加
4. US4 → 成りフリップアニメーション追加
5. Polish → アクセシビリティ・エッジケース対応

---

## Notes

- [P] タスクは別ファイル・依存なし → 並行実行可
- ゲームロジックファイル（`gameEngine.ts`, `legalMoves.ts`, `computerPlayer.ts` 等）は変更しない
- `npm run test` は各 Phase Checkpoint で実行して既存テストのパスを確認する
- アニメーション中の board 状態は「移動前」のまま保持し、ANIMATION_COMPLETE 後に更新する
- `prefers-reduced-motion` 対応（T024）により duration 0ms でも ANIMATION_COMPLETE コールバックは正常に発火する
