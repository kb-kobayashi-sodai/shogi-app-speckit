# Data Model: サイドメニュー＋対戦モード選択

**Branch**: `002-game-mode-select` | **Date**: 2026-05-22

## 既存型への追加

### `GameMode` (新規)

```typescript
// src/game/types.ts に追加
export type GameMode = 'human' | 'computer'
```

| 値 | 意味 |
|---|---|
| `'human'` | 人間同士（ホットシート）。現在の既定動作。 |
| `'computer'` | プレイヤー（先手）vs コンピュータ（後手）。 |

---

### `GameState` 拡張 (既存型への追加フィールド)

```typescript
// src/game/types.ts の GameState に追加
export interface GameState {
  // ...既存フィールド...
  gameMode: GameMode          // 対戦モード（デフォルト: 'human'）
  isComputerThinking: boolean // コンピュータが応手計算中かどうか
}
```

**制約**:
- `gameMode === 'computer'` かつ `currentPlayer === 'gote'` のとき、プレイヤー操作はブロックされる
- `isComputerThinking === true` のとき、盤面全体に「思考中...」オーバーレイを表示する
- `RESET` アクション時、`gameMode` は現在の値を維持する（`boardHistory` 等は初期化）
- `CHANGE_MODE` アクション時、`gameMode` を更新し盤面を初期化する

---

## 状態遷移

### 対局モード変更フロー

```
[対局中] → CHANGE_MODE → [確認ダイアログ表示]
                              ↓ 了承
                         [新モードで盤面初期化]
                              ↓ 拒否
                         [対局継続（モード変更なし）]

[初期状態 / 対局終了] → CHANGE_MODE → [新モードで盤面初期化（確認不要）]
```

### コンピュータ応手フロー（gameMode === 'computer'）

```
[先手が指す] → processMove() → currentPlayer = 'gote'
    → isComputerThinking = true（SET_COMPUTER_THINKING アクション）
    → useEffect 発火（setTimeout 0ms）
    → selectComputerMove() でランダム合法手取得
    → COMPUTER_MOVE アクション → processMove() → currentPlayer = 'sente'
    → isComputerThinking = false
```

### `isComputerThinking` の状態制約

| 条件 | isComputerThinking |
|---|---|
| gameMode === 'human' | 常に false |
| gameMode === 'computer' かつ currentPlayer === 'sente' | false |
| gameMode === 'computer' かつ currentPlayer === 'gote' かつ計算前 | false → true |
| gameMode === 'computer' かつ応手計算完了後 | true → false |
| 対局終了（checkmate / resigned / draw）| false |

---

## コンポーネント状態

### `SideMenuState` (ローカル状態、App.tsx 管理)

```typescript
// App.tsx の useState で管理（GameState には含まない）
const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
```

**理由**: サイドメニューの開閉状態はUI表示のみに関係し、ゲームロジックと無関係のため `GameState` に含めない。

---

## 新規エンティティ

### `ComputerPlayer` モジュール (`src/game/computerPlayer.ts`)

```typescript
// 公開API
export function selectComputerMove(state: GameState): Move | null
```

**入力**: 現在の `GameState`（`currentPlayer === 'gote'` を前提）  
**出力**: ランダムに選択した合法手 `Move`、合法手がなければ `null`（詰み）

**内部ロジック**:
1. 盤上の全後手駒の合法移動手を収集（`getLegalMovesForPiece` を使用）
2. 持ち駒の全打ち手を収集（`getLegalDropPositions` を使用）
3. 全合法手リストからランダムに1手選択して返す
4. 成り・不成りの選択：成れる場合は常に成りを選択（シンプル化のため）

---

## Reducer アクション追加

```typescript
type GameAction =
  | { type: 'CELL_CLICK'; payload: Position }
  | { type: 'CAPTURED_PIECE_CLICK'; payload: CapturablePieceType }
  | { type: 'PROMOTION_CHOICE'; payload: boolean }
  | { type: 'RESIGN' }
  | { type: 'RESET' }
  // 以下、新規追加
  | { type: 'CHANGE_MODE'; payload: GameMode }
  | { type: 'COMPUTER_MOVE'; payload: Move }
  | { type: 'SET_COMPUTER_THINKING'; payload: boolean }
```

| アクション | 処理 |
|---|---|
| `CHANGE_MODE` | `gameMode` 更新 + 盤面初期化（`isComputerThinking: false`） |
| `COMPUTER_MOVE` | `processMove()` + `isComputerThinking: false` |
| `SET_COMPUTER_THINKING` | `isComputerThinking` を指定値にセット |
