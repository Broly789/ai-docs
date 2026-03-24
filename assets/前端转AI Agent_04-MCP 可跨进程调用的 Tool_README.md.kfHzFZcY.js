import{_ as n,a,b as p,c as e,d as l,e as t,f as i,g as o,h as c,i as r,j as m,k as g,l as d,m as u,n as h,o as v,p as _,q as C,r as b,s as x,t as k,u as M}from"./chunks/image-20260128134532905.e4OsaBOB.js";import{_ as f,o as y,c as P,ag as T}from"./chunks/framework.BYTi4OdY.js";const j=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/04-MCP 可跨进程调用的 Tool/README.md","filePath":"前端转AI Agent/04-MCP 可跨进程调用的 Tool/README.md"}'),A={name:"前端转AI Agent/04-MCP 可跨进程调用的 Tool/README.md"};function w(I,s,S,q,R,E){return y(),P("div",null,[...s[0]||(s[0]=[T('<p>我们已经写了一些 tool 了：读写文件和目录、执行命令</p><p><img src="'+n+'" alt="image-20260128134320013"></p><p>只要声明 tool 的名字、描述、参数格式，模型会在发现需要用 tool 的时候自动解析出参数传入来调用，然后把执行结果封装成 ToolMessage 传入 chat。</p><p><img src="'+a+'" alt="image-20260128134326513"></p><p>比如上节我们实现了简易的 cursor，就是声明了读写文件和目录、执行命令的 tool，这样你让大模型创建 react + vite 项目，它就会自动判断什么时候调用哪个 tool，自动实现目录、文件的创建，以及 pnpm install 和 pnpn run dev 的执行。</p><p>我们只是告诉他要创建的项目，然后安装依赖跑起来。</p><p>这些 tool 怎么调用、参数是什么都是大模型自己决定的。</p><p>tool 给大模型扩展了做事情的能力，本来它只能思考，不能做事情，但是现在可以自己调用 tool 来帮你做事情了。</p><p>但你有没有发现 tool 有个问题：</p><p>node 写的 ai agent 的代码，你的 tool 也得是 node 写。</p><p>如果你之前有一些工具是 java、python、rust 写的呢？</p><p>你想封装成 tool 怎么办呢？</p><p>有的同学说：现在不是可以执行命令么，通过单独进程把这些其他语言写的代码跑一下就行啊。</p><p>确实，也就是这样：</p><p><img src="'+p+'" alt="image-20260128134333766"></p><p>这里的 stdio 就是标准输入输出流，也就是键盘输入、控制台输出。当你进程跑一个子进程，就可以用这种方式通信。</p><p>还有的同学说：简单，用 http 啊！本地跑个服务就好了。</p><p>也就是这样：</p><p><img src="'+e+'" alt="image-20260128134341530"></p><p>现在是解决了跨语言调用工具的问题。</p><p>那如果每个人都这样搞，它们提供的服务都不一样，我想接入别的 tool，是不是要了解每个服务都是怎么定义的呢？</p><p>能不能定义一个统一的通信协议，我们都按照这个格式来沟通，这样所有的跨进程工具调用就都可以接入了。</p><p>也就是这样：</p><p><img src="'+l+'" alt="image-20260128134349593"></p><p>想跨进程调用某个工具，通过这个协议通信就行。</p><p>不管是本地工具，直接跑那个进程，然后 stdio 通信。</p><p>还是远程工具，通过 http 连接远程服务进程。</p><p>这个协议叫什么呢？</p><p>是给 Model 扩展 Context 上下文，让它能做的更多，知道的更多的 Protocal 协议。</p><p>就叫 MCP 吧。</p><p>恭喜你，你发明了 MCP！</p><p><img src="'+t+'" alt="image-20260128134358629"></p><p>MCP 最大的特点就是可以<strong>跨进程调用工具</strong>。</p><p>跨本地的进程调用，就是用 stdio。</p><p>跨远程的进程调用，就是用 http。</p><p>提到 MCP 都会提到这张图：</p><p><img src="'+i+'" alt="image-20260128134407575"></p><p>你的 ai agent 就是 MCP 客户端，可以通过 MCP 协议调用各种 MCP Server，实现跨进程的工具调用。</p><p>当然，在 langchain 里，它也是 tool ，只不过是 tool 的一种而已：</p><p><img src="'+o+`" alt="image-20260128134415806"></p><p>你在 tool 的函数里，调用下 MCP Client，访问下远程 Mcp Server，它本质上还是 tool，但是却集成了 MCP 工具。</p><p>MCP 是由 AI 巨头 Anthropic 公司发起并开发，但是 2025 年 12 月交给了 Linux 基金会维护。</p><p>也就是说它现在是完全中立于任何一个模型的行业通用协议。</p><p>大概知道 MCP 是啥就行，我们自己来写个 MCP 服务就明白了。</p><p>继续在 tool-test 这个项目里写：</p><p>安装 mcp 的包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @modelcontextprotocol/sdk</span></span></code></pre></div><p>从包名就可以看出来是中立于任何一家公司的。</p><p>创建 src/my-mcp-server.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { McpServer } from&#39;@modelcontextprotocol/sdk/server/mcp.js&#39;;</span></span>
<span class="line"><span>import { StdioServerTransport } from&#39;@modelcontextprotocol/sdk/server/stdio.js&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 数据库</span></span>
<span class="line"><span>const database = {</span></span>
<span class="line"><span>users: {</span></span>
<span class="line"><span>    &#39;001&#39;: { id: &#39;001&#39;, name: &#39;张三&#39;, email: &#39;zhangsan@example.com&#39;, role: &#39;admin&#39; },</span></span>
<span class="line"><span>    &#39;002&#39;: { id: &#39;002&#39;, name: &#39;李四&#39;, email: &#39;lisi@example.com&#39;, role: &#39;user&#39; },</span></span>
<span class="line"><span>    &#39;003&#39;: { id: &#39;003&#39;, name: &#39;王五&#39;, email: &#39;wangwu@example.com&#39;, role: &#39;user&#39; },</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const server = new McpServer({</span></span>
<span class="line"><span>name: &#39;my-mcp-server&#39;,</span></span>
<span class="line"><span>version: &#39;1.0.0&#39;,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 注册工具：查询用户信息</span></span>
<span class="line"><span>server.registerTool(&#39;query_user&#39;, {</span></span>
<span class="line"><span>description: &#39;查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。&#39;,</span></span>
<span class="line"><span>inputSchema: {</span></span>
<span class="line"><span>    userId: z.string().describe(&#39;用户 ID，例如: 001, 002, 003&#39;),</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>}, async ({ userId }) =&gt; {</span></span>
<span class="line"><span>const user = database.users[userId];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (!user) {</span></span>
<span class="line"><span>    return {</span></span>
<span class="line"><span>      content: [</span></span>
<span class="line"><span>        {</span></span>
<span class="line"><span>          type: &#39;text&#39;,</span></span>
<span class="line"><span>          text: \`用户 ID \${userId} 不存在。可用的 ID: 001, 002, 003\`,</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>      ],</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    content: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        type: &#39;text&#39;,</span></span>
<span class="line"><span>        text: \`用户信息：\\n- ID: \${user.id}\\n- 姓名: \${user.name}\\n- 邮箱: \${user.email}\\n- 角色: \${user.role}\`,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>server.registerResource(&#39;使用指南&#39;, &#39;docs://guide&#39;, {</span></span>
<span class="line"><span>description: &#39;MCP Server 使用文档&#39;,</span></span>
<span class="line"><span>mimeType: &#39;text/plain&#39;,</span></span>
<span class="line"><span>}, async () =&gt; {</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    contents: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        uri: &#39;docs://guide&#39;,</span></span>
<span class="line"><span>        mimeType: &#39;text/plain&#39;,</span></span>
<span class="line"><span>        text: \`MCP Server 使用指南</span></span>
<span class="line"><span></span></span>
<span class="line"><span>功能：提供用户查询等工具。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>使用：在 Cursor 等 MCP Client 中通过自然语言对话，Cursor 会自动调用相应工具。\`,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>const transport = new StdioServerTransport();</span></span>
<span class="line"><span>await server.connect(transport);</span></span></code></pre></div><p>代码很容易看懂：</p><ul><li><p>new McpServer 创建了 mcp server 实例</p></li><li><p>server.registerTool 注册了一个工具，声明 name、description、schema</p></li><li><p>server.registerResource 注册了一个资源，就是静态数据</p></li></ul><p>和我们写 tool 的时候差不多，只不过这里分了 resource 和 tool，resouce 一般返回静态数据，tool 来做一些事情。</p><p>最后，可以提供 stdio 的本地进程的调用方式，也可以提供 http 的远程调用方式。</p><p>这里是 stdio 的传输方式（Transport）</p><p><img src="`+c+'" alt="image-20260128134423804"></p><p>这样，我们的 MCP 服务就创建好了！</p><p>是不是很简单。</p><p>其实就是 tool，加上了协议而已。</p><p>我们在 cursor 里配置下这个 mcp server：</p><video src="'+r+'" controls></video><p>配置好之后测试下：</p><video src="'+m+'" controls></video><p>我特意换了个项目来测。</p><p>可以看到，确实检测到了这个 mcp 然后调用了！</p><p>这里 cursor 有个坑注意下：</p><video src="'+g+'" controls></video><p>点一下 tool 是禁用，再点一下是启用。</p><p>但是 cursor 这个状态颜色区分不明显，没有调用 mcp 工具，可能你关掉了。</p><p><strong>这就是 mcp 的好处，写好之后可以插拔到任何地方当 tool 用。</strong></p><p>那 resource 呢？</p><p>它其实不是用来作为 tool 触发的，主要是你可以引用用来写 prompt 之类的。</p><p>比如这样：</p><video src="'+d+'" controls></video><p>resource 主要是查询信息用的（read）， 而 tool 是执行功能用的（call）</p><p>当然，因为有了 mcp，除了 cursor，别的软件同样可以调用这个服务：</p><p><img src="'+u+`" alt="image-20260128134431031"></p><p>我们在 langchain 代码里调用下 mcp server：</p><p>用这个包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/mcp-adapters</span></span></code></pre></div><p>创建 src/langchain-mcp-test.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { MultiServerMCPClient } from&#39;@langchain/mcp-adapters&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import chalk from&#39;chalk&#39;;</span></span>
<span class="line"><span>import { HumanMessage, ToolMessage } from&#39;@langchain/core/messages&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>    modelName: &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const mcpClient = new MultiServerMCPClient({</span></span>
<span class="line"><span>    mcpServers: {</span></span>
<span class="line"><span>        &#39;my-mcp-server&#39;: {</span></span>
<span class="line"><span>            command: &quot;node&quot;,</span></span>
<span class="line"><span>            args: [</span></span>
<span class="line"><span>                &quot;/Users/guang/code/tool-test/src/my-mcp-server.mjs&quot;</span></span>
<span class="line"><span>            ]</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const tools = await mcpClient.getTools();</span></span>
<span class="line"><span>const modelWithTools = model.bindTools(tools);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction runAgentWithTools(query, maxIterations = 30) {</span></span>
<span class="line"><span>    const messages = [</span></span>
<span class="line"><span>        new HumanMessage(query)</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    for (let i = 0; i &lt; maxIterations; i++) {</span></span>
<span class="line"><span>        console.log(chalk.bgGreen(\`⏳ 正在等待 AI 思考...\`));</span></span>
<span class="line"><span>        const response = await modelWithTools.invoke(messages);</span></span>
<span class="line"><span>        messages.push(response);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 检查是否有工具调用</span></span>
<span class="line"><span>        if (!response.tool_calls || response.tool_calls.length === 0) {</span></span>
<span class="line"><span>            console.log(\`\\n✨ AI 最终回复:\\n\${response.content}\\n\`);</span></span>
<span class="line"><span>            return response.content;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        console.log(chalk.bgBlue(\`🔍 检测到 \${response.tool_calls.length} 个工具调用\`));</span></span>
<span class="line"><span>        console.log(chalk.bgBlue(\`🔍 工具调用: \${response.tool_calls.map(t =&gt; t.name).join(&#39;, &#39;)}\`));</span></span>
<span class="line"><span>        // 执行工具调用</span></span>
<span class="line"><span>        for (const toolCall of response.tool_calls) {</span></span>
<span class="line"><span>            const foundTool = tools.find(t =&gt; t.name === toolCall.name);</span></span>
<span class="line"><span>            if (foundTool) {</span></span>
<span class="line"><span>                const toolResult = await foundTool.invoke(toolCall.args);</span></span>
<span class="line"><span>                messages.push(new ToolMessage({</span></span>
<span class="line"><span>                    content: toolResult,</span></span>
<span class="line"><span>                    tool_call_id: toolCall.id,</span></span>
<span class="line"><span>                }));</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return messages[messages.length - 1].content;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await runAgentWithTools(&quot;查一下用户 002 的信息&quot;);</span></span></code></pre></div><p>我们用 @langchain/mcp-adapters 创建了 mcp client</p><p>写法和 cursor 里配置一样：</p><p><img src="`+h+'" alt="image-20260128134439435"></p><p>就是用命令行启动这个进程，之后用 stdio 的方式做通信。</p><p>拿到 tools 之后绑定到模型。</p><p>模型调用返回 tool_calls 消息需要自己调用 tool，调用完通过 ToolMessage 封装返回的消息，继续调用。</p><p>这个循环我们写过很多次了。</p><p>调用下试试：</p><p>可以看到，你让大模型查询用户，它识别到了工具调用，然后调用了 mcp 的工具。</p><p>这里进程没退出，因为你跑了一个子进程作为 mcp server，需要把那个关掉才可以：</p><p><img src="'+v+'" alt="image-20260128134445925"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>await mcpClient.close();</span></span></code></pre></div><p>那 resource 怎么用呢？</p><p>那种静态信息可以放到 system message 里。</p><p>我们先查一下 resource：</p><p><img src="'+_+`" alt="image-20260128134453713"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const res = await mcpClient.listResources();</span></span>
<span class="line"><span>console.log(res);</span></span></code></pre></div><p>遍历依次读取 uri 内容</p><p><img src="`+C+`" alt="image-20260128134500893"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const res = await mcpClient.listResources();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const [serverName, resources] of Object.entries(res)) {</span></span>
<span class="line"><span>    for (const resource of resources) {</span></span>
<span class="line"><span>        const content = await mcpClient.readResource(serverName, resource.uri);</span></span>
<span class="line"><span>        console.log(content);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>然后只要把它放到 system message 里作为上下文就好了：</p><p><img src="`+b+`" alt="image-20260128134508658"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const res = await mcpClient.listResources();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let resourceContent = &#39;&#39;;</span></span>
<span class="line"><span>for (const [serverName, resources] of Object.entries(res)) {</span></span>
<span class="line"><span>    for (const resource of resources) {</span></span>
<span class="line"><span>        const content = await mcpClient.readResource(serverName, resource.uri);</span></span>
<span class="line"><span>        resourceContent += content[0].text;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const messages = [</span></span>
<span class="line"><span>    new SystemMessage(resourceContent),</span></span>
<span class="line"><span>    new HumanMessage(query)</span></span>
<span class="line"><span>];</span></span></code></pre></div><p>调用下：</p><p><img src="`+x+'" alt="image-20260128134518118"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>await runAgentWithTools(&quot;MCP Server 的使用指南是什么&quot;);</span></span></code></pre></div><p>现在，大模型就知道这个 resource 的信息，可以用来回答问题了。</p><p>resource 可以用在 system message 里，也可以用在 human message 里，总之，是作为信息引用的。</p><p>我们主要还是用 mcp 的 tools。</p><p><img src="'+k+'" alt="image-20260128134525471"></p><p>这样，我们就写了一个 mcp server，并分别在 cursor、langchain 里用了这个 mcp server。</p><p>mcp 本质上还是 tool，和之前的 tool 的区别只不过是可以跨进程调用：</p><p><img src="'+M+'" alt="image-20260128134532905"></p><p>当你不需要跨进程用的时候，还是之前那样写更好，还少了进程通信的成本。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code/tool-test" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code/tool-test</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>这节我们学了 MCP，它是可跨进程调用的 Tool。</p><p>可以是本地进程，用 stdio 进程通信。</p><p>可以是远程进程，用 http 通信。</p><p>在 langchain 里用 @langchain/mcp-adapters 封装成 tools 来用，其实和其他 tool 没区别。</p><p>跨进程就意味着不限语言，开发好之后，可以被任意 mcp client 调用，比如 cursor、langchain 等。</p><p>除了自己写 mcp server，现在也有很多现成的 mcp server 可以直接用，下节我们来用一下。</p>',125)])])}const N=f(A,[["render",w]]);export{j as __pageData,N as default};
