# Research: サイドメニュー＋対戦モード選択

**Branch**: `002-game-mode-select` | **Date**: 2026-05-22

## 技術スタック確認

既存コードベースは `React 18 + TypeScript + Vite + useReducer` で構成済み。本機能の追加に際して新規ライブラリ導入は不要。

---

## Decision 1: コンピュータAIの実装方式

**Decision**: `getLegalMoves` の結果からランダムに1手を選択する純粋関数として実装する

**Rationale**: 仕様（Assumptions）で「合法手の中からランダムに選択する最低限のレベル」と明示されている。既存の `getLegalMovesForPiece` / `getLegalDropPositions` をそのまま流用できるため、新規ゲームロジックの追加は最小限で済む。

**Alternatives considered**:
- ミニマックス探索: 実装コストが高く仕様外
- 既存将棋エンジン（Stockfish等）外部統合: バンドルサイズ肥大・複雑性増大、仕様外

---

## Decision 2: コンピュータの応手トリガー方式

**Decision**: `useEffect` フックで `currentPlayer === 'gote' && gameMode === 'computer'` を監視し、`setTimeout` で非同期に応手を発火する

**Rationale**: 
- `useReducer` ベースの既存アーキテクチャを破壊しない
- Reducer を純粋関数のままに保てる（副作用なし）
- `setTimeout(0)` でUIレンダリングを先行させ「思考中...」オーバーレイを表示してからAI計算を実行できる

**Alternatives considered**:
- Reducer 内での同期計算: UIが応手前に更新されず「思考中...」が表示できない
- Web Worker: 実装コスト過剰。ランダム選択は同期で十分高速

---

## Decision 3: 対戦モード状態の管理場所

**Decision**: `GameState` に `gameMode: GameMode` と `isComputerThinking: boolean` を追加し、既存の `useGame` reducer で管理する

**Rationale**:
- 「最初から」リセット時にモードを維持する（Clarification Q3の回答）ため、`GameState` 外で管理するより `CHANGE_MODE` アクションで一元管理するほうが整合性を保ちやすい
- `RESET` アクション時に `gameMode` を維持することが自然に実現できる

**Alternatives considered**:
- App.tsx の `useState` で管理: リセット時のモード保持とコンピュータ思考状態の連携が複雑になる

---

## Decision 4: サイドメニューのオーバーレイ実装

**Decision**: CSS の `position: fixed` + `z-index` によるオーバーレイ方式。メニュー外クリックは背景オーバーレイ（半透明）のクリックで閉じる

**Rationale**: 将棋盤のレイアウトを変更せずにオーバーレイ表示できる。既存の `PromotionDialog` が同様のパターンを採用しており、一貫性がある。

---

## 技術スタック変更なし

| 項目 | 現状 | 変更 |
|------|------|------|
| 言語 | TypeScript 5.x | なし |
| フレームワーク | React 18 | なし |
| ビルド | Vite 5 | なし |
| テスト | Vitest + RTL | なし |
| 状態管理 | useReducer | 既存拡張のみ |
| 外部依存 | なし | なし（追加ゼロ） |
