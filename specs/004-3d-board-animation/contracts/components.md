# Component Contracts: 将棋盤・駒の立体表示とリアルアニメーション

**Branch**: `004-3d-board-animation` | **Date**: 2026-05-22

---

## AnimatingPiece（新規）

アニメーション中の駒を `position: fixed` オーバーレイ上に描画するコンポーネント。
盤面上の実際の駒が移動しているように見せるためのビジュアルオーバーレイ。

```typescript
interface AnimatingPieceProps {
  piece: Piece                 // 描画する駒（種類・所有者）
  startRect: DOMRect           // アニメーション開始位置（getBoundingClientRect）
  endRect: DOMRect             // アニメーション終了位置（getBoundingClientRect）
  duration: number             // アニメーション時間（ms）
  onComplete: () => void       // アニメーション完了コールバック
}
```

**ライフサイクル**:
1. マウント直後に Web Animations API でアニメーション開始
2. アニメーション完了後に `onComplete` を呼び出す
3. アンマウント時にアニメーションをキャンセル（クリーンアップ）

**視覚的挙動**:
- 始点 → 弧の頂点（Z軸最大32px持ち上がり） → 終点の放物線軌跡
- `prefers-reduced-motion: reduce` 時は duration 0ms（即座に完了）

---

## Board（変更）

```typescript
interface BoardProps {
  board: BoardType
  selectedPosition: Position | null
  legalMoves: Position[]
  currentPlayer: Player
  status: GameStatus
  onCellClick: (position: Position) => void
  boardRef: RefObject<HTMLDivElement>   // 追加: 座標計算用 ref
}
```

**追加される視覚効果**:
- `.board-wrapper` に `perspective: 800px` 適用
- `.board` に `transform: rotateX(18deg)` 適用（斜め俯瞰）
- `AnimatingPiece` コンポーネントを条件レンダリング（アニメーション中のみ）

---

## Piece（変更）

```typescript
interface PieceProps {
  piece: PieceType_i
  isAnimating?: boolean   // 追加: true の場合は透明（AnimatingPiece がオーバーレイ表示）
}
```

**追加されるスタイル**:
- `clip-path: polygon(50% 0%, 95% 30%, 80% 100%, 20% 100%, 5% 30%)` — 五角形
- `background: linear-gradient(...)` — 木目調グラデーション
- `filter: drop-shadow(...)` — 五角形に沿った影
- `isAnimating === true` 時: `opacity: 0`（元位置の駒を非表示）

---

## CapturedPieces（変更）

```typescript
interface CapturedPiecesProps {
  captured: CapturedPieces
  owner: Player
  isCurrentPlayer: boolean
  selectedPieceType: CapturablePieceType | null
  onPieceClick: (pieceType: CapturablePieceType) => void
  isGameOver: boolean
  capturedRef: RefObject<HTMLDivElement>   // 追加: 座標計算用 ref
}
```

---

## App（変更）

```typescript
// 追加される ref（App.tsx で管理）
const boardRef = useRef<HTMLDivElement>(null)
const senteCapturedRef = useRef<HTMLDivElement>(null)
const goteCapturedRef = useRef<HTMLDivElement>(null)
```

`useAnimation(state, dispatch, { boardRef, senteCapturedRef, goteCapturedRef })` を呼び出す。
