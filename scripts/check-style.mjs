#!/usr/bin/env node
// 样式红线扫描示例:禁 !important、禁硬编码色值、禁三位数裸 z-index。
// 判据:违规为 0 才算完成。按你团队的红线增删规则。
// 用法:node scripts/check-style.mjs [目录,默认 src]

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import process from "node:process";

const root = process.argv[2] ?? "src";
const STYLE_EXT = new Set([".css", ".scss", ".less", ".vue"]);
const RULES = [
  { name: "禁用 !important", re: /!important/g },
  { name: "禁用硬编码色值(用语义化 token)", re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: "禁用三位数裸 z-index(走层级体系)", re: /z-index:\s*\d{3,}/g },
];

const violations = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (STYLE_EXT.has(extname(name))) violations.push({ file: p, name });
  }
}
walk(root);

let count = 0;
for (const { file, name } of violations) {
  const raw = readFileSync(file, "utf-8");
  const lines = raw.split("\n");
  for (const rule of RULES) {
    lines.forEach((line, i) => {
      if (rule.re.test(line)) {
        count++;
        console.log(`[红线:${rule.name}] ${file}:${i + 1} → ${line.trim()}`);
      }
    });
  }
}

console.log(`\n扫描 ${violations.length} 个样式文件,违规 ${count} 处`);
console.log(count === 0 ? "✅ 通过(违规为 0 才算完成)" : "❌ 存在违规——先溯源到定义源头修改,禁止就地覆盖");
process.exit(count === 0 ? 0 : 1);
