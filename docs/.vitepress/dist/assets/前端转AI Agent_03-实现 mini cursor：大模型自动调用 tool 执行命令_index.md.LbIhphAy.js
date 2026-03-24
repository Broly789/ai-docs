import{_ as n,a,b as p,c as e,d as l,e as i,f as o,g as c,h as t,i as r,j as d,k as m,l as g,m as u,n as h,o as _,p as f,q as b,r as v}from"./chunks/image-20260128133640928.OfsAp6yx.js";import{_ as k,o as y,c as w,ag as x}from"./chunks/framework.BZohXCq9.js";const j=JSON.parse('{"title":"03-实现 mini cursor：大模型自动调用 tool 执行命令","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/03-实现 mini cursor：大模型自动调用 tool 执行命令/index.md","filePath":"前端转AI Agent/03-实现 mini cursor：大模型自动调用 tool 执行命令/index.md"}'),q={name:"前端转AI Agent/03-实现 mini cursor：大模型自动调用 tool 执行命令/index.md"};function $(T,s,C,P,A,D){return y(),w("div",null,[...s[0]||(s[0]=[x('<h1 id="_03-实现-mini-cursor-大模型自动调用-tool-执行命令" tabindex="-1">03-实现 mini cursor：大模型自动调用 tool 执行命令 <a class="header-anchor" href="#_03-实现-mini-cursor-大模型自动调用-tool-执行命令" aria-label="Permalink to &quot;03-实现 mini cursor：大模型自动调用 tool 执行命令&quot;">​</a></h1><p>上节我们给大模型扩展了读文件的 tool，你说一个文件路径让它解释，它就可以自动调工具读文件内容给出解释了。</p><video src="'+n+'" controls></video><p>那继续思考：</p><p>如果我们给它扩展了执行命令、写文件、创建目录、读取目录、读文件等 tool，是不是就能实现 cursor 的功能呢？</p><p>比如创建项目对文件做增删改：</p><video src="'+a+'" controls></video><p>项目创建后自动执行命令安装依赖和跑服务：</p><video src="'+p+'" controls></video><p>是不是现在就可以实现了！</p><p><img src="'+e+`" alt="image-20260128133203513"></p><p>虽然我们不会做那么完善，但是简易版确实可以写了。</p><p>这节我们就来实现下大模型根据 prompt 生成项目代码，自动读写文件、通过命令安装依赖、自动把项目跑起来，全程自己调用 tool 的功能：</p><p>不创建新项目了，直接在上节的 tool-test 项目继续写。</p><p>首先， node 里如何执行命令呢？</p><p>用 child_process 这个内置模块。</p><p>创建 src/node-exec.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { spawn } from&#39;node:child_process&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const command = &#39;ls -la&#39;;</span></span>
<span class="line"><span>const cwd = process.cwd();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 解析命令和参数</span></span>
<span class="line"><span>const [cmd, ...args] = command.split(&#39; &#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const child = spawn(cmd, args, {</span></span>
<span class="line"><span>  cwd,</span></span>
<span class="line"><span>stdio: &#39;inherit&#39;, // 实时输出到控制台</span></span>
<span class="line"><span>shell: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let errorMsg = &#39;&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>child.on(&#39;error&#39;, (error) =&gt; {</span></span>
<span class="line"><span>  errorMsg = error.message;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>child.on(&#39;close&#39;, (code) =&gt; {</span></span>
<span class="line"><span>if (code === 0) {</span></span>
<span class="line"><span>    process.exit(0);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    if (errorMsg) {</span></span>
<span class="line"><span>      console.error(\`错误: \${errorMsg}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    process.exit(code || 1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>spawn 可以指定在 cwd 这个目录下执行命令，会创建一个子进程来跑，这也是为啥这个模块叫 child_process。</p><p>用空格分割出命令和参数部分，分别作为 cmd、args</p><p>inherit 就是这个子进程的 stdout 也输出到父进程的 stdout，也就是控制台。</p><p>跑一下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node ./src/node-exec.mjs</span></span></code></pre></div><p>最终我们是要跑 npx create-vite 这个命令的，试一下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const command = &#39;echo -e &quot;n\\nn&quot; | pnpm create vite react-todo-app --template react-ts&#39;;</span></span></code></pre></div><p>echo 两个 n 是有时候 vite 会让你选择两个选项：用不用 rolldown、安不安装依赖</p><p>echo n 然后通过管道操作符输出给那个进程就和我们键盘输入 n 一样的效果。</p><p>测试完之后，接下来就是封装 tools 了。</p><p>我们单独一个文件来放所有的 tools：</p><p>src/all-tools.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { tool } from&#39;@langchain/core/tools&#39;;</span></span>
<span class="line"><span>import fs from&#39;node:fs/promises&#39;;</span></span>
<span class="line"><span>import path from&#39;node:path&#39;;</span></span>
<span class="line"><span>import { spawn } from&#39;node:child_process&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 读取文件工具</span></span>
<span class="line"><span>const readFileTool = tool(</span></span>
<span class="line"><span>async ({ filePath }) =&gt; {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      const content = await fs.readFile(filePath, &#39;utf-8&#39;);</span></span>
<span class="line"><span>      console.log(\`  [工具调用] read_file(&quot;\${filePath}&quot;) - 成功读取 \${content.length} 字节\`);</span></span>
<span class="line"><span>      return\`文件内容:\\n\${content}\`;</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      console.log(\`  [工具调用] read_file(&quot;\${filePath}&quot;) - 错误: \${error.message}\`);</span></span>
<span class="line"><span>      return\`读取文件失败: \${error.message}\`;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;read_file&#39;,</span></span>
<span class="line"><span>    description: &#39;读取指定路径的文件内容&#39;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      filePath: z.string().describe(&#39;文件路径&#39;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 2. 写入文件工具</span></span>
<span class="line"><span>const writeFileTool = tool(</span></span>
<span class="line"><span>async ({ filePath, content }) =&gt; {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      const dir = path.dirname(filePath);</span></span>
<span class="line"><span>      await fs.mkdir(dir, { recursive: true });</span></span>
<span class="line"><span>      await fs.writeFile(filePath, content, &#39;utf-8&#39;);</span></span>
<span class="line"><span>      console.log(\`  [工具调用] write_file(&quot;\${filePath}&quot;) - 成功写入 \${content.length} 字节\`);</span></span>
<span class="line"><span>      return\`文件写入成功: \${filePath}\`;</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      console.log(\`  [工具调用] write_file(&quot;\${filePath}&quot;) - 错误: \${error.message}\`);</span></span>
<span class="line"><span>      return\`写入文件失败: \${error.message}\`;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;write_file&#39;,</span></span>
<span class="line"><span>    description: &#39;向指定路径写入文件内容，自动创建目录&#39;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      filePath: z.string().describe(&#39;文件路径&#39;),</span></span>
<span class="line"><span>      content: z.string().describe(&#39;要写入的文件内容&#39;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 3. 执行命令工具（带实时输出）</span></span>
<span class="line"><span>const executeCommandTool = tool(</span></span>
<span class="line"><span>async ({ command, workingDirectory }) =&gt; {</span></span>
<span class="line"><span>    const cwd = workingDirectory || process.cwd();</span></span>
<span class="line"><span>    console.log(\`  [工具调用] execute_command(&quot;\${command}&quot;)\${workingDirectory ? \` - 工作目录: \${workingDirectory}\` : &#39;&#39;}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    returnnewPromise((resolve, reject) =&gt; {</span></span>
<span class="line"><span>      // 解析命令和参数</span></span>
<span class="line"><span>      const [cmd, ...args] = command.split(&#39; &#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const child = spawn(cmd, args, {</span></span>
<span class="line"><span>        cwd,</span></span>
<span class="line"><span>        stdio: &#39;inherit&#39;, // 实时输出到控制台</span></span>
<span class="line"><span>        shell: true,</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      let errorMsg = &#39;&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      child.on(&#39;error&#39;, (error) =&gt; {</span></span>
<span class="line"><span>        errorMsg = error.message;</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      child.on(&#39;close&#39;, (code) =&gt; {</span></span>
<span class="line"><span>        if (code === 0) {</span></span>
<span class="line"><span>          console.log(\`  [工具调用] execute_command(&quot;\${command}&quot;) - 执行成功\`);</span></span>
<span class="line"><span>          const cwdInfo = workingDirectory</span></span>
<span class="line"><span>            ? \`\\n\\n重要提示：命令在目录 &quot;\${workingDirectory}&quot; 中执行成功。如果需要在这个项目目录中继续执行命令，请使用 workingDirectory: &quot;\${workingDirectory}&quot; 参数，不要使用 cd 命令。\`</span></span>
<span class="line"><span>            : &#39;&#39;;</span></span>
<span class="line"><span>          resolve(\`命令执行成功: \${command}\${cwdInfo}\`);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          console.log(\`  [工具调用] execute_command(&quot;\${command}&quot;) - 执行失败，退出码: \${code}\`);</span></span>
<span class="line"><span>          resolve(\`命令执行失败，退出码: \${code}\${errorMsg ? &#39;\\n错误: &#39; + errorMsg : &#39;&#39;}\`);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;execute_command&#39;,</span></span>
<span class="line"><span>    description: &#39;执行系统命令，支持指定工作目录，实时显示输出&#39;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      command: z.string().describe(&#39;要执行的命令&#39;),</span></span>
<span class="line"><span>      workingDirectory: z.string().optional().describe(&#39;工作目录（推荐指定）&#39;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 4. 列出目录内容工具</span></span>
<span class="line"><span>const listDirectoryTool = tool(</span></span>
<span class="line"><span>async ({ directoryPath }) =&gt; {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      const files = await fs.readdir(directoryPath);</span></span>
<span class="line"><span>      console.log(\`  [工具调用] list_directory(&quot;\${directoryPath}&quot;) - 找到 \${files.length} 个项目\`);</span></span>
<span class="line"><span>      return\`目录内容:\\n\${files.map(f =&gt; \`- \${f}\`).join(&#39;\\n&#39;)}\`;</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      console.log(\`  [工具调用] list_directory(&quot;\${directoryPath}&quot;) - 错误: \${error.message}\`);</span></span>
<span class="line"><span>      return\`列出目录失败: \${error.message}\`;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &#39;list_directory&#39;,</span></span>
<span class="line"><span>    description: &#39;列出指定目录下的所有文件和文件夹&#39;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      directoryPath: z.string().describe(&#39;目录路径&#39;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export { readFileTool, writeFileTool, executeCommandTool, listDirectoryTool };</span></span></code></pre></div><p>创建了这几个 tool：</p><ul><li><p>读文件</p></li><li><p>写文件（包含创建目录了）</p></li><li><p>读目录</p></li><li><p>执行命令</p></li></ul><p><img src="`+l+'" alt="image-20260128133214495"></p><p><img src="'+i+'" alt="image-20260128133223519"></p><p><img src="'+o+'" alt="image-20260128133259868"></p><p>这里的工具调用返回结果，我额外加了 cwd 的信息，避免之后命令胡乱 cd</p><p><img src="'+c+`" alt="image-20260128133308509"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>重要提示：命令在目录 &quot;\${workingDirectory}&quot; 中执行成功。</span></span>
<span class="line"><span>如果需要在这个项目目录中继续执行命令，</span></span>
<span class="line"><span>请使用 workingDirectory: &quot;\${workingDirectory}&quot; 参数，</span></span>
<span class="line"><span>不要使用 cd 命令。</span></span></code></pre></div><p><img src="`+t+`" alt="image-20260128133318660"></p><p>每个 tool 都是 name、description 以及基于 zod 声明的参数格式。</p><p>接下来就可以调用了：</p><p>创建 src/mini-cursor.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage, ToolMessage } from&#39;@langchain/core/messages&#39;;</span></span>
<span class="line"><span>import { executeCommandTool, listDirectoryTool, readFileTool, writeFileTool } from&#39;./all-tools.mjs&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>    modelName: &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>const tools = [</span></span>
<span class="line"><span>    readFileTool,</span></span>
<span class="line"><span>    writeFileTool,</span></span>
<span class="line"><span>    executeCommandTool,</span></span>
<span class="line"><span>    listDirectoryTool,</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 绑定工具到模型</span></span>
<span class="line"><span>const modelWithTools = model.bindTools(tools);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Agent 执行函数</span></span>
<span class="line"><span>asyncfunction runAgentWithTools(query, maxIterations = 30) {</span></span>
<span class="line"><span>    const messages = [</span></span>
<span class="line"><span>        new SystemMessage(\`你是一个项目管理助手，使用工具完成任务。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>当前工作目录: \${process.cwd()}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>工具：</span></span>
<span class="line"><span>1. read_file: 读取文件</span></span>
<span class="line"><span>2. write_file: 写入文件</span></span>
<span class="line"><span>3. execute_command: 执行命令（支持 workingDirectory 参数）</span></span>
<span class="line"><span>4. list_directory: 列出目录</span></span>
<span class="line"><span></span></span>
<span class="line"><span>重要规则 - execute_command：</span></span>
<span class="line"><span>- workingDirectory 参数会自动切换到指定目录</span></span>
<span class="line"><span>- 当使用 workingDirectory 时，绝对不要在 command 中使用 cd</span></span>
<span class="line"><span>- 错误示例: { command: &quot;cd react-todo-app &amp;&amp; pnpm install&quot;, workingDirectory: &quot;react-todo-app&quot; }</span></span>
<span class="line"><span>这是错误的！因为 workingDirectory 已经在 react-todo-app 目录了，再 cd react-todo-app 会找不到目录</span></span>
<span class="line"><span>- 正确示例: { command: &quot;pnpm install&quot;, workingDirectory: &quot;react-todo-app&quot; }</span></span>
<span class="line"><span>这样就对了！workingDirectory 已经切换到 react-todo-app，直接执行命令即可</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回复要简洁，只说做了什么\`),</span></span>
<span class="line"><span>        new HumanMessage(query)</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    for (let i = 0; i &lt; maxIterations; i++) {</span></span>
<span class="line"><span>        console.log(\`⏳ 正在等待 AI 思考...\`);</span></span>
<span class="line"><span>        const response = await modelWithTools.invoke(messages);</span></span>
<span class="line"><span>        messages.push(response);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // 检查是否有工具调用</span></span>
<span class="line"><span>        if (!response.tool_calls || response.tool_calls.length === 0) {</span></span>
<span class="line"><span>            console.log(\`\\n✨ AI 最终回复:\\n\${response.content}\\n\`);</span></span>
<span class="line"><span>            return response.content;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
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
<span class="line"><span>}</span></span></code></pre></div><p>代码大部分我们都写过。</p><p>首先创建大模型对象：</p><p><img src="`+r+'" alt="image-20260128133523596"></p><p>temperature 温度指定为 0，不让 AI 随意发挥。</p><p>模型用 qwen-plus，这个更好一点。</p><p>然后把 tools 绑定到模型：</p><p><img src="'+d+'" alt="image-20260128133531874"></p><p>后面就是返回的对话了，因为可能会反复对话、返回调用 tools 很多次，这里加了个最大限制。</p><p>具体的调用过程和之前一样：</p><p>用 System message 指定 AI 可以做什么，回答的规范：</p><p><img src="'+m+'" alt="image-20260128133540533"></p><p>告诉它有哪些工具：</p><p><img src="'+g+'" alt="image-20260128133548650"></p><p>我还特意说明了下 cd 的问题，有了 cwd 之后，就不用 cd 了。</p><p>之后把调用 tool 返回的内容封装成 ToolMessage：</p><p><img src="'+u+'" alt="image-20260128133557120"></p><p>这样，模型、工具、调用流程就搭建完了。</p><p>接下来我们开始调用：</p><p>首先我们用 chalk 加点颜色，不然都是白色不好看：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install chalk</span></span></code></pre></div><p>这行背景变绿：</p><p><img src="'+h+'" alt="image-20260128133605597"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import chalk from &#39;chalk&#39;;</span></span>\n<span class="line"><span></span></span>\n<span class="line"><span>console.log(chalk.bgGreen(`⏳ 正在等待 AI 思考...`));</span></span></code></pre></div><p>接下来写个 case：</p><p><img src="'+_+`" alt="image-20260128133613624"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const case1 = \`创建一个功能丰富的 React TodoList 应用：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 创建项目：echo -e &quot;n\\nn&quot; | pnpm create vite react-todo-app --template react-ts</span></span>
<span class="line"><span>2. 修改 src/App.tsx，实现完整功能的 TodoList：</span></span>
<span class="line"><span> - 添加、删除、编辑、标记完成</span></span>
<span class="line"><span> - 分类筛选（全部/进行中/已完成）</span></span>
<span class="line"><span> - 统计信息显示</span></span>
<span class="line"><span> - localStorage 数据持久化</span></span>
<span class="line"><span>3. 添加复杂样式：</span></span>
<span class="line"><span> - 渐变背景（蓝到紫）</span></span>
<span class="line"><span> - 卡片阴影、圆角</span></span>
<span class="line"><span> - 悬停效果</span></span>
<span class="line"><span>4. 添加动画：</span></span>
<span class="line"><span> - 添加/删除时的过渡动画</span></span>
<span class="line"><span> - 使用 CSS transitions</span></span>
<span class="line"><span>5. 列出目录确认</span></span>
<span class="line"><span></span></span>
<span class="line"><span>注意：使用 pnpm，功能要完整，样式要美观，要有动画效果</span></span>
<span class="line"><span></span></span>
<span class="line"><span>之后在 react-todo-app 项目中：</span></span>
<span class="line"><span>1. 使用 pnpm install 安装依赖</span></span>
<span class="line"><span>2. 使用 pnpm run dev 启动服务器</span></span>
<span class="line"><span>\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>  await runAgentWithTools(case1);</span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>  console.error(\`\\n❌ 错误: \${error.message}\\n\`);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>告诉它创建一个 todo app，然后安装依赖，跑起来。</p><p>你是不是在 cursor 里经常做这种事情？</p><p>今天用自己写的工具来做：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node ./src/mini-cursor.mjs</span></span></code></pre></div><p>可以看到，过程中调用了各种工具：</p><p><img src="`+f+'" alt="image-20260128133625381"></p><p><img src="'+b+'" alt="image-20260128133633969"></p><p><img src="'+v+'" alt="image-20260128133640928"></p><p>我们写的 tool 都用上了。</p><p>读取目录、写入文件、读取文件、执行命令</p><p>当然，这个过程慢很正常，生成过程本来就慢，我们没用流式展示过程，其实你等待的时间一直在输出内容。流式相关的后面再做。</p><p>但是，这个项目的代码是用我们写的 mini cursor 自动创建、自动跑起来的：</p><p>它和 cursor 肯定有差距，但是已经实现部分功能了。</p><p>我们不是想真的实现 cursor，只是要知道它的实现原理。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code/tool-test" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code/tool-test</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>这节我们创建了更多的 tool，比如目录、文件的读写，还有用 spawn 执行命令。</p><p>我们基于这些 tool 实现了部分 cursor 功能，最终效果是，它可以帮你创建项目，写入文件，执行安装依赖、跑项目的命令。</p><p>相信学到这，你就知道 cursor 的大概实现原理了。</p><p>你也可以基于 tool + llm 来做一些自己想做的功能，边学边练，AI 学起来还是很有趣的！</p>',90)])])}const z=k(q,[["render",$]]);export{j as __pageData,z as default};
