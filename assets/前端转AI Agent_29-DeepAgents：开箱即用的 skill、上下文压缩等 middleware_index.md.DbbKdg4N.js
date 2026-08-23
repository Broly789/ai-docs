import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const l="/ai-docs/assets/image-20260524102823286.-gcsRRm6.png",t="/ai-docs/assets/image-20260524102832815.lhZd5kc8.png",i="/ai-docs/assets/image-20260524102842937.BAj9u-q4.png",o="/ai-docs/assets/image-20260524102854463.CVpRCqZn.png",c="/ai-docs/assets/image-20260524102905725.BAAwx-9Q.png",r="/ai-docs/assets/image-20260524102920002.BAi1noWj.png",u="/ai-docs/assets/image-20260524102928834.Djv3axdL.png",v=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/29-DeepAgents：开箱即用的 skill、上下文压缩等 middleware/index.md","filePath":"前端转AI Agent/29-DeepAgents：开箱即用的 skill、上下文压缩等 middleware/index.md"}'),d={name:"前端转AI Agent/29-DeepAgents：开箱即用的 skill、上下文压缩等 middleware/index.md"};function m(q,s,g,h,f,w){return a(),p("div",null,[...s[0]||(s[0]=[e('<p>我们学了 LangChain、LangGraph，可以基于它们实现各种 Agent。</p><p>但如果想做一个复杂的 Agent，全部从头自己实现还是比较麻烦。</p><p>有没有基于 LangGraph 再封装一层，也就是半成品的 Agent 框架呢？</p><p>有的，就是 DeepAgents。</p><p>LangChain 是给你一堆 AI 开发积木，LangGraph 是搭建复杂工作流的底层蓝图，那 DeepAgents 就是提前搭好主体结构的半成品房子。</p><p>底层依赖 LangGraph 的状态管理（state）、循环路由、持久化执行能力（checkpointer），上层直接内置了任务规划、长期记忆、子 Agent 调度、上下文压缩等核心能力。</p><p>它最大的优势，就是大幅降低复杂 Agent 的开发门槛。</p><p>原生 LangGraph 适合极致自定义、底层深度开发</p><p>DeepAgents 适合快速落地复杂 Agent 应用，比如深度调研、代码开发、多步骤业务执行、多智能体协作等场景。</p><p>它帮我们跳过重复的底层基建，直接聚焦 Agent 的业务逻辑与能力迭代，是 LangGraph 生态里面向生产落地的高阶封装方案。</p><p><img src="'+l+`" alt="image-20260524102823286"></p><p>接下来我们就来学一下 DeepAgents：</p><p>创建项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir deepagents-test</span></span>
<span class="line"><span>cd deepagents-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+t+`" alt="image-20260524102832815"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install deepagents langchain @langchain/langgraph @langchain/openai zod dotenv</span></span></code></pre></div><p>创建 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 用于身份验证，实现链路上报  </span></span>
<span class="line"><span>LANGCHAIN_API_KEY=xxx</span></span>
<span class="line"><span># 指定LangSmith中的项目，追踪结果会归类到该项目下</span></span>
<span class="line"><span>LANGCHAIN_PROJECT=deepagents-test</span></span>
<span class="line"><span># 开启LangSmith追踪功能</span></span>
<span class="line"><span>LANGCHAIN_TRACING_V2=true</span></span></code></pre></div><p>然后先来试一下 middleware，这个是 langchain 的功能：</p><p>创建 src/middleware-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  createAgent,</span></span>
<span class="line"><span>  createMiddleware,</span></span>
<span class="line"><span>  HumanMessage,</span></span>
<span class="line"><span>  AIMessage,</span></span>
<span class="line"><span>} from&quot;langchain&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// --- 自定义 Middleware ---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 日志 + 模型调用次数统计 */</span></span>
<span class="line"><span>const loggingMiddleware = createMiddleware({</span></span>
<span class="line"><span>name: &quot;LoggingMiddleware&quot;,</span></span>
<span class="line"><span>stateSchema: z.object({</span></span>
<span class="line"><span>    modelCallCount: z.number().default(0),</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>beforeAgent: (state) =&gt; {</span></span>
<span class="line"><span>    console.log(&quot;\\n[Logging] agent 开始，消息数:&quot;, state.messages.length);</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>beforeModel: (state) =&gt; {</span></span>
<span class="line"><span>    console.log(</span></span>
<span class="line"><span>      \`[Logging] 即将调用模型，当前消息数: \${state.messages.length}，已调用: \${state.modelCallCount} 次\`</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>afterModel: (state) =&gt; {</span></span>
<span class="line"><span>    const last = state.messages.at(-1);</span></span>
<span class="line"><span>    const preview =</span></span>
<span class="line"><span>      typeof last?.content === &quot;string&quot;</span></span>
<span class="line"><span>        ? last.content.slice(0, 80)</span></span>
<span class="line"><span>        : JSON.stringify(last?.content)?.slice(0, 80);</span></span>
<span class="line"><span>    console.log(\`[Logging] 模型返回: \${preview}...\`);</span></span>
<span class="line"><span>    return { modelCallCount: state.modelCallCount + 1 };</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>afterAgent: (state) =&gt; {</span></span>
<span class="line"><span>    console.log(</span></span>
<span class="line"><span>      \`[Logging] agent 结束，累计模型调用: \${state.modelCallCount} 次\\n\`</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 在每次模型调用前追加 system 上下文 */</span></span>
<span class="line"><span>const addContextMiddleware = createMiddleware({</span></span>
<span class="line"><span>name: &quot;AddContextMiddleware&quot;,</span></span>
<span class="line"><span>wrapModelCall: async (request, handler) =&gt; {</span></span>
<span class="line"><span>    console.log(&quot;[AddContext] 注入额外 system 上下文&quot;);</span></span>
<span class="line"><span>    return handler({</span></span>
<span class="line"><span>      ...request,</span></span>
<span class="line"><span>      systemMessage: request.systemMessage.concat(</span></span>
<span class="line"><span>        &quot;\\n\\n 请用一句话简洁回答。&quot;</span></span>
<span class="line"><span>      ),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 拦截敏感词，直接结束 agent */</span></span>
<span class="line"><span>const blockedContentMiddleware = createMiddleware({</span></span>
<span class="line"><span>name: &quot;BlockedContentMiddleware&quot;,</span></span>
<span class="line"><span>beforeModel: {</span></span>
<span class="line"><span>    canJumpTo: [&quot;end&quot;],</span></span>
<span class="line"><span>    hook: (state) =&gt; {</span></span>
<span class="line"><span>      const last = state.messages.at(-1);</span></span>
<span class="line"><span>      const text =</span></span>
<span class="line"><span>        typeof last?.content === &quot;string&quot; ? last.content : String(last?.content ?? &quot;&quot;);</span></span>
<span class="line"><span>      if (text.includes(&quot;BLOCKED&quot;)) {</span></span>
<span class="line"><span>        console.log(&quot;[Blocked] 检测到 BLOCKED，短路结束&quot;);</span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>          messages: [new AIMessage(&quot;该请求已被 middleware 拦截，无法处理。&quot;)],</span></span>
<span class="line"><span>          jumpTo: &quot;end&quot;,</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// --- Agent ---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt: &quot;你是一个助手。&quot;,</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    loggingMiddleware,</span></span>
<span class="line"><span>    addContextMiddleware,</span></span>
<span class="line"><span>    blockedContentMiddleware,</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const text of [</span></span>
<span class="line"><span>&quot;用中文说：middleware 是什么？&quot;,</span></span>
<span class="line"><span>&quot;这句话包含 BLOCKED 关键词&quot;,</span></span>
<span class="line"><span>]) {</span></span>
<span class="line"><span>console.log(&quot;\\n用户:&quot;, text);</span></span>
<span class="line"><span>const { messages, modelCallCount } = await agent.invoke({</span></span>
<span class="line"><span>    messages: [new HumanMessage(text)],</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>console.log(&quot;回复:&quot;, messages.at(-1)?.content);</span></span>
<span class="line"><span>console.log(&quot;modelCallCount:&quot;, modelCallCount);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>createAgent 这个 api 提供了 middleware 的扩展机制：</p><p><img src="`+i+`" alt="image-20260524102842937"></p><p>可以在 agent 运行前后、model 调用前后加一些逻辑，以及控制 model 要不要调用，可以提前结束流程</p><p>此外，中间件还可以扩展 tool，以及 wrapToolCall</p><p>创建 src/middleware-test2.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { Command } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  createAgent,</span></span>
<span class="line"><span>  createMiddleware,</span></span>
<span class="line"><span>  HumanMessage,</span></span>
<span class="line"><span>  ToolMessage,</span></span>
<span class="line"><span>  tool,</span></span>
<span class="line"><span>} from&quot;langchain&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const getCurrentTime = tool(() =&gt;newDate().toISOString(), {</span></span>
<span class="line"><span>name: &quot;get_current_time&quot;,</span></span>
<span class="line"><span>description: &quot;返回当前 UTC 时间的 ISO 8601 字符串&quot;,</span></span>
<span class="line"><span>schema: z.object({}),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 通过 middleware 注册工具，并用 wrapToolCall 包装执行 */</span></span>
<span class="line"><span>const extendedToolsMiddleware = createMiddleware({</span></span>
<span class="line"><span>name: &quot;ExtendedToolsMiddleware&quot;,</span></span>
<span class="line"><span>stateSchema: z.object({</span></span>
<span class="line"><span>    toolInvocationCount: z.number().default(0),</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>tools: [getCurrentTime],</span></span>
<span class="line"><span>wrapToolCall: async (request, handler) =&gt; {</span></span>
<span class="line"><span>    const toolName = request.tool?.name ?? request.toolCall.name;</span></span>
<span class="line"><span>    console.log(</span></span>
<span class="line"><span>      \`[Tools] 即将执行: \${toolName}\`,</span></span>
<span class="line"><span>      &quot;args:&quot;,</span></span>
<span class="line"><span>      request.toolCall.args ?? {}</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    const result = await handler(request);</span></span>
<span class="line"><span>    if (!ToolMessage.isInstance(result)) return result;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const wrapped = new ToolMessage({</span></span>
<span class="line"><span>      content: \`\${result.content}\\n[wrapToolCall] 已由 ExtendedToolsMiddleware 包装\`,</span></span>
<span class="line"><span>      tool_call_id: result.tool_call_id,</span></span>
<span class="line"><span>      name: result.name,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(</span></span>
<span class="line"><span>      \`[Tools] 执行完成: \${toolName}\`,</span></span>
<span class="line"><span>      typeof wrapped.content === &quot;string&quot;</span></span>
<span class="line"><span>        ? wrapped.content.slice(0, 120)</span></span>
<span class="line"><span>        : wrapped</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    returnnew Command({</span></span>
<span class="line"><span>      update: {</span></span>
<span class="line"><span>        toolInvocationCount: request.state.toolInvocationCount + 1,</span></span>
<span class="line"><span>        messages: [wrapped],</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>afterAgent: (state) =&gt; {</span></span>
<span class="line"><span>    console.log(</span></span>
<span class="line"><span>      \`[Tools] agent 结束，middleware 统计工具调用: \${state.toolInvocationCount} 次\`</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;你是一个助手。&quot;,</span></span>
<span class="line"><span>middleware: [extendedToolsMiddleware],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const text of [</span></span>
<span class="line"><span>&quot;给我当前时间&quot;,</span></span>
<span class="line"><span>]) {</span></span>
<span class="line"><span>console.log(&quot;\\n用户:&quot;, text);</span></span>
<span class="line"><span>const { messages, toolInvocationCount } = await agent.invoke({</span></span>
<span class="line"><span>    messages: [new HumanMessage(text)],</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>console.log(&quot;回复:&quot;, messages.at(-1)?.content);</span></span>
<span class="line"><span>console.log(&quot;toolInvocationCount:&quot;, toolInvocationCount);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这样我们就通过中间件给 agent 扩展了 tools 并且修改了 tool call 返回的结果</p><p>deepagents 里就有很多现成的中间件可以用：</p><p><img src="`+o+`" alt="image-20260524102854463"></p><p>先试一下 FilesystemMiddleware，这个中间件可以指定一个 backend 作为文件系统，然后提供了读写、修改、搜索文件的命令。</p><p>创建 src/deepagents/filesystem-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import fs from&quot;node:fs&quot;;</span></span>
<span class="line"><span>import path from&quot;node:path&quot;;</span></span>
<span class="line"><span>import { fileURLToPath } from&quot;node:url&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createAgent, HumanMessage } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import { createFilesystemMiddleware, FilesystemBackend } from&quot;deepagents&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const workspaceDir = path.join(</span></span>
<span class="line"><span>  path.dirname(fileURLToPath(import.meta.url)),</span></span>
<span class="line"><span>&quot;workspace&quot;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 先匹配先生效；未命中任何规则则默认允许 */</span></span>
<span class="line"><span>const permissions = [</span></span>
<span class="line"><span>  { operations: [&quot;read&quot;], paths: [&quot;/secret.txt&quot;], mode: &quot;deny&quot; },</span></span>
<span class="line"><span>  { operations: [&quot;write&quot;], paths: [&quot;/todo.md&quot;], mode: &quot;allow&quot; },</span></span>
<span class="line"><span>  { operations: [&quot;write&quot;], paths: [&quot;/**&quot;], mode: &quot;deny&quot; },</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fs.rmSync(workspaceDir, { recursive: true, force: true });</span></span>
<span class="line"><span>fs.mkdirSync(workspaceDir);</span></span>
<span class="line"><span>fs.writeFileSync(path.join(workspaceDir, &quot;secret.txt&quot;), &quot;机密：不得读取&quot;, &quot;utf8&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;工作区根路径为 /。用 ls、read_file、write_file、edit_file 操作文件，路径以 / 开头。中文回答。&quot;,</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    createFilesystemMiddleware({</span></span>
<span class="line"><span>      backend: new FilesystemBackend({ rootDir: workspaceDir, virtualMode: true }),</span></span>
<span class="line"><span>      permissions,</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;工作区:&quot;, workspaceDir);</span></span>
<span class="line"><span>console.log(&quot;权限:&quot;, JSON.stringify(permissions, null, 2));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction run(label, prompt) {</span></span>
<span class="line"><span>console.log(\`\\n=== \${label} ===\\n\`, prompt, &quot;\\n&quot;);</span></span>
<span class="line"><span>const { messages } = await agent.invoke(</span></span>
<span class="line"><span>    { messages: [new HumanMessage(prompt)] },</span></span>
<span class="line"><span>    { recursionLimit: 20 }</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>for (const m of messages) {</span></span>
<span class="line"><span>    for (const t of m.tool_calls ?? []) console.log(&quot;→&quot;, t.name);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>console.log(&quot;回复:&quot;, messages.at(-1)?.content);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction expectDenied(label, prompt) {</span></span>
<span class="line"><span>console.log(\`\\n=== \${label}（预期拒绝）===\\n\`, prompt, &quot;\\n&quot;);</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    await agent.invoke({ messages: [new HumanMessage(prompt)] }, { recursionLimit: 5 });</span></span>
<span class="line"><span>    console.log(&quot;未触发拒绝（异常）&quot;);</span></span>
<span class="line"><span>  } catch (e) {</span></span>
<span class="line"><span>    const msg = e.cause?.message ?? e.message;</span></span>
<span class="line"><span>    console.log(&quot;✗&quot;, msg);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await run(</span></span>
<span class="line"><span>&quot;允许的操作&quot;,</span></span>
<span class="line"><span>&quot;write_file 创建 /todo.md（三条待办），edit_file 把第一条标为完成，ls /，一句话总结。&quot;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await expectDenied(&quot;禁止读&quot;, &quot;只调用 read_file，路径 /secret.txt。&quot;);</span></span>
<span class="line"><span>await expectDenied(&quot;禁止写&quot;, &quot;只调用 write_file，路径 /hack.txt，内容 test。&quot;);</span></span></code></pre></div><p>只要加上 deepagents 这个 FileSystem 中间件，agent 就有了一个文件系统，并且有了读写搜索文件的各种 tool，还做了权限控制。</p><p>超级方便，不用自己写！</p><p>大家应该都用过 skill，如果我们的 Agent 也要支持 skill 呢？</p><p>直接用 deepagents 的 Skill sMiddleware</p><p>创建 src/deepagents/skills-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { existsSync, mkdirSync } from&quot;node:fs&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createAgent, HumanMessage } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  LocalShellBackend,</span></span>
<span class="line"><span>  createFilesystemMiddleware,</span></span>
<span class="line"><span>  createSkillsMiddleware,</span></span>
<span class="line"><span>} from&quot;deepagents&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const skills = &quot;/.agents/skills/&quot;;</span></span>
<span class="line"><span>const output = &quot;src/deepagents/output/deepagents-skills-flow.excalidraw&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (!existsSync(&quot;.agents/skills/excalidraw-diagram-generator/SKILL.md&quot;)) {</span></span>
<span class="line"><span>thrownewError(</span></span>
<span class="line"><span>    &quot;未找到 excalidraw-diagram-generator，请先: npx skills add github/awesome-copilot --skill excalidraw-diagram-generator -y&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>mkdirSync(&quot;src/deepagents/output&quot;, { recursive: true });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>streaming: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const backend = await LocalShellBackend.create({</span></span>
<span class="line"><span>rootDir: &quot;.&quot;,</span></span>
<span class="line"><span>virtualMode: true,</span></span>
<span class="line"><span>inheritEnv: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt: &quot;按 skills 库完成任务，需要时 read_file 对应 SKILL.md。中文回答。&quot;,</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    createSkillsMiddleware({ backend, sources: [skills] }),</span></span>
<span class="line"><span>    createFilesystemMiddleware({ backend }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = [</span></span>
<span class="line"><span>&quot;画一张流程图，描述本项目的 skills-agent 工作流：&quot;,</span></span>
<span class="line"><span>&quot;用户 Prompt → createAgent → createSkillsMiddleware → createFilesystemMiddleware → 模型回复。&quot;,</span></span>
<span class="line"><span>\`保存为 \${output}。要求：\`,</span></span>
<span class="line"><span>&quot;- 顶部大标题 + 副标题&quot;,</span></span>
<span class="line"><span>&quot;- 每个主节点 numbered（①②…）且框内 2～3 行中文说明&quot;,</span></span>
<span class="line"><span>&quot;- 右侧一列「说明：…」补充细节&quot;,</span></span>
<span class="line"><span>&quot;- 箭头上标注阶段名（如 invoke、wrapModelCall）&quot;,</span></span>
<span class="line"><span>&quot;- 底部图例（颜色含义 + 如何运行 demo）&quot;,</span></span>
<span class="line"><span>].join(&quot;\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;用户:&quot;, prompt);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function chunkText(chunk) {</span></span>
<span class="line"><span>if (!chunk?.content) return&quot;&quot;;</span></span>
<span class="line"><span>if (typeof chunk.content === &quot;string&quot;) return chunk.content;</span></span>
<span class="line"><span>if (Array.isArray(chunk.content)) {</span></span>
<span class="line"><span>    return chunk.content</span></span>
<span class="line"><span>      .map((p) =&gt; (typeof p === &quot;string&quot; ? p : (p?.text ?? &quot;&quot;)))</span></span>
<span class="line"><span>      .join(&quot;&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>return&quot;&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const stream = await agent.streamEvents(</span></span>
<span class="line"><span>  { messages: [new HumanMessage(prompt)] },</span></span>
<span class="line"><span>  { recursionLimit: 100 }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let skillsMetadata;</span></span>
<span class="line"><span>console.log(&quot;\\n--- 流式输出 ---\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>forawait (const event of stream) {</span></span>
<span class="line"><span>    if (event.event === &quot;on_chat_model_stream&quot;) {</span></span>
<span class="line"><span>      const text = chunkText(event.data?.chunk);</span></span>
<span class="line"><span>      if (text) process.stdout.write(text);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (event.event === &quot;on_tool_start&quot;) {</span></span>
<span class="line"><span>      const name = event.name?.split(&quot;/&quot;).pop() ?? event.name;</span></span>
<span class="line"><span>      process.stdout.write(\`\\n\\n→ \${name}\\n\\n\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (event.event === &quot;on_chain_end&quot; &amp;&amp; event.data?.output?.skillsMetadata) {</span></span>
<span class="line"><span>      skillsMetadata = event.data.output.skillsMetadata;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} catch (e) {</span></span>
<span class="line"><span>console.error(&quot;\\n\\n[错误]&quot;, e.cause?.message ?? e.message);</span></span>
<span class="line"><span>throw e;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;\\n&quot;);</span></span>
<span class="line"><span>console.log(&quot;skills:&quot;, skillsMetadata?.map((s) =&gt; s.name));</span></span>
<span class="line"><span>if (existsSync(output)) {</span></span>
<span class="line"><span>console.log(&quot;图表:&quot;, output);</span></span>
<span class="line"><span>console.log(&quot;打开: https://excalidraw.com → Open → 选择该文件&quot;);</span></span>
<span class="line"><span>} else {</span></span>
<span class="line"><span>console.log(&quot;未生成:&quot;, output);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await backend.close();</span></span></code></pre></div><p>从 <a href="https://www.skills.sh/" target="_blank" rel="noreferrer">https://www.skills.sh/</a> 查找 skill</p><p><img src="`+c+`" alt="image-20260524102905725"></p><p>这样，我们的 Agent 就支持 skill 了！</p><p>再来试一下 deepagents 其他中间件：</p><p>SubAgentMiddleware 这个是创建多 Agent 用的</p><p>创建 src/deepagents/subagent-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createAgent, HumanMessage, tool } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import { createSubAgentMiddleware } from&quot;deepagents&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 四则运算 */</span></span>
<span class="line"><span>const calc = tool(</span></span>
<span class="line"><span>({ a, b, op }) =&gt; {</span></span>
<span class="line"><span>    const ops = {</span></span>
<span class="line"><span>      add: a + b,</span></span>
<span class="line"><span>      subtract: a - b,</span></span>
<span class="line"><span>      multiply: a * b,</span></span>
<span class="line"><span>      divide: b === 0 ? NaN : a / b,</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    const result = ops[op];</span></span>
<span class="line"><span>    if (Number.isNaN(result)) {</span></span>
<span class="line"><span>      returnJSON.stringify({ error: &quot;除数不能为 0&quot; });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    const symbols = { add: &quot;+&quot;, subtract: &quot;-&quot;, multiply: &quot;×&quot;, divide: &quot;÷&quot; };</span></span>
<span class="line"><span>    returnJSON.stringify({</span></span>
<span class="line"><span>      expression: \`\${a} \${symbols[op]} \${b}\`,</span></span>
<span class="line"><span>      result,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;calc&quot;,</span></span>
<span class="line"><span>    description: &quot;计算两个数的加减乘除&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      a: z.number().describe(&quot;左操作数&quot;),</span></span>
<span class="line"><span>      b: z.number().describe(&quot;右操作数&quot;),</span></span>
<span class="line"><span>      op: z.enum([&quot;add&quot;, &quot;subtract&quot;, &quot;multiply&quot;, &quot;divide&quot;]).describe(&quot;运算类型&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 平均分：总数 ÷ 份数 */</span></span>
<span class="line"><span>const divideEvenly = tool(</span></span>
<span class="line"><span>({ total, parts }) =&gt; {</span></span>
<span class="line"><span>    if (parts &lt;= 0) {</span></span>
<span class="line"><span>      returnJSON.stringify({ error: &quot;份数须大于 0&quot; });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    const each = total / parts;</span></span>
<span class="line"><span>    const exact = Number.isInteger(each);</span></span>
<span class="line"><span>    returnJSON.stringify({</span></span>
<span class="line"><span>      total,</span></span>
<span class="line"><span>      parts,</span></span>
<span class="line"><span>      each,</span></span>
<span class="line"><span>      exact,</span></span>
<span class="line"><span>      note: exact</span></span>
<span class="line"><span>        ? \`每人 \${each}（整除）\`</span></span>
<span class="line"><span>        : \`每人 \${each}（不能整除，应用题可说明余数）\`,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;divide_evenly&quot;,</span></span>
<span class="line"><span>    description: &quot;把总数平均分成若干份，求每份多少&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      total: z.number().nonnegative().describe(&quot;总数&quot;),</span></span>
<span class="line"><span>      parts: z.number().int().positive().describe(&quot;分成几份&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 按模板生成同类练习题（只改数字） */</span></span>
<span class="line"><span>const makeSimilarProblem = tool(</span></span>
<span class="line"><span>({ template, seed }) =&gt; {</span></span>
<span class="line"><span>    const n = (seed % 7) + 3;</span></span>
<span class="line"><span>    const problems = {</span></span>
<span class="line"><span>      divide_then_add: {</span></span>
<span class="line"><span>        stem: \`小红有 \${n * 6} 张贴纸，平均分给 \${n} 个小组，又买了 2 包每包 \${n + 2} 张的。每个小组现在一共有多少张？\`,</span></span>
<span class="line"><span>        hint: &quot;先平均分，再加上后来买的，注意单位是「每个小组」&quot;,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      share_candy: {</span></span>
<span class="line"><span>        stem: \`小刚有 \${n * 4} 块糖，要分给 \${n} 位同学，妈妈又买了 3 袋每袋 \${n} 块的。每位同学现在能分到多少块？\`,</span></span>
<span class="line"><span>        hint: &quot;与分糖题类似：先平分，再加上新增&quot;,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      group_buy: {</span></span>
<span class="line"><span>        stem: \`班里有 \${n} 个小组，每组先分到 \${n * 5} 支铅笔，老师又补了 2 盒每盒 \${n + 1} 支。每个小组现在有多少支？\`,</span></span>
<span class="line"><span>        hint: &quot;先算每组原有，再加上后来补的&quot;,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>    const picked = problems[template] ?? problems.share_candy;</span></span>
<span class="line"><span>    returnJSON.stringify({ template, ...picked });</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;make_similar_problem&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;生成一道同类应用题。template: divide_then_add | share_candy | group_buy&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      template: z</span></span>
<span class="line"><span>        .enum([&quot;divide_then_add&quot;, &quot;share_candy&quot;, &quot;group_buy&quot;])</span></span>
<span class="line"><span>        .describe(&quot;题目模板&quot;),</span></span>
<span class="line"><span>      seed: z.number().int().describe(&quot;随机种子，用于变换数字&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>streaming: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const subagents = [</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;math-solver&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;解小学应用题：用 calc、divide_evenly 列式计算，给出最终答案与算式。有具体数字时先用此 Agent。&quot;,</span></span>
<span class="line"><span>    systemPrompt: [</span></span>
<span class="line"><span>      &quot;你是解题子 Agent。&quot;,</span></span>
<span class="line"><span>      &quot;必须用 calc、divide_evenly 完成计算，不要心算。&quot;,</span></span>
<span class="line"><span>      &quot;输出：题目理解、分步算式、最终答案（带单位「块/人」等）。&quot;,</span></span>
<span class="line"><span>    ].join(&quot;\\n&quot;),</span></span>
<span class="line"><span>    tools: [calc, divideEvenly],</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;kid-tutor&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;把 math-solver 的解法讲给家长听，方便辅导孩子。description 里会有完整解题过程。&quot;,</span></span>
<span class="line"><span>    systemPrompt: [</span></span>
<span class="line"><span>      &quot;你是辅导讲解子 Agent，面向小学生家长。&quot;,</span></span>
<span class="line"><span>      &quot;根据 description 中的解题过程，用短句、比喻或分步提问方式讲解（不要堆公式）。&quot;,</span></span>
<span class="line"><span>      &quot;说明：先想什么、再算什么、怎么检查答案。不使用工具。&quot;,</span></span>
<span class="line"><span>    ].join(&quot;\\n&quot;),</span></span>
<span class="line"><span>    tools: [],</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;practice-maker&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;出 2 道同类练习题。用 make_similar_problem 生成题干，可换不同 template 或 seed。&quot;,</span></span>
<span class="line"><span>    systemPrompt: [</span></span>
<span class="line"><span>      &quot;你是出题子 Agent。&quot;,</span></span>
<span class="line"><span>      &quot;调用 make_similar_problem 至少 2 次（不同 template 或不同 seed），&quot;,</span></span>
<span class="line"><span>      &quot;每道题给出：题干、解题提示（一句话）。&quot;,</span></span>
<span class="line"><span>    ].join(&quot;\\n&quot;),</span></span>
<span class="line"><span>    tools: [makeSimilarProblem],</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt: [</span></span>
<span class="line"><span>    &quot;你是小学数学辅导主 Agent，通过 task 委派子 Agent，自己不解题、不讲题、不出题。&quot;,</span></span>
<span class="line"><span>    &quot;按顺序：① math-solver ② kid-tutor（把 solver 完整过程写进 description）③ practice-maker。&quot;,</span></span>
<span class="line"><span>    &quot;最后向家长汇总：答案、辅导要点、两道练习题。中文。&quot;,</span></span>
<span class="line"><span>  ].join(&quot;\\n&quot;),</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    createSubAgentMiddleware({</span></span>
<span class="line"><span>      defaultModel: model,</span></span>
<span class="line"><span>      subagents,</span></span>
<span class="line"><span>      generalPurposeAgent: false,</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = [</span></span>
<span class="line"><span>&quot;孩子遇到这道题：&quot;,</span></span>
<span class="line"><span>&quot;「小明有 24 块糖，平均分给 6 个同学；&quot;,</span></span>
<span class="line"><span>&quot;妈妈又买了 3 包糖，每包 5 块。每个同学现在一共有多少块？」&quot;,</span></span>
<span class="line"><span>&quot;请先 math-solver 解题，再 kid-tutor 教家长怎么讲，&quot;,</span></span>
<span class="line"><span>&quot;最后 practice-maker 出 2 道类似练习题，并汇总给我。&quot;,</span></span>
<span class="line"><span>].join(&quot;&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function chunkText(chunk) {</span></span>
<span class="line"><span>if (!chunk?.content) return&quot;&quot;;</span></span>
<span class="line"><span>if (typeof chunk.content === &quot;string&quot;) return chunk.content;</span></span>
<span class="line"><span>if (Array.isArray(chunk.content)) {</span></span>
<span class="line"><span>    return chunk.content</span></span>
<span class="line"><span>      .map((p) =&gt; (typeof p === &quot;string&quot; ? p : (p?.text ?? &quot;&quot;)))</span></span>
<span class="line"><span>      .join(&quot;&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>return&quot;&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;场景: 小学应用题辅导（解题 → 讲题 → 出题）&quot;);</span></span>
<span class="line"><span>console.log(&quot;子 Agent:&quot;);</span></span>
<span class="line"><span>console.log(&quot;  math-solver     → calc, divide_evenly&quot;);</span></span>
<span class="line"><span>console.log(&quot;  kid-tutor       → （讲解，无工具）&quot;);</span></span>
<span class="line"><span>console.log(&quot;  practice-maker  → make_similar_problem&quot;);</span></span>
<span class="line"><span>console.log();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;用户:&quot;, prompt, &quot;\\n&quot;);</span></span>
<span class="line"><span>console.log(&quot;--- 流式输出 ---\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const stream = await agent.streamEvents(</span></span>
<span class="line"><span>  { messages: [new HumanMessage(prompt)] },</span></span>
<span class="line"><span>  { recursionLimit: 60 }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>forawait (const event of stream) {</span></span>
<span class="line"><span>    if (event.event === &quot;on_chat_model_stream&quot;) {</span></span>
<span class="line"><span>      const t = chunkText(event.data?.chunk);</span></span>
<span class="line"><span>      if (t) process.stdout.write(t);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (event.event === &quot;on_tool_start&quot;) {</span></span>
<span class="line"><span>      const name = event.name?.split(&quot;/&quot;).pop() ?? event.name;</span></span>
<span class="line"><span>      process.stdout.write(\`\\n\\n→ \${name}\\n\\n\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} catch (e) {</span></span>
<span class="line"><span>console.error(&quot;\\n\\n[错误]&quot;, e.cause?.message ?? e.message);</span></span>
<span class="line"><span>throw e;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;\\n&quot;);</span></span></code></pre></div><p>用 SubAgent 的 middleware 创建子 Agent 更简单了，声明就行，不用自己去实现。</p><p>此外，长期记忆也是 Agent 必备的功能，deepagents 提供了 MemoryMiddleware</p><p>可以把记忆存储在 markdown 文件里，可以读取、更新，持久化存储</p><p>创建 src/deepagents/memory-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import fs from&quot;node:fs&quot;;</span></span>
<span class="line"><span>import path from&quot;node:path&quot;;</span></span>
<span class="line"><span>import { fileURLToPath } from&quot;node:url&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createAgent, HumanMessage } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  createFilesystemMiddleware,</span></span>
<span class="line"><span>  createMemoryMiddleware,</span></span>
<span class="line"><span>  FilesystemBackend,</span></span>
<span class="line"><span>} from&quot;deepagents&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const __dirname = path.dirname(fileURLToPath(import.meta.url));</span></span>
<span class="line"><span>const workspaceDir = path.join(__dirname, &quot;workspace-memory&quot;);</span></span>
<span class="line"><span>const projectMemoryPath = &quot;/AGENTS.md&quot;;</span></span>
<span class="line"><span>const preferencesMemoryPath = &quot;/memory/preferences.md&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const backend = new FilesystemBackend({</span></span>
<span class="line"><span>rootDir: workspaceDir,</span></span>
<span class="line"><span>virtualMode: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt: [</span></span>
<span class="line"><span>    &quot;你是项目助手。工作区根路径为 /，可用 ls、read_file、write_file、edit_file。&quot;,</span></span>
<span class="line"><span>    &quot;根据 &lt;agent_memory&gt; 回答；用户要求记住时，必须立刻 edit_file，且按类型写入对应文件：&quot;,</span></span>
<span class="line"><span>    \`- \${projectMemoryPath}：项目说明、技术栈、架构、仓库约定等\`,</span></span>
<span class="line"><span>    \`- \${preferencesMemoryPath}：用户个人偏好（语言、包管理器、回答风格等）\`,</span></span>
<span class="line"><span>    &quot;不要混写：项目事实不要写入 preferences，个人偏好不要写入 AGENTS.md。&quot;,</span></span>
<span class="line"><span>  ].join(&quot;\\n&quot;),</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    createFilesystemMiddleware({ backend }),</span></span>
<span class="line"><span>    createMemoryMiddleware({</span></span>
<span class="line"><span>      backend,</span></span>
<span class="line"><span>      sources: [projectMemoryPath, preferencesMemoryPath],</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompts = [</span></span>
<span class="line"><span>&quot;根据记忆，这个项目是做什么的？只答一句。&quot;,</span></span>
<span class="line"><span>\`请记住：我常用的包管理器是 pnpm。\`,</span></span>
<span class="line"><span>\`请记住：本仓库主入口脚本是 src/deepagents/memory-agent.mjs。\`,</span></span>
<span class="line"><span>&quot;我常用什么包管理器？本 demo 主入口脚本路径是什么？各用一行回答。&quot;,</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let messages = [];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const prompt of prompts) {</span></span>
<span class="line"><span>console.log(&quot;\\n用户:&quot;, prompt);</span></span>
<span class="line"><span>  ({ messages } = await agent.invoke(</span></span>
<span class="line"><span>    { messages: [...messages, new HumanMessage(prompt)] },</span></span>
<span class="line"><span>    { recursionLimit: 30 }</span></span>
<span class="line"><span>  ));</span></span>
<span class="line"><span>console.log(&quot;回复:&quot;, messages.at(-1)?.content);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const p of [projectMemoryPath, preferencesMemoryPath]) {</span></span>
<span class="line"><span>const file = path.join(workspaceDir, p.replace(/^\\//, &quot;&quot;));</span></span>
<span class="line"><span>console.log(\`\\n--- \${p} ---\\n\`, fs.readFileSync(file, &quot;utf8&quot;));</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这样，agent 就可以从 md 文件读取长期记忆，并且你让他记住的信息也会更新到 md 文件里。</p><p>最后，还有一个 SummarizationMiddleware 的中间件，它的作用是如果当前对话上下文长度超过预设阈值，就自动对历史对话进行摘要压缩，剔除冗余信息，只保留关键上下文摘要，再传入大模型进行后续续写 / 问答。</p><p>这样可以控制 Token 消耗、避免上下文溢出，同时保证核心对话语义不丢失。</p><p>我们自己做这个压缩还是比较麻烦的，这个 middleware 可以帮我们完成。</p><p>创建 src/deepagents/summarization-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import fs from&quot;node:fs&quot;;</span></span>
<span class="line"><span>import path from&quot;node:path&quot;;</span></span>
<span class="line"><span>import { fileURLToPath } from&quot;node:url&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createAgent, HumanMessage } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import { createSummarizationMiddleware, FilesystemBackend } from&quot;deepagents&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const __dirname = path.dirname(fileURLToPath(import.meta.url));</span></span>
<span class="line"><span>const workspaceDir = path.join(__dirname, &quot;workspace-summarization&quot;);</span></span>
<span class="line"><span>const historyPathPrefix = &quot;/conversation_history&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const summaryPrompt = \`你是对话摘要助手。请用中文总结以下对话，包含：</span></span>
<span class="line"><span>1. 讨论的主要话题</span></span>
<span class="line"><span>2. 达成的关键结论或决定</span></span>
<span class="line"><span>3. 继续对话所需的重要上下文</span></span>
<span class="line"><span></span></span>
<span class="line"><span>保持简洁，不要罗列无关细节。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>待摘要的对话：</span></span>
<span class="line"><span>{conversation}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>摘要：\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fs.rmSync(workspaceDir, { recursive: true, force: true });</span></span>
<span class="line"><span>fs.mkdirSync(workspaceDir, { recursive: true });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const backend = new FilesystemBackend({</span></span>
<span class="line"><span>rootDir: workspaceDir,</span></span>
<span class="line"><span>virtualMode: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;你是会话助手。记住用户提到的关键事实，中文简短回答。若看到「此前对话摘要」，请据此继续对话。&quot;,</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    createSummarizationMiddleware({</span></span>
<span class="line"><span>      model,</span></span>
<span class="line"><span>      backend,</span></span>
<span class="line"><span>      historyPathPrefix,</span></span>
<span class="line"><span>      summaryPrompt,</span></span>
<span class="line"><span>      // 低阈值便于 demo 触发摘要；生产环境可省略 trigger/keep，由模型 profile 自动推断</span></span>
<span class="line"><span>      trigger: { type: &quot;messages&quot;, value: 8 },</span></span>
<span class="line"><span>      keep: { type: &quot;messages&quot;, value: 4 },</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompts = [</span></span>
<span class="line"><span>&quot;请记住：我的宠物猫叫小橘。&quot;,</span></span>
<span class="line"><span>&quot;请记住：我住在北京。&quot;,</span></span>
<span class="line"><span>&quot;请记住：我喜欢喝拿铁。&quot;,</span></span>
<span class="line"><span>&quot;请记住：我的生日是 5 月 1 日。&quot;,</span></span>
<span class="line"><span>&quot;根据我们聊过的内容，我的猫叫什么、住哪、喜欢喝什么、生日是哪天？每项一行。&quot;,</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const historyDir = path.join(workspaceDir, historyPathPrefix.replace(/^\\//, &quot;&quot;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function listHistoryFiles() {</span></span>
<span class="line"><span>if (!fs.existsSync(historyDir)) return [];</span></span>
<span class="line"><span>return fs.readdirSync(historyDir);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let messages = [];</span></span>
<span class="line"><span>let knownHistory = newSet(listHistoryFiles());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const prompt of prompts) {</span></span>
<span class="line"><span>console.log(&quot;\\n用户:&quot;, prompt);</span></span>
<span class="line"><span>  ({ messages } = await agent.invoke(</span></span>
<span class="line"><span>    { messages: [...messages, new HumanMessage(prompt)] },</span></span>
<span class="line"><span>    { recursionLimit: 30 }</span></span>
<span class="line"><span>  ));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;回复:&quot;, messages.at(-1)?.content);</span></span>
<span class="line"><span>console.log(&quot;当前消息数:&quot;, messages.length);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const historyFiles = listHistoryFiles();</span></span>
<span class="line"><span>for (const file of historyFiles) {</span></span>
<span class="line"><span>    if (!knownHistory.has(file)) {</span></span>
<span class="line"><span>      knownHistory.add(file);</span></span>
<span class="line"><span>      console.log(&quot;已触发摘要，历史已写入:&quot;, \`\${historyPathPrefix}/\${file}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (knownHistory.size &gt; 0) {</span></span>
<span class="line"><span>for (const file of knownHistory) {</span></span>
<span class="line"><span>    const filePath = path.join(historyDir, file);</span></span>
<span class="line"><span>    console.log(\`\\n--- \${historyPathPrefix}/\${file} ---\\n\`, fs.readFileSync(filePath, &quot;utf8&quot;));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} else {</span></span>
<span class="line"><span>console.log(&quot;\\n未生成 conversation_history（可能未触发摘要阈值）&quot;);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们按照条数来摘要，达到 8 条触发摘要，保留 4 条，前面的变成摘要</p><p>这样摘要后聊的再多也只保留最新的几条，更前面的都变成摘要了：</p><p><img src="`+r+'" alt="image-20260524102920002"></p><p>有三种触发摘要的方式：</p><p><img src="'+u+'" alt="image-20260524102928834"></p><p>这个 middleware 也是很有用的。</p><p>至此，我们就把 deepagents 提供的 middleware 过了一遍。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>DeepAgents 提供了很多开箱即用的功能，做 Agent 可以直接用。</p><p>这节我们学了它的各种 middleware。</p><p>middleware 是 createAgent 提供的机制，可以在大模型调用前后、tool 调用前后加一些逻辑，修改 state、参数、扩展 tool 等。</p><p>DeepAgents 提供了 skill、上下文压缩、长期记忆（md）、文件系统、subagent 的 middleware，直接用很方便。</p><p>当然，DeepAgents 不只有中间件，下节我们继续来学习其他功能。</p>',72)])])}const y=n(d,[["render",m]]);export{v as __pageData,y as default};
