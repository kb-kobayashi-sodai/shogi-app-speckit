# Implementation Plan: サイドメニュー＋対戦モード選択

**Branch**: `002-game-mode-select` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-game-mode-select/spec.md`

## Summary

既存の人間同士ホットシート将棋アプリに、画面左上のハンバーガーボタンで開閉するサイドメニューを追加し、「人間同士」と「コンピュータ対戦」の2モードを選択できるようにする。コンピュータは合法手からランダムに応手し、応手中は「思考中...」オーバーレイで入力をブロックする。既存のゲームエンジン・ルールはそのまま流用し、型定義・状態管理・Reactコンポーネントの3層に最小限の追加を行う。

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Vite 5, Vitest, React Testing Library  
**Storage**: N/A（インメモリのみ、永続化なし）  
**Testing**: Vitest（ゲームロジック・コンピュータAI単体テスト）+ React Testing Library（コンポーネントテスト）  
**Target Platform**: モダンWebブラウザ（Chrome/Firefox/Safari/Edge最新版）  
**Project Type**: シングルページWebアプリ（クライアントサイドのみ）  
**Performance Goals**: コンピュータ応手 < 5秒（ランダム選択のため実際は < 100ms）  
**Constraints**: 外部ライブラリ追加なし・バックエンド不要・オフライン動作  
**Scale/Scope**: 既存アプリへの機能追加（新規ファイル4件・変更ファイル3件）

## Constitution Check

*構成ファイルはデフォルトテンプレート状態のため、プロジェクト固有のゲートは未設定。以下の一般原則を適用する。*

| Gate | Status | Notes |
|------|--------|-------|
| シンプルさ（YAGNI） | PASS | ランダムAI・外部ライブラリ追加なし・既存エンジン流用 |
| テスタビリティ | PASS | `computerPlayer.ts` は純粋関数・単体テスト可能 |
| 責務分離 | PASS | AIロジック（game/）とUI（components/）を分離維持 |
| 既存機能への影響 | PASS | `RESET` の `gameMode` 保持以外は後方互換 |

## Project Structure

### Documentation (this feature)

```text
specs/002-game-mode-select/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── components.md    # 新規・変更コンポーネント契約
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (変更対象ファイル)

```text
src/
├── game/
│   ├── types.ts              # 変更: GameMode型追加、GameState拡張
│   ├── gameEngine.ts         # 変更: createInitialGameState/processReset拡張
│   └── computerPlayer.ts     # 新規: ランダム合法手AI
├── components/
│   ├── SideMenu/
│   │   └── SideMenu.tsx      # 新規: ハンバーガーボタン+サイドメニュー
│   └── ThinkingOverlay/
│       └── ThinkingOverlay.tsx  # 新規: 思考中オーバーレイ
├── hooks/
│   ├── useGame.ts            # 変更: 新アクション追加、dispatch公開
│   └── useComputerPlayer.ts  # 新規: コンピュータ応手トリガーhook
└── App.tsx                   # 変更: 新コンポーネント統合

tests/
└── game/
    └── computerPlayer.test.ts  # 新規: AIロジックテスト
```

**Structure Decision**: 既存のシングルプロジェクト構成を維持。`game/` 層への最小追加とコンポーネントの新規作成のみで実現する。

## Complexity Tracking

*Constitution違反なし。追加記載不要。*
