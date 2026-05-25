# Implementation Plan: Claude コンテキスト最適化によるトークン削減

**Branch**: `007-optimize-claude-context` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/007-optimize-claude-context/spec.md`

## Summary

Claude Codeセッション起動時に自動読み込みされる CLAUDE.md と `.claude/rules/` 配下4ファイルの合計228行を、SpecKitマーカー保持・ルール本質維持の条件で20%以上（目標≤182行）に削減する。CLAUDE.mdは完了済みplan.md参照を削除してSpecKitマーカーのみにし、rulesファイルは4ファイル構成を維持したまま各ファイル内の冗長な目的文・具体例・プロジェクト固有サンプルを精査・削減する。

## Technical Context

**Language/Version**: Markdown（設定ファイル編集）  
**Primary Dependencies**: N/A  
**Storage**: `.claude/rules/*.md`, `CLAUDE.md`（ファイル編集）  
**Testing**: 手動検証（新セッション起動 + ファイル行数カウント）  
**Target Platform**: Claude Code  
**Project Type**: 設定・ツーリング最適化  
**Performance Goals**: 合計行数を現在の228行から20%以上削減（≤182行）  
**Constraints**: `.claude/rules/` のファイルパス・ファイル名は変更しない。各ルールの本質的な規約は保持する  
**Scale/Scope**: 5ファイル（CLAUDE.md + 4 rulesファイル）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution は未設定（テンプレート状態）のため適用ゲートなし。全フェーズ続行可。

## Project Structure

### Documentation (this feature)

```text
specs/007-optimize-claude-context/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output（各ファイルの削減詳細）
├── quickstart.md        # Phase 1 output（検証手順）
└── tasks.md             # Phase 2 output（/speckit-tasks コマンド）
```

### 変更対象ファイル

```text
CLAUDE.md                                   # SpecKitマーカーのみに整理
.claude/rules/
├── frontend-code-rule.md                   # 56行 → 削減対象
├── frontend-web-directory.md               # 70行 → 削減対象（最大削減余地）
├── frontend-web-react-rule.md              # 47行 → 削減対象
└── frontend-web-test-rule.md               # 50行 → 削減対象
```

**Structure Decision**: ファイル構成は変更なし。各ファイル内のコンテンツのみ編集する。
