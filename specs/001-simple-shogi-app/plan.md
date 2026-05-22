# Implementation Plan: シンプル将棋アプリ

**Branch**: `001-simple-shogi-app` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-simple-shogi-app/spec.md`

## Summary

同一デバイスで2人がホットシート方式で対局できるWebブラウザ向け将棋アプリ。React + Vite + TypeScript で構築し、将棋のゲームロジックをReactから分離した純粋TypeScriptモジュールとして実装する。UIはクリック2回方式で操作し、全標準将棋ルール（合法手判定・王手・詰み・千日手・持ち駒打ち・成り）を適用する。

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Vite 5, Vitest, React Testing Library  
**Storage**: N/A（インメモリのみ、永続化なし）  
**Testing**: Vitest（ゲームロジック単体テスト）+ React Testing Library（コンポーネントテスト）  
**Target Platform**: モダンWebブラウザ（Chrome/Firefox/Safari/Edge最新版）  
**Project Type**: シングルページWebアプリ（クライアントサイドのみ）  
**Performance Goals**: 合法手ハイライト表示 < 100ms、詰み検出 < 3秒  
**Constraints**: バックエンド不要・オフライン動作・インストール不要  
**Scale/Scope**: シングルページアプリ、同時利用1セッション

## Constitution Check

*構成ファイルはデフォルトテンプレート状態のため、プロジェクト固有のゲートは未設定。以下の一般原則を適用する。*

| Gate | Status | Notes |
|------|--------|-------|
| シンプルさ（YAGNI） | PASS | AIなし・オンラインなし・永続化なし |
| テスタビリティ | PASS | ゲームエンジンをReactから完全分離 |
| 責務分離 | PASS | game/（純TS）と components/（React）を分離 |
| パフォーマンス目標 | PASS | クライアントサイドのみで十分達成可能 |

## Project Structure

### Documentation (this feature)

```text
specs/001-simple-shogi-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── components.md    # UIコンポーネント契約
│   └── game-engine.md   # ゲームエンジンAPI契約
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── game/
│   ├── types.ts           # 全型定義（Piece, Board, GameState, Move）
│   ├── constants.ts       # 初期盤面配置・定数
│   ├── pieces.ts          # 駒ごとの移動ルール定義
│   ├── legalMoves.ts      # 合法手計算（盤面移動・打ち）
│   ├── gameEngine.ts      # コアゲームロジック（手を適用・王手検出・詰み検出）
│   └── sennichite.ts      # 千日手検出（局面ハッシュ履歴管理）
├── components/
│   ├── Board/
│   │   ├── Board.tsx      # 9×9将棋盤
│   │   ├── Cell.tsx       # 個別マス
│   │   └── Piece.tsx      # 駒表示
│   ├── CapturedPieces/
│   │   └── CapturedPieces.tsx  # 持ち駒エリア（先手・後手）
│   ├── GameStatus/
│   │   └── GameStatus.tsx      # 手番表示・王手通知・勝敗表示
│   ├── GameControls/
│   │   └── GameControls.tsx    # 投了・最初からボタン
│   └── PromotionDialog/
│       └── PromotionDialog.tsx # 成り・不成り選択ダイアログ
├── hooks/
│   └── useGame.ts         # useReducerベースのゲーム状態管理
├── App.tsx
└── main.tsx

tests/
├── game/
│   ├── legalMoves.test.ts
│   ├── gameEngine.test.ts
│   └── sennichite.test.ts
└── components/
    └── Board.test.tsx
```

**Structure Decision**: シングルプロジェクト構成。ゲームロジック（`src/game/`）をReactコンポーネントから完全分離し、純粋なTypeScript関数として実装することで単体テストを容易にする。状態管理はuseReducerで行い、外部状態管理ライブラリは使用しない。

## Complexity Tracking

*Constitution違反なし。追加記載不要。*
