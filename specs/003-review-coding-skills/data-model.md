# Data Model: レビュー・コーディングスキルの追加

**Branch**: `003-review-coding-skills`  
**Date**: 2026-05-22

## Entities

### スキルファイル (Skill File)

Claude Code スキルの定義ファイル。`.claude/skills/<skill-name>/SKILL.md` に配置する。

**Fields**:
- `name` (string): スキルの識別子（YAML frontmatter）。ユーザー呼び出し名に使用。
- `description` (string): スキルの概要説明（YAML frontmatter）。
- `user-invocable` (boolean): `true` のとき `/<name>` でユーザーが呼び出し可能（YAML frontmatter）。
- `disable-model-invocation` (boolean): `false` のとき通常の推論が有効（YAML frontmatter）。
- `content` (markdown): スキルのワークフロー手順。ルールファイルへの参照（`@.claude/rules/...`）と実行ステップを含む。

**Instances**:
| ファイルパス | name | user-invocable |
|-------------|------|----------------|
| `.claude/skills/frontend-web-coding/SKILL.md` | `frontend-web-coding` | true |
| `.claude/skills/frontend-web-review/SKILL.md` | `frontend-web-review` | true |

---

### ルールファイル (Rule File)

プロジェクト固有のコーディング規約を記述したマークダウンドキュメント。`.claude/rules/` に配置し、スキルファイルから `@` 記法で参照される。

**Fields**:
- `title` (string): ルールファイルのH1見出し。内容を端的に表す。
- `purpose` (string): ルールの目的セクション（H2）。
- `rules` (markdown sections): 個別ルールをセクション（H3）ごとに記載。

**Instances**:
| ファイルパス | 内容 | 参照スキル |
|-------------|------|-----------|
| `.claude/rules/frontend-web-directory.md` | ディレクトリ構成・ファイル命名規則 | coding, review |
| `.claude/rules/frontend-code-rule.md` | TypeScript/JS コーディング規約 | coding, review |
| `.claude/rules/frontend-web-react-rule.md` | React コンポーネント設計規約 | coding, review |
| `.claude/rules/frontend-web-test-rule.md` | テスト規約（Vitest / @testing-library/react）| review のみ |

---

## Relationships

```
frontend-web-coding/SKILL.md
  └── references → frontend-web-directory.md
  └── references → frontend-code-rule.md
  └── references → frontend-web-react-rule.md

frontend-web-review/SKILL.md
  └── references → frontend-web-directory.md
  └── references → frontend-code-rule.md
  └── references → frontend-web-react-rule.md
  └── references → frontend-web-test-rule.md
```

---

## State Transitions

スキルファイルとルールファイルは静的ドキュメントのためライフサイクル遷移なし。将来的な更新はファイル内容の直接編集で行う。
