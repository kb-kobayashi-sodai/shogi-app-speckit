# Feature Specification: Claude コンテキスト最適化によるトークン削減

**Feature Branch**: `007-optimize-claude-context`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "トークン使用量を減らすためCLAUDE.mdを編集して　.claude/rules/ ファイルの整理 して"

## Clarifications

### Session 2026-05-22

- Q: CLAUDE.mdから完了済みplan.md参照を削除した後、何を入れるか → A: SpecKitマーカーのみ残し、内容は空にする
- Q: .claude/rules/ の整理アプローチは何か → A: 4ファイル構成を維持したまま、各ファイルの冗長な記述・コメント・具体例を削減する

## User Scenarios & Testing *(mandatory)*

### User Story 1 - CLAUDE.md から完了済みフィーチャー参照を削除 (Priority: P1)

開発者が新しいセッションを開始するとき、完了済みフィーチャー（006-captured-pieces-right-layout）のplan.mdへの参照が毎回自動的に読み込まれてしまい、無駄なトークンを消費している。CLAUDE.mdをSpecKitマーカーのみに整理し、不要なコンテキスト読み込みを排除する。

**Why this priority**: 毎回のセッション起動時に無駄なコンテキストが読み込まれており、即効性が最も高い改善。

**Independent Test**: CLAUDE.mdを編集後、新セッションを開始したとき不要なplan.mdが読み込まれないことを確認できる。

**Acceptance Scenarios**:

1. **Given** CLAUDE.mdが完了済みフィーチャーのplan.md参照を含む状態、**When** SpecKitマーカー以外の内容を全て削除する、**Then** 次セッションからplan.mdが読み込まれなくなる
2. **Given** CLAUDE.mdを編集後、**When** 内容を確認する、**Then** SpecKitマーカーのみが残り、他の記述は一切ない

---

### User Story 2 - .claude/rules/ ファイルの統合・整理 (Priority: P2)

4つのルールファイル（frontend-code-rule.md、frontend-web-directory.md、frontend-web-react-rule.md、frontend-web-test-rule.md）が毎セッション全て読み込まれている。内容を精査し、重複を排除・統合することでトークン使用量を削減する。

**Why this priority**: 4ファイルの累計コンテキストが大きく、効率化の余地がある。

**Independent Test**: ファイル整理後、ルールの内容が失われていないことをファイル読み込みで確認できる。

**Acceptance Scenarios**:

1. **Given** 4つのルールファイルが存在する状態、**When** 重複・冗長な内容を除去・統合する、**Then** ルールの網羅性を維持しながらファイルの総行数が削減される
2. **Given** 整理後のルールファイル、**When** 開発作業を行う、**Then** 必要なコーディング規約・ディレクトリ規則が引き続き参照できる

---

### Edge Cases

- ルールファイルを統合した場合、既存の `.claude/rules/` パス参照が壊れないか？
- ファイルを削除した場合、それを参照している設定ファイルが存在しないか？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CLAUDE.md MUST SpecKitマーカー（`<!-- SPECKIT START -->` / `<!-- SPECKIT END -->`）のみを残し、それ以外の内容を全て削除する
- **FR-002**: CLAUDE.md MUST plan.mdへの参照を含まない状態にする
- **FR-003**: .claude/rules/ 以下の4ファイル（frontend-code-rule.md、frontend-web-directory.md、frontend-web-react-rule.md、frontend-web-test-rule.md）の構成はそのまま維持し、各ファイル内の冗長な記述・コメント・具体例を削減する MUST
- **FR-004**: 整理後もコーディングルール・ディレクトリ規則・Reactルール・テストルールの本質的な内容は保持される MUST
- **FR-005**: 各ファイルで削除した箇所とその理由を整理作業中に記録する MUST

### Key Entities

- **CLAUDE.md**: Claude Codeが毎セッション自動で読み込むプロジェクト設定ファイル
- **.claude/rules/*.md**: 各セッションで読み込まれるコーディングルールファイル群
- **specs/NNN-feature/plan.md**: 特定フィーチャーの実装計画（完了後は参照不要）

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: CLAUDE.mdとrules/ファイル群の合計行数が整理前と比べて20%以上削減される
- **SC-002**: コーディングルール・ディレクトリ規則・テスト規則の主要項目が整理後も全て確認できる
- **SC-003**: 整理後に新セッションを開始したとき、CLAUDE.mdからplan.mdが読み込まれない

## Assumptions

- 006-captured-pieces-right-layout フィーチャーはすでにmainブランチにマージ済みであり、plan.md参照は不要
- .claude/rules/ 以下の4ファイルは現在すべて毎セッション読み込まれている
- ルールファイルを削除するのではなく、内容を削減・整理する（ファイル自体は維持する）
- .claude/rules/ の4ファイル構成は変更しない（統合・削除は行わない）
