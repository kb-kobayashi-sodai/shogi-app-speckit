# Research: レビュー・コーディングスキルの追加

**Branch**: `003-review-coding-skills`  
**Date**: 2026-05-22

## Decision 1: スキル・ルールファイルの構成

**Decision**: othello-app-speckit の `frontend-web-review` / `frontend-web-coding` スキル構造をベースに、将棋アプリ固有のパスと構成に置き換える。

**Rationale**: 同一プロジェクトオーナーによる既存スキルが十分に動作実績を持ち、構造も明確なため再設計不要。差分は最小限（パス・プロジェクト固有例のみ）に留める。

**Alternatives considered**:
- ゼロから独自設計 → 実績のある設計を捨てる必要がなく採用しない
- othello ルールをそのままコピー → プロジェクト固有のパス（`src/game/` 等）が誤るため不採用

---

## Decision 2: ディレクトリルールの将棋アプリ対応

**Decision**: 以下のマッピングで othello の構造を将棋アプリに置き換える。

| othello | shogi |
|---------|-------|
| `src/utils/` — ゲームロジック | `src/game/` — ゲームロジック・型・定数 |
| `src/types/` — 型定義 | （`src/game/types.ts` に統合） |
| `src/constants/` — 定数 | （`src/game/constants.ts` に統合） |
| `src/workers/` — Web Worker | N/A（将棋アプリではWorker不使用） |
| `src/components/ComponentName.tsx` | `src/components/ComponentName/ComponentName.tsx`（サブディレクトリ構成） |

**Rationale**: 将棋アプリは `src/game/` にロジック・型・定数をまとめている（`types.ts`, `constants.ts`, `gameEngine.ts` 等）。この構造を正確に反映したルールにすることで、ルール違反の誤検知を防ぐ。

**Alternatives considered**:
- `src/constants/` を独立ディレクトリとしてルールに記載 → 実態と乖離するため不採用
- Workers セクションを保持 → 使用実績がなく混乱を招くため削除

---

## Decision 3: テストルールの扱い

**Decision**: `frontend-web-test-rule.md` を作成し、レビュースキルから参照する。将棋アプリのテスト対象（`src/game/` の純粋関数・`src/hooks/` のカスタムフック）を具体的に記載する。

**Rationale**: `src/setupTests.ts` が既に存在し、Vitest + @testing-library/react 環境が整備済みのため、テストルールを整備する技術的障壁はない。テスト未実装の関数・コンポーネントがある場合はレビュー時に「テスト不足」として指摘するのが適切。

**Alternatives considered**:
- テストルール省略 → レビュースキルの網羅性が下がるため不採用
- テストルールをコーディングスキルにも追加 → othello の設計に沿い、コーディング時はルール3点に絞る方針を維持

---

## Decision 4: コーディングルールの開発フロー記載

**Decision**: `frontend-code-rule.md` の「開発フロー」セクションに SpecKit ブランチ作業時のタスク確認ルール（`tasks.md` の範囲内か確認）を含める。

**Rationale**: 将棋アプリは SpecKit で管理されており、コーディングスキルが `tasks.md` の範囲を超えた実装を促さないよう制御することがプロジェクト品質に直結する。

**Alternatives considered**:
- 開発フローセクション省略 → SpecKit 管理プロジェクトとしての一貫性が失われるため不採用
