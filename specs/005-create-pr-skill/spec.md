# Feature Specification: PR作成スキル

**Feature Branch**: `005-create-pr-skill`  
**Created**: 2026-05-22  
**Status**: Draft  
**Input**: User description: "PR作成用のスキルを作って"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 現在ブランチからPRを自動作成する (Priority: P1)

開発者がフィーチャーブランチで実装を終えた後、`/speckit-git-pr` コマンドを実行すると、現在のブランチとコミット履歴をもとに適切なタイトル・本文を生成してGitHub PRを作成できる。

**Why this priority**: PRの作成はリリースサイクルの必須ステップであり、タイトルや本文の手動作成を自動化することで開発者の負担を大幅に削減できる。

**Independent Test**: `/speckit-git-pr` を実行するだけで、GitHubにPRが作成されることを確認できる。

**Acceptance Scenarios**:

1. **Given** フィーチャーブランチに未プッシュの変更がある状態で、**When** `/speckit-git-pr` を実行すると、**Then** リモートへのプッシュが行われ、PRが作成されてURLが表示される
2. **Given** フィーチャーブランチがすでにリモートにプッシュ済みの状態で、**When** `/speckit-git-pr` を実行すると、**Then** 追加プッシュなしにPRが作成される
3. **Given** mainブランチで `/speckit-git-pr` を実行した場合、**Then** 「フィーチャーブランチ上で実行してください」と警告が表示されPRは作成されない

---

### User Story 2 - PR内容のプレビューと確認 (Priority: P2)

開発者がPR作成前に生成されたタイトル・本文を確認・編集できる。

**Why this priority**: 自動生成されたPR内容が意図と異なる場合に修正できる手段を提供することで、品質の高いPRを維持できる。

**Independent Test**: `--preview` オプションで、PRを実際に作成せずに内容を確認できる。

**Acceptance Scenarios**:

1. **Given** フィーチャーブランチにコミットがある状態で、**When** プレビューモードで実行すると、**Then** 生成されるタイトルと本文が表示され、PRは作成されない
2. **Given** プレビュー表示後にユーザーが確認すると、**Then** そのままPRを作成するか中断するかを選択できる

---

### User Story 3 - specキットの成果物をPR本文に反映 (Priority: P3)

`specs/` ディレクトリにある spec.md・plan.md・tasks.md の内容を参照してPR本文のサマリーを自動生成できる。

**Why this priority**: SpecKit のワークフローで作成した設計資料をPRに反映することで、レビュアーへのコンテキスト共有が容易になる。

**Independent Test**: `specs/NNN-feature/` に spec.md が存在する状態で `/speckit-git-pr` を実行すると、PR本文にフィーチャー名と概要が含まれる。

**Acceptance Scenarios**:

1. **Given** `.specify/feature.json` に `feature_directory` が設定されている状態で、**When** PR作成を実行すると、**Then** 該当フィーチャーの spec.md の概要がPR本文に含まれる
2. **Given** `feature.json` が存在しない場合、**Then** spec情報なしのシンプルなPR本文で作成される

---

### Edge Cases

- mainブランチやデフォルトブランチから実行した場合は警告して中断する
- Gitリポジトリ外で実行した場合は「Gitリポジトリが見つかりません」と表示して終了する
- GitHub CLIがインストールされていない場合は「gh コマンドが必要です」と案内する
- 既に同一ブランチのオープンPRが存在する場合は、既存PR URLを表示して二重作成を防ぐ
- コミットが存在しない（またはmainと差分がない）場合は警告して中断する
- `gh` 認証エラーや GitHub API エラーが発生した場合は、エラー内容をメッセージで表示して処理を中断する（リトライなし）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムはカレントブランチのコミットメッセージと diff から PR タイトルおよび本文のドラフトを自動生成しなければならない。本文は `## 概要`（箇条書き）と `## テスト計画`（チェックリスト）のセクションで構成し、タイトルを含む全項目を日本語で出力する
- **FR-002**: システムは `.specify/feature.json` が存在する場合、該当フィーチャーの spec.md を読み込み PR 本文のサマリーに含めなければならない
- **FR-003**: システムはPR作成前にリモートへのプッシュが必要かどうかを判定し、必要な場合は自動でプッシュしなければならない
- **FR-004**: システムはmainブランチ・デフォルトブランチでの実行を検知し、適切な警告メッセージを出力して処理を中断しなければならない
- **FR-005**: システムは同一ブランチのオープンPRが存在する場合、既存PRのURLを表示して二重作成を防がなければならない
- **FR-006**: ユーザーはプレビューモードでPRの内容を作成前に確認できなければならない
- **FR-007**: システムはPR作成に成功した場合、作成されたPRのURLを出力しなければならない
- **FR-008**: ユーザーは `--draft` オプションを指定することでドラフトPRとして作成できなければならない

### Key Entities

- **Feature Branch**: フィーチャーブランチ。PRのソースブランチとなる
- **Base Branch**: マージ先ブランチ（通常は `main`）
- **Pull Request**: タイトル・本文を持つGitHub PR（ラベル・レビュアー付与はスコープ外）
- **Spec Artifact**: `specs/NNN-feature/` 配下の spec.md・plan.md・tasks.md

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: PR作成コマンド1回の実行で、リモートプッシュからPR作成まで完了できる
- **SC-002**: 自動生成されたPRタイトルが、コミット内容を適切に要約している（レビュアーが内容を理解できる）
- **SC-003**: SpecKit のフィーチャー情報がある場合、PR本文にフィーチャー名と概要が自動反映される
- **SC-004**: 不正な実行状態（mainブランチ、未コミット、既存PR等）を検出した場合、100%の確率でユーザーに明確なエラーメッセージが表示される

## Clarifications

### Session 2026-05-22

- Q: PR本文のフォーマット構造は何にするか？ → A: `## 概要`（箇条書き）+ `## テスト計画`（チェックリスト）形式。タイトルを含む全項目を日本語にする
- Q: ドラフトPRをサポートするか？ → A: `--draft` オプションでドラフトPR作成をサポートする
- Q: ラベル・レビュアーの自動付与はスコープに含めるか？ → A: スコープ外。オプション引数も提供しない
- Q: `gh` 認証エラー・API エラー時のフォールバック動作は？ → A: エラー内容をメッセージで表示して処理を中断する（リトライなし）
- Q: スキルファイルの配置場所は？ → A: `.claude/skills/speckit-git-pr/skill.md`（他の speckit-git-* スキルと同じ場所）

## Assumptions

- GitHub CLIの `gh` コマンドがインストールされていることを前提とする
- ベースブランチは `main` を想定する（カスタマイズは将来的な拡張とする）
- スキルは `.claude/skills/speckit-git-pr/skill.md` に配置し、`/speckit-git-pr` コマンドとして実装する
- `.specify/extensions/git/` 配下の既存PowerShellスクリプトのパターンに従う
- PR の公開範囲はデフォルト（パブリック or プライベートはリポジトリ設定に従う）
