---
name: "frontend-web-review"
description: "レビュー前にルールを確認してからコードレビューを行う"
user-invocable: true
disable-model-invocation: false
---

# frontend/web コードレビュー

## 事前確認

以下のルールファイルをすべて読み込み、**確認したルールの総数と主要項目（最大5点）を日本語で提示してから**レビューを開始してください。

提示フォーマット例：
> レビュールール確認済み（計N項目）。重点：① ディレクトリ配置 ② 型安全（`any`禁止） ③ テスト有無 ④ Hooks依存配列 ⑤ 命名規則

- @.claude/rules/frontend-web-directory.md
- @.claude/rules/frontend-code-rule.md
- @.claude/rules/frontend-web-react-rule.md
- @.claude/rules/frontend-web-test-rule.md

## レビュー手順

以下の順番でコードレビューを行ってください。

### 1. ディレクトリ構成

`@.claude/rules/frontend-web-directory.md` に記載されている構成どおりにファイルやディレクトリが管理できているか確認する。

チェック項目：
- 新規ファイルが適切なディレクトリに配置されているか（`src/game/`, `src/components/<Name>/`, `src/hooks/`）
- コンポーネントがサブディレクトリ構成（`<Name>/<Name>.tsx`）に従っているか
- ファイル命名規則（PascalCase / camelCase）に従っているか
- `src/` 直下への直接配置をしていないか

### 2. コーディングルール

`@.claude/rules/frontend-code-rule.md` および `@.claude/rules/frontend-web-react-rule.md` に記載されている規約に沿ったコーディングができているか確認する。

チェック項目：
- `any` 型が使われていないか
- 関数の戻り値型が明示されているか
- インポート順序が規約どおりか
- 関数コンポーネントのみ使用しているか
- Propsの型定義があるか
- `useEffect` の依存配列が正確か
- マジックナンバーが `src/game/constants.ts` に定数化されているか

### 3. テストルール

`@.claude/rules/frontend-web-test-rule.md` に記載されている規約に沿ったテストが実施できているか確認する。

チェック項目：
- 変更・追加した機能に対応するテストが存在するか
- `getByRole` など適切なクエリを使っているか
- テストの説明文が振る舞いを明確に示しているか
- ゲームロジック（`src/game/`）のエッジケースがカバーされているか

### 4. リファクタリング

コードの設計品質・保守性の観点からリファクタリングの余地がないか確認する。

チェック項目：
- 重複するロジックが複数箇所に存在していないか（DRY原則）
- 1つの関数・コンポーネントが複数の責務を持っていないか（単一責務）
- `useState` で管理している値のうち、他のstateから計算で求められるものがないか（派生値は `useMemo` または計算で取得する）
- 未使用の変数・インポート・Propsが残っていないか
- 条件分岐が複雑すぎて早期returnや関数の分割で整理できないか
- 3行以上同じパターンが繰り返されている箇所がないか（抽出の候補）
- 変数名・関数名がその意図を十分に表しているか

問題が見つかった場合は、**指摘にとどめず実際にリファクタリングを実施する**。
