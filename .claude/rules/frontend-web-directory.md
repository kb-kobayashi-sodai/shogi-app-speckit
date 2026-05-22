# ディレクトリ・ファイル構造ルール

## 目的

このプロジェクト（将棋ゲーム）のファイル・ディレクトリ構成を一貫させ、コードの発見性と保守性を高める。

## ルール一覧

### ディレクトリ構成

- `src/game/` — ゲームロジック・型定義・定数（Reactに依存しない純粋TypeScript）
- `src/components/` — UIコンポーネント（表示に責任を持つReactコンポーネント）
- `src/hooks/` — カスタムフック（状態ロジックの抽出）

### ファイル命名規則

- **Reactコンポーネント**: PascalCase のサブディレクトリ + 同名ファイル（例: `src/components/Board/Board.tsx`, `src/components/GameStatus/GameStatus.tsx`）
- **カスタムフック**: camelCase、`use` プレフィックス必須（例: `useGame.ts`, `useComputerPlayer.ts`）
- **ゲームロジック**: camelCase（例: `gameEngine.ts`, `legalMoves.ts`, `computerPlayer.ts`）
- **型定義**: camelCase（例: `types.ts`）
- **定数**: camelCase（例: `constants.ts`）

### ゲームロジック（`src/game/`）

- `types.ts` — ゲーム全体の型定義・インターフェース
- `constants.ts` — 定数・設定値（`BOARD_SIZE`, `INITIAL_BOARD` 等のマジックナンバーの排除）
- `gameEngine.ts` — ゲーム状態の生成・更新ロジック
- `legalMoves.ts` — 合法手計算
- `computerPlayer.ts` — AI・コンピュータプレイヤーロジック
- その他ロジックファイルはすべてこのディレクトリに配置する

### コンポーネント（`src/components/`）

- 各コンポーネントは `src/components/<ComponentName>/` のサブディレクトリに配置する
- ディレクトリ名とファイル名は同じPascalCaseにする（例: `Board/Board.tsx`）
- コンポーネント固有のスタイルが必要な場合は同ディレクトリ内に配置する

### 禁止事項

- `src/` 直下にコンポーネントやロジックファイルを直接配置しない（サブディレクトリに分類する）
- `src/game/` 以外の場所にゲームロジックを置かない
- コンポーネントをサブディレクトリなしで `src/components/` 直下に配置しない

### このプロジェクトの実際の構造（参考）

```
src/
├── game/
│   ├── types.ts          # 型定義（Board, Piece, GameState, Move 等）
│   ├── constants.ts      # 定数（BOARD_SIZE, INITIAL_BOARD, ENEMY_ZONE_ROWS）
│   ├── gameEngine.ts     # ゲーム状態の生成・更新
│   ├── legalMoves.ts     # 合法手計算
│   ├── computerPlayer.ts # ランダムAI
│   ├── pieces.ts         # 駒の定義
│   └── sennichite.ts     # 千日手判定
├── components/
│   ├── Board/            # Board.tsx, Cell.tsx, Piece.tsx
│   ├── CapturedPieces/   # CapturedPieces.tsx
│   ├── GameControls/     # GameControls.tsx
│   ├── GameStatus/       # GameStatus.tsx
│   ├── PromotionDialog/  # PromotionDialog.tsx
│   ├── SideMenu/         # SideMenu.tsx
│   └── ThinkingOverlay/  # ThinkingOverlay.tsx
├── hooks/
│   ├── useGame.ts        # ゲーム状態管理・アクションディスパッチ
│   └── useComputerPlayer.ts # コンピュータ応手トリガー
├── App.tsx
├── main.tsx
└── index.css
```
