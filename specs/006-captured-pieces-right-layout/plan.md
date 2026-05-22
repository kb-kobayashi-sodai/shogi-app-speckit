# Implementation Plan: 持ち駒エリアの右配置・縦並び・スクロール対応

**Branch**: `006-captured-pieces-right-layout` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/006-captured-pieces-right-layout/spec.md`

## Summary

将棋盤の左右に持ち駒エリアを配置し（後手左・先手右）、各エリア内で駒種ごとに縦並び表示し、エリア高さが将棋盤の半分を超えた場合にスクロールを有効にする。

**調査結果**: 持ち駒の縦並び（`flex-direction: column`）と左右配置（gote→board→sente の DOM 順）はすでに実装済み。変更点は以下の2点に限定される：
1. `.app` の `max-width` を 700px → 900px に拡大（狭い画面での折り返しを防止）
2. `.captured-pieces` に `max-height: calc(9 * var(--cell-size) / 2)` と `overflow-y: auto` を追加

## Technical Context

**Language/Version**: TypeScript 5.5.3 / React 18.3.1  
**Primary Dependencies**: React 18, Vite 5.4.1  
**Storage**: N/A  
**Testing**: Vitest 2.0.5 + @testing-library/react 16.0.0  
**Target Platform**: Web browser (デスクトップ、min-width: 601px)  
**Project Type**: Web application (SPA)  
**Performance Goals**: 60fps、レイアウトシフトなし  
**Constraints**: モバイル対応はスコープ外、アニメーション refs を破壊しない  
**Scale/Scope**: 単一ページアプリ、`src/index.css` のみ変更

## Constitution Check

Constitution ファイルは未記入のため、適用すべき gate なし。

## Project Structure

### Documentation (this feature)

```text
specs/006-captured-pieces-right-layout/
├── plan.md              # This file
├── research.md          # Phase 0: 現状調査・設計判断
├── data-model.md        # Phase 1: データモデル（変更なし確認）
└── tasks.md             # Phase 2 output (/speckit-tasks で生成)
```

### Source Code (変更対象のみ)

```text
src/
└── index.css            # 唯一の変更ファイル
    ├── .app             # max-width: 700px → 900px
    └── .captured-pieces # max-height + overflow-y: auto を追加
```

**変更なしのファイル**:
- `src/App.tsx` — DOM 順序はすでに正しい（gote→board→sente）
- `src/components/CapturedPieces/CapturedPieces.tsx` — 縦並びはすでに実装済み
- `src/game/` 以下 — ゲームロジック変更なし

## Implementation Details

### 変更 1: `.app` max-width 拡大

```css
/* Before */
.app {
  max-width: 700px;
}

/* After */
.app {
  max-width: 900px;
}
```

**理由**: 盤幅（9×60px ≈ 570px）+ 持ち駒2エリア（70px×2）+ gap（8px×2）= 726px が 700px に収まらず折り返す。

### 変更 2: `.captured-pieces` スクロール対応

```css
/* After (追加) */
.captured-pieces {
  max-height: calc(9 * var(--cell-size) / 2);
  overflow-y: auto;
}
```

**理由**: 
- `--cell-size` は `:root` で `clamp(40px, 8vw, 60px)` として定義済み
- `9 × --cell-size / 2` = 将棋盤のグリッド高さの半分
- `overflow-y: auto` により、収まる場合はスクロールバーを非表示にする（FR-004 対応）

## Testing Strategy

### 手動検証項目

1. デスクトップ（>900px）: 後手（左）・盤（中央）・先手（右）が横一列に並ぶ
2. ウィンドウ幅 750px: 折り返しなく3列が維持される
3. 持ち駒が多い状態: 持ち駒エリアがスクロール可能になる
4. 持ち駒が少ない状態: スクロールバーが表示されない

### 自動テスト

既存テストの regression チェックのみ（新機能は CSS 変更のため、ビジュアルテストは手動）。

## Risks

| リスク | 対策 |
|--------|------|
| アニメーション座標計算がずれる | `getBoundingClientRect()` は CSS 変更後も正確に動作する。変更後に駒移動アニメーションを手動確認する |
| モバイル表示が崩れる | モバイルメディアクエリ（`max-width: 600px`）は変更しない |
| スクロール時に持ち駒がクリップされる | `overflow-y: auto` はスクロール軸のみ影響し、クリックは引き続き正常に機能する |
