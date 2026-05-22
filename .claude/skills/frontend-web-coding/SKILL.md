---
name: "frontend-web-coding"
description: "コーディング前にルールを確認してからコードを書く"
user-invocable: true
disable-model-invocation: false
---

# frontend/web コーディング

## 事前確認

以下のルールファイルをすべて読み込み、**確認したルールの総数と主要項目（最大5点）を日本語で提示してから**コーディングを開始してください。

提示フォーマット例：
> コーディングルール確認済み（計N項目）。重点：① 命名規則（camelCase/PascalCase）② `any`型禁止 ③ インポート順序 ④ 関数コンポーネントのみ ⑤ マジックナンバーは `src/game/constants.ts` に定義

- @.claude/rules/frontend-web-directory.md
- @.claude/rules/frontend-code-rule.md
- @.claude/rules/frontend-web-react-rule.md

## コーディング手順

上記ルールに準拠した上で、ユーザーの依頼内容を実装してください。

### チェックポイント（コード生成前に確認）

1. **開発フロー**: SpecKit でブランチ作業中の場合、この依頼は `tasks.md` のタスク範囲内か。範囲外であればユーザーに確認してから着手する
2. **ディレクトリ**: 新しいファイルは適切なディレクトリ（`src/game/`, `src/components/<Name>/`, `src/hooks/` 等）に配置されているか
3. **型安全**: `any` を使っていないか、戻り値型を明示しているか
4. **命名**: コンポーネントはPascalCase、関数・変数はcamelCase、定数はUPPER_SNAKE_CASEか
5. **React**: 関数コンポーネントのみ、Propsの型定義あり、Hooks依存配列が正確か
6. **マジックナンバー**: 数値リテラルを直接コードに書いていないか（`src/game/constants.ts` に切り出す）
