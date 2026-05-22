# Game Engine API Contracts: シンプル将棋アプリ

**Branch**: `001-simple-shogi-app` | **Date**: 2026-05-22

これら全ての関数は副作用なしの純粋関数として実装する。

---

## constants.ts

```typescript
// src/game/constants.ts

export const INITIAL_BOARD: Board         // 初期盤面配置
export const INITIAL_CAPTURED: AllCapturedPieces  // 全0の持ち駒
export const BOARD_SIZE = 9
export const ENEMY_ZONE_ROWS: Record<Player, number[]>  // 敵陣の行インデックス
// sente: [0,1,2], gote: [6,7,8]
```

---

## pieces.ts

```typescript
// src/game/pieces.ts

// 駒種に対応する漢字テキスト（表示用）
export function getPieceLabel(pieceType: PieceType): string

// 駒が成れるか（金・王・成駒は成れない）
export function canPromote(pieceType: PieceType): boolean

// 駒が強制成りになるか（行き所のない場所かチェック）
export function mustPromote(pieceType: PieceType, toRow: number, player: Player): boolean

// 成駒を得る
export function promote(pieceType: PieceType): PieceType

// 成駒を元に戻す（持ち駒として使うため）
export function unpromote(pieceType: PieceType): CapturablePieceType
```

---

## legalMoves.ts

```typescript
// src/game/legalMoves.ts

// 指定位置の駒の合法手マス一覧を返す（王手放置チェック含む）
export function getLegalMovesForPiece(
  board: Board,
  position: Position,
  capturedPieces: AllCapturedPieces
): Position[]

// 持ち駒を打てる合法マス一覧を返す（二歩・打ち歩詰め・行き所なし含む）
export function getLegalDropPositions(
  board: Board,
  pieceType: CapturablePieceType,
  player: Player
): Position[]

// 指定プレイヤーに合法手が1つでもあるか（詰み判定に使用）
export function hasAnyLegalMove(
  board: Board,
  player: Player,
  capturedPieces: AllCapturedPieces
): boolean

// 指定マスが指定プレイヤーの王手範囲に入っているか
export function isUnderAttack(
  board: Board,
  position: Position,
  attackingPlayer: Player
): boolean
```

---

## gameEngine.ts

```typescript
// src/game/gameEngine.ts

// ゲームの初期状態を生成する
export function createInitialGameState(): GameState

// 移動を盤面に適用した新しい盤面を返す（イミュータブル）
export function applyMove(
  board: Board,
  move: Move,
  capturedPieces: AllCapturedPieces
): {
  board: Board;
  capturedPieces: AllCapturedPieces;
}

// 手を適用した後のゲーム状態全体を計算する
// 成り選択が必要な場合は status は変わらず pendingPromotion が設定される
export function processMove(
  state: GameState,
  move: Move
): GameState

// 成り・不成りの選択を処理する
export function processPromotionChoice(
  state: GameState,
  promote: boolean
): GameState

// 王手がかかっているか判定する
export function isInCheck(
  board: Board,
  player: Player
): boolean

// 詰みか判定する（王手 + 全合法手で王手回避不可）
export function isCheckmate(
  board: Board,
  player: Player,
  capturedPieces: AllCapturedPieces
): boolean

// 投了を処理した新しいゲーム状態を返す
export function processResign(state: GameState): GameState

// 最初からリセットした新しいゲーム状態を返す
export function processReset(): GameState
```

---

## sennichite.ts

```typescript
// src/game/sennichite.ts

// 現在の局面をハッシュ文字列に変換する
export function hashBoardState(
  board: Board,
  capturedPieces: AllCapturedPieces,
  currentPlayer: Player
): string

// 千日手かどうか判定する（同一ハッシュが4回以上）
export function isSennichite(boardHistory: string[]): boolean

// 最新のハッシュを履歴に追加した新しい配列を返す
export function addBoardHistory(
  boardHistory: string[],
  hash: string
): string[]
```

---

## Reducer Actions

```typescript
// src/hooks/useGame.ts （reducer）

type GameAction =
  | { type: 'CELL_CLICK'; payload: Position }
  | { type: 'CAPTURED_PIECE_CLICK'; payload: CapturablePieceType }
  | { type: 'PROMOTION_CHOICE'; payload: boolean }
  | { type: 'RESIGN' }
  | { type: 'RESET' };
```

---

## Invariants（不変条件）

実装全体を通じて保証する不変条件:

1. `board` は常に 9×9 の配列である
2. `status` が `'checkmate'` または `'resigned'` のとき `winner` は非null
3. `status` が `'playing'` または `'check'` でないとき `selectedPosition` と `legalMoves` は空
4. `pendingPromotion != null` のとき、他のゲームアクションは無効
5. `currentPlayer` の駒以外の選択は不可
6. 持ち駒にある駒の合計は取り除かれた駒数と一致する
7. 千日手判定には現在の局面も含む（移動後に即チェック）
