# Feature Specification: レビュー・コーディングスキルの追加

**Feature Branch**: `003-review-coding-skills`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "C:\Users\BND-NP2010-03\Desktop\App\SpecKit\othello-app-speckitのアプリ同様にレビューとコーディングのスキル作って"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - コーディングルールに沿った実装 (Priority: P1)

開発者が新機能を実装する際に `/frontend-web-coding` スキルを呼び出すと、Claude がプロジェクト固有のコーディングルール（ディレクトリ構成・型安全・React規約）を確認してから実装を開始する。

**Why this priority**: コーディングスキルはレビューより先に使われるため最優先。ルールを事前に読み込むことで、指摘されるまでもなくルール違反のないコードを生成できる。

**Independent Test**: `/frontend-web-coding` を呼び出した後にコンポーネント追加を依頼し、生成されたコードが `any` 型禁止・PascalCase・関数コンポーネントのみ等の規約を満たしていることを確認する。

**Acceptance Scenarios**:

1. **Given** 新しいコンポーネントの追加を依頼された状態で、**When** `/frontend-web-coding` を呼び出す、**Then** Claude はルールファイルを読み込み「コーディングルール確認済み（計N項目）。重点：...」と提示してから実装を開始する
2. **Given** コーディングスキルがアクティブな状態で、**When** 新規ファイルを生成する、**Then** ファイルは `src/components/`, `src/hooks/`, `src/game/` 等の適切なディレクトリに配置され、`any` 型・マジックナンバーを使用しない

---

### User Story 2 - ルールに基づくコードレビュー (Priority: P2)

開発者が実装済みコードのレビューを依頼する際に `/frontend-web-review` スキルを呼び出すと、Claude がコーディングルール・テストルールを確認してから4ステップのレビュー（ディレクトリ構成・コーディングルール・テストルール・リファクタリング）を行う。

**Why this priority**: コーディングスキルが整備された後にレビューが意味を持つため P2。レビュー結果が一貫したルールに基づくことで、指摘の品質と網羅性が上がる。

**Independent Test**: `/frontend-web-review` を呼び出した後に現在の `src/` コードのレビューを依頼し、ディレクトリ・コーディング・テスト・リファクタリングの4セクションで指摘・改善提案が出力されることを確認する。

**Acceptance Scenarios**:

1. **Given** レビュー対象コードが存在する状態で、**When** `/frontend-web-review` を呼び出す、**Then** Claude はルールファイルを読み込み「レビュールール確認済み（計N項目）。重点：...」と提示してからレビューを開始する
2. **Given** レビュースキルがアクティブな状態で、**When** レビューを実行する、**Then** ディレクトリ構成・コーディングルール・テスト有無・リファクタリングの4セクションで結果が提示される
3. **Given** 問題が見つかった場合、**When** レビュー結果を確認する、**Then** 指摘にとどまらず実際にリファクタリングが実施される

---

### Edge Cases

- スキル呼び出し後にルールファイルが存在しない場合、Claude はエラーを報告してルールファイルの作成を促す
- ルールファイルに記載されていない判断基準が必要な場合、Claude は一般的なベストプラクティスにフォールバックする

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `.claude/skills/frontend-web-coding/SKILL.md` が存在し、`/frontend-web-coding` として呼び出し可能であること
- **FR-002**: `.claude/skills/frontend-web-review/SKILL.md` が存在し、`/frontend-web-review` として呼び出し可能であること
- **FR-003**: 各スキルは事前に `.claude/rules/` 以下のルールファイルを読み込み、確認済みルールの総数と主要項目を提示してから処理を開始すること
- **FR-004**: コーディングスキルは `.claude/rules/frontend-web-directory.md`, `.claude/rules/frontend-code-rule.md`, `.claude/rules/frontend-web-react-rule.md` の3ファイルを参照すること
- **FR-005**: レビュースキルはコーディングスキルの3ファイルに加えて `.claude/rules/frontend-web-test-rule.md` を参照すること
- **FR-006**: ルールファイルはこの将棋アプリのプロジェクト構造（`src/game/`, `src/components/`, `src/hooks/`）を反映した内容であること
- **FR-007**: レビュースキルは「ディレクトリ構成 → コーディングルール → テストルール → リファクタリング」の4ステップで実行すること
- **FR-008**: レビューで問題が見つかった場合、指摘にとどまらず実際にリファクタリングを実施すること

### Key Entities

- **スキルファイル (SKILL.md)**: Claude Code スキルの定義ファイル。YAMLフロントマター（name, description, user-invocable等）とマークダウン形式のワークフロー手順を含む
- **ルールファイル (.md)**: プロジェクト固有のコーディング規約を記述したドキュメント。スキルから `@` 記法で参照される

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `/frontend-web-coding` を呼び出した後のコード生成で、ルール違反（`any` 型・不正なディレクトリ配置・マジックナンバー等）がゼロになる
- **SC-002**: `/frontend-web-review` を呼び出した後のレビューで、4つのレビューカテゴリ（ディレクトリ・コーディング・テスト・リファクタリング）すべてに対する評価が出力される
- **SC-003**: スキル呼び出し後、ルール確認サマリーが提示されてからコーディング・レビューが開始される（ルール確認ステップのスキップなし）

## Assumptions

- othello-app-speckit のスキル・ルール構造（`frontend-web-review`, `frontend-web-coding`, `.claude/rules/`）をベースとして流用する
- ルールファイルの内容はこの将棋アプリのディレクトリ構成（`src/game/` がゲームロジック、`src/components/` が UI）に合わせて調整する
- テストフレームワークは Vitest + @testing-library/react（plan.md で定義済みの技術スタックに従う）
- スキルファイルは `.claude/skills/` 以下に配置する（othello-app-speckit と同じ規約）
- `src/constants/` ディレクトリはまだ存在しないが、ルールの記述対象として含める
