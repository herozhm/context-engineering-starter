# context-engineering-starter

> AI 写代码很快,但在别人的大仓库里,它不知道规矩、踩不到的坑全都踩——
> 这个脚手架把「架构约束、危险地图、回归清单、验收判据」变成 **AI 可读可执行的知识**,让编码 Agent 在你的仓库里安全、稳定、按团队标准干活。

![License](https://img.shields.io/badge/license-MIT-blue)
![Zero-dependency](https://img.shields.io/badge/scripts-zero--dependency-green)
![For](https://img.shields.io/badge/for-Claude_Code__Cursor__Codex-black)

## 为什么需要它

AI 编码的三大失效模式,每一个我们都真实踩过:

| 失效模式 | 现象 | 根因 |
| --- | --- | --- |
| **静默失败** | 编译过、测试绿,但另一条链路没生效 | AI 不知道「同一逻辑要写两遍」 |
| **占位实现绕守卫** | 默认实现返回 truthy 占位值,把所有 if 守卫废掉 | AI 在「让它跑起来」而非「让它正确」 |
| **幻觉接口** | 调用不存在的函数/字段 | AI 不了解仓库的真实结构 |
| **盲目重试** | 失败后换姿势反复试到碰对为止 | 没有重试预算纪律 |

它们的共同根因:**上下文缺失或被稀释**。解法不是换更强的模型,是**上下文工程**——
把团队沉淀的知识变成 AI 每次任务必读、必守、可验证的结构化约束。

## 四层流水线(这套脚手架的架构)

```
① 知识层  CLAUDE.md + .ai/agents/*   —— 不变量、危险地图、回归清单、判据
② 执行层  skills/* + MCP             —— 高频工程动作固化为确定性流程
③ 验证层  scripts/verify-changed 等   —— mock + 用例 + 运行时实测(无输出≠通过)
④ 沉淀层  事故复盘 → 回写知识层        —— 同一个坑不踩第二次
```

详见 [docs/methodology.md](docs/methodology.md)。

## 快速开始

```bash
# 1. clone 到你的项目目录(或按目录说明手工合并)
npx degit your-name/context-engineering-starter .ai-starter && cp -r .ai-starter/* .

# 2. 填写三处占位:
#    - CLAUDE.md:项目定位、不变量、命令
#    - .ai/danger-map.json:你项目的危险区规则
#    - .ai/verify.config.json:你的检查命令(eslint/tsc/golangci-lint/...)

# 3. 验证脚手架自身可用(零依赖,纯 Node):
node scripts/verify-changed.mjs

# 4. 让 Agent 读起来:确保你的编码 Agent 加载了根目录 CLAUDE.md(Claude Code 自动加载)
```

## 目录说明

```
CLAUDE.md                       全局约束(常驻上下文):定位/不变量/红线/命令
.ai/
├── danger-map.json             危险地图:路径前缀 → 危险等级 + 规则
├── verify.config.json          增量校验配置:检查器命令(语言无关)
└── agents/
    ├── README.md               怎么写一个任务域的知识文件(四要素 + 写作规范)
    └── example-domain.md       示例域:支付模块(展示四要素的标准写法)
skills/
├── verify-before-commit/SKILL.md     示例 Skill:提交前校验流程
├── commit-discipline/SKILL.md        示例 Skill:提交纪律
├── requirement-decompose/SKILL.md    Skill:需求拆解四步法(复述/影响面/分解/排序)
└── write-domain-doc/SKILL.md         Skill:问答式生成任务域知识文件(四要素)
scripts/
├── verify-changed.mjs          增量校验(无输出≠通过 防呆)
├── check-style.mjs             样式红线扫描示例(禁 !important/硬编码色值)
docs/methodology.md            四层流水线方法论全文
```

## 写作纪律(这套体系能不能立住,看这几条)

1. **判据可执行**:写「违规为 0 才算完成」,不写「注意质量」——描述靠 AI 自觉,判据可验证
2. **反例必写**:Agent 最大的风险是创造性发挥,反例划出「不许发挥」的边界——反例比正例值钱,它标注了这条规则为什么存在
3. **真源指针化**:一份知识只留一处,其余放指针(抄一份的教训:漂移 3 个版本)
4. **事故驱动更新**:每个复盘必须产出一条新约束回写知识库,不产出不算闭环
5. **先轻后重**:Skill 和知识文件都是长出来的,不是设计出来的——避免过度设计

## 通用性边界(诚实声明)

| 层 | 通用性 |
| --- | --- |
| 脚手架机制(四层流水线/脚本) | 100% 通用——任何语言、任何 Agent 工具 |
| 知识内容 | 领域专属——**这才是团队资产,框架可以开源共享,知识才是护城河** |

## License

MIT
