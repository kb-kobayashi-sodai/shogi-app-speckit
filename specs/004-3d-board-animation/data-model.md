# Data Model: 将棋盤・駒の立体表示とリアルアニメーション

**Branch**: `004-3d-board-animation` | **Date**: 2026-05-22

## 変更・追加型定義（`src/game/types.ts`）

### 追加: `AnimationTarget`

アニメーション中の駒が最終的に向かう先を表す。

```typescript
export type AnimationTarget =
  | { type: 'cell'; position: Position }           // 盤上マスへの移動
  | { type: 'captured'; owner: Player }            // 持ち駒エリアへ（取られた駒）
```

### 追加: `PendingAnimation`

1件分のアニメーションリクエストを表す。`animationQueue` の要素型。

```typescript
export interface PendingAnimation {
  id: string                    // ユニーク識別子（例: `move-${Date.now()}`）
  kind: 'move' | 'drop' | 'capture' | 'promote'
  piece: Piece                  // アニメーションする駒
  from: AnimationTarget         // 始点
  to: AnimationTarget           // 終点
  move: Move                    // 完了後に processMove() へ渡す手
  captureAnimation?: {          // 駒を取る場合の追加アニメーション
    piece: Piece
    from: Position
    to: AnimationTarget         // 攻撃側の持ち駒エリア
  }
}
```

### 変更: `GameState`

以下のフィールドを追加する。

```typescript
export interface GameState {
  // ... 既存フィールド（変更なし） ...

  // アニメーション制御（新規追加）
  animationQueue: PendingAnimation[]   // 実行待ちアニメーションの FIFO キュー
  isAnimating: boolean                 // true の間はユーザー入力をブロック
}
```

**不変条件**:
- `isAnimating === true` のとき、`CELL_CLICK` / `CAPTURED_PIECE_CLICK` アクションは reducer がスキップする（既存の `isComputerThinking` ガードと同様）
- `animationQueue` が空で `isAnimating === false` のとき、次のユーザー操作を受け付ける

---

## 新規アクション（`src/hooks/useGame.ts`）

| Action Type | Payload | 説明 |
|---|---|---|
| `QUEUE_ANIMATION` | `PendingAnimation` | キューに追加。board は変更しない |
| `ANIMATION_START` | `string`（id） | 先頭アニメーションを開始（`isAnimating: true`） |
| `ANIMATION_COMPLETE` | `string`（id） | 完了。`move` を `processMove()` に渡して board 更新、キューから除去 |

**処理フロー**:

```
CELL_CLICK（合法手）
  → reducer が PendingAnimation を生成
  → QUEUE_ANIMATION で animationQueue に追加（board 変更なし）
  → useAnimation が ANIMATION_START を dispatch
  → Web Animations API でアニメーション再生
  → 完了後 ANIMATION_COMPLETE を dispatch
  → reducer が processMove() を呼び出して board 更新
  → animationQueue から先頭を除去
  → キューに次があれば ANIMATION_START を再度 dispatch
```

---

## アニメーション座標モデル

アニメーション中の駒は `position: fixed` の透明オーバーレイ上に描画される。

```
画面座標系 (px)
  ┌─────────────────────────────────────────┐
  │  持ち駒エリア（後手）                      │  ← capturedRef.gote
  │                                         │
  │  ┌──────────────────────────────────┐   │
  │  │   将棋盤 (board)                  │   │  ← boardRef
  │  │   [0][0] ... [0][8]              │   │
  │  │     ...         ...              │   │
  │  │   [8][0] ... [8][8]              │   │
  │  └──────────────────────────────────┘   │
  │                                         │
  │  持ち駒エリア（先手）                      │  ← capturedRef.sente
  └─────────────────────────────────────────┘
```

**座標計算**:
- 盤上マス `(row, col)` の画面座標: `boardRef.current.getBoundingClientRect()` + セルサイズ × インデックス
- 持ち駒エリアの中心座標: `capturedRef.[owner].getBoundingClientRect()`

これらの座標差分を `Web Animations API` の `translate(dx, dy)` に渡す。

---

## 状態遷移図（アニメーション）

```
[IDLE]
  ↓ QUEUE_ANIMATION
[QUEUED] (animationQueue.length > 0, isAnimating: false)
  ↓ ANIMATION_START
[ANIMATING] (isAnimating: true)
  ↓ ANIMATION_COMPLETE
[IDLE or QUEUED] (processMove 実行後、キューに次があれば再度 ANIMATION_START)
```

---

## 影響を受けるエンティティ

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/game/types.ts` | 追加 | `AnimationTarget`, `PendingAnimation`, `GameState` 拡張 |
| `src/hooks/useGame.ts` | 変更 | `QUEUE_ANIMATION`, `ANIMATION_START`, `ANIMATION_COMPLETE` アクション追加 |
| `src/hooks/useAnimation.ts` | 新規 | `animationQueue` 監視、Web Animations API 呼び出し |
| `src/components/Board/AnimatingPiece.tsx` | 新規 | `position: fixed` オーバーレイ上の移動中駒コンポーネント |
| `src/components/Board/Board.tsx` | 変更 | CSS perspective 適用、`boardRef` 追加、`AnimatingPiece` 描画 |
| `src/components/Board/Piece.tsx` | 変更 | 五角形 clip-path、グラデーション、drop-shadow |
| `src/components/CapturedPieces/CapturedPieces.tsx` | 変更 | `capturedRef` 追加（アニメーション座標計算用） |
| `src/App.tsx` | 変更 | `useAnimation` フック追加、ref 受け渡し |
| `src/index.css` | 変更 | 3D ボード・駒スタイル、`@keyframes` 追加 |
