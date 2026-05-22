# Quickstart: サイドメニュー＋対戦モード選択

**Branch**: `002-game-mode-select` | **Date**: 2026-05-22

## 開発環境のセットアップ

```bash
# 既存セットアップ済みの場合はスキップ
npm install
npm run dev       # http://localhost:5173 で起動
npm test          # Vitest でテスト実行
npm run build     # プロダクションビルド
```

## 実装順序ガイド

本機能は以下の順序で実装することを推奨。各ステップは独立してテスト可能。

### Step 1: 型とゲームエンジン拡張

1. `src/game/types.ts` に `GameMode` 型と `GameState` への追加フィールドを反映
2. `src/game/gameEngine.ts` の `createInitialGameState` を拡張（`gameMode: 'human'`, `isComputerThinking: false`）
3. `processReset` を修正: `gameMode` を維持してリセット

### Step 2: コンピュータAI

1. `src/game/computerPlayer.ts` を新規作成
2. `selectComputerMove(state)` を実装（全合法手列挙 → ランダム選択）
3. Vitest でテスト: 合法手が返るか・詰み時に null が返るか

### Step 3: useGame 拡張

1. `useGame.ts` に `CHANGE_MODE`, `COMPUTER_MOVE`, `SET_COMPUTER_THINKING` アクションを追加
2. `handleChangeMode` を `UseGameReturn` に追加
3. `dispatch` を外部公開

### Step 4: useComputerPlayer Hook

1. `src/hooks/useComputerPlayer.ts` を新規作成
2. `useEffect` でコンピュータ応手を監視・発火

### Step 5: UIコンポーネント

1. `src/components/ThinkingOverlay/ThinkingOverlay.tsx` を作成
2. `src/components/SideMenu/SideMenu.tsx`（HamburgerButton 含む）を作成
3. `src/App.tsx` を更新: `useComputerPlayer` 呼び出し、SideMenu/ThinkingOverlay を追加

## キーポイント

- コンピュータ対戦では `isComputerThinking === true` の間、プレイヤーの入力をブロックする（Reducer レベルと UI レベルの両方で対処）
- `RESET` アクションは `gameMode` を維持する（`createInitialGameState` をそのまま呼ぶのではなく、`gameMode` を引数で渡す）
- `selectComputerMove` は `getLegalMovesForPiece` / `getLegalDropPositions` を全後手駒・全持ち駒に対して呼び出して合法手を集約する

## ファイル変更マップ

| ファイル | 変更種別 | 概要 |
|---|---|---|
| `src/game/types.ts` | 変更 | `GameMode` 追加、`GameState` に `gameMode`/`isComputerThinking` 追加 |
| `src/game/gameEngine.ts` | 変更 | `createInitialGameState` と `processReset` を拡張 |
| `src/game/computerPlayer.ts` | 新規 | コンピュータAI（ランダム合法手選択） |
| `src/hooks/useGame.ts` | 変更 | 3つの新規アクション、`handleChangeMode`、`dispatch` 公開 |
| `src/hooks/useComputerPlayer.ts` | 新規 | コンピュータ応手トリガー hook |
| `src/components/SideMenu/SideMenu.tsx` | 新規 | サイドメニュー（ハンバーガーボタン含む） |
| `src/components/ThinkingOverlay/ThinkingOverlay.tsx` | 新規 | 思考中オーバーレイ |
| `src/App.tsx` | 変更 | 新コンポーネント統合、`useComputerPlayer` 呼び出し |
