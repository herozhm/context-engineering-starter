#!/usr/bin/env node
// 增量校验:对 git 改动文件执行 .ai/verify.config.json 中定义的检查器。
// 关键判据:「无输出 ≠ 通过」——检查器未真正执行时,整体结果视为失败(executed=false)。
// 用法:node scripts/verify-changed.mjs [--files a.js,b.js] [--cwd /path/to/project]

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
function argOf(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}
const cwd = argOf("--cwd") ?? process.cwd();
const filesFlag = argOf("--files");

function getChangedFiles() {
  try {
    const out = execSync("git diff --name-only HEAD", { cwd, encoding: "utf-8" });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function readConfig() {
  try {
    const raw = readFileSync(join(cwd, ".ai", "verify.config.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    console.error("[verify-changed] 无法读取 .ai/verify.config.json —— 请先在配置中声明你的检查器");
    process.exit(2);
  }
}

// ---- 解析器:每种输出格式一个解析函数,统一返回 { executed, findings[] } ----
const parsers = {
  // eslint --format json:输出为 JSON 数组
  "eslint-json": (proc) => {
    if (proc.status === null || proc.status >= 2) {
      return { executed: false, findings: [], note: `eslint crashed (exit ${proc.status}) — 无输出≠通过` };
    }
    try {
      const items = JSON.parse(proc.stdout);
      const findings = [];
      for (const item of items) {
        for (const m of item.messages) {
          findings.push({
            file: item.filePath,
            line: m.line,
            severity: m.severity === 2 ? "error" : "warning",
            rule: m.ruleId ?? "eslint",
            message: m.message,
          });
        }
      }
      return { executed: true, findings };
    } catch {
      return { executed: false, findings: [], note: "output was not valid JSON — 无输出≠通过" };
    }
  },
  // tsc --pretty false:每行 `file(line,col): error TSxxxx: message`
  "tsc-lines": (proc) => {
    if (proc.status === null) {
      return { executed: false, findings: [], note: "tsc did not run — 无输出≠通过" };
    }
    const findings = [];
    const re = /^(.+)\((\d+),(\d+)\):\s+(error|warning)\s+:\s+(.+)$/;
    for (const line of (proc.stdout ?? "").split("\n")) {
      const m = re.exec(line.trim());
      if (m) findings.push({ file: m[1].trim(), line: Number(m[2]), severity: m[4], rule: "tsc", message: m[5] });
    }
    return { executed: true, findings };
  },
  // plain:exit≠0 视为失败,stdout 每行一条错误
  plain: (proc) => {
    if (proc.status === null) return { executed: false, findings: [], note: "command did not run" };
    const findings = (proc.stdout ?? "")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => ({ file: "-", line: undefined, severity: "error", rule: "plain", message: l }));
    return { executed: true, findings };
  },
};

const config = readConfig();
const files = filesFlag ? filesFlag.split(",").map((s) => s.trim()).filter(Boolean) : getChangedFiles();

const outcomes = [];
for (const check of config.checks ?? []) {
  const parser = parsers[check.parser] ?? parsers.plain;
  const cmd = check.command.replace("{files}", files.join(" "));
  const [bin, ...rest] = cmd.split(" ");
  const proc = spawnSync(bin, rest, { cwd, encoding: "utf-8", maxBuffer: 16 * 1024 * 1024, shell: true });
  outcomes.push({ check: check.name, ...parser(proc) });
}

const executed = outcomes.some((o) => o.executed);
const allExecutedClean = outcomes
  .filter((o) => o.executed)
  .every((o) => o.findings.every((f) => f.severity !== "error"));
const passed = executed && allExecutedClean && outcomes.length > 0;

console.log("=== Code Guard 增量校验 ===");
console.log(`改动文件(${files.length}):${files.join(", ") || "(无)"}`);
for (const o of outcomes) {
  console.log(`\n[${o.check}] ${o.executed ? `${o.findings.length} finding(s)` : `未执行:${o.note ?? ""}`}`);
  for (const f of o.findings) {
    console.log(`  [${f.severity}] ${f.file}${f.line ? ":" + f.line : ""} (${f.rule}) ${f.message}`);
  }
}
if (!executed) console.log("\n⚠ 没有任何检查器真正执行——无输出≠通过,请先修复检查环境");
console.log(`\n结论:${passed ? "✅ 通过" : "❌ 未通过"}`);
process.exit(passed ? 0 : 1);
