import{_ as n,a,b as p,c as e,d as l,e as i,f as c}from"./chunks/7.CKfw2GLD.js";import{_ as t,o as r,c as o,ag as m}from"./chunks/framework.BYTi4OdY.js";const v=JSON.parse('{"title":"19-Nest + tool 实现 OpenClaw 同款定时任务功能（上）","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/19-Nest + tool 实现 OpenClaw 同款定时任务功能（上）/index.md","filePath":"前端转AI Agent/19-Nest + tool 实现 OpenClaw 同款定时任务功能（上）/index.md"}'),g={name:"前端转AI Agent/19-Nest + tool 实现 OpenClaw 同款定时任务功能（上）/index.md"};function d(u,s,f,h,b,x){return r(),o("div",null,[...s[0]||(s[0]=[m(`<h1 id="_19-nest-tool-实现-openclaw-同款定时任务功能-上" tabindex="-1">19-Nest + tool 实现 OpenClaw 同款定时任务功能（上） <a class="header-anchor" href="#_19-nest-tool-实现-openclaw-同款定时任务功能-上" aria-label="Permalink to &quot;19-Nest + tool 实现 OpenClaw 同款定时任务功能（上）&quot;">​</a></h1><p>定时任务是 Agent 常见功能。</p><p>比如你用豆包的时候：</p><p>你让它某个时间做某件事情。</p><p>它会调用定时任务的 tool 设置一个提醒，并且你可以单独管理所有的提醒。</p><p>OpenClaw 当然也有定时任务功能。</p><p>我们看下它是怎么实现的：</p><p>把 OpenClaw 的仓库代码下下来，让 ai 分析下：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeY07bvePfFk9B3ION8nM1DesrX4VwS02ib1kBqgOwx3rzibrI1NhGWz28uTddMCX9ATr1Oq8e2pGLHSqm5Sc4mRUKHEa1B0rEXQ/640?wx_fmt=png&amp;from=appmsg&amp;wxfrom=13&amp;tp=wxpic#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p>可以看到，OpenClaw 的定时任务有两种：</p><ul><li>可以创建定时任务，传入文本，到时间会启动一个 Agent Loop 来执行</li><li>心跳机制定期主动做一些事情</li></ul><p>到时间后跑一个 agent loop 循环调用 tool call 做事情：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfffoN9SehnfibyYSD7ic8y4gbo0yAXrWJ2XRib62rErXKSKnHPT5yLuZCwcRMZW84K02Yxpic6r6urUwHEaKVauNia3NmjCyAde6PC8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>它并没有把定时任务封装成 tool，但是有执行命令的 tool，所以绕了一层，也是一样：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdlFtULSlkrmoFdjlGHLwYabkJXVlPbCiafYmgkqvjuYfuRxLBPIssrsRnDyuYO9ticeO0znTaLh8Nmyf2CUKiaggaRveLQgvmUa8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" alt="图片" referrerpolicy="no-referrer"></p><p>再来看下 Nanobot 的实现，它是 mini 版 OpenClaw</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcQlo1Xicf5y4pPIDYwx1mpcs5dw3EFTC7StoDY57D6aBwwmwCdGNSqsRkibZ7iaLIHJxXd4AfKen0lg9uSMdeu4YPesdhMry3ulA/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=3" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdIsTFeGnrPsPQtRsojGyH07V7jmCxsM6Ac1YPbR2lItaymRvIbm6cyIr4ecAJ14z6rAYLbT16e9Cuk86BVN0gGLib9OB3XY1Ro/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=4" alt="图片" referrerpolicy="no-referrer"></p><p>也就是这个流程：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdZQhxkDg1icQ7n50dNbokONYFOUWicFCLKw85qEPP60y4ZFpbQbR8c3rs928QXFgcWMMMeINOZv7K1zqC3R6qkiaNPic1UGCKbveE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=5" alt="图片" referrerpolicy="no-referrer"></p><p>既然各种 Agent 都有定时任务功能，那我们也按照这个方案实现一遍，后面可以集成到我们的 Agent 项目里。</p><p>创建 Nest 项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest new cron-job-tool</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfexFJxyhic8mR8npfeJ5aIg1atFt1v15TnCyUxEeqianm2DYYTehUXAlILaRkjy33u0RC1RY6Kzib4vUYMREZ9IKsgibcYiafI2DSicE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=6" alt="图片" referrerpolicy="no-referrer"></p><p>安装 langchain 和管理配置的包</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/openai zod @nestjs/config</span></span></code></pre></div><p>生成一个 ai 的模块：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest g res ai --no-spec</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdibLEjrpz0d6HlRXyAdEZnNqK6z6vWayHx29XY5icDHfCNLBcar4Uia9g7Fk8cHqMVgicgwwVtT4msIwZZ3nu8MxhbzIwWv2L0kibk/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" alt="图片" referrerpolicy="no-referrer"></p><p>在 AppModule 引入配置模块：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdP0uEtvWzGqrwM8micv5ZeMyDT9WiasSrwOSZFMwaSFk1CbiaI9mmHMgib1uQRg5dmo9nC7NmTJ3glnBLm3CQMcxRzj0lFKHLdLBE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=8" alt="图片" referrerpolicy="no-referrer"></p><p>并且根目录创建配置文件 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span></code></pre></div><p>然后创建 ChatModel 的 provider：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffPq9aLfhPQicb0Zu35eUUr8kgA7biafcfpbicP2mVOqVSiaBrzF0YFqaKFD8LHgtYlICDA4fgnZIR5jb6FZuqPQUaldArMC4w74ZA/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=9" alt="图片" referrerpolicy="no-referrer"></p><p>有了 model 之后，改下 service，实现 ai 功能：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Inject, Injectable } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { tool } from&#39;@langchain/core/tools&#39;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  AIMessage,</span></span>
<span class="line"><span>  BaseMessage,</span></span>
<span class="line"><span>  HumanMessage,</span></span>
<span class="line"><span>  SystemMessage,</span></span>
<span class="line"><span>  ToolMessage,</span></span>
<span class="line"><span>} from&#39;@langchain/core/messages&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span>import { Runnable } from&#39;@langchain/core/runnables&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const database = {</span></span>
<span class="line"><span>users: {</span></span>
<span class="line"><span>    &#39;001&#39;: { id: &#39;001&#39;, name: &#39;张三&#39;, email: &#39;zhangsan@example.com&#39;, role: &#39;admin&#39; },</span></span>
<span class="line"><span>    &#39;002&#39;: { id: &#39;002&#39;, name: &#39;李四&#39;, email: &#39;lisi@example.com&#39;, role: &#39;user&#39; },</span></span>
<span class="line"><span>    &#39;003&#39;: { id: &#39;003&#39;, name: &#39;王五&#39;, email: &#39;wangwu@example.com&#39;, role: &#39;user&#39; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const queryUserArgsSchema = z.object({</span></span>
<span class="line"><span>userId: z.string().describe(&#39;用户 ID，例如: 001, 002, 003&#39;),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type QueryUserArgs = {</span></span>
<span class="line"><span>    userId: string;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const queryUserTool = tool(</span></span>
<span class="line"><span>async ({ userId }: QueryUserArgs) =&gt; {</span></span>
<span class="line"><span>    const user = database.users[userId];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (!user) {</span></span>
<span class="line"><span>      return\`用户 ID \${userId} 不存在。可用的 ID: 001, 002, 003\`;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return\`用户信息：\\n- ID: \${user.id}\\n- 姓名: \${user.name}\\n- 邮箱: \${user.email}\\n- 角色: \${user.role}\`;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;query_user&#39;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &#39;查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。&#39;,</span></span>
<span class="line"><span>    schema: queryUserArgsSchema,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Injectable()</span></span>
<span class="line"><span>exportclass AiService {</span></span>
<span class="line"><span>  private readonly modelWithTools: Runnable&lt;BaseMessage[], AIMessage&gt;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>constructor(@Inject(&#39;CHAT_MODEL&#39;) model: ChatOpenAI) {</span></span>
<span class="line"><span>    this.modelWithTools = model.bindTools([queryUserTool]);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async runChain(query: string): Promise&lt;string&gt; {</span></span>
<span class="line"><span>    const messages: BaseMessage[] = [</span></span>
<span class="line"><span>      new SystemMessage(</span></span>
<span class="line"><span>        &#39;你是一个智能助手，可以在需要时调用工具（如 query_user）来查询用户信息，再用结果回答用户的问题。&#39;,</span></span>
<span class="line"><span>      ),</span></span>
<span class="line"><span>      new HumanMessage(query),</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    while (true) {</span></span>
<span class="line"><span>      const aiMessage = awaitthis.modelWithTools.invoke(messages);</span></span>
<span class="line"><span>      messages.push(aiMessage);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const toolCalls = aiMessage.tool_calls ?? [];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 没有要调用的工具，直接把回答返回给调用方</span></span>
<span class="line"><span>      if (!toolCalls.length) {</span></span>
<span class="line"><span>        return aiMessage.content as string;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 依次执行本轮需要调用的所有工具</span></span>
<span class="line"><span>      for (const toolCall of toolCalls) {</span></span>
<span class="line"><span>        const toolCallId = toolCall.id || &#39;&#39;;</span></span>
<span class="line"><span>        const toolName = toolCall.name;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (toolName === &#39;query_user&#39;) {</span></span>
<span class="line"><span>          const args = queryUserArgsSchema.parse(toolCall.args);</span></span>
<span class="line"><span>          const result = await queryUserTool.invoke(args);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          messages.push(</span></span>
<span class="line"><span>            new ToolMessage({</span></span>
<span class="line"><span>              tool_call_id: toolCallId,</span></span>
<span class="line"><span>              name: toolName,</span></span>
<span class="line"><span>              content: result,</span></span>
<span class="line"><span>            }),</span></span>
<span class="line"><span>          );</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>首先上面这部分就是一个 tool：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeS3G1GzNCjWbcXoIsP42eeWHhJDhTosGu0UHVsuFLtOrek2ddKjE0mVmX3KPMjyMkySQOzegmFatpHicz1nASRavnm7BaF0Xxg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=10" alt="图片" referrerpolicy="no-referrer"></p><p>读取用户信息的 tool。</p><p>这里的类型要注意一下：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffl0N5KjJLTTPwySDwVVlxN9leYk0kBK23kcdZj5h4uHjibrpmibzN1w6MYdmsfuxXgcZgrBFLiadTicy66oic162Olmt9dUZ8IVKfc/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=11" alt="图片" referrerpolicy="no-referrer"></p><p>Runnable 的第一个类型参数是输入，第二个类型参数是输出。</p><p>因为这次要调用 tool 了嘛，所以不再是直接 invoke，而是需要一个 agent loop</p><p>用 while(true) 循环，直到没有 tool call 就返回</p><p>否则调用 tool，返回的结果通过 ToolMessage 放到 messages 数组里</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwff2k9wBbvXw63dxet8Nn0ibjtB8wZ57ZIvpbGFHTKVf2GXKxeYZYibQtJHw8xBnHImNkmlibUfXfqmlwJgsWq3bHaKhJdAPcia7e4A/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=12" alt="图片" referrerpolicy="no-referrer"></p><p>然后我们在 AiController 添加下路由：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Controller, Get, Query } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { AiService } from&#39;./ai.service&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Controller(&#39;ai&#39;)</span></span>
<span class="line"><span>exportclass AiController {</span></span>
<span class="line"><span>constructor(private readonly aiService: AiService) {}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Get(&#39;chat&#39;)</span></span>
<span class="line"><span>async chat(@Query(&#39;query&#39;) query: string) {</span></span>
<span class="line"><span>    const answer = awaitthis.aiService.runChain(query);</span></span>
<span class="line"><span>    return { answer };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>跑一下：</p><video src="`+n+`" controls></video><p>然后我们再来实现一个流式版本：</p><p>AiService 里加个方法：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>async *runChainStream(query: string): AsyncIterable&lt;string&gt; {</span></span>
<span class="line"><span>   const messages: BaseMessage[] = [</span></span>
<span class="line"><span>     new SystemMessage(</span></span>
<span class="line"><span>       &#39;你是一个智能助手，可以在需要时调用工具（如 query_user）来查询用户信息，再用结果回答用户的问题。&#39;,</span></span>
<span class="line"><span>     ),</span></span>
<span class="line"><span>     new HumanMessage(query),</span></span>
<span class="line"><span>   ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>   while (true) {</span></span>
<span class="line"><span>     // 一轮对话：先让模型思考并（可能）提出工具调用</span></span>
<span class="line"><span>     const stream = awaitthis.modelWithTools.stream(messages);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     let fullAIMessage: AIMessageChunk | null = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     forawait (const chunk of stream as AsyncIterable&lt;AIMessageChunk&gt;) {</span></span>
<span class="line"><span>       // 使用 concat 持续拼接，得到本轮完整的 AIMessageChunk</span></span>
<span class="line"><span>       fullAIMessage = fullAIMessage ? fullAIMessage.concat(chunk) : chunk;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>       const hasToolCallChunk =</span></span>
<span class="line"><span>         !!fullAIMessage.tool_call_chunks &amp;&amp;</span></span>
<span class="line"><span>         fullAIMessage.tool_call_chunks.length &gt; 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>       // 只要当前轮次还没出现 tool 调用的 chunk，就可以把文本内容流式往外推</span></span>
<span class="line"><span>       if (!hasToolCallChunk &amp;&amp; chunk.content) {</span></span>
<span class="line"><span>           yield chunk.content as string</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>     }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     if (!fullAIMessage) {</span></span>
<span class="line"><span>       return;</span></span>
<span class="line"><span>     }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     messages.push(fullAIMessage);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     const toolCalls = fullAIMessage.tool_calls ?? [];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     // 没有工具调用：说明这一轮就是最终回答，已经在上面的 for-await 中流完了，可以结束</span></span>
<span class="line"><span>     if (!toolCalls.length) {</span></span>
<span class="line"><span>       return;</span></span>
<span class="line"><span>     }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>     // 有工具调用：本轮我们不再额外输出内容，而是执行工具，生成 ToolMessage，进入下一轮</span></span>
<span class="line"><span>     for (const toolCall of toolCalls) {</span></span>
<span class="line"><span>       const toolCallId = toolCall.id || &#39;&#39;;</span></span>
<span class="line"><span>       const toolName = toolCall.name;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>       if (toolName === &#39;query_user&#39;) {</span></span>
<span class="line"><span>         const args = queryUserArgsSchema.parse(toolCall.args);</span></span>
<span class="line"><span>         const result = await queryUserTool.invoke(args);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>         messages.push(</span></span>
<span class="line"><span>           new ToolMessage({</span></span>
<span class="line"><span>             tool_call_id: toolCallId,</span></span>
<span class="line"><span>             name: toolName,</span></span>
<span class="line"><span>             content: result,</span></span>
<span class="line"><span>           }),</span></span>
<span class="line"><span>         );</span></span>
<span class="line"><span>       }</span></span>
<span class="line"><span>     }</span></span>
<span class="line"><span>   }</span></span>
<span class="line"><span> }</span></span></code></pre></div><p>主要是流式的处理部分：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdx4D8IGG745oAEUrZy7GXUUQNgF8ulbOAgOY19wXAfdPu9b3TAsgfSLu9dQOtE9EaIK4aicrQdl1QUJYY48LuzKsyKzYSg489M/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=13" alt="图片" referrerpolicy="no-referrer"></p><p>这里 stream 返回的是一个个 chunk</p><p>我们判断如果没有 tool_call_chunks 代表不是工具调用，那就直接 yeild 返回内容</p><p>否则，就进入下面的工具调用逻辑，那部分和之前一样，concat 结束之后就是完整的 tool_calls 了。</p><p>在 AiController 里加一个 sse 接口：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Sse(&#39;chat/stream&#39;)</span></span>
<span class="line"><span>chatStream(@Query(&#39;query&#39;) query: string): Observable&lt;MessageEvent&gt; {</span></span>
<span class="line"><span>  const stream = this.aiService.runChainStream(query);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return from(stream).pipe(</span></span>
<span class="line"><span>    map((chunk) =&gt; ({</span></span>
<span class="line"><span>      data: chunk,</span></span>
<span class="line"><span>    })),</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>跑一下：</p><video src="`+a+`" controls></video><p>这样，我们就完成了 tool + 流式 + sse。</p><p>但我们现在的 tool 太简单了，能不能 tool 里调用 service 呢？</p><p>比如 tool 里面调用 service 来做数据库增删改查？</p><p>其实也很简单，和之前的 ChatModel 一样定义个 provider 就好了：</p><p>首先我们加一个 ai/user.service.ts</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Injectable } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>type User = {</span></span>
<span class="line"><span>id: string;</span></span>
<span class="line"><span>  name: string;</span></span>
<span class="line"><span>  email: string;</span></span>
<span class="line"><span>  role: string;</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Injectable()</span></span>
<span class="line"><span>exportclass UserService {</span></span>
<span class="line"><span>  private readonly users = newMap&lt;string, User&gt;([</span></span>
<span class="line"><span>    [&#39;001&#39;, { id: &#39;001&#39;, name: &#39;赵云&#39;, email: &#39;zhaoyun@example.com&#39;, role: &#39;admin&#39; }],</span></span>
<span class="line"><span>    [&#39;002&#39;, { id: &#39;002&#39;, name: &#39;诸葛亮&#39;, email: &#39;zhugeliang@example.com&#39;, role: &#39;manager&#39; }],</span></span>
<span class="line"><span>    [&#39;003&#39;, { id: &#39;003&#39;, name: &#39;关羽&#39;, email: &#39;guanyu@example.com&#39;, role: &#39;user&#39; }],</span></span>
<span class="line"><span>    [&#39;004&#39;, { id: &#39;004&#39;, name: &#39;张飞&#39;, email: &#39;zhangfei@example.com&#39;, role: &#39;user&#39; }],</span></span>
<span class="line"><span>    [&#39;005&#39;, { id: &#39;005&#39;, name: &#39;刘备&#39;, email: &#39;liubei@example.com&#39;, role: &#39;owner&#39; }],</span></span>
<span class="line"><span>    [&#39;006&#39;, { id: &#39;006&#39;, name: &#39;黄忠&#39;, email: &#39;huangzhong@example.com&#39;, role: &#39;user&#39; }],</span></span>
<span class="line"><span>  ]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  findAll(): User[] {</span></span>
<span class="line"><span>    returnArray.from(this.users.values());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  findOne(id: string): User | undefined {</span></span>
<span class="line"><span>    returnthis.users.get(id);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  create(user: User): User {</span></span>
<span class="line"><span>    this.users.set(user.id, user);</span></span>
<span class="line"><span>    return user;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  update(id: string, partial: Partial&lt;Omit&lt;User, &#39;id&#39;&gt;&gt;): User | undefined {</span></span>
<span class="line"><span>    const existing = this.users.get(id);</span></span>
<span class="line"><span>    if (!existing) {</span></span>
<span class="line"><span>      returnundefined;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const updated: User = {</span></span>
<span class="line"><span>      ...existing,</span></span>
<span class="line"><span>      ...partial,</span></span>
<span class="line"><span>      id: existing.id,</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.users.set(id, updated);</span></span>
<span class="line"><span>    return updated;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  remove(id: string): boolean {</span></span>
<span class="line"><span>    returnthis.users.delete(id);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这里面定义了 mock 的增删改查</p><p>然后加一个 provider：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwff9ypfib05Q47z3GqydDV449uJFU85g0xwyhWCuQEiaLSLFGR2mLv8qAqJkm9NW7u3nrAic7n5mZbMf8ukD5xsmWqUyan30Qxdiawg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=14" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{</span></span>
<span class="line"><span>  provide: &#39;QUERY_USER_TOOL&#39;,</span></span>
<span class="line"><span>useFactory: (userService: UserService) =&gt; {</span></span>
<span class="line"><span>    const queryUserArgsSchema = z.object({</span></span>
<span class="line"><span>      userId: z.string().describe(&#39;用户 ID，例如: 001, 002, 003&#39;),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return tool(</span></span>
<span class="line"><span>      async ({ userId }: { userId: string }) =&gt; {</span></span>
<span class="line"><span>        const user = userService.findOne(userId);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (!user) {</span></span>
<span class="line"><span>          const availableIds = userService</span></span>
<span class="line"><span>            .findAll()</span></span>
<span class="line"><span>            .map((u) =&gt; u.id)</span></span>
<span class="line"><span>            .join(&#39;, &#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          return\`用户 ID \${userId} 不存在。可用的 ID: \${availableIds}\`;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        return\`用户信息：\\n- ID: \${user.id}\\n- 姓名: \${user.name}\\n- 邮箱: \${user.email}\\n- 角色: \${user.role}\`;</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        name: &#39;query_user&#39;,</span></span>
<span class="line"><span>        description:</span></span>
<span class="line"><span>          &#39;查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。&#39;,</span></span>
<span class="line"><span>        schema: queryUserArgsSchema,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>inject: [UserService],</span></span>
<span class="line"><span>},</span></span></code></pre></div><p>唯一的区别就是现在的实现用注入的 userSerivce 来做，返回 tool</p><p>然后替换下之前的 tool：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdfeGEiaict1joMH0lQhicmLfxiczGzZQiceicfvpmfIA3gpibcBoQaN7VPF7K7vK4hbicM2sJic36E6JHd0qbaNPKD73tibnXWGHibbJgcp0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=15" alt="图片" referrerpolicy="no-referrer"></p><p>调用的也换成这个：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdUP9ZqCBJyaKGLZ8Gyj8N3r7X3UFKH4IQx4Y3TBksv9w89k5XjlnDKXiaXsvdjia2Gy5sHO5Lpng2UAziaDCOMuBOwcZcFbbKom4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=16" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffibuq1XHt5MleT5Eybb5vbqL9dbFXMOwVqXreicok9vjVCefGd8UwS9j1G7MxKZHm1pOgjRBSwH6fhDibKkghzHatBQWwhLcU1cc/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=17" alt="图片" referrerpolicy="no-referrer"></p><p>再跑一下：</p><video src="`+p+'" controls></video><p>这样我们就打通了 tool 里调用 service</p><p>那自然就可以实现数据库增删改查的 tool、发送邮件的 tool</p><p>我们用 qq 邮箱的 smtp 服务发送邮件</p><video src="'+e+`" controls></video><p>拿到授权码之后，我们安装下 nodemailer</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install nodemailer @nestjs-modules/mailer</span></span></code></pre></div><p>在 AppModule 引入下：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdPjwibicibOIicoO7ATcdjvhC0eplcBklOT6MrvsGpu5nJaM0pzBTiaT4UdFZgs7NVJkgxsqYTvIjGnZS2xt8r72bMgiaOXZRv7ty9I/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=18" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MailerModule.forRootAsync({</span></span>
<span class="line"><span>  inject: [ConfigService],</span></span>
<span class="line"><span>useFactory: (configService: ConfigService) =&gt; ({</span></span>
<span class="line"><span>    transport: {</span></span>
<span class="line"><span>      host: configService.get&lt;string&gt;(&#39;MAIL_HOST&#39;),</span></span>
<span class="line"><span>      port: Number(configService.get&lt;string&gt;(&#39;MAIL_PORT&#39;)),</span></span>
<span class="line"><span>      secure: configService.get&lt;string&gt;(&#39;MAIL_SECURE&#39;) === &#39;true&#39;,</span></span>
<span class="line"><span>      auth: {</span></span>
<span class="line"><span>        user: configService.get&lt;string&gt;(&#39;MAIL_USER&#39;),</span></span>
<span class="line"><span>        pass: configService.get&lt;string&gt;(&#39;MAIL_PASS&#39;),</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    defaults: {</span></span>
<span class="line"><span>      from:</span></span>
<span class="line"><span>        configService.get&lt;string&gt;(&#39;MAIL_FROM&#39;)</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>}),</span></span></code></pre></div><p>这里的配置也是放在 .env 里：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MAIL_HOST=smtp.qq.com</span></span>
<span class="line"><span>MAIL_PORT=587</span></span>
<span class="line"><span>MAIL_SECURE=false</span></span>
<span class="line"><span>MAIL_USER=你的邮箱</span></span>
<span class="line"><span>MAIL_PASS=你的授权码</span></span>
<span class="line"><span>MAIL_FROM=&quot;No Reply&quot; &lt;你的邮箱&gt;</span></span></code></pre></div><p>我们把它封装成 tool</p><p>在 AiModule 加上这个 provider：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwff3AUApfJCQOHaAIwBERPtss3bV582nF3pTD7iauk56xUaXgUjRXWeZlcCpvoUQoAlIMQHPiaxSAqtETqOk7RiaQicZRRtngMX4Vps/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=19" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{</span></span>
<span class="line"><span>  provide: &#39;SEND_MAIL_TOOL&#39;,</span></span>
<span class="line"><span>useFactory: (mailerService: MailerService, configService: ConfigService) =&gt; {</span></span>
<span class="line"><span>    const sendMailArgsSchema = z.object({</span></span>
<span class="line"><span>      to: z</span></span>
<span class="line"><span>        .email()</span></span>
<span class="line"><span>        .describe(&#39;收件人邮箱地址，例如：someone@example.com&#39;),</span></span>
<span class="line"><span>      subject: z.string().describe(&#39;邮件主题&#39;),</span></span>
<span class="line"><span>      text: z.string().optional().describe(&#39;纯文本内容，可选&#39;),</span></span>
<span class="line"><span>      html: z.string().optional().describe(&#39;HTML 内容，可选&#39;),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return tool(</span></span>
<span class="line"><span>      async ({to, subject, text, html}: {</span></span>
<span class="line"><span>        to: string;</span></span>
<span class="line"><span>        subject: string;</span></span>
<span class="line"><span>        text?: string;</span></span>
<span class="line"><span>        html?: string;</span></span>
<span class="line"><span>      }) =&gt; {</span></span>
<span class="line"><span>        const fallbackFrom =</span></span>
<span class="line"><span>          configService.get&lt;string&gt;(&#39;MAIL_FROM&#39;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        await mailerService.sendMail({</span></span>
<span class="line"><span>          to,</span></span>
<span class="line"><span>          subject,</span></span>
<span class="line"><span>          text: text ?? &#39;（无文本内容）&#39;,</span></span>
<span class="line"><span>          html: html ?? \`&lt;p&gt;\${text ?? &#39;（无 HTML 内容）&#39;}&lt;/p&gt;\`,</span></span>
<span class="line"><span>          from: fallbackFrom,</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        return\`邮件已发送到 \${to}，主题为「\${subject}」\`;</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        name: &#39;send_mail&#39;,</span></span>
<span class="line"><span>        description:</span></span>
<span class="line"><span>          &#39;发送电子邮件。需要提供收件人邮箱、主题，可选文本内容和 HTML 内容。&#39;,</span></span>
<span class="line"><span>        schema: sendMailArgsSchema,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>inject: [MailerService, ConfigService],</span></span>
<span class="line"><span>},</span></span></code></pre></div><p>在 AiService 里注入下：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdav9kW4Ru9okOBK5Kw0hWNOR77OftFW57rmp9bCO4SOOWVGCU3J9zwzpf3NdWKBSu0ZQxmAVVicOwWv6SSzPKT0xMSHGZLbGMc/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=20" alt="图片" referrerpolicy="no-referrer"></p><p>tool 调用的地方也要加一下：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfefjA6xCl1s0KHGdw0ib4iaSdxS1TA16XlB5wxfEPP3Ub498FiabKDgI9dyMuMQCv6WWtPHOqNN5FbicfMYrpIRM4BNzBeeYLv6Ce8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=21" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdt92DF22gcQydBmnDQWOMicN4PweBeh1dRSmVkIicoq7RElCQo2OO9JLDhvHjK4R9KyT57WuGzgyKdmClTFWLTCbZEK7ME2I1pw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=22" alt="图片" referrerpolicy="no-referrer"></p><p>这样，我们就可以用自然语言调用这个工具了：</p><p>测一下：</p><video src="`+l+'" controls></video><p>这样，邮件发送的 tool 就跑通了。</p><p>接下来实现网络搜索的 tool。</p><p>用博查的 api：</p><p><a href="https://open.bochaai.com/" target="_blank" rel="noreferrer">https://open.bochaai.com/</a></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffibBuj0VWn2rOn8pydeH4Zr2bcjZyWjpybxUd8ffPdW821bulPjnDtcsu9jXrht6nd1mZ97ltBLrWgYSK5XA1MibVqm9GOZ8fBA/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=23" alt="图片" referrerpolicy="no-referrer"></p><p>deepseek 的搜索就是用的这个：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwff9UeStmRMC2JWTnqNRHibuqR9RIPJ8lRmR3wwmogHDeNAkibdTicnGLfONLxX54bgRhhNv4Xr7Z9UDPuRhGGXgPA65eAgqXFib4dg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=24" alt="图片" referrerpolicy="no-referrer"></p><p>挺靠谱的。</p><p>我们先搞一个 api key：</p><video src="'+i+`" controls></video><p>添加到 .env 文件里</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BOCHA_API_KEY=sk-xxx</span></span></code></pre></div><p>然后在 AiModule 添加一个 tool 的 provider：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{</span></span>
<span class="line"><span>  provide: &#39;WEB_SEARCH_TOOL&#39;,</span></span>
<span class="line"><span>useFactory: (configService: ConfigService) =&gt; {</span></span>
<span class="line"><span>    const webSearchArgsSchema = z.object({</span></span>
<span class="line"><span>      query: z</span></span>
<span class="line"><span>        .string()</span></span>
<span class="line"><span>        .min(1)</span></span>
<span class="line"><span>        .describe(&#39;搜索关键词，例如：公司年报、某个事件等&#39;),</span></span>
<span class="line"><span>      count: z</span></span>
<span class="line"><span>        .number()</span></span>
<span class="line"><span>        .int()</span></span>
<span class="line"><span>        .min(1)</span></span>
<span class="line"><span>        .max(20)</span></span>
<span class="line"><span>        .optional()</span></span>
<span class="line"><span>        .describe(&#39;返回的搜索结果数量，默认 10 条&#39;),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return tool(</span></span>
<span class="line"><span>      async ({ query, count }: { query: string; count?: number }) =&gt; {</span></span>
<span class="line"><span>        const apiKey = configService.get&lt;string&gt;(&#39;BOCHA_API_KEY&#39;);</span></span>
<span class="line"><span>        if (!apiKey) {</span></span>
<span class="line"><span>          return&#39;Bocha Web Search 的 API Key 未配置（环境变量 BOCHA_API_KEY），请先在服务端配置后再重试。&#39;;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        const url = &#39;https://api.bochaai.com/v1/web-search&#39;;</span></span>
<span class="line"><span>        const body = {</span></span>
<span class="line"><span>          query,</span></span>
<span class="line"><span>          freshness: &#39;noLimit&#39;,</span></span>
<span class="line"><span>          summary: true,</span></span>
<span class="line"><span>          count: count ?? 10,</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        const response = await fetch(url, {</span></span>
<span class="line"><span>          method: &#39;POST&#39;,</span></span>
<span class="line"><span>          headers: {</span></span>
<span class="line"><span>            Authorization: \`Bearer \${apiKey}\`,</span></span>
<span class="line"><span>            &#39;Content-Type&#39;: &#39;application/json&#39;,</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>          body: JSON.stringify(body),</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (!response.ok) {</span></span>
<span class="line"><span>          const errorText = await response.text();</span></span>
<span class="line"><span>          return\`搜索 API 请求失败，状态码: \${response.status}, 错误信息: \${errorText}\`;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        let json: any;</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          json = await response.json();</span></span>
<span class="line"><span>        } catch (e) {</span></span>
<span class="line"><span>          return\`搜索 API 请求失败，原因是：搜索结果解析失败 \${(e as Error).message}\`;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          if (json.code !== 200 || !json.data) {</span></span>
<span class="line"><span>            return\`搜索 API 请求失败，原因是: \${json.msg ?? &#39;未知错误&#39;}\`;</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          const webpages = json.data.webPages?.value ?? [];</span></span>
<span class="line"><span>          if (!webpages.length) {</span></span>
<span class="line"><span>            return&#39;未找到相关结果。&#39;;</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          const formatted = webpages</span></span>
<span class="line"><span>            .map(</span></span>
<span class="line"><span>              (page: any, idx: number) =&gt;</span></span>
<span class="line"><span>                \`引用: \${idx + 1}</span></span>
<span class="line"><span>标题: \${page.name}</span></span>
<span class="line"><span>URL: \${page.url}</span></span>
<span class="line"><span>摘要: \${page.summary}</span></span>
<span class="line"><span>网站名称: \${page.siteName}</span></span>
<span class="line"><span>网站图标: \${page.siteIcon}</span></span>
<span class="line"><span>发布时间: \${page.dateLastCrawled}\`,</span></span>
<span class="line"><span>            )</span></span>
<span class="line"><span>            .join(&#39;\\n\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          return formatted;</span></span>
<span class="line"><span>        } catch (e) {</span></span>
<span class="line"><span>          return\`搜索 API 请求失败，原因是：搜索结果解析失败 \${(e as Error).message}\`;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        name: &#39;web_search&#39;,</span></span>
<span class="line"><span>        description:</span></span>
<span class="line"><span>          &#39;使用 Bocha Web Search API 搜索互联网网页。输入为搜索关键词（可选 count 指定结果数量），返回包含标题、URL、摘要、网站名称、图标和时间等信息的结果列表。&#39;,</span></span>
<span class="line"><span>        schema: webSearchArgsSchema,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>inject: [ConfigService],</span></span>
<span class="line"><span>},</span></span></code></pre></div><p>就是从配置文件拿到 apikey，通过 http 调用搜索接口，把结果格式化后给大模型。</p><p>然后在 AiService 里用一下：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfd6yE0u5YUJpWrtT0xnjiaCcrEib4zZM2MDWqWHTZYaEZMI460oPu1cYne0GR9TDaYEsTM7ZuZHkFIibFnO5378FqQ1Q7c32YjO58/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=25" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcn4G6cUmicmPZQHiaAqhg3ycK0ic4NUrX4nYNP5HUE6AACqicK8ACwKB9fw02OrLG4MkxKKvbzWnJicy77eOib6q2XXNTWYHia2SpQXg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=26" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcztGBkaO7TOlAau16IAoicV2WCKszqUQ2iaribVLgAoc14oJJP0zxMG9gW6icQbJ7gUqFDLKuVLcVrCJF6HadicQe6nMjRQbkOeiaYQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=27" alt="图片" referrerpolicy="no-referrer"></p><p>然后来测一下</p><p>当然，sse 还是用界面测更好，我们加一个 html</p><p>public/ai-sse-test.html</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;!doctype html&gt;</span></span>
<span class="line"><span>&lt;html lang=&quot;zh-CN&quot;&gt;</span></span>
<span class="line"><span>&lt;head&gt;</span></span>
<span class="line"><span>    &lt;meta charset=&quot;UTF-8&quot; /&gt;</span></span>
<span class="line"><span>    &lt;title&gt;AI SSE Chat 测试&lt;/title&gt;</span></span>
<span class="line"><span>    &lt;style&gt;</span></span>
<span class="line"><span>      * {</span></span>
<span class="line"><span>        box-sizing: border-box;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      body {</span></span>
<span class="line"><span>        margin: 0;</span></span>
<span class="line"><span>        min-height: 100vh;</span></span>
<span class="line"><span>        font-family: system-ui, -apple-system, BlinkMacSystemFont, &#39;SF Pro Text&#39;,</span></span>
<span class="line"><span>          &#39;Segoe UI&#39;, sans-serif;</span></span>
<span class="line"><span>        display: flex;</span></span>
<span class="line"><span>        align-items: center;</span></span>
<span class="line"><span>        justify-content: center;</span></span>
<span class="line"><span>        background: #f5f5f5;</span></span>
<span class="line"><span>        padding: 24px16px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      .shell {</span></span>
<span class="line"><span>        width: 100%;</span></span>
<span class="line"><span>        max-width: 720px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      h1 {</span></span>
<span class="line"><span>        font-size: 20px;</span></span>
<span class="line"><span>        margin: 0012px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      .card {</span></span>
<span class="line"><span>        background: #ffffff;</span></span>
<span class="line"><span>        border-radius: 10px;</span></span>
<span class="line"><span>        border: 1px solid #e5e7eb;</span></span>
<span class="line"><span>        box-shadow: 04px12pxrgba(15, 23, 42, 0.06);</span></span>
<span class="line"><span>        padding: 16px18px18px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      label {</span></span>
<span class="line"><span>        display: block;</span></span>
<span class="line"><span>        font-size: 13px;</span></span>
<span class="line"><span>        margin-bottom: 6px;</span></span>
<span class="line"><span>        color: #6b7280;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      textarea {</span></span>
<span class="line"><span>        width: 100%;</span></span>
<span class="line"><span>        min-height: 80px;</span></span>
<span class="line"><span>        padding: 8px10px;</span></span>
<span class="line"><span>        border-radius: 8px;</span></span>
<span class="line"><span>        border: 1px solid #d1d5db;</span></span>
<span class="line"><span>        resize: vertical;</span></span>
<span class="line"><span>        font-family: inherit;</span></span>
<span class="line"><span>        font-size: 14px;</span></span>
<span class="line"><span>        outline: none;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      textarea::placeholder {</span></span>
<span class="line"><span>        color: #9ca3af;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      textarea:focus {</span></span>
<span class="line"><span>        border-color: #3b82f6;</span></span>
<span class="line"><span>        box-shadow: 0001pxrgba(59, 130, 246, 0.3);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      .controls {</span></span>
<span class="line"><span>        display: flex;</span></span>
<span class="line"><span>        align-items: center;</span></span>
<span class="line"><span>        margin-top: 10px;</span></span>
<span class="line"><span>        gap: 10px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      button {</span></span>
<span class="line"><span>        padding: 6px14px;</span></span>
<span class="line"><span>        border-radius: 999px;</span></span>
<span class="line"><span>        border: 1px solid #2563eb;</span></span>
<span class="line"><span>        background: #3b82f6;</span></span>
<span class="line"><span>        color: #ffffff;</span></span>
<span class="line"><span>        font-size: 13px;</span></span>
<span class="line"><span>        cursor: pointer;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      button:disabled {</span></span>
<span class="line"><span>        opacity: 0.7;</span></span>
<span class="line"><span>        cursor: not-allowed;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      .status {</span></span>
<span class="line"><span>        font-size: 12px;</span></span>
<span class="line"><span>        color: #6b7280;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      .output {</span></span>
<span class="line"><span>        margin-top: 16px;</span></span>
<span class="line"><span>        padding: 10px10px;</span></span>
<span class="line"><span>        border-radius: 8px;</span></span>
<span class="line"><span>        background: #111827;</span></span>
<span class="line"><span>        color: #e5e7eb;</span></span>
<span class="line"><span>        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,</span></span>
<span class="line"><span>          &#39;Liberation Mono&#39;, &#39;Courier New&#39;, monospace;</span></span>
<span class="line"><span>        white-space: pre-wrap;</span></span>
<span class="line"><span>        max-height: 360px;</span></span>
<span class="line"><span>        overflow-y: auto;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    &lt;/style&gt;</span></span>
<span class="line"><span>&lt;/head&gt;</span></span>
<span class="line"><span>&lt;body&gt;</span></span>
<span class="line"><span>    &lt;div class=&quot;shell&quot;&gt;</span></span>
<span class="line"><span>      &lt;div class=&quot;card&quot;&gt;</span></span>
<span class="line"><span>        &lt;h1&gt;AI SSE Chat 测试&lt;/h1&gt;</span></span>
<span class="line"><span>        &lt;label for=&quot;query&quot;&gt;输入你的问题：&lt;/label&gt;</span></span>
<span class="line"><span>        &lt;textarea</span></span>
<span class="line"><span>          id=&quot;query&quot;</span></span>
<span class="line"><span>          placeholder=&quot;请输入要发送给 AI 的问题...&quot;</span></span>
<span class="line"><span>        &gt;&lt;/textarea&gt;</span></span>
<span class="line"><span>        &lt;div class=&quot;controls&quot;&gt;</span></span>
<span class="line"><span>          &lt;button id=&quot;sendBtn&quot;&gt;开始对话（SSE）&lt;/button&gt;</span></span>
<span class="line"><span>          &lt;div class=&quot;status&quot; id=&quot;status&quot;&gt;状态：待机&lt;/div&gt;</span></span>
<span class="line"><span>        &lt;/div&gt;</span></span>
<span class="line"><span>        &lt;div class=&quot;output&quot; id=&quot;output&quot;&gt;&lt;/div&gt;</span></span>
<span class="line"><span>      &lt;/div&gt;</span></span>
<span class="line"><span>    &lt;/div&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;script&gt;</span></span>
<span class="line"><span>      const sendBtn = document.getElementById(&#39;sendBtn&#39;);</span></span>
<span class="line"><span>      const queryInput = document.getElementById(&#39;query&#39;);</span></span>
<span class="line"><span>      const outputEl = document.getElementById(&#39;output&#39;);</span></span>
<span class="line"><span>      const statusEl = document.getElementById(&#39;status&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      let es = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      function closeEventSource() {</span></span>
<span class="line"><span>        if (es) {</span></span>
<span class="line"><span>          es.close();</span></span>
<span class="line"><span>          es = null;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        sendBtn.disabled = false;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      sendBtn.onclick = () =&gt; {</span></span>
<span class="line"><span>        const query = queryInput.value.trim();</span></span>
<span class="line"><span>        if (!query) {</span></span>
<span class="line"><span>          alert(&#39;请输入问题&#39;);</span></span>
<span class="line"><span>          return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        closeEventSource();</span></span>
<span class="line"><span>        outputEl.textContent = &#39;&#39;;</span></span>
<span class="line"><span>        sendBtn.disabled = true;</span></span>
<span class="line"><span>        statusEl.textContent = &#39;状态：连接中…&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        const url = \`/ai/chat/stream?query=\${encodeURIComponent(query)}\`;</span></span>
<span class="line"><span>        es = new EventSource(url);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        es.onopen = () =&gt; {</span></span>
<span class="line"><span>          statusEl.textContent = &#39;状态：已连接，流式接收中…&#39;;</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        es.onmessage = (event) =&gt; {</span></span>
<span class="line"><span>          // 后端每个 chunk 用 data 发过来</span></span>
<span class="line"><span>          outputEl.textContent += event.data;</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        es.onerror = () =&gt; {</span></span>
<span class="line"><span>          statusEl.textContent = &#39;状态：连接结束或发生错误&#39;;</span></span>
<span class="line"><span>          closeEventSource();</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      window.addEventListener(&#39;beforeunload&#39;, closeEventSource);</span></span>
<span class="line"><span>    &lt;/script&gt;</span></span>
<span class="line"><span>&lt;/body&gt;</span></span>
<span class="line"><span>&lt;/html&gt;</span></span></code></pre></div><p>同样是 ai 写的页面，主要是用 EventSource 对接 sse 接口。</p><p>在 AppModule 加一下静态文件的访问</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfc4Yic8SaJP0ojViaGhZz6zWgOzfQ6icatf6jYEnqdYnEjMF2Dg3OxhABAt4CyxyPX9PfKOUARfKWLXcXaqPfxQz3Vic1wRjTwyZt0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=28" alt="图片" referrerpolicy="no-referrer"></p><p>安装用到的包</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @nestjs/serve-static</span></span></code></pre></div><p>跑一下：</p><video src="`+c+'" controls></video><p>网络搜索和发送邮件的 tool 都跑通了。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>我们梳理了豆包、OpenClaw 定时任务的实现思路。</p><p>创建了 Nest 后端项目，基于 LangChain + tool 实现了工具调用。</p><p>在 service 里加上了 Agent Loop，并且用 stream 方法实现了流式，提供 sse 接口。</p><p>然后我们把 tool 封装到 provider 实现了 tool 里调用 service。</p><p>之后分别封装了邮件发送 tool、网络搜索 tool。</p><p>综合测试了下，可以通过自然语言调用这些 tool。</p><p>下篇我们继续来实现数据库增删改查的 tool、定时任务的 tool，然后实现完整定时任务机制。</p>',144)])])}const _=t(g,[["render",d]]);export{v as __pageData,_ as default};
