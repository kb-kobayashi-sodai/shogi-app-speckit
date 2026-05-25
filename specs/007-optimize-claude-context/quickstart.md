# Quickstart: 変更の検証手順

**Phase**: 1 | **Date**: 2026-05-22

## 検証ステップ

### 1. 行数の確認（定量検証）

実装後に以下を実行して行数を確認する：

```powershell
# Windowsの場合
(Get-Content CLAUDE.md).Count
(Get-Content .claude/rules/frontend-code-rule.md).Count
(Get-Content .claude/rules/frontend-web-directory.md).Count
(Get-Content .claude/rules/frontend-web-react-rule.md).Count
(Get-Content .claude/rules/frontend-web-test-rule.md).Count
```

**目標**: 合計 ≤182行（現在228行から20%以上削減）

### 2. CLAUDE.md の確認（定性検証）

- `<!-- SPECKIT START -->` と `<!-- SPECKIT END -->` マーカーが存在する
- マーカー間に `plan.md` への参照が含まれていない
- マーカー間のコンテンツが空である

### 3. rulesファイルの内容確認（定性検証）

各rulesファイルを読み、以下が維持されていることを確認：

| ファイル | 確認ポイント |
|---|---|
| frontend-code-rule.md | `strict: true`、`any` 禁止、命名規則（camelCase等）が残っている |
| frontend-web-directory.md | ディレクトリ構成ルール、ファイル命名規則、禁止事項が残っている |
| frontend-web-react-rule.md | 関数コンポーネント必須、useEffect制限、禁止事項が残っている |
| frontend-web-test-rule.md | ユーザー視点テスト方針、AAA原則、禁止事項が残っている |

### 4. 機能的な影響がないことの確認

- `.claude/rules/` のファイルパス・ファイル名が変更されていない
- 削除したのは「参考例・目的文」のみで「規則本体」は全て残っている
