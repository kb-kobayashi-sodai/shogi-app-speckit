# Research: 持ち駒エリアの右配置・縦並び・スクロール対応

## 1. 現状レイアウト調査

### Decision
現行コードはすでに「後手（左） → 将棋盤（中央） → 先手（右）」の横並びレイアウトを実装している。

### Rationale
`App.tsx` の DOM 順序：gote CapturedPieces → Board → sente CapturedPieces  
`.game-area` の CSS：`display: flex; flex-direction: row（デフォルト）; align-items: flex-start; gap: 8px;`  
→ 視覚的に後手が左、先手が右に配置される。

### Alternatives considered
- flex-direction: column への変更 → 不要（すでに row）
- DOM 順序の変更 → 不要（すでに正しい順序）

---

## 2. 持ち駒の縦並び実装状況

### Decision
持ち駒リストはすでに縦並び（flex-direction: column, 1行=1駒種）で実装されている。

### Rationale
`CapturedPieces.tsx` が `PIECE_ORDER` を反復して駒種ごとにボタンを1つ生成。  
`.captured-list` が `flex-direction: column; gap: 4px; align-items: center;` で縦配列。  
枚数が2以上の場合は `<span className="captured-piece-count">{count}</span>` で表示済み。

### Alternatives considered
- コンポーネントの再設計 → 不要（すでに要件を満たす実装済み）

---

## 3. max-height の実装方法

### Decision
CSS 変数 `--cell-size` を利用した純粋 CSS 式 `calc(9 * var(--cell-size) / 2)` を採用する。

### Rationale
- 将棋盤の行数は常に9行で固定。盤の高さは `9 × --cell-size` で近似できる。
- `--cell-size: clamp(40px, 8vw, 60px)` はすでに :root に定義されており、レスポンシブに追従する。
- JS / ResizeObserver を使う方法より実装が単純で副作用がない。
- デスクトップ（60px）: 盤高さ ≈ 540px → max-height = 270px  
- ミドル（50px）: 盤高さ ≈ 450px → max-height = 225px

### Alternatives considered
- `useEffect + ResizeObserver` で JS から CSS 変数を設定: 正確だが複雑すぎる
- 固定値 250px: シンプルだが画面サイズ変更に追従しない

---

## 4. flex-wrap による折り返し問題

### Decision
`.app` の `max-width` を 700px から 900px に拡大し、デスクトップでの折り返しを防ぐ。

### Rationale
現状の 700px では盤（9×60px ≈ 570px）+ 持ち駒2エリア（70px×2）+ gap（8px×2）= 726px を収容できず、折り返しが発生する可能性がある。  
900px に拡大することで余裕を確保する。

`flex-wrap: wrap` 自体は削除しない。これにより、ウィンドウが極端に狭い場合（601px〜750px 程度）でも折り返して表示できるフォールバックが維持される。

### Alternatives considered
- `flex-wrap: nowrap` を強制: 狭いウィンドウでレイアウト崩れが発生するリスク
- `min-width` をコンポーネントに追加: 副作用が多い

---

## 5. アニメーション ref への影響

### Decision
`boardRef`・`senteCapturedRef`・`goteCapturedRef` はすべて DOM 要素への参照であり、CSS のみの変更は参照の有効性に影響しない。

### Rationale
`useAnimation` フックは ref.current から `getBoundingClientRect()` で座標を取得する。  
CSS flex レイアウトの変更後も DOM 要素は存在し続けるため、rect 取得は正常に機能する。

### Alternatives considered
- ref を再設計: 不要

---

## Summary

| 項目 | 変更要否 | 対象ファイル |
|------|---------|------------|
| 左右レイアウト（後手左・先手右） | **不要**（実装済み） | — |
| 縦並び（1行=1駒種） | **不要**（実装済み） | — |
| `.app` max-width 拡大 | **必要** | `src/index.css` |
| `max-height` + `overflow-y: auto` | **必要** | `src/index.css` |
| `App.tsx` DOM 構造 | **不要**（実装済み） | — |
| `CapturedPieces.tsx` コンポーネント | **不要**（実装済み） | — |
