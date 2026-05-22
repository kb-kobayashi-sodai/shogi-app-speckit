# UI Component Contracts: サイドメニュー＋対戦モード選択

**Branch**: `002-game-mode-select` | **Date**: 2026-05-22

このドキュメントは `001-simple-shogi-app` のコンポーネント契約を引き継ぎ、本機能で追加・変更されるコントラクトのみを記載する。

---

## 変更: App（ルートコンポーネント）

```typescript
// src/App.tsx（変更）
// サイドメニューの開閉状態をローカルで管理
// useComputerPlayer hook を追加で呼び出す
```

**追加責務**:
- `isSideMenuOpen: boolean` を `useState` でローカル管理
- `useComputerPlayer(state, dispatch)` を呼び出してコンピュータ応手を制御
- `SideMenu`, `ThinkingOverlay` を条件付きでレンダリング

---

## 変更: useGame Hook

```typescript
// src/hooks/useGame.ts（変更）

interface UseGameReturn {
  state: GameState;                          // gameMode, isComputerThinking を含む拡張版
  dispatch: React.Dispatch<GameAction>;      // 追加: App に dispatch を公開
  handleCellClick: (position: Position) => void;
  handleCapturedPieceClick: (pieceType: CapturablePieceType) => void;
  handlePromotionChoice: (promote: boolean) => void;
  handleResign: () => void;
  handleReset: () => void;
  handleChangeMode: (mode: GameMode) => void;  // 追加
}
```

**追加アクション**:
- `CHANGE_MODE`: `gameMode` を更新し盤面を初期化（`isComputerThinking: false`）
- `COMPUTER_MOVE`: コンピュータの手を適用し `isComputerThinking: false`
- `SET_COMPUTER_THINKING`: `isComputerThinking` を更新

**`RESET` アクションの変更**:
- 既存: 完全な初期状態に戻す
- 変更後: `gameMode` を現在の値で維持して盤面のみ初期化する

---

## 新規: SideMenu

```typescript
// src/components/SideMenu/SideMenu.tsx

interface SideMenuProps {
  isOpen: boolean;
  currentMode: GameMode;
  onModeSelect: (mode: GameMode) => void;  // 確認ダイアログの表示も含む
  onClose: () => void;
}
```

**表示仕様**:
- `isOpen === true` のとき、画面左端からスライドインするオーバーレイパネル
- 背景（パネル外）: 半透明の暗いオーバーレイ。クリックで閉じる
- メニュー項目:
  - 「対戦モード」セクションヘッダー
  - 「人間同士」ボタン（`gameMode === 'human'` のとき強調/チェックマーク）
  - 「コンピュータ対戦」ボタン（`gameMode === 'computer'` のとき強調/チェックマーク）
- モード変更時、対局中であれば確認ダイアログを表示する（`window.confirm` またはインライン確認UI）

---

## 新規: HamburgerButton

```typescript
// src/components/SideMenu/HamburgerButton.tsx（SideMenu.tsx に内包してもよい）

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}
```

**表示仕様**:
- 画面左上に `position: fixed` で常時表示（z-index はサイドメニューより低く、通常UIより高く）
- 三本線アイコン（≡）。メニューが開いているときは閉じる（✕）アイコンに変化させてもよい
- 対局画面やその他UIの上に重ならない位置に配置（padding 調整）

---

## 新規: ThinkingOverlay

```typescript
// src/components/ThinkingOverlay/ThinkingOverlay.tsx

interface ThinkingOverlayProps {
  isVisible: boolean;
}
```

**表示仕様**:
- `isVisible === true` のとき、盤面全体の上に `position: absolute` / `position: fixed` でオーバーレイ
- 半透明（rgba(0,0,0,0.35) 程度）の暗い背景
- 中央に「思考中...」テキスト（白文字、読みやすいフォントサイズ）
- `isVisible === false` のとき非表示（`display: none` または条件付きレンダリング）

---

## 新規: useComputerPlayer Hook

```typescript
// src/hooks/useComputerPlayer.ts

export function useComputerPlayer(
  state: GameState,
  dispatch: React.Dispatch<GameAction>
): void
```

**責務**:
- `useEffect` で以下の条件を監視:
  `state.gameMode === 'computer' && state.currentPlayer === 'gote' && !state.isComputerThinking && state.status === 'playing' || state.status === 'check'`
- 条件成立時:
  1. `dispatch({ type: 'SET_COMPUTER_THINKING', payload: true })`
  2. `setTimeout(() => { ... }, 0)` で非同期に実行（UIに「思考中...」を先に描画させる）
  3. `selectComputerMove(state)` で手を選択
  4. 手があれば `dispatch({ type: 'COMPUTER_MOVE', payload: move })`
  5. 手がなければ（詰み） `dispatch({ type: 'RESIGN' })` でコンピュータが投了
- `isComputerThinking` が既に `true` のとき再発火しない

---

## 新規: computerPlayer モジュール

```typescript
// src/game/computerPlayer.ts

export function selectComputerMove(state: GameState): Move | null
```

**責務**:
- `state.currentPlayer === 'gote'` の全合法手（盤上移動 + 打ち手）を列挙
- 合法手があればランダムに1手選択して返す
- 合法手がなければ `null` を返す（詰み）
- 成り判定: 成れる手の場合は `promoted: true` を設定する（常に成り）

**依存関係**:
- `getLegalMovesForPiece` (既存)
- `getLegalDropPositions` (既存)
- `canPromote` のような成り判定ロジック（`legalMoves.ts` または `gameEngine.ts` から流用）
