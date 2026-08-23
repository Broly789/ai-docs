import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const l="/ai-docs/assets/1.B3yqs3JI.mp4",i="/ai-docs/assets/2.BPK5X7Jj.mp4",t="/ai-docs/assets/3.C-T6ZkQn.mp4",c="/ai-docs/assets/4.xfSC-IHD.mp4",o="/ai-docs/assets/5.DFADG1Xa.mp4",r="/ai-docs/assets/6.Dfsvyk9O.mp4",y=JSON.parse('{"title":"Mem0：分层记忆 + 三路召回的长期记忆方案","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/33-Mem0：分层记忆 + 三路召回的长期记忆方案/index.md","filePath":"前端转AI Agent/33-Mem0：分层记忆 + 三路召回的长期记忆方案/index.md"}'),m={name:"前端转AI Agent/33-Mem0：分层记忆 + 三路召回的长期记忆方案/index.md"};function u(d,s,g,q,h,_){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="mem0-分层记忆-三路召回的长期记忆方案" tabindex="-1">Mem0：分层记忆 + 三路召回的长期记忆方案 <a class="header-anchor" href="#mem0-分层记忆-三路召回的长期记忆方案" aria-label="Permalink to &quot;Mem0：分层记忆 + 三路召回的长期记忆方案&quot;">​</a></h1><p>我们用 DeepAgents 的中间件做了消息摘要和截断，并用 Redis 搭建短期记忆存储。</p><p>而长期记忆要放到向量数据库中，通过语义检索</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfe6A7NskGncLmOa92ibIkx1cIqOVHIK3ibokywZNbHeshLlwviadLKaQXPT90TzOibIApndQJbY6FyJcN2X8f1c7EnueaspNnBcy7U/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>但只是语义检索还不够，最好还要支持关键词检索、知识图谱检索</p><ul><li>语义检索：基于向量数据库实现语义相似度匹配，支持模糊意图、同义表述的历史记忆召回；</li><li>关键词检索：构建倒排索引，针对实体、专有名词、关键参数等内容做精准检索补充；</li><li>知识图谱推理检索：通过抽取实体与实体间关系，实现多跳关联检索与逻辑推理，强化记忆的关联挖掘能力。</li></ul><p>三类检索能力协同工作，三路融合召回，以提升长期记忆召回的准确率与有效性。</p><p>但自己做这个还是挺麻烦的，有没有啥现成的长期记忆方案呢？</p><p>有的，就是 mem0</p><p>它是业界主流的 Agent 长期记忆库，原生集成向量语义检索、BM25 关键词检索、知识图谱关联检索三大能力，默认完成三路检索的融合打分与结果排序，完全契合我们的技术需求。</p><p>引入 Mem0 后，无需从零实现记忆检索能力，能够大幅缩短项目落地周期，降低开发成本，快速上线具备完整三路召回能力的长期记忆体系。</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcsUj0YscPXps5S6XQiaGQoF4jWjlG3m9ibc0ice87TwKuK5biawy5fa0Dx7icgr8hZundV2IIHRXYSicYulrJwJWYiaiar9X1GLoEGtSI/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>我们来用一下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir mem0-test</span></span>
<span class="line"><span>cd mem0-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcJibXIqibfEf5cduV5UCia4vAn9NPMdOEPPahhiaCVMEIz8gt0oaY0cvtPtcejNWOYlWQI8LZdD3e9r6LIdCf2R9yDvXPGYibhnG94/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install mem0ai dotenv</span></span></code></pre></div><p>创建 src/mem0-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { MemoryClient } from&#39;mem0ai&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const USER_ID = &#39;demo-user&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function log(title, data) {</span></span>
<span class="line"><span>console.log(\`\\n=== \${title} ===\`);</span></span>
<span class="line"><span>console.log(typeof data === &#39;string&#39; ? data : JSON.stringify(data, null, 2));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const conversation = [</span></span>
<span class="line"><span>    { role: &#39;user&#39;, content: &#39;我是素食主义者，而且对坚果过敏。&#39; },</span></span>
<span class="line"><span>    { role: &#39;assistant&#39;, content: &#39;好的，我会记住你的饮食偏好。&#39; },</span></span>
<span class="line"><span>    { role: &#39;user&#39;, content: &#39;我住在北京，平时喜欢跑步。&#39; },</span></span>
<span class="line"><span>    { role: &#39;assistant&#39;, content: &#39;已记录：北京、爱好跑步。&#39; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const added = await client.add(conversation, { userId: USER_ID });</span></span>
<span class="line"><span>  log(&#39;添加记忆&#39;, added);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const searchResult = await client.search(&#39;用户的饮食限制是什么？中文回答&#39;, {</span></span>
<span class="line"><span>    filters: { user_id: USER_ID },</span></span>
<span class="line"><span>    topK: 5,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  log(&#39;搜索记忆&#39;, searchResult);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const allMemories = await client.getAll({</span></span>
<span class="line"><span>    filters: { user_id: USER_ID },</span></span>
<span class="line"><span>    pageSize: 10,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  log(&#39;列出全部记忆&#39;, allMemories);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const firstMemory = allMemories.results?.[0] ?? searchResult.results?.[0];</span></span>
<span class="line"><span>if (firstMemory?.id) {</span></span>
<span class="line"><span>    const memory = await client.get(firstMemory.id);</span></span>
<span class="line"><span>    log(&#39;获取单条记忆&#39;, memory);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const updated = await client.update(firstMemory.id, {</span></span>
<span class="line"><span>      text: \`\${memory.memory ?? firstMemory.memory}（已通过示例脚本更新）\`,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    log(&#39;更新记忆&#39;, updated);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const history = await client.history(firstMemory.id);</span></span>
<span class="line"><span>    log(&#39;记忆变更历史&#39;, history);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (process.argv.includes(&#39;--cleanup&#39;)) {</span></span>
<span class="line"><span>    const deleted = await client.deleteAll({ userId: USER_ID });</span></span>
<span class="line"><span>    log(&#39;清理测试数据&#39;, deleted);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    console.log(&#39;\\n提示: 运行 \`node src/mem0-test.mjs --cleanup\` 可删除本次测试用户的全部记忆&#39;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main().catch((error) =&gt; {</span></span>
<span class="line"><span>console.error(&#39;\\n执行失败:&#39;, error.message ?? error);</span></span>
<span class="line"><span>if (error.suggestion) {</span></span>
<span class="line"><span>    console.error(&#39;建议:&#39;, error.suggestion);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>跑一下：</p><p><video src="`+l+'" controls></video></p><p>mem0 只要配一个 apikey 就可以存储记忆、检索记忆了。</p><p>但免费版是有调用次数限制的：</p><p><video src="'+i+`" controls></video></p><p>后面我们自己部署一下。</p><p>mem0 一共有三种记忆的作用范围：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_jpg/NMByQQfVwfedHQGROboCIv7PgB5UkCptH64UNDrGSypia03ejHia7yrHtYyV6E0P7Yibc5sP9mvKeYy7VKHr7aib0bmHgPia4L5Ijb6UlYADR2oE/640?wx_fmt=jpeg&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p><strong>用户记忆（User Memory）</strong></p><p>绑定 userId，存的是跟着人走的长期信息：姓名、城市、偏好、习惯等。</p><p>换会话、换 Agent 也能读到，适合个性化和跨场景复用。</p><p><strong>会话记忆（Session Memory）</strong></p><p>绑定 userId + runId，存的是当前这次对话里的任务上下文：这次要做什么、讨论到哪一步、临时目标等。</p><p>会话结束后可以清理，不会和别的 thread 混在一起。</p><p><strong>Agent 记忆（Agent Memory）</strong></p><p>绑定 agentId，存的是某个 Agent 自己的设定：角色、语气、回答方式、专业领域等。</p><p>同一个用户换不同 Agent，各自保持独立人格和风格。</p><p><strong>用户记忆管“这个人”，会话记忆管“这次聊什么”，Agent 记忆管“这个助手是谁”。</strong></p><p>我们分别存取一下试试：</p><p>src/mem0-scoped-memory-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * Mem0 三种记忆 scope 的 API 测试</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * add / search 分开调用，自行决定何时 search（add 为异步处理）</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>import&quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MemoryClient } from&quot;mem0ai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const USER_ID = &quot;mem0_test_user&quot;;</span></span>
<span class="line"><span>const RUN_ID = &quot;mem0_test_session&quot;;</span></span>
<span class="line"><span>const AGENT_ID = &quot;mem0_test_agent&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function log(title, data) {</span></span>
<span class="line"><span>console.log(\`\\n=== \${title} ===\`);</span></span>
<span class="line"><span>console.log(typeof data === &quot;string&quot; ? data : JSON.stringify(data, null, 2));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction addUserMemory(client) {</span></span>
<span class="line"><span>const messages = [</span></span>
<span class="line"><span>    { role: &quot;user&quot;, content: &quot;我叫小明，住在杭州，平时喜欢骑行和摄影。&quot; },</span></span>
<span class="line"><span>    { role: &quot;assistant&quot;, content: &quot;好的，已记住你的姓名、城市和爱好。&quot; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span>const added = await client.add(messages, { userId: USER_ID });</span></span>
<span class="line"><span>  log(&quot;用户记忆 — add&quot;, added);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction searchUserMemory(client) {</span></span>
<span class="line"><span>const searched = await client.search(&quot;用户住在哪里，有什么爱好&quot;, {</span></span>
<span class="line"><span>    filters: { user_id: USER_ID },</span></span>
<span class="line"><span>    topK: 5,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  log(&quot;用户记忆 — search&quot;, searched.results?.map((m) =&gt; m.memory) ?? []);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const listed = await client.getAll({ filters: { user_id: USER_ID }, pageSize: 5 });</span></span>
<span class="line"><span>  log(&quot;用户记忆 — getAll&quot;, listed.results?.map((m) =&gt; m.memory) ?? []);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction addSessionMemory(client) {</span></span>
<span class="line"><span>const messages = [</span></span>
<span class="line"><span>    { role: &quot;user&quot;, content: &quot;这次聊天先帮我把季度总结的大纲列出来，重点写 Q1 的项目复盘。&quot; },</span></span>
<span class="line"><span>    { role: &quot;assistant&quot;, content: &quot;明白，我们先围绕 Q1 项目复盘整理季度总结大纲。&quot; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span>const added = await client.add(messages, { userId: USER_ID, runId: RUN_ID });</span></span>
<span class="line"><span>  log(&quot;会话记忆 — add&quot;, added);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction searchSessionMemory(client) {</span></span>
<span class="line"><span>const searched = await client.search(&quot;这次对话要先做什么&quot;, {</span></span>
<span class="line"><span>    filters: { AND: [{ user_id: USER_ID }, { run_id: RUN_ID }] },</span></span>
<span class="line"><span>    topK: 5,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  log(&quot;会话记忆 — search&quot;, searched.results?.map((m) =&gt; m.memory) ?? []);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const listed = await client.getAll({</span></span>
<span class="line"><span>    filters: { AND: [{ user_id: USER_ID }, { run_id: RUN_ID }] },</span></span>
<span class="line"><span>    pageSize: 5,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  log(&quot;会话记忆 — getAll&quot;, listed.results?.map((m) =&gt; m.memory) ?? []);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction addAgentMemory(client) {</span></span>
<span class="line"><span>const messages = [</span></span>
<span class="line"><span>    { role: &quot;user&quot;, content: &quot;你现在是旅行规划助手，回答时多给具体建议和备选方案。&quot; },</span></span>
<span class="line"><span>    { role: &quot;assistant&quot;, content: &quot;好的，我会以旅行规划助手的身份，提供具体建议和备选方案。&quot; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span>const added = await client.add(messages, { agentId: AGENT_ID });</span></span>
<span class="line"><span>  log(&quot;Agent 记忆 — add&quot;, added);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction searchAgentMemory(client) {</span></span>
<span class="line"><span>const searched = await client.search(&quot;这个 Agent 的角色和回答方式&quot;, {</span></span>
<span class="line"><span>    filters: { agent_id: AGENT_ID },</span></span>
<span class="line"><span>    topK: 5,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  log(&quot;Agent 记忆 — search&quot;, searched.results?.map((m) =&gt; m.memory) ?? []);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const listed = await client.getAll({ filters: { agent_id: AGENT_ID }, pageSize: 5 });</span></span>
<span class="line"><span>  log(&quot;Agent 记忆 — getAll&quot;, listed.results?.map((m) =&gt; m.memory) ?? []);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>if (!process.env.MEM0_API_KEY) {</span></span>
<span class="line"><span>    console.error(&quot;缺少 MEM0_API_KEY&quot;);</span></span>
<span class="line"><span>    process.exit(1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });</span></span>
<span class="line"><span>const action = process.argv[2] ?? &quot;add&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (process.argv.includes(&quot;--cleanup&quot;)) {</span></span>
<span class="line"><span>    await client.deleteAll({ userId: USER_ID });</span></span>
<span class="line"><span>    await client.deleteAll({ userId: USER_ID, runId: RUN_ID });</span></span>
<span class="line"><span>    await client.deleteAll({ agentId: AGENT_ID });</span></span>
<span class="line"><span>    log(&quot;清理完成&quot;, { USER_ID, RUN_ID, AGENT_ID });</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (action === &quot;add&quot;) {</span></span>
<span class="line"><span>    await addUserMemory(client);</span></span>
<span class="line"><span>    await addSessionMemory(client);</span></span>
<span class="line"><span>    await addAgentMemory(client);</span></span>
<span class="line"><span>    console.log(&quot;\\nadd 已提交（异步处理），稍后再运行: pnpm scoped-memory search&quot;);</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (action === &quot;search&quot;) {</span></span>
<span class="line"><span>    await searchUserMemory(client);</span></span>
<span class="line"><span>    await searchSessionMemory(client);</span></span>
<span class="line"><span>    await searchAgentMemory(client);</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.error(\`未知命令: \${action}，可用: add | search | --cleanup\`);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main().catch((error) =&gt; {</span></span>
<span class="line"><span>console.error(&quot;\\n执行失败:&quot;, error.message ?? error);</span></span>
<span class="line"><span>if (error.suggestion) console.error(&quot;建议:&quot;, error.suggestion);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>跑一下：</p><p><video src="`+t+`" controls></video></p><p>用户、会话、Agent 三种级别的 scope 可以独立的存储和检索记忆。</p><p>然后我们在 Agent 里接入 mem0 做长期记忆，用 Redis 存做短期记忆</p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/openai dotenv ioredis langchain mem0ai zod</span></span></code></pre></div><p>改下 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MEM0_API_KEY=m0-xx</span></span>
<span class="line"><span></span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span>OPENAI_API_KEY=sk-xx</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 用于身份验证，实现链路上报</span></span>
<span class="line"><span>LANGCHAIN_API_KEY=xx</span></span>
<span class="line"><span># 指定LangSmith中的项目，追踪结果会归类到该项目下</span></span>
<span class="line"><span>LANGCHAIN_PROJECT=mem0-test</span></span>
<span class="line"><span># 开启LangSmith追踪功能</span></span>
<span class="line"><span>LANGCHAIN_TRACING_V2=true</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Redis（默认与 docker-compose 一致）</span></span>
<span class="line"><span>REDIS_HOST=localhost</span></span>
<span class="line"><span>REDIS_PORT=6379</span></span>
<span class="line"><span>REDIS_DB=0</span></span>
<span class="line"><span>MEMORY_TTL_SECONDS=1800</span></span>
<span class="line"><span>MEMORY_SESSION_ID=session_001</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Mem0：MEM0_USER_ID=用户层，MEMORY_SESSION_ID=会话层 run_id</span></span>
<span class="line"><span>MEM0_USER_ID=demo_user_001</span></span>
<span class="line"><span>MEM0_TOP_K=5</span></span></code></pre></div><p>创建 docker-compose.yml （我们要跑 redis 来存短期记忆）</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>services:</span></span>
<span class="line"><span>  # Redis</span></span>
<span class="line"><span>redis:</span></span>
<span class="line"><span>    image:redis:7-alpine</span></span>
<span class="line"><span>    container_name:redis-mem0-test</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;6379:6379&quot;</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/redis:/data</span></span>
<span class="line"><span>    command:redis-server--appendonlyyes</span></span>
<span class="line"><span>    healthcheck:</span></span>
<span class="line"><span>      test:[&quot;CMD&quot;,&quot;redis-cli&quot;,&quot;ping&quot;]</span></span>
<span class="line"><span>      interval:5s</span></span>
<span class="line"><span>      timeout:5s</span></span>
<span class="line"><span>      retries:5</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Redis 官方 Web GUI（类似 pgAdmin）</span></span>
<span class="line"><span>redisinsight:</span></span>
<span class="line"><span>    image:redis/redisinsight:2.50</span></span>
<span class="line"><span>    container_name:redisinsight-mem0-test</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;5540:5540&quot;</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/redisinsight:/data</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      -RI_HOST=0.0.0.0</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      -redis</span></span>
<span class="line"><span></span></span>
<span class="line"><span>networks:</span></span>
<span class="line"><span>default:</span></span>
<span class="line"><span>    name:common-network</span></span></code></pre></div><p>创建 mem0-redis-mem0-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * Redis 记这轮聊天，Mem0 记值得长期留着的事。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 用户层 = 换天聊还认得你；会话层 = 只管当前这个聊天窗口。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * docker compose up -d redis 后 pnpm agent</span></span>
<span class="line"><span> * :clear 清 Redis | :clear-mem0 清 Mem0 | exit/:q 退出</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>import&quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import Redis from&quot;ioredis&quot;;</span></span>
<span class="line"><span>import * as readline from&quot;node:readline/promises&quot;;</span></span>
<span class="line"><span>import { stdin, stdout } from&quot;node:process&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { MemoryClient } from&quot;mem0ai&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  SystemMessage,</span></span>
<span class="line"><span>  SystemMessageChunk,</span></span>
<span class="line"><span>  HumanMessage,</span></span>
<span class="line"><span>  mapChatMessagesToStoredMessages,</span></span>
<span class="line"><span>  mapStoredMessagesToChatMessages,</span></span>
<span class="line"><span>} from&quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { createAgent, summarizationMiddleware } from&quot;langchain&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const REDIS_HOST = process.env.REDIS_HOST ?? &quot;localhost&quot;;</span></span>
<span class="line"><span>const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);</span></span>
<span class="line"><span>const REDIS_DB = Number(process.env.REDIS_DB ?? 0);</span></span>
<span class="line"><span>const MEMORY_TTL = Number(process.env.MEMORY_TTL_SECONDS ?? 1800);</span></span>
<span class="line"><span>const KEY_PREFIX = process.env.MEMORY_KEY_PREFIX ?? &quot;agent:short_memory&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const USER_ID = process.env.MEM0_USER_ID ?? &quot;demo_user_001&quot;;</span></span>
<span class="line"><span>const SESSION_ID = process.env.MEMORY_SESSION_ID ?? &quot;session_001&quot;;</span></span>
<span class="line"><span>const MEM0_TOP_K = Number(process.env.MEM0_TOP_K ?? 5);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const memorySchema = z.object({</span></span>
<span class="line"><span>write_user: z</span></span>
<span class="line"><span>    .boolean()</span></span>
<span class="line"><span>    .describe(</span></span>
<span class="line"><span>      &quot;写入用户层：换一个新会话仍应保留的长期事实（身份、居住地、长期爱好、饮食禁忌、持久偏好）。不含仅本轮任务。&quot;,</span></span>
<span class="line"><span>    ),</span></span>
<span class="line"><span>write_session: z</span></span>
<span class="line"><span>    .boolean()</span></span>
<span class="line"><span>    .describe(</span></span>
<span class="line"><span>      &quot;写入会话层：仅当前会话/thread 有效的任务、大纲、进度、待办、临时决策（如「这次先写…」「数据部分明天补」）。&quot;,</span></span>
<span class="line"><span>    ),</span></span>
<span class="line"><span>reason: z.string().describe(&quot;分类理由，一句话&quot;),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const CLASSIFIER_PROMPT = \`你是记忆分层分类器。判断本轮对话是否有「新事实」需写入 Mem0，并分到正确层级。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## user 层（跨会话长期）</span></span>
<span class="line"><span>- 用户身份与画像：姓名、职业、居住地、长期爱好</span></span>
<span class="line"><span>- 长期偏好与约束：饮食过敏、回答风格、常用技术栈</span></span>
<span class="line"><span>- 持续数周以上的个人背景（非单次任务）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## session 层（仅当前会话）</span></span>
<span class="line"><span>- 当前正在做的任务、目标、文档大纲、方案草稿</span></span>
<span class="line"><span>- 本会话内的进度、决策、待办、临时约定</span></span>
<span class="line"><span>- 用户明确用「这次」「本轮」「当前会话」描述的工作上下文</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 均不写入</span></span>
<span class="line"><span>- 寒暄、致谢、纯确认</span></span>
<span class="line"><span>- 助手生成的通用内容（攻略、示例代码、建议清单），用户未明确采纳为新事实</span></span>
<span class="line"><span>- 无信息增量的复述</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 决策原则</span></span>
<span class="line"><span>1. 「这次我们先写 Q1 总结」「当前在排查 XX」→ 优先 session，不要标成 user</span></span>
<span class="line"><span>2. user 与 session 可同时为 true（如同时说职业+当前任务），但勿把纯会话任务只标 user</span></span>
<span class="line"><span>3. 一次性请求（如「帮我做旅行攻略」）且未产生需跨轮记住的约定 → 均为 false\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const summaryPrompt = \`你是对话摘要助手。用中文简洁总结：话题、会话内进度/报错/待办。</span></span>
<span class="line"><span>用户级长期偏好由外部记忆维护，摘要勿重复堆砌。不要编造。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>待摘要的对话：</span></span>
<span class="line"><span>{messages}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>摘要：\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** Mem0 注入的 SystemMessage 不写回 Redis */</span></span>
<span class="line"><span>function messagesForRedis(messages) {</span></span>
<span class="line"><span>return messages.filter(</span></span>
<span class="line"><span>    (m) =&gt; !SystemMessage.isInstance(m) &amp;&amp; !SystemMessageChunk.isInstance(m),</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class RedisMessageStore {</span></span>
<span class="line"><span>constructor({ redis, keyPrefix, ttlSeconds }) {</span></span>
<span class="line"><span>    this.redis = redis;</span></span>
<span class="line"><span>    this.keyPrefix = keyPrefix;</span></span>
<span class="line"><span>    this.ttlSeconds = ttlSeconds;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  messagesKey(sessionId) {</span></span>
<span class="line"><span>    return\`\${this.keyPrefix}:\${sessionId}:messages\`;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async loadMessages(sessionId) {</span></span>
<span class="line"><span>    const raw = awaitthis.redis.get(this.messagesKey(sessionId));</span></span>
<span class="line"><span>    if (!raw) return [];</span></span>
<span class="line"><span>    return mapStoredMessagesToChatMessages(JSON.parse(raw));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async saveMessages(sessionId, messages) {</span></span>
<span class="line"><span>    const payload = JSON.stringify(mapChatMessagesToStoredMessages(messages));</span></span>
<span class="line"><span>    awaitthis.redis.set(this.messagesKey(sessionId), payload, &quot;EX&quot;, this.ttlSeconds);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async clear(sessionId) {</span></span>
<span class="line"><span>    awaitthis.redis.del(this.messagesKey(sessionId));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async ttl(sessionId) {</span></span>
<span class="line"><span>    returnthis.redis.ttl(this.messagesKey(sessionId));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class Mem0MemoryStore {</span></span>
<span class="line"><span>constructor({ client, userId, sessionId, topK, classifier }) {</span></span>
<span class="line"><span>    this.client = client;</span></span>
<span class="line"><span>    this.userId = userId;</span></span>
<span class="line"><span>    this.sessionId = sessionId;</span></span>
<span class="line"><span>    this.topK = topK;</span></span>
<span class="line"><span>    this.classifier = classifier;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async search(query) {</span></span>
<span class="line"><span>    const [userRes, sessionRes] = awaitPromise.all([</span></span>
<span class="line"><span>      this.client.search(query, {</span></span>
<span class="line"><span>        filters: { user_id: this.userId },</span></span>
<span class="line"><span>        topK: this.topK,</span></span>
<span class="line"><span>      }),</span></span>
<span class="line"><span>      this.client.search(query, {</span></span>
<span class="line"><span>        filters: {</span></span>
<span class="line"><span>          AND: [{ user_id: this.userId }, { run_id: this.sessionId }],</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        topK: this.topK,</span></span>
<span class="line"><span>      }),</span></span>
<span class="line"><span>    ]);</span></span>
<span class="line"><span>    return {</span></span>
<span class="line"><span>      user: userRes.results ?? [],</span></span>
<span class="line"><span>      session: sessionRes.results ?? [],</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  buildSystemMessage({ user, session }) {</span></span>
<span class="line"><span>    const blocks = [];</span></span>
<span class="line"><span>    if (user.length) {</span></span>
<span class="line"><span>      blocks.push(\`【用户长期记忆】\\n\${user.map((m) =&gt; \`- \${m.memory}\`).join(&quot;\\n&quot;)}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (session.length) {</span></span>
<span class="line"><span>      blocks.push(\`【当前会话记忆】\\n\${session.map((m) =&gt; \`- \${m.memory}\`).join(&quot;\\n&quot;)}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (!blocks.length) returnnull;</span></span>
<span class="line"><span>    returnnew SystemMessage(\`\${blocks.join(&quot;\\n\\n&quot;)}\\n\\n请结合以上记忆回答，勿编造。\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async classifyAndPersist(userText, assistantText) {</span></span>
<span class="line"><span>    const turn = [</span></span>
<span class="line"><span>      { role: &quot;user&quot;, content: userText },</span></span>
<span class="line"><span>      { role: &quot;assistant&quot;, content: assistantText },</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const { write_user, write_session, reason } = awaitthis.classifier.invoke([</span></span>
<span class="line"><span>      new SystemMessage(CLASSIFIER_PROMPT),</span></span>
<span class="line"><span>      new HumanMessage(\`用户：\${userText}\\n助手：\${assistantText}\`),</span></span>
<span class="line"><span>    ]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const written = [];</span></span>
<span class="line"><span>    if (write_user) {</span></span>
<span class="line"><span>      awaitthis.client.add(turn, { userId: this.userId });</span></span>
<span class="line"><span>      written.push(&quot;user&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (write_session) {</span></span>
<span class="line"><span>      awaitthis.client.add(turn, { userId: this.userId, runId: this.sessionId });</span></span>
<span class="line"><span>      written.push(&quot;session&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return { written, reason };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async clear() {</span></span>
<span class="line"><span>    awaitthis.client.deleteAll({ userId: this.userId });</span></span>
<span class="line"><span>    awaitthis.client.deleteAll({ userId: this.userId, runId: this.sessionId });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction invokeWithMemory(agent, redisStore, mem0Store, sessionId, userText) {</span></span>
<span class="line"><span>const history = await redisStore.loadMessages(sessionId);</span></span>
<span class="line"><span>console.log(\`  ↳ Redis 加载 \${history.length} 条历史\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const mem = await mem0Store.search(userText);</span></span>
<span class="line"><span>if (mem.user.length) console.log(\`  ↳ Mem0 用户层 \${mem.user.length} 条\`);</span></span>
<span class="line"><span>if (mem.session.length) console.log(\`  ↳ Mem0 会话层 \${mem.session.length} 条\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const memoryMsg = mem0Store.buildSystemMessage(mem);</span></span>
<span class="line"><span>const invokeMessages = [</span></span>
<span class="line"><span>    ...(memoryMsg ? [memoryMsg] : []),</span></span>
<span class="line"><span>    ...history,</span></span>
<span class="line"><span>    new HumanMessage(userText),</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await agent.invoke(</span></span>
<span class="line"><span>    { messages: invokeMessages },</span></span>
<span class="line"><span>    { recursionLimit: 30 },</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const redisMessages = messagesForRedis(result.messages);</span></span>
<span class="line"><span>const dropped = result.messages.length - redisMessages.length;</span></span>
<span class="line"><span>await redisStore.saveMessages(sessionId, redisMessages);</span></span>
<span class="line"><span>const ttl = await redisStore.ttl(sessionId);</span></span>
<span class="line"><span>console.log(</span></span>
<span class="line"><span>    \`  ↳ Redis 写回 \${redisMessages.length} 条\` +</span></span>
<span class="line"><span>      (dropped ? \`（过滤 \${dropped} 条 SystemMessage）\` : &quot;&quot;) +</span></span>
<span class="line"><span>      \` (TTL \${ttl}s)\`,</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const assistantText = String(result.messages.at(-1)?.content ?? &quot;&quot;);</span></span>
<span class="line"><span>const { written, reason } = await mem0Store.classifyAndPersist(userText, assistantText);</span></span>
<span class="line"><span>console.log(\`  ↳ 分类: \${reason}\`);</span></span>
<span class="line"><span>console.log(written.length ? \`  ↳ Mem0 写入: \${written.join(&quot;, &quot;)}\` : &quot;  ↳ Mem0 未写入&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return { messages: result.messages, redisMessages, assistantText };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (!process.env.MEM0_API_KEY || !process.env.OPENAI_API_KEY) {</span></span>
<span class="line"><span>console.error(&quot;需要 MEM0_API_KEY 与 OPENAI_API_KEY&quot;);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB });</span></span>
<span class="line"><span>const mem0 = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>redis.on(&quot;connect&quot;, () =&gt; console.log(&quot;✅ Redis 已连接&quot;));</span></span>
<span class="line"><span>redis.on(&quot;error&quot;, (err) =&gt; console.error(&quot;❌ Redis 错误:&quot;, err.message));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>await redis.ping();</span></span>
<span class="line"><span>} catch {</span></span>
<span class="line"><span>console.error(&quot;Redis 未连接，请先执行: docker compose up -d redis&quot;);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const redisStore = new RedisMessageStore({</span></span>
<span class="line"><span>  redis,</span></span>
<span class="line"><span>keyPrefix: KEY_PREFIX,</span></span>
<span class="line"><span>ttlSeconds: MEMORY_TTL,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const llmOpts = {</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ model: process.env.MODEL_NAME, ...llmOpts });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const classifier = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  ...llmOpts,</span></span>
<span class="line"><span>}).withStructuredOutput(memorySchema);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const mem0Store = new Mem0MemoryStore({</span></span>
<span class="line"><span>client: mem0,</span></span>
<span class="line"><span>userId: USER_ID,</span></span>
<span class="line"><span>sessionId: SESSION_ID,</span></span>
<span class="line"><span>topK: MEM0_TOP_K,</span></span>
<span class="line"><span>  classifier,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;你是会话助手。结合系统消息中的长期/会话记忆回答，中文简短。有对话摘要则据此继续。&quot;,</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    summarizationMiddleware({</span></span>
<span class="line"><span>      model,</span></span>
<span class="line"><span>      summaryPrompt,</span></span>
<span class="line"><span>      trigger: { messages: 8 },</span></span>
<span class="line"><span>      keep: { messages: 4 },</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`用户 \${USER_ID} | 会话 \${SESSION_ID}\`);</span></span>
<span class="line"><span>console.log(&quot;输入 exit / quit / :q 退出；:clear 清空 Redis；:clear-mem0 清空 Mem0\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const rl = readline.createInterface({ input: stdin, output: stdout });</span></span>
<span class="line"><span>let prevCount = (await redisStore.loadMessages(SESSION_ID)).length;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>while (true) {</span></span>
<span class="line"><span>    const userText = (await rl.question(&quot;你: &quot;)).trim();</span></span>
<span class="line"><span>    if (!userText) continue;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if ([&quot;exit&quot;, &quot;quit&quot;, &quot;:q&quot;].includes(userText.toLowerCase())) break;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (userText === &quot;:clear&quot;) {</span></span>
<span class="line"><span>      await redisStore.clear(SESSION_ID);</span></span>
<span class="line"><span>      prevCount = 0;</span></span>
<span class="line"><span>      console.log(&quot;已清空 Redis 短期记忆\\n&quot;);</span></span>
<span class="line"><span>      continue;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (userText === &quot;:clear-mem0&quot;) {</span></span>
<span class="line"><span>      await mem0Store.clear();</span></span>
<span class="line"><span>      console.log(&quot;已清空 Mem0 用户层与当前会话层\\n&quot;);</span></span>
<span class="line"><span>      continue;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const { redisMessages, assistantText } = await invokeWithMemory(</span></span>
<span class="line"><span>      agent,</span></span>
<span class="line"><span>      redisStore,</span></span>
<span class="line"><span>      mem0Store,</span></span>
<span class="line"><span>      SESSION_ID,</span></span>
<span class="line"><span>      userText,</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n助手:&quot;, assistantText);</span></span>
<span class="line"><span>    console.log(\`Redis 消息数: \${redisMessages.length}\`);</span></span>
<span class="line"><span>    if (redisMessages.length &lt; prevCount + 2) {</span></span>
<span class="line"><span>      console.log(&quot;  ⚡ 已触发压缩&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    prevCount = redisMessages.length;</span></span>
<span class="line"><span>    console.log();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} finally {</span></span>
<span class="line"><span>  rl.close();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await redis.quit();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/*</span></span>
<span class="line"><span> * 测试对话（复制进终端，先来 :clear-mem0 和 :clear）</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 一、寒暄</span></span>
<span class="line"><span> * 你好 / 在吗 / 谢谢</span></span>
<span class="line"><span> * → 纯客套，Mem0 不用记。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 二、自我介绍</span></span>
<span class="line"><span> * 我叫小明，住在杭州，平时喜欢骑行和摄影。</span></span>
<span class="line"><span> * 我对海鲜过敏，出差尽量别安排沿海城市。</span></span>
<span class="line"><span> * → 换天聊还得知道的事，写 user 层。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 三、这会儿在干嘛</span></span>
<span class="line"><span> * 这次我们先写 Q1 季度总结，大纲分三块：项目复盘、数据指标、下季度计划。</span></span>
<span class="line"><span> * 项目复盘里重点写 order-service 的 500 错误排查过程。</span></span>
<span class="line"><span> * → 只管这次聊天的事，写 session 层。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 四、长期背景 + 手头活</span></span>
<span class="line"><span> * 我长期做后端开发，这次会话的任务是排查 payment-api 超时，先从 P99 日志看起。</span></span>
<span class="line"><span> * 另外我之后技术回答都希望带代码示例，这个一直记住。</span></span>
<span class="line"><span> * → 职业和当前任务可能两层都写，偏好那条走 user。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 五、Redis 和 Mem0 各管啥</span></span>
<span class="line"><span> * 刚才说的 payment-api，超时阈值先假设 3 秒。</span></span>
<span class="line"><span> * 上一句我说的阈值是多少？</span></span>
<span class="line"><span> * → 刚说过的话 Redis 兜得住，不用等 Mem0。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 重启 agent（别清 mem0）再问：我是谁？有什么过敏？</span></span>
<span class="line"><span> * → 新会话 Redis 是空的，user 层还能认出你。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 六、聊多了会压缩（可选，连聊 8 轮以上）</span></span>
<span class="line"><span> * 继续完善 Q1 总结 / 把第二段改短 / 加个标题……</span></span>
<span class="line"><span> * → 终端会出现「已触发压缩」，老消息变摘要。</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 推荐顺序：清空 → 寒暄 → 自我介绍 → 当前任务 → 重启验 user → 清 mem0 验 session 没了</span></span>
<span class="line"><span> */</span></span></code></pre></div><p>跑一下：</p><p><video src="`+c+`" controls></video></p><p>这样，我们基于 Redis 实现了短期记忆，基于 Mem0 实现了长期记忆</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdNdatWh7bGzJZW3wam5QYkI79u5K17kZVCVgWLkml7T4d9QzwlE3zQWtwgpKicBQDI5RhwVEyGMiclYWHwI7LzZfXgy9gAWZiah0/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfe3S00NRw87ibbP4Zy9d8Ga9RtBD0iceq1bPNsEYpjuNo4Aro1WoZxcrAcINQ0cSakSyaUWCiantSnaTibicTibniciao2IUNFNpwZHQ24/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcUJBOWZicWv1YEfZpZT1FiaTMDpYic8ksibsQ5UBSYQhcnEMVBjaic0TvIeN6sWbfvr2h9ook7hmCzYKVEBR7Ua3UDsTttgOHbAzQo/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdLwHmJ57ib3vNbTicTP88GwjibdTHRBTqRWQ5sfxqApLGbpZ8OELicht7m1DuqSSuR0qdfj3436McNUTibXTYCL6ZceXXzexx3gMx4/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>豆包那种跨会话还能记住用户信息，就是做了长期记忆分层</p><p>用户相关的写入用户层，可以跨会话检索</p><p>当前会话相关的写入会话层，只在当前会话生效</p><p>每轮对话结束，调用大模型判断是 user、session 哪一层，分别存到不同层的长期记忆</p><p>这样跨会话聊天可以检索用户层的记忆，用户画像、偏好相关的信息可以长期保存</p><p>但现在直接用 mem0 现成的服务有一堆问题，比如请求次数限制，记忆都是英文的等。</p><p>接下来我们自己部署一下：</p><p>下载 mem0 源码：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>git clone git@github.com:mem0ai/mem0.git</span></span></code></pre></div><p>它 server 目录下有 docker-compose.yaml 配置，直接跑就行。</p><p>不过要先改一下 .env 配置文件</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Postgres — POSTGRES_PASSWORD is required; docker-compose will not start without it.</span></span>
<span class="line"><span>POSTGRES_HOST=postgres</span></span>
<span class="line"><span>POSTGRES_PORT=5432</span></span>
<span class="line"><span>POSTGRES_DB=postgres</span></span>
<span class="line"><span>POSTGRES_USER=postgres</span></span>
<span class="line"><span>POSTGRES_PASSWORD=12345678</span></span>
<span class="line"><span>POSTGRES_COLLECTION_NAME=memories</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ADMIN_API_KEY=</span></span>
<span class="line"><span>JWT_SECRET=+BpwM3kDGOuzDAt32gla4PBJmuNMLcw9ToNx3VOIvjad4G8gCfYqotABzic11zjZ</span></span>
<span class="line"><span># Local development only. Leave false in production.</span></span>
<span class="line"><span>AUTH_DISABLED=true</span></span>
<span class="line"><span>DASHBOARD_URL=http://localhost:3000</span></span>
<span class="line"><span>APP_DB_NAME=mem0_app</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Default LLM and embedder models. Provider must be in BUNDLED_*_PROVIDERS</span></span>
<span class="line"><span># (see server/main.py). Override to pin a specific model without editing code.</span></span>
<span class="line"><span>MEM0_DEFAULT_LLM_MODEL=qwen-plus</span></span>
<span class="line"><span>MEM0_DEFAULT_EMBEDDER_MODEL=text-embedding-v3</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Anonymous telemetry. Sends a single onboarding event per install</span></span>
<span class="line"><span># (install UUID, email domain, server version, source). No PII.</span></span>
<span class="line"><span># Set to false to opt out.</span></span>
<span class="line"><span>MEM0_TELEMETRY=true</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Days of request_logs history to keep when \`make prune-logs\` runs.</span></span>
<span class="line"><span># Wire the prune command into cron/systemd in production.</span></span>
<span class="line"><span>REQUEST_LOG_RETENTION_DAYS=30</span></span></code></pre></div><p>然后还要改几个地方：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwferXIsGcFOhIRallxXwFIs8uGVHJSZxTasuianauia1vibibIVpGp6mia0oOdDZ8iczOVC4fDdTwLSrMloy7OVUetibxuIsWghkHUnxso/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfey18kGQl6qmL9gNQQMZJKrmwoT4xmBu68V42NPH0puuaqTDaNqqS4tFQSawYERY5VPlyHVKdpuWzGklcMUayBxJRYLuPzorOM/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdE77WxZergY2xDx6avGwFjqAZfYS79hm4IUjUOcRyMSqy0icyDKrD4iaYL11iaNw09y2UkYF77Arj5Th4OeZkQibpcq57akkggLgU/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;packageManager&quot;: &quot;pnpm@10.5.2+sha512.da9dc28cd3ff40d0592188235ab25d3202add8a207afbedc682220e4a0029ffbff4562102b9e6e46b4e3f9e8bd53e6d05de48544b0c57d4b0179e22c76d1199b&quot;,</span></span>
<span class="line"><span>&quot;pnpm&quot;: {</span></span>
<span class="line"><span>  &quot;onlyBuiltDependencies&quot;: [</span></span>
<span class="line"><span>    &quot;sharp&quot;,</span></span>
<span class="line"><span>    &quot;unrs-resolver&quot;</span></span>
<span class="line"><span>  ]</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>跑一下：</p><p><video src="`+o+`" controls></video></p><p>跑起来可以看到接口文档和 mem0 的管理界面：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcTQyN16m2q3NgQPfzfgjPV4uIEEZBmibjM8U9bfGZq7F2LFQqibN31DDjlv7HuB0UFzzL3Czias534j5xzN7iciaXnQ411MbRiaOyN4/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcGicYWogUz2jxpYLfqTRp9b7icd7DaNXBPVwgjqxk33krOCvophM1X1B22zXnzgqHXNIvCr2ZUYIFrTLqB5eb53Xst0HerjR1icc/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>跑起来之后创建 api key 然后我们在代码里用连接一下：</p><p>创建 src/mem0-local-pai-demo.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const BASE_URL = &quot;http://localhost:8888&quot;</span></span>
<span class="line"><span>const USER_ID =  &quot;local_api_demo&quot;;</span></span>
<span class="line"><span>const API_KEY = process.env.MEM0_LOCAL_API_KEY;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function log(title, data) {</span></span>
<span class="line"><span>console.log(\`\\n=== \${title} ===\`);</span></span>
<span class="line"><span>console.log(typeof data === &quot;string&quot; ? data : JSON.stringify(data, null, 2));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class LocalMem0Client {</span></span>
<span class="line"><span>constructor({ baseUrl = BASE_URL, apiKey = API_KEY } = {}) {</span></span>
<span class="line"><span>    this.baseUrl = baseUrl.replace(/\\/$/, &quot;&quot;);</span></span>
<span class="line"><span>    this.apiKey = apiKey;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  headers() {</span></span>
<span class="line"><span>    const h = { &quot;Content-Type&quot;: &quot;application/json&quot; };</span></span>
<span class="line"><span>    if (this.apiKey) h[&quot;X-API-Key&quot;] = this.apiKey;</span></span>
<span class="line"><span>    return h;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async request(path, options = {}) {</span></span>
<span class="line"><span>    const res = await fetch(\`\${this.baseUrl}\${path}\`, {</span></span>
<span class="line"><span>      ...options,</span></span>
<span class="line"><span>      headers: { ...this.headers(), ...options.headers },</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    const text = await res.text();</span></span>
<span class="line"><span>    let body;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      body = text ? JSON.parse(text) : null;</span></span>
<span class="line"><span>    } catch {</span></span>
<span class="line"><span>      body = text;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (!res.ok) {</span></span>
<span class="line"><span>      const detail = typeof body === &quot;object&quot; ? body.detail ?? JSON.stringify(body) : body;</span></span>
<span class="line"><span>      thrownewError(\`\${res.status} \${detail}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return body;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async add(messages, { userId, runId, agentId, metadata, infer } = {}) {</span></span>
<span class="line"><span>    const payload = {</span></span>
<span class="line"><span>      messages: typeof messages === &quot;string&quot;</span></span>
<span class="line"><span>        ? [{ role: &quot;user&quot;, content: messages }]</span></span>
<span class="line"><span>        : messages,</span></span>
<span class="line"><span>      user_id: userId,</span></span>
<span class="line"><span>      run_id: runId,</span></span>
<span class="line"><span>      agent_id: agentId,</span></span>
<span class="line"><span>      metadata,</span></span>
<span class="line"><span>      infer,</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    returnthis.request(&quot;/memories&quot;, {</span></span>
<span class="line"><span>      method: &quot;POST&quot;,</span></span>
<span class="line"><span>      body: JSON.stringify(payload),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async getAll({ filters, userId, runId, agentId } = {}) {</span></span>
<span class="line"><span>    const params = new URLSearchParams();</span></span>
<span class="line"><span>    const uid = userId ?? filters?.user_id;</span></span>
<span class="line"><span>    const rid = runId ?? filters?.run_id;</span></span>
<span class="line"><span>    const aid = agentId ?? filters?.agent_id;</span></span>
<span class="line"><span>    if (uid) params.set(&quot;user_id&quot;, uid);</span></span>
<span class="line"><span>    if (rid) params.set(&quot;run_id&quot;, rid);</span></span>
<span class="line"><span>    if (aid) params.set(&quot;agent_id&quot;, aid);</span></span>
<span class="line"><span>    const qs = params.toString();</span></span>
<span class="line"><span>    returnthis.request(\`/memories\${qs ? \`?\${qs}\` : &quot;&quot;}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async search(query, { filters, topK = 5 } = {}) {</span></span>
<span class="line"><span>    returnthis.request(&quot;/search&quot;, {</span></span>
<span class="line"><span>      method: &quot;POST&quot;,</span></span>
<span class="line"><span>      body: JSON.stringify({ query, filters, top_k: topK }),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async deleteAll({ userId, runId, agentId } = {}) {</span></span>
<span class="line"><span>    const params = new URLSearchParams();</span></span>
<span class="line"><span>    if (userId) params.set(&quot;user_id&quot;, userId);</span></span>
<span class="line"><span>    if (runId) params.set(&quot;run_id&quot;, runId);</span></span>
<span class="line"><span>    if (agentId) params.set(&quot;agent_id&quot;, agentId);</span></span>
<span class="line"><span>    returnthis.request(\`/memories?\${params}\`, { method: &quot;DELETE&quot; });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const client = new LocalMem0Client();</span></span>
<span class="line"><span>const action = process.argv[2] ?? &quot;add&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (process.argv.includes(&quot;--cleanup&quot;)) {</span></span>
<span class="line"><span>    log(&quot;清理测试数据&quot;, await client.deleteAll({ userId: USER_ID }));</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (action === &quot;add&quot;) {</span></span>
<span class="line"><span>    const added = await client.add(</span></span>
<span class="line"><span>      [</span></span>
<span class="line"><span>        { role: &quot;user&quot;, content: &quot;我是素食主义者，而且对坚果过敏。&quot; },</span></span>
<span class="line"><span>        { role: &quot;assistant&quot;, content: &quot;好的，我会记住你的饮食偏好。&quot; },</span></span>
<span class="line"><span>        { role: &quot;user&quot;, content: &quot;我住在北京，平时喜欢跑步。&quot; },</span></span>
<span class="line"><span>        { role: &quot;assistant&quot;, content: &quot;已记录：北京、爱好跑步。&quot; },</span></span>
<span class="line"><span>      ],</span></span>
<span class="line"><span>      { userId: USER_ID },</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    log(&quot;添加记忆&quot;, added);</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (action === &quot;search&quot;) {</span></span>
<span class="line"><span>    log(</span></span>
<span class="line"><span>      &quot;搜索记忆&quot;,</span></span>
<span class="line"><span>      await client.search(&quot;用户的饮食限制是什么？&quot;, {</span></span>
<span class="line"><span>        filters: { user_id: USER_ID },</span></span>
<span class="line"><span>        topK: Number(process.env.MEM0_TOP_K ?? 5),</span></span>
<span class="line"><span>      }),</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (action === &quot;list&quot;) {</span></span>
<span class="line"><span>    log(&quot;列出全部记忆&quot;, await client.getAll({ filters: { user_id: USER_ID } }));</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.error(\`未知命令: \${action}，可用: add | search | list | --cleanup\`);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main().catch((error) =&gt; {</span></span>
<span class="line"><span>console.error(&quot;\\n执行失败:&quot;, error.message ?? error);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>mem0 的 server 提供了 restful 的接口，用 fetch 来访问。</p><p>跑一下：</p><p><video src="`+r+'" controls></video></p><p>这样我们就基于本地跑的 mem0 服务实现了长期记忆的分层存储、语义检索。</p><p>有的同学可能怀疑，这是不是走的向量 + 关键词 + 图谱三路检索啊</p><p>你不都拿到源码了么？让 AI 分析下就好了：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcic9AztHjj2yvgQvSkY109ayGgRiawQps6VgaTNrQchcibQ3ShxdC88KHXSFPonvwhBCRAVrQA7r3nkGaDtR0GHuQrEsDONpZkYA/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>确实是三路召回 + 重排。</p><p>你用 mem0 平台的 api 的时候，也能看到三路的分数：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfezphY3TyqPzuxjpT6xN07w8VRTbqHgBl6FgIibyEZ46wA5dLg4d1JgBxyyIC2fDdDic9L0OMZZ6bNoMGgZX0j39KBia8rAUsFcpY/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"><img src="" alt="img"></p><p>这样，我们就可以基于 mem0 来存储长期记忆了，用户层、会话层的区分，以及向量、关键词、图谱的检索，都可以直接用。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>Mem0 是开箱即用的长期记忆方案。</p><p>它分了用户层、会话层、Agent 层三种记忆。</p><p>类似豆包那种切换会话，它依然知道你的信息，就是提取用户画像等内容存在了用户层记忆。</p><p>它还做了向量的语义检索、BM25 的关键词检索、图谱的推理式检索三种混合召回 + 重排。</p><p>我们可以直接用它的云端服务，但免费版有次数限制，也可以自己部署开源版本。</p><p>Mem0 是比较流行的长期记忆方案，你的 Agent 可以直接接入它来实现长期记忆存储。</p><p>我们基于 Redis 做了短期记忆存储，用 Mem0 实现了长期记忆分层存储，这样 Agent 的记忆系统就比较完善了。</p>',103)])])}const I=n(m,[["render",u]]);export{y as __pageData,I as default};
