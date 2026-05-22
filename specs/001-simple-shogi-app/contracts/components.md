# UI Component Contracts: シンプル将棋アプリ

**Branch**: `001-simple-shogi-app` | **Date**: 2026-05-22

## App（ルートコンポーネント）

```typescript
// src/App.tsx
// Props: なし
// 責務: useGame hookを保有し、全子コンポーネントに状態・ハンドラを渡す
```

---

## useGame Hook

```typescript
// src/hooks/useGame.ts

interface UseGameReturn {
  state: GameState;
  handleCellClick: (position: Position) => void;
  handleCapturedPieceClick: (pieceType: CapturablePieceType) => void;
  handlePromotionChoice: (promote: boolean) => void;
  handleResign: () => void;
  handleReset: () => void;
}
```

**責務**:
- useReducerでGameStateを管理
- ゲームエンジン関数を呼び出してReducerアクションに変換
- クリック1回目/2回目の判定（selectedPositionの有無で判断）

---

## Board

```typescript
// src/components/Board/Board.tsx

interface BoardProps {
  board: Board;
  selectedPosition: Position | null;
  legalMoves: Position[];
  currentPlayer: Player;
  status: GameStatus;
  onCellClick: (position: Position) => void;
}
```

**表示仕様**:
- 9×9のグリッド、先手が下（row 8）・後手が上（row 0）
- 選択中の駒マス: ハイライト（青系）
- 合法手マス: ハイライト（緑系または点）
- 王手状態の王将マス: 赤ハイライト
- 後手の駒: CSS `transform: rotate(180deg)` で上下反転表示

---

## Cell

```typescript
// src/components/Board/Cell.tsx

interface CellProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isLegalMove: boolean;
  isInCheck: boolean;    // 王手がかかった王将のマスか
  onClick: (position: Position) => void;
}
```

---

## Piece（表示コンポーネント）

```typescript
// src/components/Board/Piece.tsx

interface PieceProps {
  piece: Piece;
  isCurrentPlayer: boolean;  // 現在の手番プレイヤーの駒か
}
```

**表示仕様**:
- 漢字テキストで駒を表示（例: 歩、と、飛、龍）
- 後手の駒: CSS `transform: rotate(180deg)` で上下反転
- 駒の色: 先手=黒系、後手=暗めの色で区別（または回転のみで区別）

| 駒種 | 表示 | 成り後表示 |
|------|------|----------|
| fu   | 歩   | と       |
| kyo  | 香   | 杏       |
| kei  | 桂   | 圭       |
| gin  | 銀   | 全       |
| kin  | 金   | -        |
| kaku | 角   | 馬       |
| hi   | 飛   | 龍       |
| ou   | 王/玉 | -       |

---

## CapturedPieces

```typescript
// src/components/CapturedPieces/CapturedPieces.tsx

interface CapturedPiecesProps {
  captured: CapturedPieces;
  owner: Player;
  isCurrentPlayer: boolean;
  selectedPieceType: CapturablePieceType | null;  // 持ち駒選択中
  legalDropMoves: Position[];
  onPieceClick: (pieceType: CapturablePieceType) => void;
}
```

**表示仕様**:
- 枚数が0の駒種は表示しない（または薄く表示）
- 選択中の持ち駒をハイライト
- 後手の持ち駒エリアは盤面上部、先手は下部に配置

---

## GameStatus

```typescript
// src/components/GameStatus/GameStatus.tsx

interface GameStatusProps {
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
}
```

**表示仕様**:
- 通常: 「▲先手の番」「△後手の番」
- 王手: 「▲先手の番【王手！】」（テキスト通知を目立たせる）
- 詰み: 「[勝者]の勝ち」
- 投了: 「[勝者]の勝ち（投了）」
- 千日手: 「引き分け（千日手）」

---

## GameControls

```typescript
// src/components/GameControls/GameControls.tsx

interface GameControlsProps {
  status: GameStatus;
  currentPlayer: Player;
  onResign: () => void;
  onReset: () => void;
}
```

**表示仕様**:
- 「投了」ボタン: 対局中のみ有効
- 「最初から」ボタン: 常に表示
- 対局終了後は「投了」を非表示または無効化

---

## PromotionDialog

```typescript
// src/components/PromotionDialog/PromotionDialog.tsx

interface PromotionDialogProps {
  pendingPromotion: PendingPromotion;
  onChoice: (promote: boolean) => void;
}
```

**表示仕様**:
- モーダルオーバーレイで盤面を覆う
- 「成る」「成らない」の2択ボタン
- 強制成りの場合（行き所のない駒）は表示せず自動で成りを適用
- 表示中は盤面・持ち駒エリアの操作を無効化
