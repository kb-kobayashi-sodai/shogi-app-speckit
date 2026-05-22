# Tasks: シンプル将棋アプリ

**Input**: Design documents from `/specs/001-simple-shogi-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.
**Tests**: Not explicitly requested. Game engine unit tests included in Foundational phase due to rule complexity.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Vite + React + TypeScript プロジェクトの初期化

- [x] T001 npm create vite でReact + TypeScriptプロジェクトを作成し、package.jsonを確認する
- [x] T002 Vitest・jsdom・@testing-library/react・@testing-library/jest-dom・@testing-library/user-event をインストールし、vite.config.ts の `test` ブロックを設定する
- [x] T003 [P] src/game・src/components/{Board,CapturedPieces,GameStatus,GameControls,PromotionDialog}・src/hooks・tests/{game,components} のディレクトリ構造を作成する（quickstart.md 参照）

---

## Phase 2: Foundational（ゲームエンジン・純粋TypeScript）

**Purpose**: 全ユーザーストーリーが依存するゲームロジックの実装

**⚠️ CRITICAL**: このフェーズが完了するまでReactコンポーネントの実装を開始してはならない

- [x] T004 data-model.md の全型定義（Player・PieceType・Piece・Position・Board・CapturedPieces・Move・GameStatus・PendingPromotion・GameState）を src/game/types.ts に実装する
- [x] T005 [P] data-model.md の初期盤面配置（先手・後手の全40駒）と定数（INITIAL_BOARD・INITIAL_CAPTURED・BOARD_SIZE・ENEMY_ZONE_ROWS）を src/game/constants.ts に実装する
- [x] T006 contracts/game-engine.md の pieces.ts API（getPieceLabel・canPromote・mustPromote・promote・unpromote）を src/game/pieces.ts に実装する。駒の漢字ラベル（歩/と/香/杏/桂/圭/銀/全/金/角/馬/飛/龍/王）を定義する
- [x] T007 contracts/game-engine.md の legalMoves.ts API のうち、isUnderAttack と全14駒種（8通常駒＋6成駒）の移動ルールおよび非スライド駒（歩・桂・銀・金・王・成駒）の getLegalMovesForPiece を src/game/legalMoves.ts に実装する
- [x] T008 スライド駒（香・角・飛・龍馬・龍王）の移動計算（遮断ロジック含む）・王手放置チェック（移動後に自玉がisUnderAttackか確認）・getLegalDropPositions（二歩・打ち歩詰め・行き所なし禁止）・hasAnyLegalMove を src/game/legalMoves.ts に追加する
- [x] T009 contracts/game-engine.md の gameEngine.ts API（createInitialGameState・applyMove・processMove・processPromotionChoice・isInCheck・isCheckmate・processResign・processReset）を src/game/gameEngine.ts に実装する。processMove は成り選択が必要な場合に pendingPromotion を設定し、詰み・千日手を自動検出する
- [x] T010 [P] contracts/game-engine.md の sennichite.ts API（hashBoardState・isSennichite・addBoardHistory）を src/game/sennichite.ts に実装する。局面ハッシュ形式は data-model.md の BoardHash 仕様に従う
- [x] T011 contracts/components.md の useGame hook（UseGameReturn 型）を src/hooks/useGame.ts に useReducer で実装する。GameAction（CELL_CLICK・CAPTURED_PIECE_CLICK・PROMOTION_CHOICE・RESIGN・RESET）と reducer 関数を定義し、ゲームエンジン関数を呼び出す

**ゲームエンジン単体テスト**（将棋ルールのバグ防止のため推奨）:

- [x] T012 [P] 合法手計算（二歩・打ち歩詰め・王手放置・行き所なし・スライド駒遮断）の単体テストを tests/game/legalMoves.test.ts に実装し、全テストがパスすることを確認する
- [x] T013 [P] 詰み検出・千日手検出・成り強制判定の単体テストを tests/game/gameEngine.test.ts に実装し、全テストがパスすることを確認する

**Checkpoint**: ゲームエンジンが全ルールを正しく適用できる状態 — Reactコンポーネントの実装をここから開始できる

---

## Phase 3: User Story 1 - 将棋の対局を開始・プレイする (Priority: P1) 🎯 MVP

**Goal**: 9×9の将棋盤で2人が交互に駒を動かし、詰みまで対局できる（成り選択・王手表示・詰み検出含む）

**Independent Test**: アプリを開き、先手・後手で交互に駒を移動させ、王手時に赤ハイライト+「王手！」が表示され、詰みで勝者表示が出ることを確認する

- [x] T014 [P] [US1] contracts/components.md の PieceProps に従い、駒の漢字テキスト表示（後手は CSS rotate(180deg)）を src/components/Board/Piece.tsx に実装する
- [x] T015 [P] [US1] contracts/components.md の CellProps に従い、マスの選択ハイライト（青）・合法手ハイライト（緑）・王手中の王将マス（赤）を src/components/Board/Cell.tsx に実装する
- [x] T016 [US1] contracts/components.md の BoardProps に従い、9×9グリッドの将棋盤（先手が下・後手が上の固定表示）を src/components/Board/Board.tsx に実装する。Cell・Piece コンポーネントを組み合わせる
- [x] T017 [P] [US1] contracts/components.md の GameStatusProps に従い、手番表示（▲先手の番 / △後手の番）・王手テキスト通知（【王手！】）・対局結果表示（勝者・引き分け）を src/components/GameStatus/GameStatus.tsx に実装する
- [x] T018 [P] [US1] contracts/components.md の PromotionDialogProps に従い、成り・不成りの選択モーダルダイアログを src/components/PromotionDialog/PromotionDialog.tsx に実装する。pendingPromotion が非null のとき表示し、他操作を無効化する
- [x] T019 [US1] src/App.tsx を実装する。useGame hook と Board・GameStatus・PromotionDialog コンポーネントを組み合わせ、将棋盤の対局画面を構成する
- [x] T020 [US1] 将棋盤・駒・ハイライト・ダイアログの CSS スタイル（盤面グリッド・マスサイズ・駒フォント・色分け）を src/index.css に実装する

**Checkpoint**: `npm run dev` でアプリを開き、2人で駒を交互に動かして詰みまで対局できることを確認する

---

## Phase 4: User Story 2 - 取った駒を打つ (Priority: P2)

**Goal**: 持ち駒エリアから駒を選択して合法マスへ打てる（二歩・打ち歩詰め・行き所なし禁止）

**Independent Test**: 対局中に駒を取り、持ち駒エリアから選択して合法マスに打てること・非合法マスがハイライトされないことを確認する

- [x] T021 [P] [US2] contracts/components.md の CapturedPiecesProps に従い、各プレイヤーの持ち駒一覧（枚数・選択ハイライト）を src/components/CapturedPieces/CapturedPieces.tsx に実装する
- [x] T022 [US2] src/hooks/useGame.ts の CAPTURED_PIECE_CLICK アクションハンドラを実装する。持ち駒選択時に getLegalDropPositions を呼び出して legalMoves を更新し、2回目のクリック（マス選択）で DROP アクションを processMove に渡す
- [x] T023 [US2] src/App.tsx を更新して先手・後手の CapturedPieces コンポーネント（盤面の上下）を追加し、onCapturedPieceClick ハンドラを接続する

**Checkpoint**: 持ち駒を選択して打てること・二歩などの非合法手が防止されることを確認する

---

## Phase 5: User Story 3 - 対局を最初からやり直す (Priority: P3)

**Goal**: 「最初から」ボタンで確認ダイアログを経て盤面をリセットできる

**Independent Test**: 対局中に「最初から」ボタンを押して確認ダイアログが出て、確定後に初期配置に戻ることを確認する

- [x] T024 [P] [US3] contracts/components.md の GameControlsProps に従い、「最初から」ボタンと確認ダイアログを src/components/GameControls/GameControls.tsx に実装する（対局終了後も常に表示）
- [x] T025 [US3] src/App.tsx を更新して GameControls コンポーネントを追加し、handleReset を接続する

**Checkpoint**: 対局中・終了後どちらでも「最初から」で初期配置に戻ることを確認する

---

## Phase 6: User Story 4 - 投了する (Priority: P4)

**Goal**: 「投了」ボタンで確認ダイアログを経て対局終了し、相手の勝利が表示される

**Independent Test**: 対局中に「投了」ボタンを押して確認後、相手プレイヤーの勝利が表示されることを確認する

- [x] T026 [US4] src/components/GameControls/GameControls.tsx に「投了」ボタンと確認ダイアログを追加する（対局中のみ有効・対局終了後は無効化）
- [x] T027 [US4] src/hooks/useGame.ts の RESIGN アクションハンドラが processResign を呼び出してステータスと勝者を設定することを確認・実装する

**Checkpoint**: 投了後に相手の勝利が正しく表示され、「最初から」で再開できることを確認する

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 全ユーザーストーリーにまたがる品質改善

- [x] T028 [P] レスポンシブレイアウト（スマートフォン・タブレット・デスクトップ）のCSSを src/index.css に追加する（SC-005 達成）
- [x] T029 [P] 千日手引き分け時の終了表示を src/components/GameStatus/GameStatus.tsx で確認・調整する（「引き分け（千日手）」テキスト）
- [x] T030 `npm run dev` でアプリを起動し、spec.md の全Acceptance Scenariosを手動でウォークスルーして検証する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即座に開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 — **全ユーザーストーリーをブロック**
- **US1 (Phase 3)**: Phase 2 完了後 — 他のユーザーストーリーに依存しない
- **US2 (Phase 4)**: Phase 2 完了後 — US1 と独立して開発可能（UI統合のみ US1 に依存）
- **US3 (Phase 5)**: Phase 2 完了後 — US1・US2 と独立
- **US4 (Phase 6)**: Phase 2 完了後 — US1・US2・US3 と独立
- **Polish (Phase 7)**: 全ユーザーストーリー完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後 — 依存なし。これが MVP
- **US2 (P2)**: Phase 2 完了後 — US1 と独立だが App.tsx の統合で US1 を前提
- **US3 (P3)**: Phase 2 完了後 — useGame hook の RESET は T011 で実装済み
- **US4 (P4)**: Phase 2 完了後 — GameControls を US3 で作成後に拡張

### Within Each Phase

- `[P]` が付いたタスクは同フェーズ内の他の `[P]` タスクと並列実行可能
- T007 → T008 → T009 は順番に実行（依存関係あり）
- コンポーネントは先に Cell/Piece（葉）、次に Board（親）の順で実装

### Parallel Opportunities

- T005, T010 は互いに並列実行可能（別ファイル）
- T012, T013 は互いに並列実行可能（別テストファイル）
- T014, T015, T017, T018 は並列実行可能（別コンポーネントファイル）
- T021, T024 は並列実行可能（別コンポーネントファイル）

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# 以下を並列で開始:
Task T014: src/components/Board/Piece.tsx
Task T015: src/components/Board/Cell.tsx
Task T017: src/components/GameStatus/GameStatus.tsx
Task T018: src/components/PromotionDialog/PromotionDialog.tsx

# 上記完了後:
Task T016: src/components/Board/Board.tsx (Piece, Cell に依存)

# Board, GameStatus, PromotionDialog 完了後:
Task T019: src/App.tsx (全コンポーネントを組み合わせ)
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. Phase 1 完了: プロジェクトセットアップ
2. Phase 2 完了: ゲームエンジン（CRITICAL）
3. Phase 3 完了: US1 コンポーネント
4. **STOP & VALIDATE**: `npm run dev` で対局できることを確認
5. デモ可能な MVP 完成

### Incremental Delivery

1. Setup + Foundational → ゲームロジック完成
2. US1 追加 → 基本対局 MVP デモ可能
3. US2 追加 → 持ち駒打ちでより本格的な将棋に
4. US3 追加 → 繰り返し遊べるUX
5. US4 追加 → 完全な将棋体験
6. Polish → 全デバイス対応・品質向上

---

## Notes

- `[P]` = 別ファイル・依存なし → 並列実行可能
- `[Story]` ラベルは各タスクのユーザーストーリーへのトレーサビリティを示す
- **T007-T009 は将棋ルールの心臓部** — 実装前に contracts/game-engine.md の Invariants を熟読すること
- 各フェーズの Checkpoint で動作確認してから次フェーズへ進む
- 成駒を取ったとき元の駒種に戻す処理（unpromote）を applyMove 内で確実に実装すること
- 王手放置の禁止チェックは getLegalMovesForPiece 内で移動後の isUnderAttack チェックとして実装すること

