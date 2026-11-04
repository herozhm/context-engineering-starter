---
name: commit-discipline
description: 提交纪律。触发词:提交、commit、生成提交信息
---

# 提交纪律(Monorepo / 多模块项目通用)

## 工作流

1. 按 `git status` 列出全部改动,按**模块边界**分组——一个 commit 只包含一个模块的改动
2. 每组改动生成 Conventional Commits 信息(`feat:` / `fix:` / `docs:` / `chore:`)
3. 自动修复类改动(格式化/lint --fix)**必须独立成 commit**,禁止与功能改动混合
4. 生成提交信息后,逐组 `git add <模块路径> && git commit`——**禁止 `git add -A` 盲加**

## 判据

- 每个 commit 的改动文件都属于同一个模块/目录
- commit message 能独立说清「这个 commit 做了什么、为什么」
- 反例:曾因 `git add -A` 把自动格式化与功能改动混入同一 commit,回滚功能时被迫连格式化一起回滚

## 纪律

- 提交信息用祈使句,不写「修复了」——写「修复 XX」
- 一行说清做了什么,如有必要空一行后再写「为什么」
