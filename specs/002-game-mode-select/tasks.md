# Tasks: サイドメニュー＋対戦モード選択

**Input**: Design documents from `/specs/002-game-mode-select/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/components.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並行実行可（異なるファイル・依存なし）
- **[US1/US2/US3]**: 対応するユーザーストーリー

---

## Phase 1: Setup（ディレクトリ作成）

**Purpose**: 新規コンポーネント用ディレクトリを作成する

- [x] T001 新規ディレクトリを作成: `src/components/SideMenu/` および `src/components/ThinkingOverlay/`

---

## Phase 2: Foundational（全ストーリーの前提となる型・エンジン変更）

**Purpose**: `GameMode` 型の追加と `GameState` 拡張。全ユーザーストーリーの実装に必要。

**⚠️ CRITICAL**: このフェーズが完了するまでユーザーストーリーの実装を開始できない

- [x] T002 [P] `src/game/types.ts` に `GameMode = 'human' | 'computer'` 型を追加し、`GameState` に `gameMode: GameMode` と `isComputerThinking: boolean` フィールドを追加する
- [x] T003 `src/game/gameEngine.ts` の `createInitialGameState` を更新して `gameMode: 'human'` と `isComputerThinking: false` を初期値として返すようにする
- [x] T004 `src/game/gameEngine.ts` の `processReset` を修正して `gameMode` を引数で受け取り、リセット後も現在のモードを維持するようにする
- [x] T005 `src/hooks/useGame.ts` の `GameAction` 型に `CHANGE_MODE`・`COMPUTER_MOVE`・`SET_COMPUTER_THINKING` の3アクションを追加し、`UseGameReturn` に `handleChangeMode: (mode: GameMode) => void` を追加し、`dispatch` を公開する

**Checkpoint**: `GameState` が `gameMode`/`isComputerThinking` を持ち、`useGame` が新アクションを受け付ける状態

---

## Phase 3: User Story 1 - 対戦モードを選んで対局を開始する (Priority: P1) 🎯 MVP

**Goal**: ハンバーガーボタンでサイドメニューを開閉し、「人間同士」または「コンピュータ対戦」を選んで新しい対局を開始できる

**Independent Test**: アプリを起動 → ハンバーガーボタンをクリック → 「コンピュータ対戦」を選択 → 確定 → 先手番でコンピュータ対戦が開始されることを確認（この時点ではコンピュータは応手しないが、モード切替は動作する）

### Implementation for User Story 1

- [x] T006 [P] [US1] `src/components/SideMenu/SideMenu.tsx` を新規作成: ハンバーガーボタン（画面左上 `position: fixed`）と「人間同士」「コンピュータ対戦」の2選択肢を持つオーバーレイパネルを実装する。Props: `isOpen`, `currentMode`, `onModeSelect`, `onClose`
- [x] T007 [US1] `src/hooks/useGame.ts` の reducer に `CHANGE_MODE` ハンドラーを実装: `gameMode` を更新し `processReset(state.gameMode)` で盤面を初期化する。対局中の場合（`status === 'playing' || 'check'`）は `CHANGE_MODE` アクションのペイロードに確認済みフラグを持たせるか、呼び出し元（App）で確認を行う
- [x] T008 [US1] `src/App.tsx` を更新: `useState` で `isSideMenuOpen` を管理し、`SideMenu` コンポーネントを追加する。`handleChangeMode` 内で対局中かどうかを判定し `window.confirm` で確認ダイアログを表示した上で `dispatch({ type: 'CHANGE_MODE', payload: mode })` を呼び出す

**Checkpoint**: ハンバーガーボタンを押してモード選択 → 新しい対局開始が動作する。US1 単体でMVPとして成立。

---

## Phase 4: User Story 2 - コンピュータと対局する (Priority: P2)

**Goal**: コンピュータ対戦モード中にプレイヤーが指し手を入力するとコンピュータが自動応手し、計算中は「思考中...」オーバーレイで入力をブロックする

**Independent Test**: コンピュータ対戦モードで対局開始 → 先手が指し手を入力 → 「思考中...」が表示される → コンピュータが応手して先手番に戻る、を繰り返し詰みまで対局できることを確認

### Implementation for User Story 2

- [x] T009 [P] [US2] `src/game/computerPlayer.ts` を新規作成: `selectComputerMove(state: GameState): Move | null` を実装する。後手（gote）の全盤上駒に対して `getLegalMovesForPiece` を呼び出し、全持ち駒に対して `getLegalDropPositions` を呼び出して合法手リストを構築し、`Math.random()` でランダムに1手選択して返す。合法手がなければ `null` を返す。成れる移動手は `promoted: true` に設定する
- [x] T010 [P] [US2] `src/components/ThinkingOverlay/ThinkingOverlay.tsx` を新規作成: `isVisible: boolean` を props に受け取り、`isVisible === true` のとき盤面上に `position: absolute` の半透明オーバーレイ（背景 `rgba(0,0,0,0.35)`）を重ね、中央に「思考中...」テキストを白文字で表示する
- [x] T011 [US2] `src/hooks/useGame.ts` の reducer に `COMPUTER_MOVE` ハンドラー（`processMove()` を実行し `isComputerThinking: false` をセット）と `SET_COMPUTER_THINKING` ハンドラーを実装する。また `isComputerThinking === true` の場合は `CELL_CLICK`・`CAPTURED_PIECE_CLICK` アクションを無視するようにガードを追加する
- [x] T012 [US2] `src/hooks/useComputerPlayer.ts` を新規作成: `useEffect` で `state.gameMode === 'computer' && state.currentPlayer === 'gote' && !state.isComputerThinking && (state.status === 'playing' || state.status === 'check')` を監視し、条件成立時に `SET_COMPUTER_THINKING: true` → `setTimeout(0)` → `selectComputerMove(state)` → 手があれば `COMPUTER_MOVE`、なければ `RESIGN` をdispatch する。投了・リセット時（`status !== 'playing' && 'check'`）に計算を中断するため cleanup 関数でフラグを管理する
- [x] T013 [US2] `src/App.tsx` を更新: `useComputerPlayer(state, dispatch)` を呼び出す。`game-area` の wrapper を `position: relative` にして `ThinkingOverlay` を `isVisible={state.isComputerThinking}` で追加する

**Checkpoint**: US1 + US2 が動作し、コンピュータと実際に対局完了できる。

---

## Phase 5: User Story 3 - サイドメニューを開閉する (Priority: P3)

**Goal**: サイドメニューのUX品質向上。バックドロップクリックで閉じる・現在モードのハイライト表示

**Independent Test**: サイドメニューを開いた状態でパネル外をクリックするとメニューが閉じること、現在選択中のモードが強調表示されることを確認

### Implementation for User Story 3

- [x] T014 [US3] `src/components/SideMenu/SideMenu.tsx` を更新: パネル外の半透明オーバーレイ（backdrop）をクリックしたとき `onClose()` を呼び出すイベントハンドラーを追加する
- [x] T015 [US3] `src/components/SideMenu/SideMenu.tsx` を更新: 現在の `currentMode` と一致するモードボタンに強調スタイル（チェックマーク or `font-weight: bold` + 背景色変更）を適用する

**Checkpoint**: 全3つのユーザーストーリーが動作し、仕様の全 Acceptance Scenarios を満たす。

---

## Phase 6: Polish（横断的品質改善）

**Purpose**: スタイル・エッジケース・最終確認

- [x] T016 [P] `src/index.css` に SideMenu のスライドインアニメーション（`transform: translateX(-100%)` → `translateX(0)`）と ThinkingOverlay のフェードイン CSS を追加する
- [x] T017 `src/App.tsx` の `handleChangeMode` を更新: `state.isComputerThinking === true` のとき（コンピュータ計算中）もモード変更を安全に処理できるよう、`dispatch({ type: 'RESIGN' })` を先行して計算を終わらせてからモード変更するか、計算中はモード変更UIを無効化する

---

## Dependencies & Execution Order

### フェーズ依存関係

- **Phase 1 (Setup)**: 依存なし — 即開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後 — **全ユーザーストーリーをブロック**
- **Phase 3 (US1)**: Phase 2 完了後
- **Phase 4 (US2)**: Phase 2 完了後（US1 と並行可能だが、US1 完了後の方が統合しやすい）
- **Phase 5 (US3)**: Phase 3 完了後（SideMenu.tsx が存在することが前提）
- **Phase 6 (Polish)**: 全ユーザーストーリー完了後

### ユーザーストーリー内タスク依存関係

**US1**: T006（並行可） + T007（並行可） → T008

**US2**: T009（並行可）+ T010（並行可） → T011 → T012 → T013

**US3**: T006 完了済み → T014（並行可）+ T015（並行可）

---

## Parallel Example: Phase 2（Foundational）

```bash
# T002 と T003/T004 は別ファイル — 並行実行可
Task: T002 - src/game/types.ts への型追加
Task: T003/T004 - src/game/gameEngine.ts の関数更新  # 同一ファイルなのでシーケンシャル
# T005 は T002 完了後（types.ts の新型が必要）
```

## Parallel Example: Phase 4（US2）

```bash
# T009 と T010 は独立した新規ファイル — 並行実行可
Task: T009 - src/game/computerPlayer.ts 新規作成
Task: T010 - src/components/ThinkingOverlay/ThinkingOverlay.tsx 新規作成
# T011 は T005 完了後
# T012 は T009 + T011 完了後
# T013 は T010 + T012 完了後
```

---

## Implementation Strategy

### MVP First（User Story 1 のみ）

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（T002–T005）
3. Phase 3: US1 完了（T006–T008）
4. **STOP & VALIDATE**: ハンバーガーボタン → モード選択 → 新対局開始が動作することを確認
5. コンピュータが応手しない「コンピュータ対戦モード」として最低限動作する状態

### Incremental Delivery

1. Phase 1 + 2 → 基盤完成
2. Phase 3 (US1) → モード選択UIが動作 → デモ可能（MVP）
3. Phase 4 (US2) → コンピュータが実際に応手 → 完全なコンピュータ対戦
4. Phase 5 (US3) → UX品質向上（バックドロップ・ハイライト）
5. Phase 6 → アニメーション・エッジケース仕上げ

---

## Notes

- `[P]` タスクは異なるファイル・依存関係なしで並行実行可能
- `processReset` の変更（T004）は既存の人間同士モードにも影響するため、リセット後も `gameMode: 'human'` が維持されることを手動確認すること
- `useComputerPlayer` の cleanup 処理（T012）でメモリリークを防ぐ（`useEffect` の return で `cancelled = true` フラグを設定）
- 合計タスク数: **17タスク**（T001–T017）
