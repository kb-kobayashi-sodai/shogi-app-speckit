# Quickstart: シンプル将棋アプリ

**Branch**: `001-simple-shogi-app` | **Date**: 2026-05-22

## 必要環境

- Node.js 18 以上
- npm または pnpm

## セットアップ

```bash
# プロジェクト作成（Vite + React + TypeScript テンプレート）
npm create vite@latest shogi-app -- --template react-ts
cd shogi-app

# 依存インストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:5173 でブラウザ確認

# テスト実行
npm run test

# ビルド
npm run build
```

## Vitest セットアップ

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

`vite.config.ts` に追記:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

## ディレクトリ構成の初期化

```bash
mkdir -p src/game src/components/Board src/components/CapturedPieces
mkdir -p src/components/GameStatus src/components/GameControls src/components/PromotionDialog
mkdir -p src/hooks
mkdir -p tests/game tests/components
```

## 開発順序（推奨）

1. `src/game/types.ts` — 型定義を全て先に定義
2. `src/game/constants.ts` — 初期配置を定義
3. `src/game/pieces.ts` — 駒のルール関数
4. `src/game/legalMoves.ts` — 合法手計算（テストを先に書く）
5. `src/game/gameEngine.ts` — 手適用・王手・詰み（テストを先に書く）
6. `src/game/sennichite.ts` — 千日手検出
7. `src/hooks/useGame.ts` — Reducer実装
8. `src/components/` — UIコンポーネント実装
9. `src/App.tsx` — 全体組み立て

## 主要コマンド

```bash
npm run dev       # 開発サーバー（HMR有効）
npm run test      # Vitestでテスト実行（watchモード）
npm run test run  # テスト1回実行
npm run build     # 本番ビルド（dist/）
npm run preview   # ビルド成果物のプレビュー
```
