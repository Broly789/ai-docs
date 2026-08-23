import{_ as s,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const t="/ai-docs/assets/image-20260412160524341.DDc3EsrO.png",l="/ai-docs/assets/image-20260412160608580.1O1oMnqg.png",i="/ai-docs/assets/image-20260412160626493.BxG7O2IG.png",q=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/23-图编排引擎：LangGraph 和多 Agent 架构/index.md","filePath":"前端转AI Agent/23-图编排引擎：LangGraph 和多 Agent 架构/index.md"}'),o={name:"前端转AI Agent/23-图编排引擎：LangGraph 和多 Agent 架构/index.md"};function c(r,n,u,m,g,d){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>复杂的 Agent 产品基本都是多 Agent 架构。</p><p>为什么呢？</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfekibxsvA7ZcVJDJiciaxWTfmicwnUYz2HHaeZ4ZxCaDibmkEpa1FFniaXCCYgo8yxJOSFhf4ZrZJkkVZKQ2WuIv8C7GBicskEKy7zicYU/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p>单 Agent 架构下，所有 tool 的描述、每个功能的 prompt 都放到 system prompt 里。</p><p>实际上执行每个功能只需要其中一部分 prompt，但每次都全带上。</p><p>这样会导致 token 消耗更高，更重要的是很多无关信息干扰，思考效率低还更容易出错。</p><p>而如果你拆分成多个 Agent 呢？</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcoVvWlWxwGoibuEicuMp3nHcThXlcR7BK13LVUL8MhZWnPicqpKSNSSaAaJM1yuxUocE9COibvd3lickplaiaAd4Rz73hyTToX372jw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>每个 Agent 只保留需要的 prompt，执行功能的时候，消耗的 token 更少，没有无关信息干扰，准确率也更高。</p><p>再就是单 Agent 只有一个大脑，需要一步步思考，调用 tool</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeCfJ5ibqygRTocrE7I4Hbf2GyHtaTecicrg6qEuG4fINM1OVo3zGFNeuCRa2pHDXFqSCtRic0r0BbrIibYS8PcMALDfbGYnUCxOhs/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" alt="图片" referrerpolicy="no-referrer"></p><p>而多 Agent 的多个大脑当然是可以并行思考的，主 Agent 下发任务，子 Agent 并行处理完成后返回</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcKra4AEDHFAgaicBhBeicUOoJ0T2Wgg9eu4gWep7a2wAx1Z7gkwCENxMTS4F8KmR6iaTbK23GRVRWQrOCbfKVzVbxLrqZwmQoMcw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=3" alt="图片" referrerpolicy="no-referrer"></p><p>还有，单 Agent 虽然可以加上反思阶段，但相当于自己给自己纠错</p><p>而多 Agent 每个都是不同的角色，可以互相讨论纠错</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcTDefKhLBQIibScE4X0Khog9jZY6v7K1t0MDTjQsmZXgI9FreRLxCxic46pSLKWEYQdmSnWibO5ticMckoO5wmJRjmcWdQycYK06A/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=4" alt="图片" referrerpolicy="no-referrer"></p><p>基于这三个原因：</p><ul><li><strong>决策准确率更高、token 消耗更低</strong>：每个 Agent 只带必要的最少prompt，没有冗余信息干扰，虽然调用 LLM 次数多了，但更省 token、决策更准、更稳定</li><li><strong>并行思考和任务处理</strong>：主管分派任务，子 Agent 并行处理，整体效率更高</li><li><strong>多角色互相讨论，纠错能力更强</strong>：多 Agent 有不同橘色，可以互相监督、互相纠错，比单个 Agent 自己反思更靠谱，复杂任务表现更强</li></ul><p>现在复杂 Agent 产品基本都是多 Agent 架构的。</p><p>实现 Multi Agent 就需要学习 LangGraph 了。</p><p>用到的 api 还是 LangChain 那些，但它多了一套图编排引擎。</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcPmWVTc3X5LiaRetlQVEEe6EpJORakGyo5FKHtnzr6UGEyWDLW7hiaQau2YwjZO5mT1XMmlwpFqwjSY0hhoPfuWZ1iciaHVaia5XtI/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=5" alt="图片" referrerpolicy="no-referrer"></p><p>我们学了 LangChain 的组件，学了 LCEL 的线性编排，今天来学一下 LangGraph 的图编排引擎。</p><p>我们直接通过代码来学一下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir langgraph-test</span></span>
<span class="line"><span>cd langgraph-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeXiaZltcAEwGRr9JNeKRTxkFswF3uomRs9AOtiaCoLf4X4LFejLY3TfFBibTPWJQycIdXySGM3LiaLvmTJMx44MhOuQ3o7KBMy0icQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=6" alt="图片" referrerpolicy="no-referrer"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/langgraph @langchain/core @langchain/openai dotenv zod</span></span></code></pre></div><p>创建 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span></code></pre></div><p>创建 src/basic-graph.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const StateAnnotation = Annotation.Root({</span></span>
<span class="line"><span>text: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const step1 = (state) =&gt; ({ text: \`\${state.text} -&gt; step1\` });</span></span>
<span class="line"><span>const step2 = (state) =&gt; ({ text: \`\${state.text} -&gt; step2\` });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(StateAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;step1&quot;, step1)</span></span>
<span class="line"><span>  .addNode(&quot;step2&quot;, step2)</span></span>
<span class="line"><span>  .addEdge(START, &quot;step1&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;step1&quot;, &quot;step2&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;step2&quot;, END)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await graph.invoke({ text: &quot;hello&quot; });</span></span>
<span class="line"><span>console.log(&quot;result:&quot;, result);</span></span></code></pre></div><p>创建 StateGraph 图</p><p>添加两个节点（node），加上固定的 START、END 节点</p><p>然后用边（edge）连起来</p><p>编译后执行</p><p>Annotation 用于创建 State，指定默认值（default）和合并逻辑（reducer）</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwff0pU1nc75to45wAbTuYlQwEPv8LgcxaicN6NLxUBxFPhEJMx5WSRvaJI48VMb6lgQZy5zia74VsMWODDRuvltATxrBdTD3PTjy0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" alt="图片" referrerpolicy="no-referrer"></p><p>这样我们基于 LangGraph 的第一个图就完成了。</p><p>图中当然有分支和循环。</p><p>先试一下分支：</p><p>src/conditional-routing.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const StateAnnotation = Annotation.Root({</span></span>
<span class="line"><span>query: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>route: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;chat&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>answer: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const router = (state) =&gt; {</span></span>
<span class="line"><span>const isMath = /[+\\-*/]/.test(state.query);</span></span>
<span class="line"><span>return { route: isMath ? &quot;math&quot; : &quot;chat&quot; };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const mathNode = (state) =&gt; {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    return { answer: String(eval(state.query)) };</span></span>
<span class="line"><span>  } catch {</span></span>
<span class="line"><span>    return { answer: &quot;表达式无法计算&quot; };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const chatNode = (state) =&gt; ({ answer: \`你说的是：\${state.query}\` });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(StateAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;router&quot;, router)</span></span>
<span class="line"><span>  .addNode(&quot;math&quot;, mathNode)</span></span>
<span class="line"><span>  .addNode(&quot;chat&quot;, chatNode)</span></span>
<span class="line"><span>  .addEdge(START, &quot;router&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;router&quot;, (state) =&gt; state.route, {</span></span>
<span class="line"><span>    math: &quot;math&quot;,</span></span>
<span class="line"><span>    chat: &quot;chat&quot;,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .addEdge(&quot;math&quot;, END)</span></span>
<span class="line"><span>  .addEdge(&quot;chat&quot;, END)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(</span></span>
<span class="line"><span>&quot;result:&quot;,</span></span>
<span class="line"><span>await graph.invoke({ query: &quot;你好&quot; })</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(</span></span>
<span class="line"><span>    &quot;result:&quot;,</span></span>
<span class="line"><span>    await graph.invoke({ query: &quot;10 * 8&quot; })</span></span>
<span class="line"><span>);</span></span></code></pre></div><p>用 addConditionalEdges 添加分支</p><p>判断文本如果有+-*/字符就走 math 分支，否则走 chat 分支</p><p><img src="`+t+`" alt="image-20260412160524341"></p><p>接下来试一下循环，其实它也是用分支来实现：</p><p>src/loop-retry.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const StateAnnotation = Annotation.Root({</span></span>
<span class="line"><span>tries: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;0,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>ok: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;false,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>message: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const attempt = (state) =&gt; {</span></span>
<span class="line"><span>const tries = state.tries + 1;</span></span>
<span class="line"><span>const ok = tries &gt;= 3;</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    tries,</span></span>
<span class="line"><span>    ok,</span></span>
<span class="line"><span>    message: ok ? \`第 \${tries} 次成功\` : \`第 \${tries} 次失败，继续重试\`,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(StateAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;attempt&quot;, attempt)</span></span>
<span class="line"><span>  .addEdge(START, &quot;attempt&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;attempt&quot;, (state) =&gt; (state.ok ? &quot;done&quot; : &quot;retry&quot;), {</span></span>
<span class="line"><span>    retry: &quot;attempt&quot;,</span></span>
<span class="line"><span>    done: END,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await graph.invoke({ tries: 0 });</span></span>
<span class="line"><span>console.log(&quot;result:&quot;, result);</span></span></code></pre></div><p>同样用 addConditionalEdges 判断条件满足就到 END 节点，否则重新路由到之前的节点</p><p>这样就可以实现循环效果</p><p>经过这几个例子，应该能看出节点之间是怎么通信的：</p><p>通过 state</p><p>那把 state 保存下来不就是把当前图的执行状态保存下来了么？</p><p>这个通过 ChekpointerSaver 的 api 就可以保存</p><p>创建 src/checkpointer-memory.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import {</span></span>
<span class="line"><span>  Annotation,</span></span>
<span class="line"><span>  END,</span></span>
<span class="line"><span>  MemorySaver,</span></span>
<span class="line"><span>  START,</span></span>
<span class="line"><span>  StateGraph,</span></span>
<span class="line"><span>} from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const StateAnnotation = Annotation.Root({</span></span>
<span class="line"><span>visitCount: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;0,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>message: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 每跑一轮图，给「当前会话」访问次数 +1 */</span></span>
<span class="line"><span>function recordVisit(state) {</span></span>
<span class="line"><span>const visitCount = state.visitCount + 1;</span></span>
<span class="line"><span>const message =</span></span>
<span class="line"><span>    visitCount === 1</span></span>
<span class="line"><span>      ? &quot;这是你在本会话里第 1 次进入。&quot;</span></span>
<span class="line"><span>      : \`这是你在本会话里第 \${visitCount} 次进入\`;</span></span>
<span class="line"><span>return { visitCount, message };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(StateAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;recordVisit&quot;, recordVisit)</span></span>
<span class="line"><span>  .addEdge(START, &quot;recordVisit&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;recordVisit&quot;, END);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const checkpointer = new MemorySaver();</span></span>
<span class="line"><span>const app = graph.compile({ checkpointer });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const user1 = { configurable: { thread_id: &quot;用户-小张&quot; } };</span></span>
<span class="line"><span>const user2 = { configurable: { thread_id: &quot;用户-小李&quot; } };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const res1 = await app.invoke({}, user1);</span></span>
<span class="line"><span>const res2 = await app.invoke({}, user1);</span></span>
<span class="line"><span>const res3 = await app.invoke({}, user1);</span></span>
<span class="line"><span>const res4  = await app.invoke({}, user2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(res1)</span></span>
<span class="line"><span>console.log(res2);</span></span>
<span class="line"><span>console.log(res3);</span></span>
<span class="line"><span>console.log(res4);</span></span></code></pre></div><p>我们用 MemorySaver 来把 state 保存到内存里，这样下次就会基于上次的 state 继续执行</p><p>当然，还可以保存到 sqlite、redis 等，分别用 SqliteSave、RedisSaver 等 api</p><p>我们用 cursor 之类的 coding agent，它经常会让你确认，确认后再继续执行，这种打断功能咋做呢？</p><p>LangGraph 提供了 interrupt 的 api</p><p>创建 src/graph-interrupt.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { createInterface } from&quot;node:readline/promises&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  Annotation,</span></span>
<span class="line"><span>  Command,</span></span>
<span class="line"><span>  END,</span></span>
<span class="line"><span>  MemorySaver,</span></span>
<span class="line"><span>  START,</span></span>
<span class="line"><span>  StateGraph,</span></span>
<span class="line"><span>  interrupt,</span></span>
<span class="line"><span>} from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const StateAnnotation = Annotation.Root({</span></span>
<span class="line"><span>actionSummary: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>userInput: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 展示一笔待确认的转账 */</span></span>
<span class="line"><span>const showTransfer = () =&gt; ({</span></span>
<span class="line"><span>actionSummary: &quot;向张三转账 ¥100（模拟，不会真扣款）&quot;,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 停在这里等人输入；resume 的值会写进 userInput */</span></span>
<span class="line"><span>const waitConfirm = (state) =&gt; {</span></span>
<span class="line"><span>const text = interrupt({</span></span>
<span class="line"><span>    hint: &quot;终端里输入「确认」或备注后回车，图才会继续&quot;,</span></span>
<span class="line"><span>    actionSummary: state.actionSummary,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>return { userInput: String(text) };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(StateAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;showTransfer&quot;, showTransfer)</span></span>
<span class="line"><span>  .addNode(&quot;waitConfirm&quot;, waitConfirm)</span></span>
<span class="line"><span>  .addEdge(START, &quot;showTransfer&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;showTransfer&quot;, &quot;waitConfirm&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;waitConfirm&quot;, END)</span></span>
<span class="line"><span>  .compile({ checkpointer: new MemorySaver() });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const config = { configurable: { thread_id: &quot;interrupt-demo&quot; } };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const paused = await graph.invoke({}, config);</span></span>
<span class="line"><span>console.log(&quot;\\n待你确认：&quot;, paused.__interrupt__?.[0]?.value);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const rl = createInterface({ input: process.stdin, output: process.stdout });</span></span>
<span class="line"><span>const line = (await rl.question(&quot;&gt; &quot;)).trim();</span></span>
<span class="line"><span>await rl.close();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (!line) {</span></span>
<span class="line"><span>console.error(&quot;未输入，退出。&quot;);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const done = await graph.invoke(new Command({ resume: line }), config);</span></span>
<span class="line"><span>console.log(&quot;结果：&quot;, done);</span></span></code></pre></div><p>用 interrupt 中断图的执行</p><p>等待用户输入之后再次 invoke，传入 new Command({resume: &#39;xxx&#39;})</p><p>这样图就会在上次断点位置继续执行</p><p>这里用了 nodejs 的 readline 包读取键盘输入</p><p>这样就可以实现图的中断、恢复了。</p><p>此外，有些常用的节点，langgrph 给封装好了，放到 prebuilt 下：</p><p>src/prebuilt-tool-node.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { HumanMessage } from&quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { tool } from&quot;@langchain/core/tools&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  END,</span></span>
<span class="line"><span>  MessagesAnnotation,</span></span>
<span class="line"><span>  START,</span></span>
<span class="line"><span>  StateGraph,</span></span>
<span class="line"><span>} from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { ToolNode, toolsCondition } from&quot;@langchain/langgraph/prebuilt&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { getProductBySku } from&quot;./inventory-mock.mjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const getProductStock = tool(</span></span>
<span class="line"><span>async ({ sku }) =&gt; getProductBySku(sku),</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;get_product_stock&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;按 SKU 查商品名与库存，SKU 如 SKU-001。&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      sku: z.string().describe(&quot;商品 SKU&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const tools = [getProductStock];</span></span>
<span class="line"><span>const llm = new ChatOpenAI({</span></span>
<span class="line"><span>modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>}).bindTools(tools);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction agent(state) {</span></span>
<span class="line"><span>const response = await llm.invoke(state.messages);</span></span>
<span class="line"><span>return { messages: response };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const toolNode = new ToolNode(tools);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(MessagesAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;agent&quot;, agent)</span></span>
<span class="line"><span>  .addNode(&quot;tools&quot;, toolNode)</span></span>
<span class="line"><span>  .addEdge(START, &quot;agent&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;agent&quot;, toolsCondition, [&quot;tools&quot;, END])</span></span>
<span class="line"><span>  .addEdge(&quot;tools&quot;, &quot;agent&quot;)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await graph.invoke({</span></span>
<span class="line"><span>messages: [</span></span>
<span class="line"><span>    new HumanMessage(</span></span>
<span class="line"><span>      &quot;查一下 SKU-001 的库存还有多少，回答里带上商品名和数字。&quot;</span></span>
<span class="line"><span>    ),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const last = result.messages.at(-1);</span></span>
<span class="line"><span>console.log(last?.content ?? result.messages);</span></span></code></pre></div><p>比如我们要调用 tool，用 graph 的写法怎么写呢？</p><p>创建 model 的节点，创建 tool 的节点</p><p>然后加一个 conditional 节点，判断如果有 tool call 就走 tool 节点，否则走 END</p><p>但不用自己写，langgraph 内置了 ToolNode 和 toolsCondition 的 api</p><p>用到的 inventory.mock.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/** 假数据，模拟「按 SKU 查库存」接口 */</span></span>
<span class="line"><span>const rows = [</span></span>
<span class="line"><span>  { sku: &quot;SKU-001&quot;, name: &quot;无线鼠标&quot;, stock: 42 },</span></span>
<span class="line"><span>  { sku: &quot;SKU-002&quot;, name: &quot;机械键盘&quot;, stock: 7 },</span></span>
<span class="line"><span>  { sku: &quot;SKU-003&quot;, name: &quot;USB-C 线缆&quot;, stock: 120 },</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportfunction getProductBySku(sku) {</span></span>
<span class="line"><span>const key = String(sku).trim().toUpperCase();</span></span>
<span class="line"><span>const row = rows.find((r) =&gt; r.sku.toUpperCase() === key);</span></span>
<span class="line"><span>if (!row) returnJSON.stringify({ found: false, sku: String(sku).trim() });</span></span>
<span class="line"><span>returnJSON.stringify({ found: true, ...row });</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><img src="`+l+`" alt="image-20260412160608580"></p><p>当然，像这么常用的 agent loop 自然也给封装好了，就是 createAgent 的 api：</p><p>prebuilt-agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { HumanMessage } from&quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { MemorySaver } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { createAgent, tool } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { getProductBySku } from&quot;./inventory-mock.mjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const getProductStock = tool(</span></span>
<span class="line"><span>async ({ sku }) =&gt; getProductBySku(sku),</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;get_product_stock&quot;,</span></span>
<span class="line"><span>    description:</span></span>
<span class="line"><span>      &quot;按 SKU 查商品名与库存，SKU 如 SKU-001。&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      sku: z.string().describe(&quot;商品 SKU&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [getProductStock],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;你是仓库助手。问库存时必须调用 get_product_stock（模拟数据），禁止编造。&quot;,</span></span>
<span class="line"><span>checkpointer: new MemorySaver(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await agent.invoke(</span></span>
<span class="line"><span>  { messages: [new HumanMessage(&quot;SKU-002 还剩多少库存？&quot;)] },</span></span>
<span class="line"><span>  { configurable: { thread_id: &quot;demo-thread&quot; } }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await agent.graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const last = result.messages.at(-1);</span></span>
<span class="line"><span>console.log(last?.content ?? result);</span></span></code></pre></div><p>直接用 createAgent 来跑 agent loop</p><p>看一下它的图：</p><p><img src="`+i+`" alt="image-20260412160626493"></p><p>和刚才写的一样，这个 api 内部就是基于 LangGraph 构建的 agent loop 的图。</p><p>学完 LangGraph 的图，我们来写一个多 Agent 的架构</p><p>多 Agent 最常用的是 Supervisor - Worker 模式，也就是“主管 - 工人”模式</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffmYUvhuicW7dOkM6NlamdHGlhozbwD5yLXFOGTE8pic3TsWvV6IeYkgZcr6xDH0v1qXH5RNXmQPElMYHVRia1OYoeXBR4o26WzoI/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=11" alt="图片" referrerpolicy="no-referrer"></p><p>langchain 提供了这种多 Agent 架构的包 @langchain/langgraph-supervisor</p><p>安装下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/langgraph-supervisor</span></span></code></pre></div><p>创建 multi-agent-supervisor.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { HumanMessage } from&quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { createSupervisor } from&quot;@langchain/langgraph-supervisor&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { createAgent, tool } from&quot;langchain&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import { lookupCityTrivia, lookupWeather } from&quot;./simple-mock.mjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const lookupWeatherTool = tool(</span></span>
<span class="line"><span>async ({ city }) =&gt; lookupWeather(city),</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;lookup_weather&quot;,</span></span>
<span class="line"><span>    description: &quot;查询某城市当日天气概况（气温区间、天气、空气质量等）。&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      city: z.string().describe(&quot;城市名，如 杭州&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const lookupCityTriviaTool = tool(</span></span>
<span class="line"><span>async ({ city }) =&gt; lookupCityTrivia(city),</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    name: &quot;lookup_city_trivia&quot;,</span></span>
<span class="line"><span>    description: &quot;查询与某城市相关的一句趣味知识。&quot;,</span></span>
<span class="line"><span>    schema: z.object({</span></span>
<span class="line"><span>      city: z.string().describe(&quot;城市名，如 杭州&quot;),</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 子代理 A：只回答「天气」类问题 */</span></span>
<span class="line"><span>const weatherAgent = createAgent({</span></span>
<span class="line"><span>name: &quot;weather_agent&quot;,</span></span>
<span class="line"><span>description: &quot;专门查天气&quot;,</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [lookupWeatherTool],</span></span>
<span class="line"><span>systemPrompt: &quot;你只处理天气。用户提到城市时，用 lookup_weather 查询后再用中文简短说明。&quot;,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 子代理 B：只回答「城市小知识」 */</span></span>
<span class="line"><span>const triviaAgent = createAgent({</span></span>
<span class="line"><span>name: &quot;trivia_agent&quot;,</span></span>
<span class="line"><span>description: &quot;专门讲与城市相关的小知识；必须调用 lookup_city_trivia。&quot;,</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [lookupCityTriviaTool],</span></span>
<span class="line"><span>systemPrompt: &quot;你只讲城市小知识。先 lookup_city_trivia，再用人话转述，不要编造工具里没有的内容。&quot;,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Supervisor：根据用户问的是「天气」还是「小知识」切换子代理。</span></span>
<span class="line"><span> * （真实业务里还可以再加更多子代理，思路一样。）</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>const workflow = createSupervisor({</span></span>
<span class="line"><span>agents: [weatherAgent.graph, triviaAgent.graph],</span></span>
<span class="line"><span>llm: model,</span></span>
<span class="line"><span>prompt: \`你是调度员，只负责选人，不要自己报气温、也不要自己讲城市百科。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- 问天气、气温、下不下雨、空气 → 用 weather_agent</span></span>
<span class="line"><span>- 问小知识、名胜、历史、一句介绍 → 用 trivia_agent</span></span>
<span class="line"><span>\`,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const app = workflow.compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const drawable = await app.getGraphAsync();</span></span>
<span class="line"><span>console.log(drawable.drawMermaid({ withStyles: true }));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const input = {</span></span>
<span class="line"><span>messages: [</span></span>
<span class="line"><span>    new HumanMessage(&quot;查一下杭州的天气，再讲一条和杭州有关的小知识。&quot;),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const nodePath = [];</span></span>
<span class="line"><span>let finalState = null;</span></span>
<span class="line"><span>const stream = await app.stream(input, { streamMode: [&quot;updates&quot;, &quot;values&quot;] });</span></span>
<span class="line"><span>forawait (const event of stream) {</span></span>
<span class="line"><span>const [mode, payload] = event;</span></span>
<span class="line"><span>if (mode === &quot;updates&quot; &amp;&amp; payload &amp;&amp; typeof payload === &quot;object&quot;) {</span></span>
<span class="line"><span>    nodePath.push(...Object.keys(payload));</span></span>
<span class="line"><span>  } elseif (mode === &quot;values&quot;) {</span></span>
<span class="line"><span>    finalState = payload;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;路径:&quot;, nodePath.join(&quot; → &quot;));</span></span>
<span class="line"><span>const last = finalState?.messages?.at(-1);</span></span>
<span class="line"><span>console.log(last?.content ?? finalState?.messages);</span></span></code></pre></div><p>我们用 createAgent 创建了 2 个 子 Agent</p><p>然后用 createSupervisor 创建主管 Agent：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdvQFzhU1WV4u30XXYrDOvHUJpy4Gn9vLb4Yiak8ia9lWQiaeY9QibwBdhHPEDVyTE9a4wOibYtgPElNicByzqgnYPSiaNzcdSQXL88jc/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=12" alt="图片" referrerpolicy="no-referrer"></p><p>子 Agent 一个查天气，一个查城市历史</p><p>用 stream 可以拿到整个图运行过程的状态</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdzAib5wPRgU3IZ0JtVk8VlPNSrNppic6oGvnL1mvNnylr6qgWBZd1Nk3kvo5HSOTkr0FuAO1OlXqFMrd96sdm2gDSmaCvicZgvbA/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=13" alt="图片" referrerpolicy="no-referrer"></p><p>它的 state 内容挺多的，所以支持几种模式</p><p>updates 是增量模式，就是过滤出这个节点增量修改的 state 来</p><p>values 是全量模式，给你所有的 state</p><p>我们这里用 updates 模式拿到经过的节点的名字</p><p>最后的回复用 values 模式拿</p><p>用到查询代码的实现：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/** 假接口：演示 supervisor 如何把问题分给不同子代理 */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function normCity(city) {</span></span>
<span class="line"><span>returnString(city).trim();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const weatherTable = {</span></span>
<span class="line"><span>  杭州: { summary: &quot;多云转小雨&quot;, tempHighC: 22, tempLowC: 15, aqi: &quot;良&quot; },</span></span>
<span class="line"><span>  北京: { summary: &quot;晴&quot;, tempHighC: 26, tempLowC: 12, aqi: &quot;轻度污染&quot; },</span></span>
<span class="line"><span>  上海: { summary: &quot;阴&quot;, tempHighC: 20, tempLowC: 16, aqi: &quot;良&quot; },</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const triviaTable = {</span></span>
<span class="line"><span>  杭州: &quot;西湖文化景观是世界文化遗产之一。&quot;,</span></span>
<span class="line"><span>  北京: &quot;故宫是世界上现存规模最大的古代宫殿建筑群之一。&quot;,</span></span>
<span class="line"><span>  上海: &quot;外滩万国建筑博览群是近代城市历史的缩影。&quot;,</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 查某地当日天气摘要（模拟） */</span></span>
<span class="line"><span>exportfunction lookupWeather(city) {</span></span>
<span class="line"><span>const c = normCity(city);</span></span>
<span class="line"><span>const w = weatherTable[c];</span></span>
<span class="line"><span>if (!w) {</span></span>
<span class="line"><span>    returnJSON.stringify({</span></span>
<span class="line"><span>      city: c,</span></span>
<span class="line"><span>      summary: &quot;暂无该城市数据，以下为占位&quot;,</span></span>
<span class="line"><span>      tempHighC: 20,</span></span>
<span class="line"><span>      tempLowC: 12,</span></span>
<span class="line"><span>      aqi: &quot;—&quot;,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>returnJSON.stringify({ city: c, ...w });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 查与某城市相关的一句小知识（模拟） */</span></span>
<span class="line"><span>exportfunction lookupCityTrivia(city) {</span></span>
<span class="line"><span>const c = normCity(city);</span></span>
<span class="line"><span>const line = triviaTable[c];</span></span>
<span class="line"><span>returnJSON.stringify({</span></span>
<span class="line"><span>    city: c,</span></span>
<span class="line"><span>    trivia: line ?? \`没有为「\${c}」准备内置小知识，可换杭州/北京/上海试试。\`,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这样，我们第一个多 Agent 的代码就跑通了。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffB8XKb9GtPVJkaW7Es0FhddkJ769TOsNUbG3m6MhyD3kEMm2yPCREGfbyk1PSPA20DnIZhsKGJ0GWcPV7OWy3Jic1kia00yJdWg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=14" alt="图片" referrerpolicy="no-referrer"></p><p>虽然用 stream 的 values 模式可以打印 state，但是它内容太多了。</p><p>如果想看一下执行过程，最好的方式是断点调试。</p><p>通过调试，就可以清晰的看到整个 graph 的流转过程。</p><p>也可以看到 @langchain/langgraph-supervisor 的多 Agent 架构的实现原理，就是在 state 里保存了 messages 数组来传递信息</p><p>回头看下这张图：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcPmWVTc3X5LiaRetlQVEEe6EpJORakGyo5FKHtnzr6UGEyWDLW7hiaQau2YwjZO5mT1XMmlwpFqwjSY0hhoPfuWZ1iciaHVaia5XtI/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=15" alt="图片" referrerpolicy="no-referrer"></p><p>我们学 LangChain 的组件层花了比较多时间，学编排层的 LCEL、LangGraph 都是很快的，一两节搞定。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>这节我们学了 LangGraph 和多 Agent 架构。</p><p>我们理清了 3 个用多 Agent 架构的理由：</p><ul><li>prompt 拆分到多个 Agent 中去，更纯净，token 消耗少，不容易决策出错</li><li>多个 Agent 可以并行思考和执行任务</li><li>多个 Agent 基于各自的角色可以相互讨论、纠错</li></ul><p>复杂的 Agent 产品基本都是多 Agent 架构。</p><p>我们学了 LangGraph 的图怎么创建：</p><ul><li>state 用 Annotation 创建，包括 default（默认值）、reducer（值怎么合并）</li><li>图用 StateGraph 创建，可以添加 node（节点）、edge（边）</li><li>边可以用 addConditionalEdges 添加路由分支，基于这个也可以实现循环</li><li>可以用 MemorySaver 等 checkpointer 保存节点的 state，这样就可以恢复上次执行状态了</li><li>用 interupt 可以做图执行过程的打断，之后再次 invoke 传入 resume Command 即可恢复执行</li></ul><p>还学了 prebuilt 的 ToolNode、toolsCondition 以及 createAgent 这些内置的节点、图</p><p>学完 LangGraph 的图之后，我们学了多 Agent</p><p>多 Agent 一般是 Supervisor - Worker 的架构</p><p>直接用 @langchain/langgraph-supervisor 这个包就行，它封装了这套架构。</p><p>用 stream 可以看到图执行过程中的 state，分别用 updates、values 可以增量、全量看到节点输出的 state</p><p>当然，打印太多的话可以直接用断点调试来看多 Agent 的流转过程。</p><p>Supervisor 主管节点只负责任务分发，Worker 来做具体的任务执行。</p><p>后面我们的项目实战都是基于这种多 Agent 的架构来写。</p>`,131)])])}const f=s(o,[["render",c]]);export{q as __pageData,f as default};
