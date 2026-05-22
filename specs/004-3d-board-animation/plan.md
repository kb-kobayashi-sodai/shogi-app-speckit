# Implementation Plan: 将棋盤・駒の立体表示とリアルアニメーション

**Branch**: `004-3d-board-animation` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/004-3d-board-animation/spec.md`

## Summary

将棋盤と駒を CSS 3D transforms で斜め俯瞰（約70〜80度）に立体表示し、駒の移動・取り・成りに Web Animations API を使った放物線アニメーションを追加する。新規ライブラリは導入せず、アニメーション状態は React reducer のキューで管理して複数アニメーションを順番に再生する。ゲームロジック（`gameEngine.ts` / `legalMoves.ts` 等）は変更しない。

## Technical Context

**Language/Version**: TypeScript 5.5.3 / React 18.3.1  
**Primary Dependencies**: React, Vite — 新規依存ライブラリなし（CSS 3D + Web Animations API のみ）  
**Storage**: N/A（クライアントサイドゲーム、状態は React state のみ）  
**Testing**: Vitest + @testing-library/react  
**Target Platform**: ブラウザ（Chrome / Firefox / Safari 最新版）  
**Project Type**: Web アプリ（フロントエンド単体、Vite + React）  
**Performance Goals**: アニメーション 60fps、駒移動 0.3〜0.6 秒  
**Constraints**: 新規依存ライブラリなし、既存ゲームロジックファイルを変更しない  
**Scale/Scope**: シングルプレイヤー将棋ゲーム（対人・対コンピュータ）

## Constitution Check

プロジェクトにコンスティテューションは定義されていない。以下の自律的なゲートを適用する。

| Gate | Status | 備考 |
|---|---|---|
| 既存テストを壊さない | ✅ Pass | ゲームロジックは変更しない |
| 新規依存ライブラリなし | ✅ Pass | CSS + Web Animations API = ブラウザ標準 |
| ゲームロジック不変 | ✅ Pass | `gameEngine.ts`, `legalMoves.ts` 等は読み取りのみ |
| アニメーション状態の管理 | ✅ Pass | React state で管理（グローバル変数・直接DOM操作なし） |

## Project Structure

### Documentation (this feature)

```text
specs/004-3d-board-animation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── components.md    # Phase 1 output
│   └── hooks.md         # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code Changes

```text
src/
├── game/
│   └── types.ts                        # PendingAnimation, AnimationTarget 追加; GameState 拡張
├── components/
│   ├── Board/
│   │   ├── Board.tsx                   # perspective CSS, boardRef, AnimatingPiece 描画
│   │   ├── Cell.tsx                    # 変更なし（スタイルのみ）
│   │   ├── Piece.tsx                   # 五角形 clip-path, グラデーション, isAnimating prop
│   │   └── AnimatingPiece.tsx          # [新規] 移動中駒オーバーレイ
│   └── CapturedPieces/
│       └── CapturedPieces.tsx          # capturedRef 追加（座標計算用）
├── hooks/
│   ├── useGame.ts                      # QUEUE_ANIMATION, ANIMATION_START, ANIMATION_COMPLETE 追加
│   └── useAnimation.ts                 # [新規] アニメーションキュー制御フック
├── App.tsx                             # useAnimation, boardRef, capturedRef 追加
└── index.css                           # 3D board/piece スタイル, @keyframes 追加
```

**変更しないファイル**:
```text
src/game/gameEngine.ts
src/game/legalMoves.ts
src/game/computerPlayer.ts
src/game/pieces.ts
src/game/sennichite.ts
src/game/constants.ts
src/hooks/useComputerPlayer.ts
src/components/GameStatus/
src/components/GameControls/
src/components/PromotionDialog/
src/components/SideMenu/
src/components/ThinkingOverlay/
```

## 実装フェーズ概要

### Phase A: CSS 3D ビジュアル（ロジック変更なし）
将棋盤の perspective 傾き、駒の五角形形状、木目テクスチャ、陰影をスタイルのみで実装する。ゲームロジックは一切触れない。この段階で既存テストがすべてパスすることを確認する。

### Phase B: アニメーション状態機械
`types.ts` の型拡張、`useGame` reducer の変更、`useAnimation` フックの新規作成を行う。`AnimatingPiece` コンポーネントも作成する。

### Phase C: 移動アニメーション
人間の指し手・コンピュータの応手の移動アニメーションを繋ぎ込む。`QUEUE_ANIMATION` → `ANIMATION_START` → `ANIMATION_COMPLETE` のフローを動作確認する。

### Phase D: 取り・持ち駒打ちアニメーション
取られた駒が持ち駒エリアへ飛んでいくアニメーション、持ち駒打ちのアニメーションを実装する。DOMRect 座標計算が中心。

### Phase E: 成りアニメーション
成り選択後の駒フリップアニメーション（`rotateY` 180deg）を追加する。

### Phase F: テストと仕上げ
`prefers-reduced-motion` 対応確認、アニメーション中の入力ブロック確認、既存テスト全通過確認。
