# Data Model: 持ち駒エリアの右配置・縦並び・スクロール対応

## 概要

本機能は純粋な UI レイアウト変更であり、ゲームロジックやデータ構造の変更は不要。  
既存の型定義・状態管理はそのまま利用する。

## 既存エンティティ（変更なし）

### CapturedPieces (型)

```typescript
type CapturablePieceType = 'fu' | 'kyo' | 'kei' | 'gin' | 'kin' | 'kaku' | 'hi'
type CapturedPieces = Record<CapturablePieceType, number>  // 駒種 → 枚数
```

- 7種類の駒種それぞれの枚数を保持
- 0枚の場合は表示しない（CapturedPieces.tsx で `if (count === 0) return null`）
- スクロール対応はこのデータ構造をそのままに、CSS の max-height で制御する

### AllCapturedPieces (型)

```typescript
interface AllCapturedPieces {
  sente: CapturedPieces  // 先手の持ち駒（将棋盤右側に表示）
  gote: CapturedPieces   // 後手の持ち駒（将棋盤左側に表示）
}
```

## UI 構造（変更点のみ記載）

### `.captured-pieces` コンテナ

| プロパティ | 変更前 | 変更後 |
|-----------|-------|-------|
| max-height | なし | `calc(9 * var(--cell-size) / 2)` |
| overflow-y | なし | `auto` |

### `.app` コンテナ

| プロパティ | 変更前 | 変更後 |
|-----------|-------|-------|
| max-width | `700px` | `900px` |

## 依存関係

- `--cell-size` CSS 変数（`:root` で定義済み）に依存してスクロール上限を計算
- アニメーション用 ref（`senteCapturedRef`, `goteCapturedRef`）は変更なし
