import{_ as n,a,b as p,c as e,d as l,e as o,f as t,g as i,h as c,i as r,j as m,k as u,l as d,m as g,n as h,o as v,p as _,q as C,r as q}from"./chunks/image-20260128135053703.C6eJk5v5.js";import{_ as P,o as b,c as M,ag as k}from"./chunks/framework.lghGfHnE.js";const R=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/05-高德 MCP + 浏览器 MCP：LangChain 复用别人的 MCP Server 有多爽！/README.md","filePath":"前端转AI Agent/05-高德 MCP + 浏览器 MCP：LangChain 复用别人的 MCP Server 有多爽！/README.md"}'),A={name:"前端转AI Agent/05-高德 MCP + 浏览器 MCP：LangChain 复用别人的 MCP Server 有多爽！/README.md"};function f(y,s,S,x,T,I){return b(),M("div",null,[...s[0]||(s[0]=[k('<p>上节我们学了 MCP。</p><p>自己实现了一个 MCP Server，然后在 Cursor 或者 LangChain 里连上这个 server，就可以用里面的 tools 了。</p><video src="'+n+'" controls></video><p><img src="'+a+'" alt="image-20260128134953817"></p><p>它本质上还是 tool，只不过包了一层进程，可以通过 stdio 和 http 来访问。</p><p><img src="'+p+'" alt="image-20260128135000078"></p><p>有这一层协议之后，有个巨大的好处：</p><p>任何人都可以开发基于这个协议的 MCP Server，然后我们可以直接复用！</p><p>比如上节我们写的那个 MCP Server 就可以被别人用。</p><p>这节我们用一下别人写好的 MCP Server，感受下 MCP 有多爽！</p><p>我们用这三个 MCP Server：</p><ul><li><p>高德 MCP：可以做位置查询、路线规划等</p></li><li><p>Chrome DevTools MCP：控制浏览器，打开关闭页面、点击元素、截图等</p></li><li><p>FileSystem MCP：读写文件、创建目录等</p></li></ul><p>首先是高德 MCP，我们需要先获取一个 apikey：</p><p><a href="https://developer.amap.com/" target="_blank" rel="noreferrer">https://developer.amap.com/</a></p><video src="'+e+'" controls></video><p>创建应用，然后创建一个 api key</p><p>类型选 web 服务就行。</p><p>然后我们先在 cursor 里测试下这个 mcp 服务是否可用：</p><video src="'+l+'" controls></video><p>可以看到，配好之后，就可以查到这个 mcp server 里的一堆 tool 了：</p><p><img src="'+o+'" alt="image-20260128135009500"></p><p>记得我们说过 mcp 有两种接入方式么？</p><p><img src="'+t+`" alt="image-20260128135016089"></p><p>这就是 http 的接入方式。</p><p>当然，高德也支持 stdio 的本地进程的接入方式，这样写：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;amap-maps&quot;: {</span></span>
<span class="line"><span>  &quot;command&quot;: &quot;npx&quot;,</span></span>
<span class="line"><span>  &quot;args&quot;: [</span></span>
<span class="line"><span>    &quot;-y&quot;,</span></span>
<span class="line"><span>    &quot;@amap/amap-maps-mcp-server&quot;</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>  &quot;env&quot;: {</span></span>
<span class="line"><span>    &quot;AMAP_MAPS_API_KEY&quot;: &quot;你的 api key&quot;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>},</span></span></code></pre></div><video src="`+i+`" controls></video><p>就是用 npx 跑一个 npm 包，会创建一个支持 stdio 连接的进程，然后连上其中的 mcp server 就好了。</p><p>这个 mcp server 里肯定封装了和高德服务端的通信，本质上是一样的。</p><p>其实你的前端简历里就可以写一下这个：</p><p>我开发了一个 mcp server 的 npm 包，包含 xxx tool，支持 stdio 访问。可以在 cursor 或 langchain 里用 npx 执行来连上这个 mcp server。</p><p>这样面试官一看就知道，这个人是真懂 MCP 的，而且还有实践经验。</p><p>说回正题，我们在 langchain 里用一下这个 mcp：</p><p>在 tool-test 项目里创建 src/mcp-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { MultiServerMCPClient } from&#39;@langchain/mcp-adapters&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import chalk from&#39;chalk&#39;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage, ToolMessage } from&#39;@langchain/core/messages&#39;;</span></span>
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
<span class="line"><span>        },</span></span>
<span class="line"><span>        &quot;amap-maps-streamableHTTP&quot;: {</span></span>
<span class="line"><span>            &quot;url&quot;: &quot;https://mcp.amap.com/mcp?key=&quot; + process.env.AMAP_MAPS_API_KEY</span></span>
<span class="line"><span>        },</span></span>
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
<span class="line"><span>                </span></span>
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
<span class="line"><span></span></span>
<span class="line"><span>await runAgentWithTools(&quot;北京南站附近的酒店，以及去的路线&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await mcpClient.close();</span></span></code></pre></div><p>mcp client 的代码和上节一样，用 @langchain/mcp-adapters</p><p>拿到其中的 tools 绑定给 model</p><p>然后调用 model，如果有 tool_calls 就调用下，把工具调用结果封装为 ToolMessage 传给大模型继续处理。</p><p>这里的高德 api key 同样放到了 .env 里：</p><p><img src="`+c+'" alt="image-20260128135023814"></p><p>先注释掉高德 mcp server 跑一下：</p><video src="'+r+'" controls></video><p>可以看到，大模型没法处理地理位置信息，让你用地图。</p><p>我们启用高德 MCP Server：</p><video src="'+m+'" controls></video><p>现在，大模型就可以调用高德 mcp 里的 tool 给出酒店位置和路线了！</p><p>这就是 mcp 的好处，直接复用别人写好的 tool。</p><p>然后文件读写、创建目录这种，也不用自己写 tool，可以用现成 mcp：</p><p><img src="'+u+`" alt="image-20260128135029786"></p><p>mcp 官方维护的一个 mcp server</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;filesystem&quot;: {</span></span>
<span class="line"><span>    &quot;command&quot;: &quot;npx&quot;,</span></span>
<span class="line"><span>    &quot;args&quot;: [</span></span>
<span class="line"><span>      &quot;-y&quot;,</span></span>
<span class="line"><span>      &quot;@modelcontextprotocol/server-filesystem&quot;,</span></span>
<span class="line"><span>      ...(process.env.ALLOWED_PATHS.split(&#39;,&#39;) || &#39;&#39;)</span></span>
<span class="line"><span>    ]</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>后面是可访问的目录，我们配在 .env 里：</p><p><img src="`+d+'" alt="image-20260128135036933"></p><p>逗号分隔</p><p>我们可以先在 cursor 里配置下这个 mcp 服务，看下有哪些 tool：</p><video src="'+g+'" controls></video><p>可以看到，有文件读写、目录创建、文件移动等 tool。</p><p>这样，配上这个 mcp，大模型就有文件读写能力了。</p><p>不过这里还有个坑注意下：</p><p><img src="'+h+`" alt="image-20260128135046173"></p><p>一般我们写 tool 都是直接返回字符串，但是 FileSystem MCP 封装的这些 tool 返回的是对象，有 text 属性，所以要处理下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 确保 content 是字符串类型</span></span>
<span class="line"><span>let contentStr;</span></span>
<span class="line"><span>if (typeof toolResult === &#39;string&#39;) {</span></span>
<span class="line"><span>    contentStr = toolResult;</span></span>
<span class="line"><span>} else if (toolResult &amp;&amp; toolResult.text) {</span></span>
<span class="line"><span>    // 如果返回对象有 text 字段，优先使用</span></span>
<span class="line"><span>    contentStr = toolResult.text;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>messages.push(new ToolMessage({</span></span>
<span class="line"><span>    content: contentStr,</span></span>
<span class="line"><span>    tool_call_id: toolCall.id,</span></span>
<span class="line"><span>}));</span></span></code></pre></div><p>改下提示词：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>await runAgentWithTools(&quot;北京南站附近的5个酒店，以及去的路线，路线规划生成文档保存到 /Users/guang/Desktop 的一个 md 文件&quot;);</span></span></code></pre></div><p>跑跑试试：</p><video src="`+v+`" controls></video><p>可以看到，大模型首先调用高德 mcp 拿到了附近的酒店位置，然后规划了路线</p><p>最后调用 FileSystem MCP 写入了文件。</p><p>直接复用别人的 MCP，完全不用自己写。</p><p>你自己写的 tool 想给别人用，也可以封装成 MCP，最好发个 npm 包，这样还可以写到简历上去，让面试官用。</p><p>最后我们再来用一下 Chrome Devtools 的 MCP，它是可以用来做浏览器自动化的。</p><p>比如打开页面、点击元素、截图等。</p><p>在 cursor 配置下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;chrome-devtools&quot;: {</span></span>
<span class="line"><span>  &quot;command&quot;: &quot;npx&quot;,</span></span>
<span class="line"><span>  &quot;args&quot;: [</span></span>
<span class="line"><span>    &quot;-y&quot;,</span></span>
<span class="line"><span>    &quot;chrome-devtools-mcp@latest&quot;</span></span>
<span class="line"><span>  ]</span></span>
<span class="line"><span>}</span></span></code></pre></div><video src="`+_+'" controls></video><p>改下提示词：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>await runAgentWithTools(&quot;北京南站附近的酒店，最近的 3 个酒店，拿到酒店图片，打开浏览器，展示每个酒店的图片，每个 tab 一个 url 展示，并且在把那个页面标题改为酒店名&quot;);</span></span></code></pre></div><video src="'+C+'" controls></video><p>可以看到，搜到了北京南站最近的 3 个酒店，并且浏览器打开了酒店图片。</p><p>只要配好 MCP，大模型就可以直接调用里面的 tools 了：</p><p><img src="'+q+'" alt="image-20260128135053703"></p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code/tool-test" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code/tool-test</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>这节我们使用了高德、FileSystem、Chrome Devtools 的 MCP，用它们结合来实现了一些功能。</p><p>这些 MCP Server 有的是 stdio 本地进程调用，有的是 http 远程进程调用。</p><p>MCP 的一大好处就是别人开发好的，可以直接用。</p><p>你全程不需要知道怎么用高德的 API 查询位置、路线，不需要知道怎么用 cdp 协议控制浏览器。</p><p>你只需要把这些 MCP 给到 AI，让它自己去调用。</p><p>你不需要知道这些 tool 里面的高德 API 怎么用、浏览器控制怎么用，大模型会自己读取 tool 描述来传入参数调用。是不是特别爽！</p>',89)])])}const D=P(A,[["render",f]]);export{R as __pageData,D as default};
