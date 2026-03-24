import{_ as n,a,b as p,c as e,d as l,e as i,f as o,g as t,h as c,i as r,j as d,k as g,l as m,m as h,n as u,o as v,p as _,q as b,r as k,s as f,t as y}from"./chunks/image-20260128122409640.DZTfyE3v.js";import{_ as x,o as C,c as A,ag as I}from"./chunks/framework.lghGfHnE.js";const $=JSON.parse('{"title":"02-从 Tool 开始：让大模型自动调工具读文件","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/02-从 Tool 开始：让大模型自动调工具读文件/index.md","filePath":"前端转AI Agent/02-从 Tool 开始：让大模型自动调工具读文件/index.md"}'),q={name:"前端转AI Agent/02-从 Tool 开始：让大模型自动调工具读文件/index.md"};function M(T,s,P,w,E,O){return C(),A("div",null,[...s[0]||(s[0]=[I('<h1 id="_02-从-tool-开始-让大模型自动调工具读文件" tabindex="-1">02-从 Tool 开始：让大模型自动调工具读文件 <a class="header-anchor" href="#_02-从-tool-开始-让大模型自动调工具读文件" aria-label="Permalink to &quot;02-从 Tool 开始：让大模型自动调工具读文件&quot;">​</a></h1><p>我们和大模型聊天，可以问它一些问题，它告诉你怎么做。</p><p>但是大模型没法帮你去做。</p><p>比如你想创建一个 react + vite 的 todolist 项目，你直接问大模型，它只能告诉你应该创建哪些文件，代码是什么，但是不能帮你读写文件、执行命令。</p><p>但是 cursor 是可以的：</p><video src="'+n+'" controls></video><p>你让它创建一个 todolist 项目，它会直接给你写入文件。</p><p>你还可以让它安装依赖，把项目跑起来：</p><video src="'+a+'" controls></video><p>这是怎么实现的呢？</p><p>开发一些 tool 交给 agent 调用就可以了。</p><p>比如读文件、写文件、读取目录、创建目录、执行命令</p><p>这节我们来学下 tool：</p><p><img src="'+p+'" alt="image-20260128122211209"></p><p>首先，我们找个大模型来用：</p><p>这里我们用阿里的千问，因为每个用户登录都有 100 万免费 token</p><p><img src="'+e+'" alt="image-20260128122218945"></p><p>够我们学习用了。</p><p>当然，就算以后不免费了，买也没多少钱，几十块可以用很久了。</p><p>你用别的大模型也一样，都可以。</p><p>首先，登录下：</p><p><a href="https://bailian.console.aliyun.com/?tab=api#/api" target="_blank" rel="noreferrer">https://bailian.console.aliyun.com/?tab=api#/api</a></p><p>点这里获取 api key：</p><p><img src="'+l+'" alt="image-20260128122230840"></p><p>视频演示：</p><video src="'+i+'" controls></video><p>然后就可以用 apikey 来调模型了</p><p>找个模型：</p><video src="'+o+`" controls></video><p>搜 coder 相关的编码模型，这里是生成代码用。每个模型训练的数据集不同，都是用于不同目的。</p><p>我们用 qwen-coder-turbo 这个就行。</p><p>然后来写代码调用。</p><p>创建项目：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir tool-test</span></span>
<span class="line"><span>cd tool-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+t+`" alt="image-20260128122240425"></p><p>用编辑器打开，然后创建一个文件：</p><p>src/hello-langchain.mjs</p><p>mjs 是 es module 格式的 js 文件的意思，可以用 import、export 语法</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { ChatOpenAI } from &#39;@langchain/openai&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>    modelName: &quot;qwen-coder-turbo&quot;,</span></span>
<span class="line"><span>    apiKey: &#39;你的 apiKey&#39;,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: &#39;https://dashscope.aliyuncs.com/compatible-mode/v1&#39;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const response = await model.invoke(&quot;介绍下自己&quot;);</span></span>
<span class="line"><span>console.log(response.content);</span></span></code></pre></div><p>这里的 api key 换成你刚才复制的，然后 base url 是这个：</p><p><img src="`+c+'" alt="image-20260128122248224"></p><p>安装依赖：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/openai</span></span></code></pre></div><p>跑一下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node ./src/hello-langchain.mjs</span></span></code></pre></div><p>可以看到模型调用成功了。</p><p>不过这样把 api key 写死到代码里的方式不好，我们通过 .env 文件来管理，然后用 dotenv 这个包来读取</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install dotenv</span></span></code></pre></div><p>用 dotenv 来读取环境变量：</p><p><img src="'+r+`" alt="image-20260128122256779"></p><p>dotenv 的作用就是读取 .env 文件，设置到环境变量里</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import dotenv from&#39;dotenv&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dotenv.config();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME || &quot;qwen-coder-turbo&quot;,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const response = await model.invoke(&quot;介绍下自己&quot;);</span></span>
<span class="line"><span>console.log(response.content);</span></span></code></pre></div><p>所以我们在 .env 文件里配置这些变量，代码里动态读取：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># OpenAI API 配置</span></span>
<span class="line"><span>OPENAI_API_KEY=你的 api key</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 模型配置（可选，默认为 qwen-coder-turbo）</span></span>
<span class="line"><span>MODEL_NAME=qwen-coder-turbo</span></span></code></pre></div><p>然后还要添加到 .gitignore，因为这些私密信息是不保存到 git 的，就像数据库的密码一样，都是私下里传文件，不会提交 git</p><video src="`+d+`" controls></video><p>好了，准备工作结束！</p><p>接下来开发 tool：</p><p>其实也很简单，我们先写一个读文件的 tool：</p><p>创建 src/tool-file-read.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { tool } from&#39;@langchain/core/tools&#39;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage, ToolMessage } from&#39;@langchain/core/messages&#39;;</span></span>
<span class="line"><span>import fs from&#39;node:fs/promises&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>modelName: process.env.MODEL_NAME || &quot;qwen-coder-turbo&quot;,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const readFileTool = tool(</span></span>
<span class="line"><span>async ({ filePath }) =&gt; {</span></span>
<span class="line"><span>    const content = await fs.readFile(filePath, &#39;utf-8&#39;);</span></span>
<span class="line"><span>    console.log(\`  [工具调用] read_file(&quot;\${filePath}&quot;) - 成功读取 \${content.length} 字节\`);</span></span>
<span class="line"><span>    return\`文件内容:\\n\${content}\`;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;read_file&#39;,</span></span>
<span class="line"><span>    description: &#39;用此工具来读取文件内容。当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）。&#39;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      filePath: z.string().describe(&#39;要读取的文件路径&#39;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const tools = [</span></span>
<span class="line"><span>  readFileTool</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const modelWithTools = model.bindTools(tools);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const messages = [</span></span>
<span class="line"><span>new SystemMessage(\`你是一个代码助手，可以使用工具读取文件并解释代码。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>工作流程：</span></span>
<span class="line"><span>1. 用户要求读取文件时，立即调用 read_file 工具</span></span>
<span class="line"><span>2. 等待工具返回文件内容</span></span>
<span class="line"><span>3. 基于文件内容进行分析和解释</span></span>
<span class="line"><span></span></span>
<span class="line"><span>可用工具：</span></span>
<span class="line"><span>- read_file: 读取文件内容（使用此工具来获取文件内容）</span></span>
<span class="line"><span>\`),</span></span>
<span class="line"><span>new HumanMessage(&#39;请读取 src/tool-file-read.mjs 文件内容并解释代码&#39;)</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let response = await modelWithTools.invoke(messages);</span></span>
<span class="line"><span>console.log(response);</span></span></code></pre></div><p>这里需要用到 langchain 的核心包，以及 zod：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core zod</span></span></code></pre></div><p>首先，创建一个模型 model</p><p>temperature 是温度，也就是 ai 的创造性，设置为 0，让它严格按照指令来做事情，不要自己发挥</p><p>我们没有调用 dotenv.configure，引入了这个模块就行</p><p><img src="`+g+'" alt="image-20260128122307297"></p><p>然后创建一个 tool，调用 tool 的 api</p><p><img src="'+m+`" alt="image-20260128122314811"></p><p>这个很容易看懂，就是函数以及它的名字、描述、参数格式。</p><p>因为要给大模型用，你要描述下这个工具是干什么的。</p><p>描述下参数的格式。</p><p>这里用 zod 包来描述，就是传入一个 object，里面的 filePath 是一个 string</p><p>也就是这样：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{</span></span>
<span class="line"><span>  filePath: &#39;xxx&#39;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>之后把这个 tool 传给大模型：</p><p><img src="`+h+'" alt="image-20260128122323851"></p><p>调用下：</p><p><img src="'+u+'" alt="image-20260128122332634"></p><p>具体的消息有四种：SystemMessage、HumanMessage、AIMessage、ToolMessage</p><ul><li><p><strong>SystemMessage</strong>：设置 AI 是谁，可以干什么，有什么能力，以及一些回答、行为的规范等</p></li><li><p><strong>HumanMessage</strong>：用户输入的信息</p></li><li><p><strong>AIMessage</strong>：AI 的回复信息</p></li><li><p><strong>ToolMessage</strong>：调用工具的结果返回</p></li></ul><p>我们用 system message 告诉 ai，它是一个代码助手，可以读取文件并解释代码内容，给出建议</p><p>跑下试试：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node ./src/tool-file-read.mjs</span></span></code></pre></div><video src="'+v+'" controls></video><p>可以看到 AI 返回的消息是 AIMessage 实例</p><p>它返回了这个信息：</p><p><img src="'+_+'" alt="image-20260128122342586"></p><p>就是解析出来我们给的路径，拼接了调用工具的参数。</p><p>接下来我们基于这个参数调用下工具不就行了？</p><p><img src="'+b+'" alt="image-20260128122350630"></p><p>根据 tool_calls 的数组，分别从 tools 数组里找到对应的工具，取出来 invoke，传入大模型解析出的参数</p><p>最后把工具调用结果作为 ToolMessage 传给大模型，让它继续回答：</p><p><img src="'+k+`" alt="image-20260128122400777"></p><p>注意，这里要用 toolCall 对应的 id 来关联执行结果，也就是告诉大模型，你让我调用的哪个工具，返回的结果是什么</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>let response = await modelWithTools.invoke(messages);</span></span>
<span class="line"><span>// console.log(response);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>messages.push(response);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>while (response.tool_calls &amp;&amp; response.tool_calls.length &gt; 0) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`\\n[检测到 \${response.tool_calls.length} 个工具调用]\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 执行所有工具调用</span></span>
<span class="line"><span>const toolResults = awaitPromise.all(</span></span>
<span class="line"><span>    response.tool_calls.map(async (toolCall) =&gt; {</span></span>
<span class="line"><span>      const tool = tools.find(t =&gt; t.name === toolCall.name);</span></span>
<span class="line"><span>      if (!tool) {</span></span>
<span class="line"><span>        return\`错误: 找不到工具 \${toolCall.name}\`;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      console.log(\`  [执行工具] \${toolCall.name}(\${JSON.stringify(toolCall.args)})\`);</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        const result = await tool.invoke(toolCall.args);</span></span>
<span class="line"><span>        return result;</span></span>
<span class="line"><span>      } catch (error) {</span></span>
<span class="line"><span>        return\`错误: \${error.message}\`;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    })</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 将工具结果添加到消息历史</span></span>
<span class="line"><span>  response.tool_calls.forEach((toolCall, index) =&gt; {</span></span>
<span class="line"><span>    messages.push(</span></span>
<span class="line"><span>      new ToolMessage({</span></span>
<span class="line"><span>        content: toolResults[index],</span></span>
<span class="line"><span>        tool_call_id: toolCall.id,</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 再次调用模型，传入工具结果</span></span>
<span class="line"><span>  response = await modelWithTools.invoke(messages);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;\\n[最终回复]&#39;);</span></span>
<span class="line"><span>console.log(response.content);</span></span></code></pre></div><p>跑下试试：</p><video src="`+f+'" controls></video><p><img src="'+y+'" alt="image-20260128122409640"></p><p>可以看到，检测到了 tool_calls 工具调用，用 read_file 这个工具读取了文件，然后让大模型分析了文件内容，给出了代码解释。</p><p>是不是现在大模型就能读文件了！</p><p>这就是通过工具给大模型扩展了能力。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><span style="color:rgb(46,161,33);background-color:inherit;">总结</span> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;&lt;span style=&quot;color: rgb(46,161,33); background-color: inherit&quot;&gt;总结&lt;/span&gt;&quot;">​</a></h2><p>这节我们入门了 langchain，调用了大模型，并且实现了第一个 tool</p><p>我们用的千问的模型，因为它有免费额度，获取 api key 后，用 .env 管理。</p><p>.env 这个文件不提交 git，都是聊天软件发送的方式口口相传，就和数据库密码一样。</p><p>我们用 tool 创建了一个工具，写一下函数，以及加下名字、描述、参数的格式（用 zod 声明）就可以了。</p><p>用 model.bindTools 传给大模型，在 system message 告诉它这个工具的信息，以及规范下它的回答流程。</p><p>message 分为 SystemMessage、HumanMessage、AIMessage、ToolMessage 四种</p><p>之后，直接问大模型某个代码的信息，它就会调用工具读取文件，然后来解答了。</p><p>实现了第一个 tool 之后，你可以想一下 cursor 怎么实现，后面我们实现一个简易版 cursor！</p>',112)])])}const j=x(q,[["render",M]]);export{$ as __pageData,j as default};
