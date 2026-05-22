# Research: 将棋盤・駒の立体表示とリアルアニメーション

**Branch**: `004-3d-board-animation` | **Date**: 2026-05-22

## Decision 1: 3D レンダリングアプローチ

**Decision**: CSS 3D transforms + Web Animations API（新規ライブラリなし）

**Rationale**:
- 既存アーキテクチャ（React + 純粋CSS）への変更を最小化できる
- `perspective` + `rotateX` でブラウザ標準の斜め俯瞰視点を実現できる
- Web Animations API はモダンブラウザ全対応でライブラリ不要
- GPU アクセラレーションが効くため 60fps を維持しやすい
- 駒の五角形形状は `clip-path: polygon()` で CSS のみで表現可能

**Alternatives considered**:
- **Three.js / Babylon.js**: 真の 3D 描画が可能だが、全レンダリングの書き直しが必要。バンドルサイズ増大（Three.js ~600KB gzip）。オーバースペック。
- **Framer Motion**: React ネイティブで扱いやすいが、新規依存追加が必要。`layoutId` による自動位置アニメーションは放物線制御が難しい。
- **WebGL直接実装**: 最高の自由度だが実装コストが高すぎる。

---

## Decision 2: アニメーション状態管理アーキテクチャ

**Decision**: `pendingAnimation` + `animationQueue` を `GameState` に追加し、`useAnimation` フックで制御する二段階コミット方式

**Rationale**:
- ゲームロジック（`gameEngine.ts`, `legalMoves.ts` 等）は一切変更しない
- `processMove` の呼び出しタイミングをアニメーション完了後に遅延させることで、ゲーム状態の更新とアニメーション再生を分離できる
- `reducer` がアニメーション状態も管理することでテスト可能性が保たれる
- `ANIMATION_COMPLETE` アクションで完了を通知するパターンは既存の `SET_COMPUTER_THINKING` と同じ設計思想

**Flow**:
```
ユーザー操作 / コンピュータ指し手
  → dispatcher が合法手確認後に QUEUE_ANIMATION アクション
  → reducer が animationQueue に追加（board は変更しない）
  → useAnimation が animationQueue を監視し順番にアニメーション再生
  → アニメーション完了 → ANIMATION_COMPLETE アクション
  → reducer が board を更新し次のキューアイテムへ
```

**Alternatives considered**:
- **アニメーション状態を別 useState で管理**: ゲーム状態と分離されてしまい、テストとデバッグが困難になる
- **useEffect でキュー管理**: 依存配列の管理が複雑になる。`useComputerPlayer` との干渉リスクがある
- **アニメーションライブラリに委ねる**: layoutId アニメーション（Framer Motion）は任意の放物線制御ができない

---

## Decision 3: 放物線アニメーションの実装手法

**Decision**: Web Animations API（`Element.animate()`）の 3 キーフレーム方式

**Rationale**:
- 任意の始点・終点座標を JavaScript で計算し、中間点（頂点）を動的に生成できる
- `easing` に `ease-in-out` を指定することで自然な加速・減速が得られる
- `translateZ` で持ち上がり（Z軸方向の動き）を表現し、XY移動と組み合わせて放物線に見せる
- Promise ベースの完了通知（`.finished`）で `ANIMATION_COMPLETE` ディスパッチが簡潔に書ける

**Keyframe 設計**:
```
frame 0%:   translate(0, 0)       translateZ(0px)     → 元位置
frame 50%:  translate(dx/2, dy/2) translateZ(32px)    → 弧の頂点（持ち上がり）
frame 100%: translate(dx, dy)     translateZ(0px)     → 目的地
```

**Alternatives considered**:
- **CSS @keyframes のみ**: 任意の dx, dy を CSS 変数でキーフレームに渡すことができないため不採用
- **requestAnimationFrame 手動ループ**: 実装量が増え、easing 計算も自前になる。Web Animations API で十分
- **setTimeout ベース**: 精度が低く、タブ切り替え時に狂う

---

## Decision 4: 駒の 3D 形状表現

**Decision**: CSS `clip-path: polygon()` + グラデーション + `drop-shadow` フィルター

**Rationale**:
- 既存の `<span>` ベースの `Piece` コンポーネントを最小変更で五角形にできる
- `clip-path` はモダンブラウザ全対応
- `background: linear-gradient()` で木目・光沢感を表現
- `filter: drop-shadow()` で clip-path に沿った影がつく（`box-shadow` では clip された外に出ない）
- 後手駒の `transform: rotate(180deg)` は既存の `piece--rotated` クラスで既に実装済み

**Pentagon clip-path**:
```css
clip-path: polygon(50% 0%, 95% 30%, 80% 100%, 20% 100%, 5% 30%);
```

**Alternatives considered**:
- **SVG pentagon**: DOM 構造の変更が必要。テキスト配置が複雑。
- **border tricks**: 五角形を border で作るのは制限が多い
- **Canvas に駒を描画**: React の DOM ツリーから切り離されるため状態管理が複雑

---

## Decision 5: 取られた駒の移動先座標計算

**Decision**: DOM `getBoundingClientRect()` で盤上マスと持ち駒エリアの絶対座標を取得し、差分を計算してアニメーション適用

**Rationale**:
- 将棋盤は CSS Grid で配置されており、各マスの画面座標は CSS だけでは計算しにくい
- `ref` を使って盤面マスと持ち駒エリアの要素参照を取得し、実際の座標差分を Web Animations API に渡す方法が最も確実
- `position: fixed` のオーバーレイ要素でアニメーション中の駒を描画することで、レイアウトに影響を与えない

**Alternatives considered**:
- **CSS Grid のセルサイズから計算**: `--cell-size` は `clamp()` を使っており、実際の描画サイズをJSで事前計算するのは困難
- **アニメーション専用の座標系を設ける**: 複雑さが増し、レスポンシブ対応が難しくなる

---

## Decision 6: `prefers-reduced-motion` 対応

**Decision**: CSS `@media (prefers-reduced-motion: reduce)` でアニメーション duration を 0 に設定し、アニメーション再生をスキップ（即座に完了）

**Rationale**:
- 仕様書の Assumptions に明記されている要件
- アニメーション完了コールバックは同様に発火するため、ゲームロジックへの影響なし
- CSS メディアクエリで一括制御できるため実装コストが低い

```css
@media (prefers-reduced-motion: reduce) {
  .piece-animate { transition-duration: 0ms; animation-duration: 0ms; }
}
```
