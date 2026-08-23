import{_ as s,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const d=JSON.parse('{"title":"DeepAgents 实战：多 Agent 架构的深度调研助手","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/30-DeepAgents 实战：多 Agent 架构的深度调研助手/index.md","filePath":"前端转AI Agent/30-DeepAgents 实战：多 Agent 架构的深度调研助手/index.md"}'),l={name:"前端转AI Agent/30-DeepAgents 实战：多 Agent 架构的深度调研助手/index.md"};function i(t,n,c,o,r,m){return a(),p("div",null,[...n[0]||(n[0]=[e(`<h1 id="deepagents-实战-多-agent-架构的深度调研助手" tabindex="-1">DeepAgents 实战：多 Agent 架构的深度调研助手 <a class="header-anchor" href="#deepagents-实战-多-agent-架构的深度调研助手" aria-label="Permalink to &quot;DeepAgents 实战：多 Agent 架构的深度调研助手&quot;">​</a></h1><p>前面学了 DeepAgents 的各种 middleware，但是太散了。</p><p>而且 middleware 里带的 tool 需要在 prompt 里说明怎么用。</p><p>那有没有一个整合所有中间件的 api，并且内置了 prompt 呢？</p><p>有的，就是 createDeepAgent</p><p>我们基于 deepagents 开发一个多 Agent 项目：深度调研助手</p><p>你只要给它一个主题，它的主 Agent 会自动规划任务，列出 todo 列表，然后交给不同的子 Agent 来执行任务，比如联网搜索、代码执行等，最后生成一份调研报告</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdI2MoBToe3e2ytecSVRw8t506XxWCoXfk9iaOyh4tIYnPZ9ApefYUaJUlBsvGCxCK39A7J5d7HLHSS3BkJLHpOGicoqbSJCyO4U/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p>我们分了三个子 Agent：</p><p><strong>主 Agent</strong>：整个系统的编排中心，负责把用户输入的调研主题拆解成可执行流程，并协调各子 Agent 分工完成。它不亲自包揽所有调研细节，而是按「规划 → 调研 → 分析 → 起草 → 审阅 → 定稿」推进任务：先用待办列表明确步骤，再按需委派子 Agent，最后由自己整合材料、撰写报告并根据编辑反馈修订定稿。</p><p><strong>调研员子 Agent（researcher）</strong>：每次只负责一个聚焦的子主题。通过联网搜索收集资料，将关键事实与来源 URL 整理成结构化摘要，写入 findings_*.md。多个调研员可并行工作，适合把大主题拆成若干子方向同时推进。</p><p><strong>分析师子 Agent（analyst）</strong>：当调研涉及数字对比、排名、增长率等计算时启用。在 QuickJS REPL 中执行 JavaScript 完成数值分析，禁止凭猜测给出数字。结果写入 analysis_*.md，供主 Agent 写报告时引用。</p><p>**编辑子 Agent（editor）**在报告草稿完成后介入，从准确性、结构完整性、来源引用、语言表述等维度审阅，返回具体修改建议。编辑不直接改写报告，审阅与修订分离，便于主 Agent 在保持整体思路的前提下做针对性修改。</p><p>大概有这个 4 个 Agent</p><p>创建项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir deep-research-assistant</span></span>
<span class="line"><span>cd deep-research-assistant</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfekNfbiau45ibVbYC1Bq3FQy7prVWUBUFvnaB6rQGiaibb0mxV086LVU63iaWXibNUkm0ma7iaiauCuneZom98LBULcncrz5VdtPzc19jM/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>进入项目，安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/langgraph @langchain/openai @langchain/quickjs dedent deepagents dotenv langchain zod</span></span></code></pre></div><p>写一下 .env 配置：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xx</span></span>
<span class="line"><span>OPENAI_BASE_URL=&quot;https://dashscope.aliyuncs.com/compatible-mode/v1&quot;</span></span>
<span class="line"><span>OPENAI_MODEL=&quot;qwen-plus&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 用于身份验证，实现链路上报  </span></span>
<span class="line"><span>LANGCHAIN_API_KEY=xxx</span></span>
<span class="line"><span># 指定LangSmith中的项目，追踪结果会归类到该项目下</span></span>
<span class="line"><span>LANGCHAIN_PROJECT=deep-research-assistant</span></span>
<span class="line"><span># 开启LangSmith追踪功能</span></span>
<span class="line"><span>LANGCHAIN_TRACING_V2=true</span></span>
<span class="line"><span></span></span>
<span class="line"><span>BOCHA_API_KEY=sk-xx</span></span></code></pre></div><p>开启 langsmith 追踪</p><p>这里用到网络搜索，配置下博查的 api key</p><p>然后创建 src/tools/search.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { tool } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const BOCHA_API_URL = &quot;https://api.bochaai.com/v1/web-search&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function formatWebPages(webpages) {</span></span>
<span class="line"><span>return webpages</span></span>
<span class="line"><span>    .map(</span></span>
<span class="line"><span>      (page, idx) =&gt;</span></span>
<span class="line"><span>        \`引用: \${idx + 1}</span></span>
<span class="line"><span>标题: \${page.name ?? &quot;&quot;}</span></span>
<span class="line"><span>URL: \${page.url ?? &quot;&quot;}</span></span>
<span class="line"><span>摘要: \${page.summary ?? &quot;&quot;}</span></span>
<span class="line"><span>网站名称: \${page.siteName ?? &quot;&quot;}</span></span>
<span class="line"><span>网站图标: \${page.siteIcon ?? &quot;&quot;}</span></span>
<span class="line"><span>发布时间: \${page.dateLastCrawled ?? &quot;&quot;}\`,</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span>    .join(&quot;\\n\\n&quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction bochaWebSearch(query, count) {</span></span>
<span class="line"><span>const apiKey = process.env.BOCHA_API_KEY?.trim();</span></span>
<span class="line"><span>if (!apiKey) {</span></span>
<span class="line"><span>    return&quot;Bocha 联网搜索的 API Key 未配置（环境变量 BOCHA_API_KEY），请先在 .env 中配置后再重试。&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const response = await fetch(BOCHA_API_URL, {</span></span>
<span class="line"><span>    method: &quot;POST&quot;,</span></span>
<span class="line"><span>    headers: {</span></span>
<span class="line"><span>      Authorization: \`Bearer \${apiKey}\`,</span></span>
<span class="line"><span>      &quot;Content-Type&quot;: &quot;application/json&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    body: JSON.stringify({</span></span>
<span class="line"><span>      query,</span></span>
<span class="line"><span>      freshness: &quot;noLimit&quot;,</span></span>
<span class="line"><span>      summary: true,</span></span>
<span class="line"><span>      count,</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (!response.ok) {</span></span>
<span class="line"><span>    const errorText = await response.text();</span></span>
<span class="line"><span>    return\`搜索 API 请求失败，状态码: \${response.status}，错误信息: \${errorText}\`;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let json;</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    json = await response.json();</span></span>
<span class="line"><span>  } catch (e) {</span></span>
<span class="line"><span>    return\`搜索 API 请求失败，原因是：搜索结果解析失败 \${e.message}\`;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    if (json.code !== 200 || !json.data) {</span></span>
<span class="line"><span>      return\`搜索 API 请求失败，原因是: \${json.msg ?? &quot;未知错误&quot;}\`;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const webpages = json.data.webPages?.value ?? [];</span></span>
<span class="line"><span>    if (!webpages.length) {</span></span>
<span class="line"><span>      return\`未找到与「\${query}」相关的结果。\`;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return formatWebPages(webpages);</span></span>
<span class="line"><span>  } catch (e) {</span></span>
<span class="line"><span>    return\`搜索 API 请求失败，原因是：搜索结果解析失败 \${e.message}\`;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportconst webSearch = tool(</span></span>
<span class="line"><span>async (input) =&gt; {</span></span>
<span class="line"><span>    const count = input.count ?? 10;</span></span>
<span class="line"><span>    console.log(\`  🔎 搜索: \${input.query}（\${count} 条）\`);</span></span>
<span class="line"><span>    return bochaWebSearch(input.query, count);</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;web_search&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;使用 Bocha 联网搜索 API 检索互联网网页。输入中文或中英结合的搜索关键词，可选 count 指定结果数量。返回标题、URL、摘要、网站名称、图标和发布时间。&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      query: z</span></span>
<span class="line"><span>        .string()</span></span>
<span class="line"><span>        .min(1)</span></span>
<span class="line"><span>        .describe(&quot;搜索关键词，优先使用中文，例如：2026年 AI Agent 框架对比、LangGraph 最新动态&quot;),</span></span>
<span class="line"><span>      count: z</span></span>
<span class="line"><span>        .number()</span></span>
<span class="line"><span>        .int()</span></span>
<span class="line"><span>        .min(1)</span></span>
<span class="line"><span>        .max(20)</span></span>
<span class="line"><span>        .optional()</span></span>
<span class="line"><span>        .describe(&quot;返回的搜索结果数量，默认 10 条&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>);</span></span></code></pre></div><p>这个就是网络搜索的 tool</p><p>然后写下 4 个 Agent：</p><p>src/agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import path from&quot;node:path&quot;;</span></span>
<span class="line"><span>import { fileURLToPath } from&quot;node:url&quot;;</span></span>
<span class="line"><span>import dedent from&quot;dedent&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createCodeInterpreterMiddleware } from&quot;@langchain/quickjs&quot;;</span></span>
<span class="line"><span>import { createDeepAgent, FilesystemBackend } from&quot;deepagents&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { webSearch } from&quot;./tools/search.mjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const projectDir = path.resolve(</span></span>
<span class="line"><span>  path.dirname(fileURLToPath(import.meta.url)),</span></span>
<span class="line"><span>&quot;..&quot;,</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const researcherSubAgent = {</span></span>
<span class="line"><span>name: &quot;researcher&quot;,</span></span>
<span class="line"><span>description:</span></span>
<span class="line"><span>    &quot;通过联网搜索调研单一子主题。每次只分配一个子主题；多个独立子主题可并行启动多个调研员。&quot;,</span></span>
<span class="line"><span>systemPrompt: dedent\`</span></span>
<span class="line"><span>    你是一名专业调研员，负责调研**一个**分配给你的子主题，并写入**一份**调研结果文件。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## 工作流程（严格遵守，禁止空转循环）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    1. **可选**：用 write_todos 列出最多 3 条中文执行步骤（例如「搜索官方文档」「搜索社区评价」「整理并写入 findings」），然后按步骤执行</span></span>
<span class="line"><span>    2. 最多调用 3 次 web_search（硬性上限，绝不超过）</span></span>
<span class="line"><span>    3. 将搜索结果整理为结构化摘要，包含关键事实与来源 URL</span></span>
<span class="line"><span>    4. 调用 write_file **一次**，保存到任务指定的路径（必须在 /workspace/sources/findings_*.md 下，禁止写到其他目录）</span></span>
<span class="line"><span>    5. 用一句话确认已完成，然后**立即停止**，不要再搜索、写文件或更新 todo</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## write_todos 使用规则（若使用）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    - 最多 3 条，每条 content 必须用中文</span></span>
<span class="line"><span>    - 仅用于拆解本子的调研步骤，不要重复主 Agent 已完成的总体规划</span></span>
<span class="line"><span>    - 最后一条 todo 必须是「写入 findings 文件」；该步骤完成后将所有 todo 标为 completed 并结束</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## 其他规则</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    - 不要重复相同的搜索关键词</span></span>
<span class="line"><span>    - write_file 完成后禁止再次搜索——你的任务已结束</span></span>
<span class="line"><span>    - 其他人只能看到你写入的文件，内容必须完整、自洽</span></span>
<span class="line"><span>    - **所有输出必须使用中文**（专有名词如 LangGraph 可保留英文）</span></span>
<span class="line"><span>    - 搜索关键词优先使用中文；若主题本身是英文专有名词，可中英结合</span></span>
<span class="line"><span>  \`,</span></span>
<span class="line"><span>tools: [webSearch],</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const editorSubAgent = {</span></span>
<span class="line"><span>name: &quot;editor&quot;,</span></span>
<span class="line"><span>description:</span></span>
<span class="line"><span>    &quot;审阅报告草稿的准确性、结构与完整性。在 /workspace/reports/draft_*.md 写好后使用。&quot;,</span></span>
<span class="line"><span>systemPrompt: dedent\`</span></span>
<span class="line"><span>    你是一名资深情报编辑，负责**审阅**报告草稿——**不要**亲自改写报告。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## 阅读材料</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    - 原始问题：/workspace/sources/question.txt</span></span>
<span class="line"><span>    - 待审草稿：任务中指定的路径</span></span>
<span class="line"><span>    - 支撑材料：/workspace/sources/ 下的调研文件（如需要）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## 审阅要点</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    - 报告是否直接回答了原始问题？</span></span>
<span class="line"><span>    - 章节结构是否清晰，段落是否充实（而非只有 bullet 列表）？</span></span>
<span class="line"><span>    - 是否引用了来源，并在「参考资料」章节列出？</span></span>
<span class="line"><span>    - 是否有遗漏、无依据的断言或缺失的视角？</span></span>
<span class="line"><span>    - 语言是否为中文，表述是否专业？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## 输出</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    返回简洁的审阅意见和具体、可操作的修改建议。</span></span>
<span class="line"><span>    **不要**写入报告文件，只提供反馈。所有输出使用中文。</span></span>
<span class="line"><span>  \`,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const analystSubAgent = {</span></span>
<span class="line"><span>name: &quot;analyst&quot;,</span></span>
<span class="line"><span>description:</span></span>
<span class="line"><span>    &quot;使用 eval REPL 进行数值计算与结构化数据分析。适用于计算、排名、同比对比或 JSON/CSV 分析。&quot;,</span></span>
<span class="line"><span>systemPrompt: dedent\`</span></span>
<span class="line"><span>    你是一名数据分析师，所有计算必须通过 eval REPL 完成——**禁止**猜测数字。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    ## 工作流程</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    1. 从 /workspace/sources/ 读取数据文件（或从调研结果中提取数字）</span></span>
<span class="line"><span>    2. 在 REPL 中编写并运行 JavaScript，计算总和、均值、排名、增长率等</span></span>
<span class="line"><span>    3. 将分析结果保存到 /workspace/sources/analysis_*.md，包含计算逻辑与结论</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    必须展示计算过程，结论可从 REPL 输出复现。所有输出使用中文。</span></span>
<span class="line"><span>  \`,</span></span>
<span class="line"><span>middleware: [createCodeInterpreterMiddleware()],</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const orchestratorPrompt = dedent\`</span></span>
<span class="line"><span>  你是「深度调研助手」的主 Agent，负责协调调研、分析与编辑，产出高质量调研简报。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## 语言要求</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  - **所有输出必须使用中文**：对话回复、write_todos 任务列表、文件内容、搜索关键词</span></span>
<span class="line"><span>  - write_todos 中每条 todo 的 content 必须用中文描述，例如「撰写调研计划」「委派调研员调研 LangGraph」</span></span>
<span class="line"><span>  - 搜索时优先使用中文关键词；英文专有名词（如 LangGraph、AutoGen）可保留</span></span>
<span class="line"><span>  - 报告、调研笔记、计划文件全部用中文撰写</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## 你的职责</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  协调调研员、分析师和编辑完成报告。不要亲自完成所有调研——将专业工作委派给子 Agent。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## 标准流程</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  1. **规划** — 用 write_todos 拆解任务（中文）。将用户问题保存到 /workspace/sources/question.txt</span></span>
<span class="line"><span>  2. **调研** — 按 web-research 技能：写 research_plan.md，委派调研员子 Agent（可并行）</span></span>
<span class="line"><span>  3. **分析** — 若涉及数字对比或数据表，委派分析师子 Agent</span></span>
<span class="line"><span>  4. **起草** — **由你亲自**按 report-writer 技能撰写，用 write_file 写入 /workspace/reports/draft_[主题].md</span></span>
<span class="line"><span>  5. **审阅** — 委派编辑子 Agent 审稿，根据反馈修订一次</span></span>
<span class="line"><span>  6. **定稿** — 保存最终报告到 /workspace/reports/report_[主题]_[日期].md</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## task 工具（子 Agent 委派）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  **仅**以下 subagent_type 合法：researcher、analyst、editor、general-purpose。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  - web-research、report-writer 是**技能**（写作指南），**不是**子 Agent，禁止作为 subagent_type 调用</span></span>
<span class="line"><span>  - 报告起草、修订、定稿由**主 Agent 自己**用 write_file / edit_file 完成，不要委派 task</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## 委派规则</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  - 每个调研员只负责一个聚焦的子主题</span></span>
<span class="line"><span>  - **每份报告最多 3 个调研员**——只选最相关的子主题</span></span>
<span class="line"><span>  - 框架对比类任务：优先调研用户明确点名的框架；否则选最重要的 3 个</span></span>
<span class="line"><span>  - 最多并行启动 3 个调研员，已有 3 份 findings 文件后不再新增调研员</span></span>
<span class="line"><span>  - 仅在确实需要数值计算时使用分析师</span></span>
<span class="line"><span>  - 每份报告只调用编辑一次（草稿完成后）</span></span>
<span class="line"><span>  - 调研完成后直接进入起草 → 审阅 → 定稿，不要额外开调研轮次</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## 文件约定</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  - 计划与原始资料：/workspace/sources/</span></span>
<span class="line"><span>  - 草稿与终稿：/workspace/reports/</span></span>
<span class="line"><span>  - 同一时间只编辑一个文件，避免冲突</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ## 完成时告知用户</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  - 最终报告保存路径</span></span>
<span class="line"><span>  - 2–3 句话的核心发现摘要</span></span>
<span class="line"><span>  - 调研中的局限或信息缺口</span></span>
<span class="line"><span>\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportfunction createIntelligenceDeskAgent() {</span></span>
<span class="line"><span>const apiKey = process.env.OPENAI_API_KEY?.trim();</span></span>
<span class="line"><span>if (!apiKey) {</span></span>
<span class="line"><span>    thrownewError(&quot;未设置 OPENAI_API_KEY 环境变量&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = process.env.OPENAI_MODEL?.trim() || &quot;gpt-4o&quot;;</span></span>
<span class="line"><span>const baseURL = process.env.OPENAI_BASE_URL?.trim() || undefined;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const backend = new FilesystemBackend({</span></span>
<span class="line"><span>    rootDir: projectDir,</span></span>
<span class="line"><span>    virtualMode: true,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return createDeepAgent({</span></span>
<span class="line"><span>    model: new ChatOpenAI({</span></span>
<span class="line"><span>      model,</span></span>
<span class="line"><span>      temperature: 0,</span></span>
<span class="line"><span>      apiKey,</span></span>
<span class="line"><span>      ...(baseURL</span></span>
<span class="line"><span>        ? {</span></span>
<span class="line"><span>            configuration: {</span></span>
<span class="line"><span>              baseURL,</span></span>
<span class="line"><span>            },</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        : {}),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>    systemPrompt: orchestratorPrompt,</span></span>
<span class="line"><span>    backend,</span></span>
<span class="line"><span>    memory: [path.join(projectDir, &quot;AGENTS.md&quot;)],</span></span>
<span class="line"><span>    skills: [&quot;/skills/&quot;],</span></span>
<span class="line"><span>    subagents: [researcherSubAgent, editorSubAgent, analystSubAgent],</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export { projectDir };</span></span></code></pre></div><p>我们直接用 createDeepAgent 的 api，这样不用自己组装 middleware 了，配置下 skills 目录、memory 的文件路径、子 agent 就好了。</p><p>这里的 dedent 是去掉换行和缩进的空格，换成 \\n 的：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffvmE9oiawytsnibTv3EXRZmwHhhxm6KVnvJDFibMlS1kLaqCAO7y2OicN49SQDgDeTNsNH8cvqsaQo4ajUCzVpcRFEYp8Lm8WJEKU/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=2" alt="图片" referrerpolicy="no-referrer"></p><p>写代码的时候正常缩进，用这个可以自动去掉换成 \\n</p><p>然后分析的子 Agent 需要执行代码，用到了 quickjs 这个 js 引擎来执行：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdRD0Ij4c2O54iaT5Jew02fArj558zncuMVhjJvbAHgcSeo8XqkveiakXD8D2kBkS1pvm7UhUpXOCbiahhd0fZd3Bqul3CUt8k2QA/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=3" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfd53t9VLEhicPiaVkickT2Vn5Ljicdkxmc43nkA341DaibNbY87cVNoWdgMRRZrtgxfdQtraeKIoMvrQj9tLIzxfLxakXFRTz1d059o/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=4" alt="图片" referrerpolicy="no-referrer"></p><p>还有一个 src/cli.mjs 就是调用这个 agent，格式化下输出（直接从仓库复制吧）</p><p>还有两个 skill：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfc62yngoKYkUJCMe4kPK2duVeUMNFfqLYlRGNJZcJbcRN4ib4oeTBgIA6RGbJvibFlTtseiaoOoCWS4rCohZWT1I4AOiclBHwRgZx8/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=5" alt="图片" referrerpolicy="no-referrer"></p><p>skill 就是对 prompt 的封装，这里就是告诉 agent 怎么网络搜索、怎么写报告的</p><p>跑一下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node src/cli.mjs  &quot;调研国家统计局公开的2023年省级地区生产总值（GDP）数据：提取GDP总量前6名省份的具体数值及同 比增速，计算六省GDP总和、各省占全国GDP的比重，并按增速从高到低排名&quot;</span></span></code></pre></div><p>神光的编程秘籍</p><p>这样，一个可以加载 skills、有自动读取长期记忆 Agents.md、多个子 Agent 的 Agent 就完成了。</p><p>网络搜索的 tool 前面用过几次了。</p><p>重点是这个沙箱执行代码的 tool</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffCjOF3rr3aphD49oDzrydeSbd8omocTTGdhp0xYUIl3bFxlndWwDN8NHPUdAgImySicheibEtFMjU7tZWb8dRy0icsLlorZD734g/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=6" alt="图片" referrerpolicy="no-referrer"></p><p>大模型不会数学计算，涉及到计算的都是生成代码，用 eval 的 tool 来执行，这里是 js 代码用 quickjs 引擎来执行。</p><p>当然，你生成别的语言的代码也行，用对应的引擎执行即可。</p><p>这里有个 langsmith 小技巧：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeWz5GhNdfx6BrH3f2vP05buibx1o6FK3zMCSuWeh3v1rWRdYR3nc2NjrDSA6eoRvCHah4Ria6F5z5vrWVvg9UNGaZHtBCGjUq8I/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=7" alt="图片" referrerpolicy="no-referrer"></p><p>可以通过 filter 过滤出所有的 tool 来，更容易理清流程。</p><p>最后就是 todo 了，复杂任务不能走一步想一步，都要提前生成 todo 列表，一步步执行：</p><p>主 agent 的 todo 列表：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffYJUH1qwmMjchvGdyR1GvxpvUiczPKibS3RlDteCEjLsjH5VTLd6PLGdfcytFKAXOqia9e3ict5WZZicV81lSD6ictickAXx3GZzicznw/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=8" alt="图片" referrerpolicy="no-referrer"></p><p>当前的是 in_progress，完成后会标记为 completed</p><p>这个是调研员子 Agent 的 todo 列表：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfe1hBh1gU7sRM3Sd52Qz2BIicFQthD2Y5vybib3xSrLqUQvdpoD5URibvA1lmX4cJjZeBdW5m8tZCNtUGqTclK4FU8KonvUckRQBA/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>其实这个中间件是 langchain 提供的，我们用一下试试：</p><p>src/todo-middleware-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  createAgent,</span></span>
<span class="line"><span>  HumanMessage,</span></span>
<span class="line"><span>  todoListMiddleware,</span></span>
<span class="line"><span>} from&quot;langchain&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.OPENAI_MODEL,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>configuration: { </span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;你是生活规划助手。收到需要多步完成的请求时，先用 write_todos 列出中文执行步骤，然后简要说明你的计划。&quot;,</span></span>
<span class="line"><span>middleware: [todoListMiddleware()],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const query =</span></span>
<span class="line"><span>&quot;我下周末想带爸妈去杭州玩两天，帮我规划一下：交通怎么选、住哪里方便、必去景点和吃什么，预算控制在人均 1500 元左右。&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await agent.invoke({</span></span>
<span class="line"><span>messages: [new HumanMessage(query)],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;todos:&quot;, JSON.stringify(result.todos, null, 2));</span></span>
<span class="line"><span>console.log(&quot;─&quot;.repeat(50));</span></span>
<span class="line"><span>console.log(&quot;回复:&quot;, result.messages.at(-1)?.content);</span></span></code></pre></div><p>用 createAgent + todoListMiddleware</p><p>这个中间件自带了 write_todos 的 tool，会生成 todo 列表写到 graph 的 state 里</p><p>神光的编程秘籍</p><p>这是 langchain 提供的中间件：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfegBibuG0UcL5JokZntib0Kz9nWbicv3mwEmnEJgiaWXmTJyfIkVQ3xgBoX40wsxcKeVr1RJ9ibnZZSJPjaMeBGdib9r2aRtS0FN6jxY/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=10" alt="图片" referrerpolicy="no-referrer"></p><p>我们的 Agent 里也可以用。</p><p>通过这个 agent，我们把 deepagents 的 createDeepAgent 的 todo 规划、多 Agent 执行、skill、memory 等用了一遍。</p><p>相比自己调用中间件，它集成了各种中间件，内置了对应的 prompt，用起来更简单</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcelxD4tnKjfCvr5tRhsKcGbBFrxkibzG8rSz415IsMTDSGgN09gKN8nqPGZ5MgfzkhEZdlXztq9icCoSzOicE6gKoTVkwSe0sHnQ/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=11" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdqpLA37XfJx0fCKatdia25d8AVbYic6rtQ09smICgtEnAmHY8kF4uibwgQAG70UtWzurwX6SHWDLyuo3BFlJxw1JfbGgYX3L81YU/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=12" alt="图片" referrerpolicy="no-referrer"></p><p>上下文压缩这块，内置逻辑是每个模型有输入上下文限制，达到 85% 会触发总结，保留 10%</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffNL8sWWREAkm6S72yEj64ibd14jYaM4F5mv3FiahzjBiamXzY5X0LIk29ZiacaQpFurw0MKCs8WrHibWq3vIKCRYric5VK47juWH1ib0/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=13" alt="图片" referrerpolicy="no-referrer"></p><p>qwen 模型没这个，我们我们可以这样改：</p><p>src/max-input-tokens-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    model: process.env.OPENAI_MODEL,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: { </span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(model.profile.maxInputTokens);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Object.defineProperty(model, &quot;profile&quot;, {</span></span>
<span class="line"><span>get: () =&gt; ({ maxInputTokens: 131_072 }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(model.profile.maxInputTokens);</span></span></code></pre></div><p>神光的编程秘籍</p><p>我们改下这个值，就可以实现对上下文压缩触发阈值的修改：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdibicCzglYcNDuUo0qic3LicF15ocgmax0PiakIPWWuUjtc0kHXhlf64tfTqOuAA9h7blDIXUazKAsgr0RPicvmkdDRRNDA1gpoS6e8/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=14" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcOGGHc3V2Nm3RoGt8Q4g8wan6qH9I4iaicWaHMsN1uvuEvEzaD9McABGf3mXwCDfTYpuCjNwVgibftUa6uDrvFfxeq1n5fRgw6u4/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1#imgIndex=15" alt="图片" referrerpolicy="no-referrer"></p><p>而且，触发摘要后，会把会话原文记录在 conversation_history 目录下归档：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffzZoNFJWyBluhuicibZptOE3CbCAwwZt89OgEibVRTx8Q6IDxCJUtbOcmGMM1ViajoBvhPJvwViaBOAjfialIujXBgLkvXXrLbMI1Gk/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>我们基于 DeepAgents 的 createDeepAgent api 实现了深度调研助手。</p><p>这是一个多 Agent 架构的 agent</p><p>主 Agent 会列出 todo 列表，按步执行，具体的调研、数据计算分析、报告编辑，由三个子 Agent 负责，它们有各自的能力，比如网络搜索、沙盒执行代码</p><p>子 Agent 执行的时候，如果需要多个步骤，也是先列 todo 列表再执行，比如调研的时候。执行完更改 todo 任务状态。</p><p>Agents.md 的长期记忆、skill 执行 等都是内置了，配置一下就行。</p><p>上下文压缩也是内置功能，可以修改 profile.maxInputTokens 来修改触发阈值。</p><p>这样，我们没有写很多代码，就完成了一个多 Agent 架构支持 skill 的功能比较完善的 Agent，这就是 DeepAgents 开发 Agent 的好处，有很多开箱即用的能力。</p>`,91)])])}const u=s(l,[["render",i]]);export{d as __pageData,u as default};
