# Hook Contracts: 将棋盤・駒の立体表示とリアルアニメーション

**Branch**: `004-3d-board-animation` | **Date**: 2026-05-22

---

## useAnimation（新規）

アニメーションキューを監視し、`AnimatingPiece` のレンダリングとアニメーション完了通知を担うカスタムフック。
コンポーネント側は実装詳細を知らなくてよい（`useComputerPlayer` と同じパターン）。

```typescript
interface AnimationRefs {
  boardRef: RefObject<HTMLDivElement>
  senteCapturedRef: RefObject<HTMLDivElement>
  goteCapturedRef: RefObject<HTMLDivElement>
}

interface UseAnimationReturn {
  currentAnimation: PendingAnimation | null   // 現在再生中（AnimatingPiece に渡す）
  animatingFromRect: DOMRect | null           // 始点座標
  animatingToRect: DOMRect | null             // 終点座標
}

function useAnimation(
  state: GameState,
  dispatch: Dispatch<GameAction>,
  refs: AnimationRefs
): UseAnimationReturn
```

**責務**:
1. `state.animationQueue` の先頭を監視
2. キューに新しいアニメーションが追加されたら `ANIMATION_START` を dispatch
3. `boardRef` / `capturedRef` から始点・終点の `DOMRect` を計算し返す
4. `AnimatingPiece` の `onComplete` で `ANIMATION_COMPLETE` を dispatch

**不変条件**:
- `state.isAnimating === true` の間は新しいアニメーションを開始しない（前のが完了するまで待つ）
- `boardRef.current` が `null` の場合（非表示時）はアニメーションをスキップして即座に `ANIMATION_COMPLETE` を dispatch

---

## useGame（変更）

```typescript
// 追加されるアクション
type GameAction =
  | ... // 既存アクション
  | { type: 'QUEUE_ANIMATION'; payload: PendingAnimation }
  | { type: 'ANIMATION_START'; payload: string }      // id
  | { type: 'ANIMATION_COMPLETE'; payload: string }   // id

// 追加されるハンドラー（不要。useAnimation 内で dispatch する）
// 変更される戻り値型
export interface UseGameReturn {
  state: GameState          // animationQueue, isAnimating が追加される
  dispatch: Dispatch<GameAction>
  // ... 既存ハンドラー（変更なし）
}
```

**reducer の変更点**:

| アクション | 処理内容 |
|---|---|
| `CELL_CLICK` / `CAPTURED_PIECE_CLICK` | `isAnimating === true` の場合スキップ（既存の `isComputerThinking` ガードと並列に追加） |
| `QUEUE_ANIMATION` | `animationQueue` に追加。`board` は変更しない |
| `ANIMATION_START` | `isAnimating: true` に設定 |
| `ANIMATION_COMPLETE` | `processMove(state, pendingAnimation.move)` を呼び出して board 更新 → キューから先頭を削除 → `isAnimating: false` |

**初期状態の追加フィールド**:
```typescript
animationQueue: [],
isAnimating: false,
```
