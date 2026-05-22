# Data Model: シンプル将棋アプリ

**Branch**: `001-simple-shogi-app` | **Date**: 2026-05-22

## Core Types (`src/game/types.ts`)

### Player（プレイヤー）

```typescript
type Player = 'sente' | 'gote';  // 先手 | 後手
```

---

### PieceType（駒種）

```typescript
type PieceType =
  // 通常駒
  | 'fu'    // 歩兵
  | 'kyo'   // 香車
  | 'kei'   // 桂馬
  | 'gin'   // 銀将
  | 'kin'   // 金将
  | 'kaku'  // 角行
  | 'hi'    // 飛車
  | 'ou'    // 王将 / 玉将
  // 成駒
  | 'tofu'       // と金（成歩）
  | 'narikyo'    // 成香
  | 'narikei'    // 成桂
  | 'narigin'    // 成銀
  | 'uma'        // 龍馬（成角）
  | 'ryu';       // 龍王（成飛）
```

---

### Piece（駒）

```typescript
interface Piece {
  type: PieceType;
  owner: Player;
}
```

---

### Position（座標）

```typescript
interface Position {
  row: number;  // 0-8（0が上=9段目、8が下=1段目）
  col: number;  // 0-8（0が右=9筋、8が左=1筋）
}
```

*Note: 将棋の座標系（9一が右上）をゼロベース配列インデックスにマッピング。表示時に変換する。*

---

### Board（盤面）

```typescript
type Board = (Piece | null)[][];  // [row][col], 9×9
```

---

### CapturedPieces（持ち駒）

成駒は取ると元の駒種に戻るため、持ち駒には通常駒種のみ存在する。

```typescript
type CapturablePieceType = Exclude<PieceType, 'ou' | 'tofu' | 'narikyo' | 'narikei' | 'narigin' | 'uma' | 'ryu'>;
// = 'fu' | 'kyo' | 'kei' | 'gin' | 'kin' | 'kaku' | 'hi'

type CapturedPieces = Record<CapturablePieceType, number>;

interface AllCapturedPieces {
  sente: CapturedPieces;
  gote: CapturedPieces;
}
```

---

### Move（指し手）

```typescript
type Move =
  | {
      type: 'move';
      from: Position;
      to: Position;
      piece: Piece;
      captured?: Piece;         // 取った駒（成駒は元の駒種に変換済み）
      promoted: boolean;        // 成りを選択したか
    }
  | {
      type: 'drop';
      to: Position;
      pieceType: CapturablePieceType;
      player: Player;
    };
```

---

### GameStatus（対局状態）

```typescript
type GameStatus =
  | 'playing'    // 通常対局中
  | 'check'      // 王手がかかっている
  | 'checkmate'  // 詰み（対局終了）
  | 'draw'       // 引き分け（千日手）
  | 'resigned';  // 投了（対局終了）
```

---

### PendingPromotion（成り選択待ち）

```typescript
interface PendingPromotion {
  from: Position;
  to: Position;
  piece: Piece;  // 移動前の駒
}
```

---

### GameState（ゲーム全体状態）

```typescript
interface GameState {
  board: Board;
  capturedPieces: AllCapturedPieces;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;                  // checkmate/resignedの場合のみ設定
  pendingPromotion: PendingPromotion | null;  // 成り選択ダイアログ表示中
  boardHistory: string[];                 // 千日手検出用の局面ハッシュ列
  selectedPosition: Position | null;     // UIで選択中の駒またはマス（クリック1回目）
  legalMoves: Position[];                // 選択中の駒の合法手マス一覧
}
```

---

## State Transitions（状態遷移）

```
[初期状態]
  → 対局開始 → status: 'playing'

[playing / check]
  → 駒選択（1回目クリック）    → selectedPosition, legalMoves 更新
  → 移動先選択（2回目クリック）→
      成り選択が必要: pendingPromotion 設定
      成り選択不要:  手を適用 → 王手検出 → 詰み検出 → 千日手検出
  → 持ち駒選択 → legalMoves 更新
  → 投了      → status: 'resigned', winner 設定

[pendingPromotion != null]
  → 成り選択   → pendingPromotion クリア → 手を適用 → ...
  → 不成り選択 → pendingPromotion クリア → 手を適用 → ...

[checkmate / resigned / draw]
  → 最初からリセット → 全状態を初期値に戻す
```

---

## BoardHash（局面ハッシュ）

千日手検出のために盤面を文字列化する仕様:

```
<player>|<board_serialized>|<captured_sente>|<captured_gote>

board_serialized: 各マスをカンマ区切り（空き="."、駒="owner:type"）、行を"|"で区切り
例: "sente:fu,.,..." 

captured_serialized: "fu:2,kyo:0,..." （全駒種の枚数）
```

同一ハッシュが4回出現したとき千日手を宣言する。

---

## Initial Board Layout（初期配置）

先手（下側、row 6-8）と後手（上側、row 0-2）:

| Row | 配置 |
|-----|------|
| 0   | 後手: 香・桂・銀・金・玉・金・銀・桂・香 |
| 1   | 後手: _・飛・_・_・_・_・_・角・_ |
| 2   | 後手: 歩×9 |
| 3-5 | 空き |
| 6   | 先手: 歩×9 |
| 7   | 先手: _・角・_・_・_・_・_・飛・_ |
| 8   | 先手: 香・桂・銀・金・王・金・銀・桂・香 |
