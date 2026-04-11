import{_ as a,o as n,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const f=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/22-AGUI 协议：Vercel AI SDK + LangChain 实现流式组件渲染/index.md","filePath":"前端转AI Agent/22-AGUI 协议：Vercel AI SDK + LangChain 实现流式组件渲染/index.md"}'),i={name:"前端转AI Agent/22-AGUI 协议：Vercel AI SDK + LangChain 实现流式组件渲染/index.md"};function l(t,s,c,r,o,m){return n(),p("div",null,[...s[0]||(s[0]=[e(`<p>我们前面做的 Agent 功能上没啥问题，但是 UI 比较简陋，只有流式的文字：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_gif/NMByQQfVwfeDF2qrgEbib7BxSq0LwaXxeCODbBLfGiaRhibQXPWItClickIxuNvaTyqS17KdicIc1CFPf9gZTTicVxGh2T1RLXPBKqh63f6f1bWTw/640?wx_fmt=gif&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p>而你用 cursor 之类的 Agent，它的界面是这样的：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdJ7u8AdyZCMvo5AEltWXQFqzib1pTsZ2RjA5TPyBF7ic8vib5DUABKGH95NUAYRyjt0h1zJWPF52vAAFQzcM2aqngbpoyyI6Ih7I/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>除了流式的文字，不同的 tool call 有不同的组件来展示，这样体验就好很多。</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdG7CJ49bu9GF73553Zt22Ffy0JPtC7g8mgsfAy3xfT83fDpgY9gUI2YO0khSLLWjgiaMaaKMMv6mmICqnre3Rs4JEJicMcDKhL8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" alt="图片" referrerpolicy="no-referrer"></p><p>这种流式返回文字，还能流式渲染组件，需要一套协议。</p><p>叫做 AGUI 协议（Agent–User Interaction Protocol），定义 agent 和图形界面怎么交互的</p><p>比如我们之前返回的 SSE 消息是这样的：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeeiajvwOvicOwFtsGOpEgEOyUNwL4cnjaNwibejT9WhtDWtkYmDjb7VabnYxrAQXfxh8mcLC8H8w9gzkXxLT7mVy3ibS8rfibeguTI/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=3" alt="图片" referrerpolicy="no-referrer"></p><p>只有文字，并不能区分是文本内容，还是 tool call，需要一些元信息，比如 type。</p><p>解决也很简单，返回 json 就好了。</p><p>比如这样：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfe73NxecLpDBk2YBKHDWES0STZqrlHyaEUl5A4ntUIgC726TgsgnpeMfo8l32tD3VeLCSDmts6rVfLpwakXicb9FkoiaMiaYGkMO4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=4" alt="图片" referrerpolicy="no-referrer"></p><p>text-start 代表文本流开始</p><p>text-delta 是流式的文本数据</p><p>text-end 代表文本流结束</p><p>如果有 tool call 就是这样：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcBHeBKGdQzws4rCOTScWc7eFtFT9YrpicPg0b9qJZjJwE8DE8kCsaGLWUUbmmlxSK2aricNSlTJiaUGGJaTZMu4oufMQTrzPq4ZM/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=5" alt="图片" referrerpolicy="no-referrer"></p><p>tool-input-start 代表开始接收到 tool 的参数</p><p>tool-input-delta 是流式的 tool call 的参数</p><p>tool-input-available 代表 tool 的参数接收完</p><p>tool-output-available 代表有了 tool 的调用结果，可以从 output 里取</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffdPyF6Y1bz9oostYsf8Npsic92UPdI1O8gdCtGX0FueTVmw16sQzlqygWSVqIUNOlYM7H2qJg3WyGHibIbVOQgr2MChNOiadibhsM/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=6" alt="图片" referrerpolicy="no-referrer"></p><p>这样 SSE 不止返回流式文本，而是这种 json，那前端不就知道当前是在工具调用还是输出流式文本了么？</p><p>自然就可以渲染不同的组件，实现更好的体验。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_gif/NMByQQfVwff6PU4c0zazEpD0jhbB7Es5sFicHF4OibVNwzUyWJianQhRaxFtT38dafRreBq4NMthYNSfkC0xLpgFeZ3RzPYwLECHuhZTGNPlfM/640?wx_fmt=gif&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" alt="图片" referrerpolicy="no-referrer"></p><p>上面的是 Vercel AI SDK 实现的协议，我们直接用它那个就行。</p><p><a href="https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol#data-stream-protocol" target="_blank" rel="noreferrer">https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol#data-stream-protocol</a></p><p>在 Vercel AI SDK 里叫做 Data Stream Protocol</p><p>Vercel AI SDK 提供了这些包：</p><ul><li><strong>ai 包</strong>：写 agent 逻辑</li><li><strong>@ai-sdk/openai、 @ai-sdk/anthropic 等包</strong>：对接不同的大模型，就和 langchain 的 ChatModel 一样</li><li><strong>@ai-sdk/react、@ai-sdk/vue 等包</strong>：对接后端接口，实现页面渲染</li></ul><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffd4BibMJduMAeBoOxibe6lGozjedhicobhBlXU3viagrcEg7ILeH77BmqwPHbibiajDXOmUaRWhcvjOllNAW5suwUgpy3RAmFiam2OUg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=8" alt="图片" referrerpolicy="no-referrer"></p><p>用它也可以写 Agent，但它功能比较少，我们只用它的 UI 方面的功能，就是刚才的那套 AGUI 的协议。</p><p>它提供了和 LangChain 的集成包 @ai-sdk/langchain</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeAup7icRyicthiarsUTjxQeN4lCUxWXeKgWibyWYats9zXNRWFYsNwj7o1G59vqr0krGB0a3NXXfXSrudRDUxFgW9yRZAzwhuBVJs/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=9" alt="图片" referrerpolicy="no-referrer"></p><p>我们用 LangChain 写 Agent 部分，然后复用它这套 AGUI 协议来给前端传输消息</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeDwJZ787ic0AFxWGeR0YgSZcibmqUHt1SAoJYYINx5ibEtZuj8YX9cfY4uUiauvLL3MDxLj58BDWhJMVzWz1qzicQt8BM1oMkyicrj4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=10" alt="图片" referrerpolicy="no-referrer"></p><p>前端用 @ai-sdk/react、@ai-sdk/vue 等来解析 SSE 的消息，拿到 messages，用不同组件渲染就可以了。</p><p>我们来创建个后端项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest new agui-backend</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfe5FvgBUrFDc8okIHzhV0KMTwsLGrYNC1LppUeXfYcLBCrs4Xn2mutl9tsT3F0NdkO67jbxVtCZpGoDdG3lsQBEFKOTpYtLSmo/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=11" alt="图片" referrerpolicy="no-referrer"></p><p>安装用到的包：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/openai @nestjs/config zod</span></span></code></pre></div><p>创建 .env 配置文件：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span></span></span>
<span class="line"><span>BOCHA_API_KEY=sk-xx</span></span></code></pre></div><p>然后引入 ConfigModule 读取配置：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdDhZa1icgYcz5LDG3XfuvfM6hJ5qH55rX2882lSDWEfMb60v3W1JTaFAn7eErYn6cwmZzn6QFFriaticsk1sicfBhookmS1pPia9JA/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=12" alt="图片" referrerpolicy="no-referrer"></p><p>创建 ai 模块：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest g module ai</span></span>
<span class="line"><span>nest g controller ai --no-spec</span></span>
<span class="line"><span>nest g service ai --no-spec</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeOwSqibvlQ7ib6aNh9uRCA2UlETwbQxHKOMmeldTTbJ91KvIC5DtO9dvVCQF8hNbQxOS63NoZ1mDSwTbQial5tCsrfItMplYptTs/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=13" alt="图片" referrerpolicy="no-referrer"></p><p>然后来写个 SSE 的 ai 接口：</p><p>改下 AiModule，加一下网络搜索的 tool</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Module } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { AiService } from&#39;./ai.service&#39;;</span></span>
<span class="line"><span>import { AiController } from&#39;./ai.controller&#39;;</span></span>
<span class="line"><span>import { ConfigService } from&#39;@nestjs/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { tool } from&#39;@langchain/core/tools&#39;;</span></span>
<span class="line"><span>import z from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Module({</span></span>
<span class="line"><span>controllers: [AiController],</span></span>
<span class="line"><span>providers: [AiService,</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      provide: &#39;CHAT_MODEL&#39;,</span></span>
<span class="line"><span>      useFactory: (configService: ConfigService) =&gt; {</span></span>
<span class="line"><span>        returnnew ChatOpenAI({</span></span>
<span class="line"><span>          model: configService.get(&#39;MODEL_NAME&#39;),</span></span>
<span class="line"><span>          apiKey: configService.get(&#39;OPENAI_API_KEY&#39;),</span></span>
<span class="line"><span>          configuration: {</span></span>
<span class="line"><span>            baseURL: configService.get(&#39;OPENAI_BASE_URL&#39;),</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      inject: [ConfigService],</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      provide: &#39;WEB_SEARCH_TOOL&#39;,</span></span>
<span class="line"><span>      useFactory: (configService: ConfigService) =&gt; {</span></span>
<span class="line"><span>        const webSearchArgsSchema = z.object({</span></span>
<span class="line"><span>          query: z</span></span>
<span class="line"><span>            .string()</span></span>
<span class="line"><span>            .min(1)</span></span>
<span class="line"><span>            .describe(&#39;搜索关键词，例如：公司年报、某个事件等&#39;),</span></span>
<span class="line"><span>          count: z</span></span>
<span class="line"><span>            .number()</span></span>
<span class="line"><span>            .int()</span></span>
<span class="line"><span>            .min(1)</span></span>
<span class="line"><span>            .max(20)</span></span>
<span class="line"><span>            .optional()</span></span>
<span class="line"><span>            .describe(&#39;返回的搜索结果数量，默认 10 条&#39;),</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>        return tool(</span></span>
<span class="line"><span>          async ({ query, count }: { query: string; count?: number }) =&gt; {</span></span>
<span class="line"><span>            const apiKey = configService.get&lt;string&gt;(&#39;BOCHA_API_KEY&#39;);</span></span>
<span class="line"><span>            if (!apiKey) {</span></span>
<span class="line"><span>              return&#39;Bocha Web Search 的 API Key 未配置（环境变量 BOCHA_API_KEY），请先在服务端配置后再重试。&#39;;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>            const url = &#39;https://api.bochaai.com/v1/web-search&#39;;</span></span>
<span class="line"><span>            const body = {</span></span>
<span class="line"><span>              query,</span></span>
<span class="line"><span>              freshness: &#39;noLimit&#39;,</span></span>
<span class="line"><span>              summary: true,</span></span>
<span class="line"><span>              count: count ?? 10,</span></span>
<span class="line"><span>            };</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>            const response = await fetch(url, {</span></span>
<span class="line"><span>              method: &#39;POST&#39;,</span></span>
<span class="line"><span>              headers: {</span></span>
<span class="line"><span>                Authorization: \`Bearer \${apiKey}\`,</span></span>
<span class="line"><span>                &#39;Content-Type&#39;: &#39;application/json&#39;,</span></span>
<span class="line"><span>              },</span></span>
<span class="line"><span>              body: JSON.stringify(body),</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>            if (!response.ok) {</span></span>
<span class="line"><span>              const errorText = await response.text();</span></span>
<span class="line"><span>              return\`搜索 API 请求失败，状态码: \${response.status}, 错误信息: \${errorText}\`;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>            let json: any;</span></span>
<span class="line"><span>            try {</span></span>
<span class="line"><span>              json = await response.json();</span></span>
<span class="line"><span>            } catch (e) {</span></span>
<span class="line"><span>              return\`搜索 API 请求失败，原因是：搜索结果解析失败 \${(e as Error).message}\`;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>            try {</span></span>
<span class="line"><span>              if (json.code !== 200 || !json.data) {</span></span>
<span class="line"><span>                return\`搜索 API 请求失败，原因是: \${json.msg ?? &#39;未知错误&#39;}\`;</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>              const webpages = json.data.webPages?.value ?? [];</span></span>
<span class="line"><span>              if (!webpages.length) {</span></span>
<span class="line"><span>                return&#39;未找到相关结果。&#39;;</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>              const formatted = webpages</span></span>
<span class="line"><span>                .map(</span></span>
<span class="line"><span>                  (page: any, idx: number) =&gt;</span></span>
<span class="line"><span>                    \`引用: \${idx + 1}</span></span>
<span class="line"><span>    标题: \${page.name}</span></span>
<span class="line"><span>    URL: \${page.url}</span></span>
<span class="line"><span>    摘要: \${page.summary}</span></span>
<span class="line"><span>    网站名称: \${page.siteName}</span></span>
<span class="line"><span>    网站图标: \${page.siteIcon}</span></span>
<span class="line"><span>    发布时间: \${page.dateLastCrawled}\`,</span></span>
<span class="line"><span>                )</span></span>
<span class="line"><span>                .join(&#39;\\n\\n&#39;);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>              return formatted;</span></span>
<span class="line"><span>            } catch (e) {</span></span>
<span class="line"><span>              return\`搜索 API 请求失败，原因是：搜索结果解析失败 \${(e as Error).message}\`;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>          {</span></span>
<span class="line"><span>            name: &#39;web_search&#39;,</span></span>
<span class="line"><span>            description:</span></span>
<span class="line"><span>              &#39;使用 Bocha Web Search API 搜索互联网网页。输入为搜索关键词（可选 count 指定结果数量），返回包含标题、URL、摘要、网站名称、图标和时间等信息的结果列表。&#39;,</span></span>
<span class="line"><span>            schema: webSearchArgsSchema,</span></span>
<span class="line"><span>          },</span></span>
<span class="line"><span>        );</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      inject: [ConfigService],</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>})</span></span>
<span class="line"><span>exportclass AiModule {}</span></span></code></pre></div><p>这里创建了 ChatModel 和网络搜索的 tool 的 provider</p><p>然后在 AiService 注入：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Inject, Injectable } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { AIMessage, AIMessageChunk, createAgent, HumanMessage, SystemMessage, ToolMessage } from&#39;langchain&#39;;</span></span>
<span class="line"><span>import { UIMessage } from&#39;ai&#39;;</span></span>
<span class="line"><span>import { toBaseMessages, toUIMessageStream } from&#39;@ai-sdk/langchain&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Injectable()</span></span>
<span class="line"><span>exportclass AiService {</span></span>
<span class="line"><span>  private readonly agent: ReturnType&lt;typeof createAgent&gt;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>constructor(</span></span>
<span class="line"><span>    @Inject(&#39;WEB_SEARCH_TOOL&#39;) private readonly webSearchTool: any,</span></span>
<span class="line"><span>    @Inject(&#39;CHAT_MODEL&#39;) model: ChatOpenAI</span></span>
<span class="line"><span>  ) {</span></span>
<span class="line"><span>    this.agent = createAgent({</span></span>
<span class="line"><span>        model,</span></span>
<span class="line"><span>        tools: [this.webSearchTool],</span></span>
<span class="line"><span>        systemPrompt:</span></span>
<span class="line"><span>          &#39;你是 AI 助手，需要最新信息、事实核查或联网信息时，请使用 web_search 工具搜索后再作答。&#39;,</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async stream(messages: UIMessage[]) {</span></span>
<span class="line"><span>    const lcMessages = await toBaseMessages(messages);</span></span>
<span class="line"><span>    const lgStream = awaitthis.agent.stream(</span></span>
<span class="line"><span>      { messages: lcMessages },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        streamMode: [&#39;messages&#39;, &#39;values&#39;],</span></span>
<span class="line"><span>        recursionLimit: 12,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return toUIMessageStream(lgStream as AsyncIterable&lt;AIMessageChunk&gt;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这次我们不再手写 agent loop，自己调用 tool 了，直接用 langchain 封装好的 createAgent 的 api</p><p>然后用 @ai-sdk/langchain 这个适配器：</p><p>把传入的 ai sdk 的 messages 转成 langchain 的 BaseMessage 传给 agent</p><p>再把返回的 stream 转成 ai ask 的 ui message stream 返回</p><p>这样返回的流式内容就是 SSE 的 Data Stream Protocol 的协议数据了。</p><p>我们改下 AiController，加一下接口：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { BadRequestException, Body, Controller, Get, Post, Query, Res, Sse } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import type { Response } from&#39;express&#39;;</span></span>
<span class="line"><span>import { AiService } from&#39;./ai.service&#39;;</span></span>
<span class="line"><span>import { pipeUIMessageStreamToResponse, UIMessage } from&#39;ai&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Controller(&#39;ai&#39;)</span></span>
<span class="line"><span>exportclass AiController {</span></span>
<span class="line"><span>constructor(private readonly aiService: AiService) {}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span>    本地测试：</span></span>
<span class="line"><span>    curl -N -sS -X POST &#39;http://localhost:3000/ai/chat&#39; \\</span></span>
<span class="line"><span>      -H &#39;Content-Type: application/json&#39; \\</span></span>
<span class="line"><span>      -d &#39;{&quot;messages&quot;:[{&quot;id&quot;:&quot;1&quot;,&quot;role&quot;:&quot;user&quot;,&quot;parts&quot;:[{&quot;type&quot;:&quot;text&quot;,&quot;text&quot;:&quot;北京今天的天气&quot;}]}]}&#39;</span></span>
<span class="line"><span>   */</span></span>
<span class="line"><span>  @Post(&#39;chat&#39;)</span></span>
<span class="line"><span>async postChat(</span></span>
<span class="line"><span>    @Body() body: { messages?: UIMessage[] },</span></span>
<span class="line"><span>    @Res({ passthrough: false }) res: Response,</span></span>
<span class="line"><span>  ): Promise&lt;void&gt; {</span></span>
<span class="line"><span>    if (!body?.messages || !Array.isArray(body.messages)) {</span></span>
<span class="line"><span>      thrownew BadRequestException(&#39;Invalid JSON&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const stream = awaitthis.aiService.stream(body.messages);</span></span>
<span class="line"><span>    pipeUIMessageStreamToResponse({ response: res, stream });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>因为 ai sdk 转换好的就是 SSE 的流，我们不需要自己再做处理，直接把它传给 response 就可以了。</p><p>安装用到的 ai sdk 的包：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install ai @ai-sdk/langchain</span></span></code></pre></div><p>用上面那个 curl 测试下：</p><p>对接成功！</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdpcKjlsNRYIjIicJx25u08rQ3IX6dqGXajfsurzQ2LcXEFiczCXxMhicXH8ujNFiaDZAovytysbq7BbDo8TDyXGzHoloDXStIB4Ew/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=14" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffHG4LTlNYFvm4PrFia5w5jNhiaBKWp3rEZlQq0Z3jVBOnrRHYMAQrlLJuBfBMkPCfo7EKQibaF5A4URvwBw8KIibnIsoGJFlicGPYg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=15" alt="图片" referrerpolicy="no-referrer"></p><p>现在就把 langchain 的 agent 的 stream 转成了 ai sdk 的 Data Stream Protocol 协议的格式了。</p><p>接下来创建前端项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>npx create-vite agui-frontend</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeJiaL2WCn4cH2XSPN3icX2MBXD9ghvwQPCOlhBliafMynX9UFmTRvh3xP7xvcWg7PExF1zaeCeibd8yxlT1oUBwXeoLOeltsezgzk/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=16" alt="图片" referrerpolicy="no-referrer"></p><p>这里创建的是 react 项目，用 @ai-sdk/react 来对接，你换成 vue 项目，用 @ai-sdk/vue 对接也可以。</p><p>vercel ai sdk 支持各种前端框架</p><p>在后端允许下跨域访问接口：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeRY3GYSEJIAnk2d8pQ27blQFvDyqs0PFXAXibly5gHJhjlribFOpTeVdJnTBQqdWicxibibDrRsp5mV7IE18jDkPM917bxzgiagnyx8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=17" alt="图片" referrerpolicy="no-referrer"></p><p>然后来改前端页面：</p><p>安装 @ai-sdk/react 和 ai 包</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @ai-sdk/react ai</span></span></code></pre></div><p>核心逻辑是这个：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffZGExUbF4ZhUh3yltQnZcv74IViaSvD6Yak5ZkGpRCsgLMsKGBP99EKt8lB0bgaZW5bHYofxXeVh403lkWdiaEz1wtp2Zw0aJCY/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=18" alt="图片" referrerpolicy="no-referrer">用 useChat 连接后端的 SSE 接口，连接方式用 DefaultChatTransport</p><p>这样就可以拿到 messages 了，不用自己解析</p><p>message 有 id、role、parts 属性：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcorB1hyADgIxWcEiaM40vOILOEJwaqyHNa5z60YaNQ8ApntuCutKAEOvAoAClicd390bA93qibXibfMiad4ibulwhphPjq6PCpn8324/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=19" alt="图片" referrerpolicy="no-referrer"></p><p>创建个组件渲染 parts 部分：</p><p>ai 包提供了 isToolUIPart、getToolName 的 api</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdduKFNQL2QxxaicnrflsEUxWYxwx4oXeyib4mB7zFKygNOFYfx5y9WrRs5d2mCtMwQW4uRiby8OMGzrcb6B0HJJhEYp8bu83rbzk/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=20" alt="图片" referrerpolicy="no-referrer"></p><p>我们可以用它来判断当前 part 是不是 tool call</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdNrCwSiaLwADMVRZsQZnLJ4ca16nVfhUdUEvd6MicNwR0BNMcGHGcp00pODo0DEhF37C5w5jGVhQKb2duF2nGIqVbkj07eJSFVk/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=21" alt="图片" referrerpolicy="no-referrer"></p><p>如果不是，就是渲染文本，如果是就是渲染对应的 tool 的组件。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdHDF67E6oLaMW8VjEDqRHhtsNHhZCO5IFdWCHqIXZKhylDibQibRb6VqdZNFVeV9qTj4ia0X04KPRunUyPRhzHjOoHYvT9LOUNec/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=22" alt="图片" referrerpolicy="no-referrer"></p><p>用 getToolName 拿到 part 的工具名</p><p>目前只有 web search 的 tool，根据 state 来渲染 pending、error 状态的组件，还有成功后的组件</p><p>就像前面分析的，output-available 阶段可以拿到 output：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcLjyaCngDvZnialeQibSZTx5H4mqmQYEicqxz50u0ATT1LR3HEf3YIfeYu6Aia8cgUruVrzjw98s1y5WQr8N91jm06wCicaHZRpkso/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=23" alt="图片" referrerpolicy="no-referrer"></p><p>根据不同 tool 的 output 的格式做下渲染就可以了。</p><p>具体代码可以从仓库复制，核心的就是刚才讲的这几个，其余的不重要。</p><p>跑一下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>npm run dev</span></span></code></pre></div><p>现在就不只是流式渲染文本了，还会流式渲染 tool call 对应的组件</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcQlibozrss82bbfIwvVY0v5bzIHngaZ4nrlvxCd8MebHuYMrC2JjFd3IeCP1HqyVfiaXfP7YxWMCSlaODMpHkSwNJX0hSAjJjib4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=24" alt="图片" referrerpolicy="no-referrer"></p><p>但现在流式文本部分的 markdown 还没处理：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfc2bl01RvvzDBbG8JQlJDy2jibu3l0AFTtlia4dYkiawstgCXhxIX4b95GV4JoXic5gQx9kRjGhfsTECtjtMicTuVww3ec4OwOEJbs4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=25" alt="图片" referrerpolicy="no-referrer"></p><p>我们加一个流式渲染 markdown 对应组件的库 Streamdown</p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install streamdown @streamdown/code @streamdown/mermaid</span></span></code></pre></div><p>这样流式的 markdown 文本就会用对应组件来渲染了：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffAicQnjViaIfC3DWSO8kXZtXN2I88nD1mcnlw2z3SwFavBoFIJFOgesb1bF7JD0G64OjR2RXC5XERSvJX0hVzIG1OwGYMmPh6u0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=26" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdKAccgibR3RR4dQmwyc8IC6Z0Spca9CKicDVuGE9NNdL8d6L7pUPGVeiaPGSOYXXNflIiaBABve1wTiayPDoKHyibxyvjOeqHbcNMVg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=27" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffuXglpicXGVF1nHHOG6tL1o5uw2zibGggXwyfiaNq4RgauHMg6CicLKD6ukBuTRng0viaOjziayCRdYP5q7ice8qcd7KKbkia95oBHibz4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=28" alt="图片" referrerpolicy="no-referrer"></p><p>我们只做了 web search 的 tool，再来加一个 tool</p><p>把之前发送邮件的 tool 拿过来</p><p>安装下依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @nestjs-modules/mailer</span></span></code></pre></div><p>在 .env 加对应配置：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcIRZ4Ol9HcHyz5iaovJoS8OOjQPOWD94ogkH40GMIHpiaKdQgd1cj1aDnEk9gvad1Ua1GXLFR9giaCqAM9HW1My95uPkLuUeavg8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=29" alt="图片" referrerpolicy="no-referrer"></p><p>在 AppModule 引入这个包：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffhAwBrqrlphOogNHbZ1TdQ6HUrkN8Nv433e4vZpzVSSnRhzupSutKrs76SDjI2QTAT4Han5KOTIjyArVDgwbvvQDwicZMibCRaE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=30" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>MailerModule.forRootAsync({</span></span>
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
<span class="line"><span>      from: configService.get&lt;string&gt;(&#39;MAIL_FROM&#39;),</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>}),</span></span></code></pre></div><p>之后在 AiModule 添加一个 provider：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcAc0LrYm6WR8P979XIswKn6gP6JCOVjLicXicu9tELzVWiaEmPVzbb1VCvqI2EgHE3Ahv9SWdBb7QHYxibz8ocGQ7KB6jq9icMZpu4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=31" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{</span></span>
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
<span class="line"><span>},</span></span></code></pre></div><p>绑定一下：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdxCibIE7T67Vdb478YZVPYJ5e7HYVueN6MeXp0fO7R1LCDOr6HrUunaOM27aEia8oXzS00W1NyvRKcHse5tmI2VSfdmMPBibR4o8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=32" alt="图片" referrerpolicy="no-referrer"></p><p>直接调用会渲染默认 tool call 组件</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcKddMbaBQpS53EeQ2dN0F6kEicibiba9yXsibICpxibjNlQbSEBGfcXf0jVic6N9Iyake7uEGNwovic4h3SjF9ickg6XPxlz41utI0ySw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=33" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdRgWNzBlcwnnGYuIictMutV87HThIXwULkbOpKBHOD5EGN5Y9o2W90oZexgmQiaooQiaOnvbXTibM6iawpLFfe0ACvSkQ4YOg31ib3Y/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=34" alt="图片" referrerpolicy="no-referrer"></p><p>我们再加一个单独的组件用于渲染发送邮件的 tool</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcMfZQ4kges72oQtkicSfa6YJKVAFzUbgiaTZkIaguCkfl9ObPkL0nFu58WxXygia05LypJ6BGlIMqgDev5Yh2SSF5NQEETxYuiaWQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=35" alt="图片" referrerpolicy="no-referrer"></p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>我们基于 AGUI 协议实现了流式渲染文本、tool call 组件的效果。</p><p>用的是 Vercel AI SDK 的 Data Stream Protocol。</p><p>后端用 LangChain 来写 Agent，我们不再手写 agent loop，直接用了 createAgent 的 api</p><p>通过 @ai-sdk/langchain 把 stream 转为基于 Data Stream Protocol 协议的 SSE 流</p><p>前端用 @ai-sdk/react 或者 @ai-sdk/vue 的 useChat 来解析这个 SSE 流，拿到 messages。</p><p>根据 message 是文本还是 tool call 做不同的渲染</p><p>文本用 streamdown 流式渲染，会解析 markdown 的表格、mermaid 流程图、代码等语法，用不同组件展示</p><p>tool call 则是自定义组件实现渲染。</p><p>对接了 AGUI 协议后，Agent 的交互体验就好很多了。</p>`,143)])])}const d=a(i,[["render",l]]);export{f as __pageData,d as default};
