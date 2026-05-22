# Quickstart: 3D アニメーションシステムの開発ガイド

**Branch**: `004-3d-board-animation` | **Date**: 2026-05-22

## 概要

このフィーチャーは「3D ビジュアル層」と「アニメーション制御層」の2つに分かれる。

```
CSS/スタイル層      → 将棋盤・駒の 3D 見た目（CSS perspective, clip-path）
アニメーション制御層 → 駒の移動・取り・成りアニメーション（状態管理 + Web Animations API）
```

両者は独立して開発・テストできる。スタイル変更はゲームロジックに影響せず、アニメーション制御は CSS と独立している。

---

## 開発環境の起動

```bash
npm run dev    # localhost:5173 で開発サーバー起動
npm run test   # Vitest でテスト実行
npm run build  # 本番ビルド
```

---

## CSS 3D ボードの仕組み

```
.board-wrapper
  perspective: 800px          ← 視点距離（小さいほど歪みが強い）
  └── .board-container
        transform: rotateX(18deg)   ← X軸回転で斜め俯瞰
        transform-style: preserve-3d
        └── .board（既存グリッド）
```

**調整ポイント**:
- `perspective` の値: 大きくすると平行投影に近づく、小さくすると魚眼レンズ風に
- `rotateX` の角度: 0deg = 真上、90deg = 真横。18〜22deg が「将棋らしい」範囲
- 駒は `transform: rotateX(-18deg)` で counter-rotate し、カメラに正面を向ける

---

## アニメーション制御フロー

### 1. ユーザーが駒を動かす

```
handleCellClick(pos)
  → reducer: CELL_CLICK
  → 合法手の場合: QUEUE_ANIMATION({ kind: 'move', from, to, move, ... })
  → board は変更しない（アニメーション完了まで現状維持）
```

### 2. useAnimation がアニメーションを開始

```typescript
// useAnimation.ts の概略
useEffect(() => {
  if (state.animationQueue.length > 0 && !state.isAnimating) {
    const anim = state.animationQueue[0]
    dispatch({ type: 'ANIMATION_START', payload: anim.id })
    // fromRect と toRect を計算して AnimatingPiece に渡す
  }
}, [state.animationQueue, state.isAnimating])
```

### 3. AnimatingPiece がアニメーション再生

```typescript
// AnimatingPiece.tsx の概略
useEffect(() => {
  const el = pieceRef.current
  const anim = el.animate([
    { transform: 'translate(0, 0) translateZ(0px)' },
    { transform: `translate(${dx/2}px, ${dy/2}px) translateZ(32px)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) translateZ(0px)` },
  ], { duration, easing: 'ease-in-out', fill: 'forwards' })

  anim.finished.then(() => onComplete())
}, [])
```

### 4. 完了後に board 更新

```
onComplete()
  → dispatch: ANIMATION_COMPLETE({ id })
  → reducer: processMove(state, pendingAnimation.move)
  → board が更新される → キューから除去 → 次のアニメーションへ
```

---

## テスト戦略

### ゲームロジックのテスト（既存・変更なし）
- `gameEngine.ts`, `legalMoves.ts` の純粋関数はそのまま動作する
- `processMove` の入出力テストは変更不要

### アニメーション状態のテスト
- `reducer` の `QUEUE_ANIMATION` / `ANIMATION_COMPLETE` アクションは純粋関数テスト可能
- `useAnimation` フックは `vi.useFakeTimers()` + `renderHook` でテスト

### CSS ビジュアルのテスト
- 自動テストでは `clip-path` や `perspective` を直接検証しない
- スナップショットテストよりも「駒に `.piece--3d` クラスがある」等の属性テストを使う

---

## よくある落とし穴

| 問題 | 原因 | 対処 |
|---|---|---|
| アニメーション中に駒が2つ表示される | `AnimatingPiece` 表示中に元の `Piece` を非表示にし忘れ | `isAnimating` prop を `Piece` に渡し `opacity: 0` |
| アニメーション完了後に board が更新されない | `ANIMATION_COMPLETE` の dispatch タイミングがずれている | `anim.finished` Promise を必ず await する |
| 持ち駒エリアへの座標がずれる | `getBoundingClientRect()` の呼び出しタイミングが早い | `ANIMATION_START` 後、次の tick で ref を読む |
| コンピュータの連続手がスキップされる | キューが正しく処理されていない | `ANIMATION_COMPLETE` 後に再度キュー先頭を確認する |
