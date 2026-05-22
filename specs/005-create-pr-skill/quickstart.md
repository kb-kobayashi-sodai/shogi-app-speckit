# Quickstart: speckit-git-pr スキル

## 基本的な使い方

フィーチャーブランチで実装が完了したら：

```bash
/speckit-git-pr
```

これだけで、コミット履歴から PR タイトル・本文を自動生成し、GitHub PR を作成します。

## PR作成前にプレビューを確認したい場合

```bash
/speckit-git-pr --preview
```

## ドラフト PR として作成したい場合

```bash
/speckit-git-pr --draft
```

## 前提条件

- GitHub CLI (`gh`) がインストールされていること: `gh --version`
- GitHub 認証済みであること: `gh auth status`
- フィーチャーブランチにいること（`main` では使用不可）

## スキルファイルの場所

`.claude/skills/speckit-git-pr/skill.md`

## SpecKit ワークフローでの位置づけ

```
/speckit-specify → /speckit-clarify → /speckit-plan → /speckit-tasks → /speckit-implement → /speckit-git-pr
```

実装完了後、PR 作成フェーズとして使用します。
