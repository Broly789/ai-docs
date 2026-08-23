import{_ as n,a,b as p,c as e,d as l,e as i,f as t,g as c,h as o,i as r,j as m,k as g,l as u,m as d,n as y,o as h,p as M,q as v,r as _,s as f,t as k,u as q,v as I,w,x as A,y as C,z as E,A as b,B as x,C as T,D as O,E as $,F as S}from"./chunks/9.CNjwCkYt.js";import{_ as H,o as N,c as P,ag as R}from"./chunks/framework.lghGfHnE.js";const F=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/11-Memory 管理的三大策略：截断、总结、检索/README.md","filePath":"前端转AI Agent/11-Memory 管理的三大策略：截断、总结、检索/README.md"}'),D={name:"前端转AI Agent/11-Memory 管理的三大策略：截断、总结、检索/README.md"};function L(j,s,z,U,B,K){return N(),P("div",null,[...s[0]||(s[0]=[R('<p>我们给大模型扩展了 tool，让它可以做一些事情而不只是回答问题。给大模型扩展了 RAG，基于 query 获取向量数据库里相关的知识放入 prompt。但这些其实都依赖一个东西：Memory</p><p>大模型是无状态的，你这次调用和下次调用没区别，它并不知道之前你问了什么，回答了什么。</p><p>有的同学说，不对啊，我明明可以基于上次的回答继续问。</p><p>这是因为你已经做了 Memory 管理。</p><p>记得我们之前写的这个循环么：</p><p><img src="'+n+'" alt="image-20260128154150142"></p><p>我们在 messages 数组放入了 SystemMessage，告诉大模型它的角色、功能，然后放入了 HumanMessage，也就是用户问的问题。</p><p>然后 invoke 大模型，这是第一次调用。</p><p>大模型返回了 AIMessage 和 tool_calls 信息。</p><p><img src="'+a+'" alt="image-20260128154157169"></p><p>我们基于 tool_calls 去调用工具，然后把结果封装成 ToolMessage 也放入 messages 数组。</p><p>这样 messages 数组里就有了 SystemMessage、HumanMessage、AIMessage、ToolMessage</p><p>循环继续调用大模型，这是第二次调用。</p><p><img src="'+p+'" alt="image-20260128154203113"></p><p>直到不再有 tool_calls，就把那个 AIMessage 返回，这就是最终回复。</p><p><img src="'+e+'" alt="image-20260128154209865"></p><p>这个过程我们循环调用了多次大模型。</p><p>你觉得大模型是怎么知道之前问过什么、回答过什么的？</p><p>就是基于 messages 数组，也就是 Memory。</p><p>如果不做 Memory 管理，大模型根本不知道之前回答过什么，所以说它是无状态的。</p><p>但这种 messages 数组不断 push 的 Memory 管理机制显然不靠谱。</p><p>因为大模型的上下文大小是有限的，比如 GPT-4o 大概是 200k token</p><p>不管这个限制是多大，当你无限往 memory 里增加 message 的时候，总是会超的。</p><p>所以我们要学一些 Memory 的管理策略。</p><p>先不看有哪些方案，你自己考虑下，应该怎么做呢？</p><ul><li><p>有同学说，可以只保留最近的几条 message，之前的舍弃掉啊。</p></li><li><p>有同学说，直接舍弃之前的也不好，可以对之前的做一些总结，保留这个总结和最近的几条 message。</p></li><li><p>有同学说可以用我们刚学的向量数据库啊，根据语义检索之前的 message</p></li></ul><p>没错，主流的也就是这三种思路，截断、总结、检索</p><p>其实你每天都在用 memory 的这些策略：</p><p>你用 cursor 或者 claude code 的时候，会有一个 token 的计数，当达到的时候，会触发总结，然后开始新的一轮计数：</p><p>cursor：</p><p><img src="'+l+'" alt="image-20260128154217611"></p><p><img src="'+i+'" alt="image-20260128154224089"></p><p>达到上下文限制，会自动触发总结。</p><p>claude code：</p><p><img src="'+t+'" alt="image-20260128154230399"></p><p><img src="'+c+'" alt="image-20260128154238402"></p><p>达到限制自动触发总结，或者也可以 /compact 手动总结（compact 是压实压紧的意思）</p><p>还有一个问题，就是 messages 存在哪，现在都是存在内存中的，而实际上可以做持久化，存在文件、redis、数据库等。</p><p>所以之前 memory 一共有两个维度的 api：</p><p>一个是 ChatMessageHistory 相关的：</p><p><img src="'+o+'" alt="image-20260128154244201"></p><p>它是存储层，也就是 messages 存在哪，可以是内存、文件、数据库等。</p><p>然后是逻辑层，也就是截断、总结、向量数据库这些：</p><p><img src="'+r+'" alt="image-20260128154251936"></p><p>每个 xxMemory 类都有一个 chatHistory 属性，关联着存储层。</p><p>但是，这些 memory 的 api，已经全部被废弃了。</p><p>移到了 @langchain/classic 这个包：</p><video src="'+m+'" controls></video><p>可以看到，刚才提到的所有 Memory api 都被废弃了：</p><p><img src="'+g+`" alt="image-20260128154257303"></p><p>因为它们不够灵活，像之前提到的截断、总结、检索（向量数据库）完全可以自己实现：</p><ul><li><p>截断就是根据总 token 数量来保留最近的 message</p></li><li><p>总结就是调用大模型对之前的 message 生成一个摘要</p></li><li><p>检索向量数据库就是之前的 RAG 流程，只不过用来对 message 做语义检索</p></li></ul><p>用 memory 这些 api 反而更黑盒而且也不灵活，所以新版干脆都去掉了。</p><p>但是加了一个 trimMessages 的 api，可以根据 token 来截断消息</p><p>所以现在 Memory 相关就剩下了 history + trimMessages 的 api</p><p>我们来写代码试一遍：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir memory-test</span></span>
<span class="line"><span>cd memory-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+u+`" alt="image-20260128154303279"></p><p>安装下用到的包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install dotenv @langchain/core @langchain/openai @langchain/community langchain</span></span></code></pre></div><p>创建 src/history-test.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from &#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { InMemoryChatMessageHistory } from &quot;@langchain/core/chat_history&quot;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>  modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  temperature: 0,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function inMemoryDemo() {</span></span>
<span class="line"><span>  const history = new InMemoryChatMessageHistory();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const systemMessage = new SystemMessage(</span></span>
<span class="line"><span>    &quot;你是一个友好、幽默的做菜助手，喜欢分享美食和烹饪技巧。&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 第一轮对话</span></span>
<span class="line"><span>  console.log(&quot;[第一轮对话]&quot;);</span></span>
<span class="line"><span>  const userMessage1 = new HumanMessage(</span></span>
<span class="line"><span>    &quot;你今天吃的什么？&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>  await history.addMessage(userMessage1);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const messages1 = [systemMessage, ...(await history.getMessages())];</span></span>
<span class="line"><span>  const response1 = await model.invoke(messages1);</span></span>
<span class="line"><span>  await history.addMessage(response1);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`用户: \${userMessage1.content}\`);</span></span>
<span class="line"><span>  console.log(\`助手: \${response1.content}\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 第二轮对话（基于历史记录）</span></span>
<span class="line"><span>  console.log(&quot;[第二轮对话 - 基于历史记录]&quot;);</span></span>
<span class="line"><span>  const userMessage2 = new HumanMessage(</span></span>
<span class="line"><span>    &quot;好吃吗？&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>  await history.addMessage(userMessage2);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const messages2 = [systemMessage, ...(await history.getMessages())];</span></span>
<span class="line"><span>  const response2 = await model.invoke(messages2);</span></span>
<span class="line"><span>  await history.addMessage(response2);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`用户: \${userMessage2.content}\`);</span></span>
<span class="line"><span>  console.log(\`助手: \${response2.content}\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 展示所有历史消息</span></span>
<span class="line"><span>  console.log(&quot;[历史消息记录]&quot;);</span></span>
<span class="line"><span>  const allMessages = await history.getMessages();</span></span>
<span class="line"><span>  console.log(\`共保存了 \${allMessages.length} 条消息：\`);</span></span>
<span class="line"><span>  allMessages.forEach((msg, index) =&gt; {</span></span>
<span class="line"><span>    const type = msg.type;</span></span>
<span class="line"><span>    const prefix = type === &#39;human&#39; ? &#39;用户&#39; : &#39;助手&#39;;</span></span>
<span class="line"><span>    console.log(\`  \${index + 1}. [\${prefix}]: \${msg.content.substring(0, 50)}...\`);</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>inMemoryDemo().catch(console.error);</span></span></code></pre></div><p>用 InMemoryChatMessageHistory 来管理 message，放到内存里。</p><p>用 addMessage 添加 HumanMessage 和 AIMessage，分别调用了两次大模型。</p><p>创建用到的 .env</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># OpenAI API 配置</span></span>
<span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span></code></pre></div><p>跑一下：</p><video src="`+d+'" controls></video><p><img src="'+y+'" alt="image-20260128154311843"></p><p>可以看到，第一次调用大模型，它回答了红烧肉、冬阴功汤</p><p>第二次再和它对话，它能知道之前聊过的内容，接着聊</p><p>我们之前是用 messages 数组实现的，现在换成了 InMemoryChatMessageHistory 的 api。</p><p>当然，保存在文件里也是可以的。</p><p>你看 cursor 就是把对话过程持久化了：</p><video src="'+h+`" controls></video><p>我们随时可以找到一个之前的聊天继续聊。</p><p>这就是 message 持久化的好处，也叫做长时记忆（LTM long-term memory）。</p><p>相应的，内存中那种叫短时记忆（short-term memory）。</p><p>试一下存到文件的长时记忆：</p><p>创建 src/history-test2.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from &#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { FileSystemChatMessageHistory } from &quot;@langchain/community/stores/message/file_system&quot;;</span></span>
<span class="line"><span>import { HumanMessage, AIMessage, SystemMessage } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import path from &quot;node:path&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>  modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  temperature: 0,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function fileHistoryDemo() {</span></span>
<span class="line"><span>  // 指定存储文件的路径</span></span>
<span class="line"><span>  const filePath = path.join(process.cwd(), &quot;chat_history.json&quot;);</span></span>
<span class="line"><span>  const sessionId = &quot;user_session_001&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 系统提示词</span></span>
<span class="line"><span>  const systemMessage = new SystemMessage(</span></span>
<span class="line"><span>    &quot;你是一个友好的做菜助手，喜欢分享美食和烹饪技巧。&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  console.log(&quot;[第一轮对话]&quot;);</span></span>
<span class="line"><span>  const history = new FileSystemChatMessageHistory({</span></span>
<span class="line"><span>    filePath: filePath,</span></span>
<span class="line"><span>    sessionId: sessionId,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const userMessage1 = new HumanMessage(</span></span>
<span class="line"><span>    &quot;红烧肉怎么做&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>  await history.addMessage(userMessage1);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const messages1 = [systemMessage, ...(await history.getMessages())];</span></span>
<span class="line"><span>  const response1 = await model.invoke(messages1);</span></span>
<span class="line"><span>  await history.addMessage(response1);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`用户: \${userMessage1.content}\`);</span></span>
<span class="line"><span>  console.log(\`助手: \${response1.content}\`);</span></span>
<span class="line"><span>  console.log(\`✓ 对话已保存到文件: \${filePath}\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  console.log(&quot;[第二轮对话]&quot;);</span></span>
<span class="line"><span>  const userMessage2 = new HumanMessage(</span></span>
<span class="line"><span>    &quot;好吃吗？&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>  await history.addMessage(userMessage2);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const messages2 = [systemMessage, ...(await history.getMessages())];</span></span>
<span class="line"><span>  const response2 = await model.invoke(messages2);</span></span>
<span class="line"><span>  await history.addMessage(response2);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`用户: \${userMessage2.content}\`);</span></span>
<span class="line"><span>  console.log(\`助手: \${response2.content}\`);</span></span>
<span class="line"><span>  console.log(\`✓ 对话已更新到文件\\n\`);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fileHistoryDemo().catch(console.error);</span></span></code></pre></div><p>第一轮对话问红烧肉怎么做</p><p>第二轮对话接着问好吃吗</p><p>对话内容会保存到文件里</p><p>然后我们再创建一个文件来接着问：</p><p>创建 src/history-test3.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from &#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { FileSystemChatMessageHistory } from &quot;@langchain/community/stores/message/file_system&quot;;</span></span>
<span class="line"><span>import { HumanMessage, AIMessage, SystemMessage } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import path from &quot;node:path&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>  modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  temperature: 0,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function fileHistoryDemo() {</span></span>
<span class="line"><span>  // 指定存储文件的路径</span></span>
<span class="line"><span>  const filePath = path.join(process.cwd(), &quot;chat_history.json&quot;);</span></span>
<span class="line"><span>  const sessionId = &quot;user_session_001&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 系统提示词</span></span>
<span class="line"><span>  const systemMessage = new SystemMessage(</span></span>
<span class="line"><span>    &quot;你是一个友好、幽默的做菜助手，喜欢分享美食和烹饪技巧。&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const restoredHistory = new FileSystemChatMessageHistory({</span></span>
<span class="line"><span>    filePath: filePath,</span></span>
<span class="line"><span>    sessionId: sessionId,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const restoredMessages = await restoredHistory.getMessages();</span></span>
<span class="line"><span>  console.log(\`从文件恢复了 \${restoredMessages.length} 条历史消息：\`);</span></span>
<span class="line"><span>  restoredMessages.forEach((msg, index) =&gt; {</span></span>
<span class="line"><span>    const type = msg.type;</span></span>
<span class="line"><span>    const prefix = type === &#39;human&#39; ? &#39;用户&#39; : &#39;助手&#39;;</span></span>
<span class="line"><span>    console.log(\`  \${index + 1}. [\${prefix}]: \${msg.content.substring(0, 50)}...\`);</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  console.log();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  console.log(&quot;[第三轮对话]&quot;);</span></span>
<span class="line"><span>  const userMessage3 = new HumanMessage(</span></span>
<span class="line"><span>    &quot;需要哪些食材？&quot;</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>  await restoredHistory.addMessage(userMessage3);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const messages3 = [systemMessage, ...(await restoredHistory.getMessages())];</span></span>
<span class="line"><span>  const response3 = await model.invoke(messages3);</span></span>
<span class="line"><span>  await restoredHistory.addMessage(response3);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`用户: \${userMessage3.content}\`);</span></span>
<span class="line"><span>  console.log(\`助手: \${response3.content}\`);</span></span>
<span class="line"><span>  console.log(\`✓ 对话已保存到文件\\n\`);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>fileHistoryDemo().catch(console.error);</span></span></code></pre></div><p>加载那个文件里的历史 message，继续问需要的食材。</p><p>跑一下：</p><video src="`+M+`" controls></video><p>可以看到，我们第一轮、第二轮对话都被持久化保存到了文件里</p><p>后面可以从文件里恢复前两轮对话，继续第三轮</p><p>基于这个完全可以实现 cursor 这种功能：</p><p>ChatMessageHistory 的 api 只是用来存储 message，接下来实现那三种策略：</p><p>首先是截断：</p><p>创建 src/memory/truncation-memory.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { InMemoryChatMessageHistory } from &quot;@langchain/core/chat_history&quot;;</span></span>
<span class="line"><span>import { HumanMessage, AIMessage, trimMessages } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { getEncoding } from &quot;js-tiktoken&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ========== 1. 按消息数量截断 ==========</span></span>
<span class="line"><span>async function messageCountTruncation() {</span></span>
<span class="line"><span>  const history = new InMemoryChatMessageHistory();</span></span>
<span class="line"><span>  const maxMessages = 4;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const messages = [</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我叫张三&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;你好张三，很高兴认识你！&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我今年25岁&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;25岁正是青春年华，有什么我可以帮助你的吗？&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我喜欢编程&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;编程很有趣！你主要用什么语言？&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我住在北京&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;北京是个很棒的城市！&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我的职业是软件工程师&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;软件工程师是个很有前景的职业！&#39; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 添加所有消息</span></span>
<span class="line"><span>  for (const msg of messages) {</span></span>
<span class="line"><span>    if (msg.type === &#39;human&#39;) {</span></span>
<span class="line"><span>      await history.addMessage(new HumanMessage(msg.content));</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      await history.addMessage(new AIMessage(msg.content));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  let allMessages = await history.getMessages();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 按消息数量截断：保留最近 maxMessages 条消息</span></span>
<span class="line"><span>  const trimmedMessages = allMessages.slice(-maxMessages);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  console.log(\`保留消息数量: \${trimmedMessages.length}\`);</span></span>
<span class="line"><span>  console.log(&quot;保留的消息:&quot;, trimmedMessages.map(m =&gt; \`\${m.constructor.name}: \${m.content}\`).join(&#39;\\n  &#39;));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 计算消息数组的总 token 数量</span></span>
<span class="line"><span>function countTokens(messages, encoder) {</span></span>
<span class="line"><span>  let total = 0;</span></span>
<span class="line"><span>  for (const msg of messages) {</span></span>
<span class="line"><span>    const content = typeof msg.content === &#39;string&#39; ? msg.content : JSON.stringify(msg.content);</span></span>
<span class="line"><span>    total += encoder.encode(content).length;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return total;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ========== 2. 按 token 数量截断（使用 js-tiktoken 计数） ==========</span></span>
<span class="line"><span>async function tokenCountTruncation() {</span></span>
<span class="line"><span>  const history = new InMemoryChatMessageHistory();</span></span>
<span class="line"><span>  const maxTokens = 100; // 限制最多 100 个 token</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const messages = [</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我叫李四&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;你好李四，很高兴认识你！&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我是一名设计师&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;设计师是个很有创造力的职业！你主要做什么类型的设计？&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我喜欢艺术和音乐&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;艺术和音乐都是很好的爱好，它们能激发创作灵感。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我擅长 UI/UX 设计&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;UI/UX 设计非常重要，好的用户体验能让产品更成功！&#39; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 添加所有消息</span></span>
<span class="line"><span>  for (const msg of messages) {</span></span>
<span class="line"><span>    if (msg.type === &#39;human&#39;) {</span></span>
<span class="line"><span>      await history.addMessage(new HumanMessage(msg.content));</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      await history.addMessage(new AIMessage(msg.content));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  let allMessages = await history.getMessages();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 使用 trimMessages API：使用 js-tiktoken 计算 token 数量</span></span>
<span class="line"><span>  const trimmedMessages = await trimMessages(allMessages, {</span></span>
<span class="line"><span>    maxTokens: maxTokens,</span></span>
<span class="line"><span>    tokenCounter: async (msgs) =&gt; countTokens(msgs, enc),</span></span>
<span class="line"><span>    strategy: &quot;last&quot;, // 保留最近的消息</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 计算实际 token 数用于显示</span></span>
<span class="line"><span>  const totalTokens = countTokens(trimmedMessages, enc);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`总 token 数: \${totalTokens}/\${maxTokens}\`);</span></span>
<span class="line"><span>  console.log(\`保留消息数量: \${trimmedMessages.length}\`);</span></span>
<span class="line"><span>  console.log(&quot;保留的消息:&quot;, trimmedMessages.map(m =&gt; {</span></span>
<span class="line"><span>    const content = typeof m.content === &#39;string&#39; ? m.content : JSON.stringify(m.content);</span></span>
<span class="line"><span>    const tokens = enc.encode(content).length;</span></span>
<span class="line"><span>    return \`\${m.constructor.name} (\${tokens} tokens): \${content}\`;</span></span>
<span class="line"><span>  }).join(&#39;\\n  &#39;));</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function runAll() {</span></span>
<span class="line"><span>  await messageCountTruncation();</span></span>
<span class="line"><span>  await tokenCountTruncation();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>runAll().catch(console.error);</span></span></code></pre></div><p>这里有两种计数逻辑：</p><p>第一种是消息条数，直接 slice 就行</p><p>第二种是 token 数量，用 trimMessages 的 api，这里用 js-tiktoken 这个包来计数</p><p>安装下这个包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install js-tiktoken</span></span></code></pre></div><p>跑一下：</p><p><img src="`+v+'" alt="image-20260128154350742"></p><p><img src="'+_+`" alt="image-20260128154358737"></p><p>可以看到，第一次是根据数量截取了 4 条最近的 message</p><p>第二次是根据 token 来截取的</p><p>之后把截取的 messages 传给大模型调用就行了。</p><p>这就是第一种策略，截断</p><p>然后再来试下第二种，总结：</p><p>创建 src/memory/summarization-memory.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { InMemoryChatMessageHistory } from &quot;@langchain/core/chat_history&quot;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage, AIMessage, getBufferString } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>  modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  temperature: 0,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ========== 总结策略演示 ==========</span></span>
<span class="line"><span>async function summarizationMemoryDemo() {</span></span>
<span class="line"><span>  const history = new InMemoryChatMessageHistory();</span></span>
<span class="line"><span>  const maxMessages = 6; // 超过 6 条消息时触发总结</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const messages = [</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我想学做红烧肉，你能教我吗？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;当然可以！红烧肉是一道经典的中式菜肴。首先需要准备五花肉、冰糖、生抽、老抽、料酒等材料。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;五花肉需要切多大块？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;建议切成3-4厘米见方的块，这样既容易入味，口感也更好。切好后可以用开水焯一下去除血沫。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;炒糖色的时候有什么技巧吗？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;炒糖色是关键步骤。用小火慢慢炒，等冰糖完全融化变成焦糖色，冒小泡时就可以下肉了。注意不要炒过头，否则会发苦。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;需要炖多长时间？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;一般需要炖40-60分钟，用小火慢炖，直到肉变得软糯入味。可以用筷子戳一下，能轻松戳透就说明好了。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;最后收汁的时候要注意什么？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;收汁时要用大火，不断翻动，让汤汁均匀包裹在肉块上。看到汤汁变得浓稠，颜色红亮就可以出锅了。&#39; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 添加所有消息</span></span>
<span class="line"><span>  for (const msg of messages) {</span></span>
<span class="line"><span>    if (msg.type === &#39;human&#39;) {</span></span>
<span class="line"><span>      await history.addMessage(new HumanMessage(msg.content));</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      await history.addMessage(new AIMessage(msg.content));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  let allMessages = await history.getMessages();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  console.log(\`原始消息数量: \${allMessages.length}\`);</span></span>
<span class="line"><span>  console.log(&quot;原始消息:&quot;, allMessages.map(m =&gt; \`\${m.constructor.name}: \${m.content}\`).join(&#39;\\n  &#39;));</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 如果消息过多，触发总结</span></span>
<span class="line"><span>  if (allMessages.length &gt;= maxMessages) {</span></span>
<span class="line"><span>    const keepRecent = 2; // 保留最近 2 条消息</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 分离要保留的消息和要总结的消息</span></span>
<span class="line"><span>    const recentMessages = allMessages.slice(-keepRecent);</span></span>
<span class="line"><span>    const messagesToSummarize = allMessages.slice(0, -keepRecent);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(&quot;\\n💡 历史消息过多，开始总结...&quot;);</span></span>
<span class="line"><span>    console.log(\`📝 将被总结的消息数量: \${messagesToSummarize.length}\`);</span></span>
<span class="line"><span>    console.log(\`📝 将被保留的消息数量: \${recentMessages.length}\`);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 总结将被丢弃的旧消息</span></span>
<span class="line"><span>    const summary = await summarizeHistory(messagesToSummarize);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 清空历史消息，只保留最近的消息</span></span>
<span class="line"><span>    await history.clear();</span></span>
<span class="line"><span>    for (const msg of recentMessages) {</span></span>
<span class="line"><span>      await history.addMessage(msg);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(\`\\n保留消息数量: \${recentMessages.length}\`);</span></span>
<span class="line"><span>    console.log(&quot;保留的消息:&quot;, recentMessages.map(m =&gt; \`\${m.constructor.name}: \${m.content}\`).join(&#39;\\n  &#39;));</span></span>
<span class="line"><span>    console.log(\`\\n总结内容（不包含保留的消息）: \${summary}\`);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    console.log(&quot;\\n消息数量未超过阈值，无需总结&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>summarizationMemoryDemo().catch(console.error);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 总结历史对话的函数</span></span>
<span class="line"><span>async function summarizeHistory(messages) {</span></span>
<span class="line"><span>  if (messages.length === 0) return &quot;&quot;;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const conversationText = getBufferString(messages, {</span></span>
<span class="line"><span>    humanPrefix: &quot;用户&quot;,</span></span>
<span class="line"><span>    aiPrefix: &quot;助手&quot;,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const summaryPrompt = \`请总结以下对话的核心内容，保留重要信息：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${conversationText}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>总结：\`;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const summaryResponse = await model.invoke([new SystemMessage(summaryPrompt)]);</span></span>
<span class="line"><span>  return summaryResponse.content;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>有 10 条消息，我们只保留最近的 2 条，之前的用 LLM 做总结</p><p>这里用到了 getBufferString 的 api，它可以给 HumanMessage、AIMessage 等加上不同的前缀来格式化</p><p>跑一下：</p><video src="`+f+'" controls></video><p>可以看到，之前的 8 条内容做了总结，然后最近的 2 条保留。</p><p><img src="'+k+`" alt="image-20260128154405601"></p><p>这样，总结后再继续聊，token 消耗就少了。</p><p>当然，更常用的是根据 token 来触发总结，而不是消息条数：</p><p>创建 src/memory/summarization-memory2.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { InMemoryChatMessageHistory } from &quot;@langchain/core/chat_history&quot;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage, AIMessage, getBufferString } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { getEncoding } from &quot;js-tiktoken&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>  modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  temperature: 0,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 计算消息数组的总 token 数量</span></span>
<span class="line"><span>function countTokens(messages, encoder) {</span></span>
<span class="line"><span>  let total = 0;</span></span>
<span class="line"><span>  for (const msg of messages) {</span></span>
<span class="line"><span>    const content = typeof msg.content === &#39;string&#39; ? msg.content : JSON.stringify(msg.content);</span></span>
<span class="line"><span>    total += encoder.encode(content).length;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return total;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// ========== 总结策略演示（基于 token 计数） ==========</span></span>
<span class="line"><span>async function summarizationMemoryDemo() {</span></span>
<span class="line"><span>  const history = new InMemoryChatMessageHistory();</span></span>
<span class="line"><span>  const maxTokens = 200; // 超过 200 个 token 时触发总结</span></span>
<span class="line"><span>  const keepRecentTokens = 80; // 保留最近消息的 token 数量（约占总数的 40%）</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const messages = [</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;我想学做红烧肉，你能教我吗？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;当然可以！红烧肉是一道经典的中式菜肴。首先需要准备五花肉、冰糖、生抽、老抽、料酒等材料。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;五花肉需要切多大块？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;建议切成3-4厘米见方的块，这样既容易入味，口感也更好。切好后可以用开水焯一下去除血沫。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;炒糖色的时候有什么技巧吗？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;炒糖色是关键步骤。用小火慢慢炒，等冰糖完全融化变成焦糖色，冒小泡时就可以下肉了。注意不要炒过头，否则会发苦。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;需要炖多长时间？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;一般需要炖40-60分钟，用小火慢炖，直到肉变得软糯入味。可以用筷子戳一下，能轻松戳透就说明好了。&#39; },</span></span>
<span class="line"><span>    { type: &#39;human&#39;, content: &#39;最后收汁的时候要注意什么？&#39; },</span></span>
<span class="line"><span>    { type: &#39;ai&#39;, content: &#39;收汁时要用大火，不断翻动，让汤汁均匀包裹在肉块上。看到汤汁变得浓稠，颜色红亮就可以出锅了。&#39; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 添加所有消息</span></span>
<span class="line"><span>  for (const msg of messages) {</span></span>
<span class="line"><span>    if (msg.type === &#39;human&#39;) {</span></span>
<span class="line"><span>      await history.addMessage(new HumanMessage(msg.content));</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      await history.addMessage(new AIMessage(msg.content));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  let allMessages = await history.getMessages();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const totalTokens = countTokens(allMessages, enc);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 如果 token 数超过阈值，触发总结</span></span>
<span class="line"><span>  if (totalTokens &gt;= maxTokens) {</span></span>
<span class="line"><span>    // 从后往前累加消息，保留最近的消息直到达到 keepRecentTokens</span></span>
<span class="line"><span>    const recentMessages = [];</span></span>
<span class="line"><span>    let recentTokens = 0;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    for (let i = allMessages.length - 1; i &gt;= 0; i--) {</span></span>
<span class="line"><span>      const msg = allMessages[i];</span></span>
<span class="line"><span>      const content = typeof msg.content === &#39;string&#39; ? msg.content : JSON.stringify(msg.content);</span></span>
<span class="line"><span>      const msgTokens = enc.encode(content).length;</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      if (recentTokens + msgTokens &lt;= keepRecentTokens) {</span></span>
<span class="line"><span>        recentMessages.unshift(msg);</span></span>
<span class="line"><span>        recentTokens += msgTokens;</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    const messagesToSummarize = allMessages.slice(0, allMessages.length - recentMessages.length);</span></span>
<span class="line"><span>    const summarizeTokens = countTokens(messagesToSummarize, enc);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(&quot;\\n💡 Token 数量超过阈值，开始总结...&quot;);</span></span>
<span class="line"><span>    console.log(\`📝 将被总结的消息数量: \${messagesToSummarize.length} (\${summarizeTokens} tokens)\`);</span></span>
<span class="line"><span>    console.log(\`📝 将被保留的消息数量: \${recentMessages.length} (\${recentTokens} tokens)\`);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 总结将被丢弃的旧消息</span></span>
<span class="line"><span>    const summary = await summarizeHistory(messagesToSummarize);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 清空历史消息，只保留最近的消息</span></span>
<span class="line"><span>    await history.clear();</span></span>
<span class="line"><span>    for (const msg of recentMessages) {</span></span>
<span class="line"><span>      await history.addMessage(msg);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(\`\\n保留消息数量: \${recentMessages.length}\`);</span></span>
<span class="line"><span>    console.log(&quot;保留的消息:&quot;, recentMessages.map(m =&gt; {</span></span>
<span class="line"><span>      const content = typeof m.content === &#39;string&#39; ? m.content : JSON.stringify(m.content);</span></span>
<span class="line"><span>      const tokens = enc.encode(content).length;</span></span>
<span class="line"><span>      return \`\${m.constructor.name} (\${tokens} tokens): \${m.content}\`;</span></span>
<span class="line"><span>    }).join(&#39;\\n  &#39;));</span></span>
<span class="line"><span>    console.log(\`\\n总结内容（不包含保留的消息）: \${summary}\`);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    console.log(\`\\nToken 数量 (\${totalTokens}) 未超过阈值 (\${maxTokens})，无需总结\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>summarizationMemoryDemo().catch(console.error);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 总结历史对话的函数</span></span>
<span class="line"><span>async function summarizeHistory(messages) {</span></span>
<span class="line"><span>  if (messages.length === 0) return &quot;&quot;;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const conversationText = getBufferString(messages, {</span></span>
<span class="line"><span>    humanPrefix: &quot;用户&quot;,</span></span>
<span class="line"><span>    aiPrefix: &quot;助手&quot;,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const summaryPrompt = \`请总结以下对话的核心内容，保留重要信息：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${conversationText}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>总结：\`;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  const summaryResponse = await model.invoke([new SystemMessage(summaryPrompt)]);</span></span>
<span class="line"><span>  return summaryResponse.content;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>区别是现在是 token 计数来触发总结：</p><video src="`+q+'" controls></video><p>我们每天用的 cursor、claude code 就是这种策略：</p><p>cursor：</p><p><img src="'+I+'" alt="image-20260128154415236"></p><p><img src="'+w+'" alt="image-20260128154421408"></p><p>达到上下文限制，会自动触发总结。</p><p>claude code：</p><p><img src="'+A+'" alt="image-20260128154429074"></p><p><img src="'+C+'" alt="image-20260128154436016"></p><p>最后再来试下检索向量数据库的思路：</p><p>先把 milvus 跑起来：</p><p><img src="'+E+'" alt="image-20260128154441935"></p><p><img src="'+b+`" alt="image-20260128154446895"></p><p>我们用代码创建集合，插入数据：</p><p>创建 src/memory/insert-conversations.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient, DataType, MetricType, IndexType } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;conversations&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  model: &#39;text-embedding-v3&#39;,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  dimensions: VECTOR_DIM</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new MilvusClient({</span></span>
<span class="line"><span>  address: &#39;localhost:19530&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 获取文本的向量嵌入</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>async function getEmbedding(text) {</span></span>
<span class="line"><span>  const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function main() {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;连接到 Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ 已连接\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 创建集合</span></span>
<span class="line"><span>    console.log(&#39;创建集合...&#39;);</span></span>
<span class="line"><span>    await client.createCollection({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      fields: [</span></span>
<span class="line"><span>        { name: &#39;id&#39;, data_type: DataType.VarChar, max_length: 50, is_primary_key: true },</span></span>
<span class="line"><span>        { name: &#39;vector&#39;, data_type: DataType.FloatVector, dim: VECTOR_DIM },</span></span>
<span class="line"><span>        { name: &#39;content&#39;, data_type: DataType.VarChar, max_length: 5000 },</span></span>
<span class="line"><span>        { name: &#39;round&#39;, data_type: DataType.Int64 },</span></span>
<span class="line"><span>        { name: &#39;timestamp&#39;, data_type: DataType.VarChar, max_length: 100 }</span></span>
<span class="line"><span>      ]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(&#39;✓ 集合已创建&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 创建索引</span></span>
<span class="line"><span>    console.log(&#39;\\n创建索引...&#39;);</span></span>
<span class="line"><span>    await client.createIndex({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      field_name: &#39;vector&#39;,</span></span>
<span class="line"><span>      index_type: IndexType.IVF_FLAT,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(&#39;✓ 索引已创建&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 加载集合</span></span>
<span class="line"><span>    console.log(&#39;\\n加载集合...&#39;);</span></span>
<span class="line"><span>    await client.loadCollection({ collection_name: COLLECTION_NAME });</span></span>
<span class="line"><span>    console.log(&#39;✓ 集合已加载&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 插入对话数据</span></span>
<span class="line"><span>    console.log(&#39;\\n插入对话数据...&#39;);</span></span>
<span class="line"><span>    const conversations = [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;conv_001&#39;,</span></span>
<span class="line"><span>        content: &#39;用户: 我叫赵六，是一名数据科学家\\n助手: 很高兴认识你，赵六！数据科学是一个很有趣的领域。&#39;,</span></span>
<span class="line"><span>        round: 1,</span></span>
<span class="line"><span>        timestamp: new Date().toISOString()</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;conv_002&#39;,</span></span>
<span class="line"><span>        content: &#39;用户: 我最近在研究机器学习算法\\n助手: 机器学习确实很有意思，你在研究哪些算法呢？&#39;,</span></span>
<span class="line"><span>        round: 2,</span></span>
<span class="line"><span>        timestamp: new Date().toISOString()</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;conv_003&#39;,</span></span>
<span class="line"><span>        content: &#39;用户: 我喜欢打篮球和看电影\\n助手: 运动和文化娱乐都是很好的爱好！&#39;,</span></span>
<span class="line"><span>        round: 3,</span></span>
<span class="line"><span>        timestamp: new Date().toISOString()</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;conv_004&#39;,</span></span>
<span class="line"><span>        content: &#39;用户: 我周末经常去电影院\\n助手: 看电影是很好的放松方式。&#39;,</span></span>
<span class="line"><span>        round: 4,</span></span>
<span class="line"><span>        timestamp: new Date().toISOString()</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;conv_005&#39;,</span></span>
<span class="line"><span>        content: &#39;用户: 我的职业是软件工程师\\n助手: 软件工程师是个很有前景的职业！&#39;,</span></span>
<span class="line"><span>        round: 5,</span></span>
<span class="line"><span>        timestamp: new Date().toISOString()</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&#39;生成向量嵌入...&#39;);</span></span>
<span class="line"><span>    const conversationData = await Promise.all(</span></span>
<span class="line"><span>      conversations.map(async (conv) =&gt; ({</span></span>
<span class="line"><span>        ...conv,</span></span>
<span class="line"><span>        vector: await getEmbedding(conv.content)</span></span>
<span class="line"><span>      }))</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const insertResult = await client.insert({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      data: conversationData</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(\`✓ 已插入 \${insertResult.insert_cnt} 条记录\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(60));</span></span>
<span class="line"><span>    console.log(&#39;说明：已成功将对话数据插入到 Milvus 向量数据库&#39;);</span></span>
<span class="line"><span>    console.log(&#39;这些对话数据将用于后续的 RAG 检索&#39;);</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(60) + &#39;\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;错误:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>创建集合 conversations 用来保存对话记录</p><p>然后插入一些数据。</p><p>跑一下：</p><video src="`+x+`" controls></video><p>这样，我们就把每轮对话格式化后存到了向量数据库里，记录了对话的时间、轮次。</p><p>接下来对话的时候，就可以用 RAG 来检索之前的对话内容了：</p><p>创建 src/memory/retrieval-memory.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { InMemoryChatMessageHistory } from &quot;@langchain/core/chat_history&quot;;</span></span>
<span class="line"><span>import { MilvusClient, MetricType } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { HumanMessage, SystemMessage } from &quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;conversations&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 OpenAI Chat 模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({ </span></span>
<span class="line"><span>  modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  temperature: 0,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Embeddings 模型</span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  model: &#39;text-embedding-v3&#39;,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  dimensions: VECTOR_DIM</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Milvus 客户端</span></span>
<span class="line"><span>const client = new MilvusClient({</span></span>
<span class="line"><span>  address: &#39;localhost:19530&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 获取文本的向量嵌入</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>async function getEmbedding(text) {</span></span>
<span class="line"><span>  const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 从 Milvus 中检索相关的历史对话</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>async function retrieveRelevantConversations(query, k = 2) {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    // 生成查询的向量</span></span>
<span class="line"><span>    const queryVector = await getEmbedding(query);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 在 Milvus 中搜索相似的对话</span></span>
<span class="line"><span>    const searchResult = await client.search({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      vector: queryVector,</span></span>
<span class="line"><span>      limit: k,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>      output_fields: [&#39;id&#39;, &#39;content&#39;, &#39;round&#39;, &#39;timestamp&#39;]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return searchResult.results;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;检索对话时出错:&#39;, error.message);</span></span>
<span class="line"><span>    return [];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 策略3: 检索（Retrieval）</span></span>
<span class="line"><span> * 使用 Milvus 向量数据库存储历史对话，根据当前输入检索语义相关的历史</span></span>
<span class="line"><span> * 实现 RAG（Retrieval-Augmented Generation）流程</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function retrievalMemoryDemo() {  </span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;连接到 Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ 已连接\\n&#39;);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;❌ 无法连接到 Milvus:&#39;, error.message);</span></span>
<span class="line"><span>    console.log(&#39;请确保 Milvus 服务正在运行（localhost:19530）&#39;);</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 创建历史消息存储</span></span>
<span class="line"><span>  const history = new InMemoryChatMessageHistory();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  const conversations = [</span></span>
<span class="line"><span>    { input: &quot;我之前提到的机器学习项目进展如何？&quot; },</span></span>
<span class="line"><span>    { input: &quot;我周末经常做什么？&quot; },</span></span>
<span class="line"><span>    { input: &quot;我的职业是什么？&quot; },</span></span>
<span class="line"><span>  ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  for (let i = 0; i &lt; conversations.length; i++) {</span></span>
<span class="line"><span>    const { input } = conversations[i];</span></span>
<span class="line"><span>    const userMessage = new HumanMessage(input);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(\`\\n[第 \${i + 1} 轮对话]\`);</span></span>
<span class="line"><span>    console.log(\`用户: \${input}\`);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 1. 检索相关的历史对话</span></span>
<span class="line"><span>    console.log(&#39;\\n【检索相关历史对话】&#39;);</span></span>
<span class="line"><span>    const retrievedConversations = await retrieveRelevantConversations(input, 2);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    let relevantHistory = &quot;&quot;;</span></span>
<span class="line"><span>    if (retrievedConversations.length &gt; 0) {</span></span>
<span class="line"><span>      // 显示检索到的相关历史及相似度</span></span>
<span class="line"><span>      retrievedConversations.forEach((conv, idx) =&gt; {</span></span>
<span class="line"><span>        console.log(\`\\n[历史对话 \${idx + 1}] 相似度: \${conv.score.toFixed(4)}\`);</span></span>
<span class="line"><span>        console.log(\`轮次: \${conv.round}\`);</span></span>
<span class="line"><span>        console.log(\`内容: \${conv.content}\`);</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      // 构建上下文</span></span>
<span class="line"><span>      relevantHistory = retrievedConversations</span></span>
<span class="line"><span>        .map((conv, idx) =&gt; {</span></span>
<span class="line"><span>          return \`[历史对话 \${idx + 1}]</span></span>
<span class="line"><span>轮次: \${conv.round}</span></span>
<span class="line"><span>\${conv.content}\`;</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>        .join(&#39;\\n\\n━━━━━\\n\\n&#39;);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      console.log(&#39;未找到相关历史对话&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 2. 构建 prompt（使用检索到的历史作为上下文）</span></span>
<span class="line"><span>    const contextMessages = relevantHistory </span></span>
<span class="line"><span>      ? [</span></span>
<span class="line"><span>          new HumanMessage(\`相关历史对话：\\n\${relevantHistory}\\n\\n用户问题: \${input}\`)</span></span>
<span class="line"><span>        ]</span></span>
<span class="line"><span>      : [userMessage];</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 3. 调用模型生成回答</span></span>
<span class="line"><span>    console.log(&#39;\\n【AI 回答】&#39;);</span></span>
<span class="line"><span>    const response = await model.invoke(contextMessages);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 保存当前对话到历史消息</span></span>
<span class="line"><span>    await history.addMessage(userMessage);</span></span>
<span class="line"><span>    await history.addMessage(response);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 4. 将对话保存到 Milvus 向量数据库</span></span>
<span class="line"><span>    const conversationText = \`用户: \${input}\\n助手: \${response.content}\`;</span></span>
<span class="line"><span>    const convId = \`conv_\${Date.now()}_\${i + 1}\`;</span></span>
<span class="line"><span>    const convVector = await getEmbedding(conversationText);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      await client.insert({</span></span>
<span class="line"><span>        collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>        data: [{</span></span>
<span class="line"><span>          id: convId,</span></span>
<span class="line"><span>          vector: convVector,</span></span>
<span class="line"><span>          content: conversationText,</span></span>
<span class="line"><span>          round: i + 1,</span></span>
<span class="line"><span>          timestamp: new Date().toISOString()</span></span>
<span class="line"><span>        }]</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>      console.log(\`💾 已保存到 Milvus 向量数据库\`);</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      console.warn(&#39;保存到向量数据库时出错:&#39;, error.message);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(\`助手: \${response.content}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>retrievalMemoryDemo().catch(console.error);</span></span></code></pre></div><p>我们调用大模型，问了一些问题：</p><p><img src="`+T+'" alt="image-20260128154456248"></p><p>通过 rag 流程来检索之前的对话，来生成回答：</p><video src="'+O+'" controls></video><p>这样，不管之前多久聊过什么内容，都能够继续聊。</p><p>聊完之后我们把最新的聊天也存入了向量数据库：</p><p><img src="'+$+'" alt="image-20260128154501915"></p><video src="'+S+'" controls></video><p>这样之后检索就知道我们这次聊了什么。</p><p>这就是实现 Memory 的第三种策略，检索。</p><p>总结、检索，这俩策略经常同时用</p><p>比如你开发一个聊天应用：</p><p>每聊 20 条就触发一次总结，生成摘要，存入 milvus 向量数据库。</p><p>你问 ai 你们聊过什么的内容，这时候 RAG 就是从 milvus 的摘要集合里查找，生成回答。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>大模型是无状态的，需要我们管理 Memory，也就是管理给它的 messages，它才能继续之前的话题聊。</p><p>langchain 封装了 ChatMessageHistory 的 api 用来存储 messages，可以存在内存、redis、数据库等。</p><p>之前有 memory 的 api，现在都废弃了，因为完全可以自己实现。</p><p>memory 有三种管理策略：截断、总结、检索</p><p>截断就是超出一定条数、一定 token 数量就去掉之前的 message</p><p>总结就是调用大模型生成对话摘要，这样就可以删掉原始 message 了</p><p>检索是结合向量数据库来做语义检索，通过 RAG 来检索之前聊的内容</p><p>我们常用的 cursor 就是超出一定 token 会触发总结</p><p>也可以用总结 + 检索，在 milvus 中存储对话总结，然后结合检索来查找</p><p>管理好了 memory，就无论什么时候都可以基于之前的话题继续聊了，这是做 AI Agent 开发必须要做的。</p>',173)])])}const Y=H(D,[["render",L]]);export{F as __pageData,Y as default};
