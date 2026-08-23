import{_ as s,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/24-Agentic RAG：基于 LangGraph 实现大模型自主决策的 RAG 闭环系统/index.md","filePath":"前端转AI Agent/24-Agentic RAG：基于 LangGraph 实现大模型自主决策的 RAG 闭环系统/index.md"}'),l={name:"前端转AI Agent/24-Agentic RAG：基于 LangGraph 实现大模型自主决策的 RAG 闭环系统/index.md"};function t(i,n,o,c,r,u){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>公司内部的 Agent 基本都要用到 RAG。</p><p>因为大模型能思考，但它不知道公司内部的文档，而我们需要它能基于内部文档来回答。</p><p>传统 RAG 是这样的：</p><p>查询的时候，把 query 用嵌入模型向量化，根据余弦相似度，匹配向量数据库中最相近的文档返回：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfeud9nI4zgHToOB2SgZOzHp3NBvaqtAK7yt9H5rDMdxq23aacDlrZh2bgE6LiaguRGjQhjnx7ykyyL6HRavX0JIyAWT6V9mTHMI/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p>但这个流程太固定，会有一些问题：</p><ul><li>所有问题都走检索，其实简单常识类问题不需要检索，浪费资源</li><li>没有纠错和评估机制，无法判断检索内容是否准确、是否足够</li><li>处理不了需要多步检索的复杂问题，比如先查 A、再查 B 才能得出结论</li><li>专业术语、精确实体更适合关键词检索，纯语义检索容易匹配不准</li><li>本地知识库没有的内容，不会主动去网络搜索补充，容易编造答案</li></ul><p>解决这些问题，显然要在 RAG 的固定流程中，引入大模型来思考。</p><ul><li>让模型根据问题类型选择检索策略，简单问题直接回答，复杂问题才走完整检索</li><li>评估检索结果是否相关、是否足够，让模型判断是否需要重新检索或补充检索</li><li>让模型自动拆解复杂问题，决定先查什么、后查什么，实现多步检索</li><li>同时结合关键词检索与语义检索，由模型统一融合多路结果，提升专业场景准确率</li><li>让模型判断本地知识库是否覆盖答案，覆盖不足时自动触发网络搜索补充信息</li></ul><p>最终把原本 “死板的检索 - 生成” 流程，升级为可思考、可判断、可纠错的智能 RAG 架构。</p><p>这种由大模型自主决策怎么检索、检索的信息是否足够、是否要重新检索等的 RAG 流程就叫 <strong>Agentic RAG</strong>。</p><p>这很适合用 LangGraph 的多 Agent 架构来做，每个 Agent 负责其中一块功能。</p><p>我们来写一下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir advanced-rag</span></span>
<span class="line"><span>cd advanced-rag</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfd4R7KwBJ0dq1x8OgU342y6zUDVkWwG0qdY948tap3Tzrbj5acq9C88lNLnQ3HUtsEK22KDciciaHgDUVHH0OeicpwGeQaNp30cuQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/langgraph @langchain/core @langchain/openai @langchain/community dotenv zod</span></span></code></pre></div><p>创建 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span></code></pre></div><p>我们先基于 LangGraph 实现传统 RAG</p><p>创建 src/naive-rag.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { Milvus } from&quot;@langchain/community/vectorstores/milvus&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &quot;ebook_collection&quot;;</span></span>
<span class="line"><span>const TOP_K = 5;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const GraphState = Annotation.Root({</span></span>
<span class="line"><span>    question: Annotation,</span></span>
<span class="line"><span>    k: Annotation,</span></span>
<span class="line"><span>    documents: Annotation,</span></span>
<span class="line"><span>    generation: Annotation,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    model: &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>    model: &quot;text-embedding-v3&quot;,</span></span>
<span class="line"><span>    dimensions: 1024,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let vectorStore;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction retrieveRelevantContent(question, k = TOP_K) {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>        const docsWithScores = await vectorStore.similaritySearchWithScore(question, k);</span></span>
<span class="line"><span>        return docsWithScores.map(([doc, score]) =&gt; ({</span></span>
<span class="line"><span>            score,</span></span>
<span class="line"><span>            content: doc.pageContent,</span></span>
<span class="line"><span>            id: doc.metadata?.id ?? &quot;unknown&quot;,</span></span>
<span class="line"><span>            book_id: doc.metadata?.book_id ?? &quot;未知&quot;,</span></span>
<span class="line"><span>            chapter_num: doc.metadata?.chapter_num ?? &quot;未知&quot;,</span></span>
<span class="line"><span>            index: doc.metadata?.index ?? &quot;未知&quot;,</span></span>
<span class="line"><span>        }));</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>        console.error(&quot;检索内容时出错:&quot;, error.message);</span></span>
<span class="line"><span>        return [];</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retrieveNode = async (state) =&gt; {</span></span>
<span class="line"><span>    const documents = await retrieveRelevantContent(state.question, state.k);</span></span>
<span class="line"><span>    return {</span></span>
<span class="line"><span>        question: state.question,</span></span>
<span class="line"><span>        k: state.k,</span></span>
<span class="line"><span>        documents,</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const generateNode = async (state) =&gt; {</span></span>
<span class="line"><span>    const context = state.documents</span></span>
<span class="line"><span>        .map(</span></span>
<span class="line"><span>            (item, i) =&gt;</span></span>
<span class="line"><span>                \`[片段 \${i + 1}]</span></span>
<span class="line"><span>章节: 第 \${item.chapter_num} 章</span></span>
<span class="line"><span>内容: \${item.content}\`,</span></span>
<span class="line"><span>        )</span></span>
<span class="line"><span>        .join(&quot;\\n\\n━━━━━\\n\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const prompt = \`你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确、详细的语言。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请根据以下《天龙八部》小说片段内容回答问题：</span></span>
<span class="line"><span>\${context}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题: \${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回答要求：</span></span>
<span class="line"><span>1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答</span></span>
<span class="line"><span>2. 可以综合多个片段的内容，提供完整的答案</span></span>
<span class="line"><span>3. 如果片段中没有相关信息，请如实告知用户</span></span>
<span class="line"><span>4. 回答要准确，符合小说的情节和人物设定</span></span>
<span class="line"><span>5. 可以引用原文内容来支持你的回答</span></span>
<span class="line"><span></span></span>
<span class="line"><span>AI 助手的回答:\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>    let generation = &quot;&quot;;</span></span>
<span class="line"><span>    const stream = await model.stream(prompt);</span></span>
<span class="line"><span>    forawait (const chunk of stream) {</span></span>
<span class="line"><span>        const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>        if (!text) continue;</span></span>
<span class="line"><span>        generation += text;</span></span>
<span class="line"><span>        process.stdout.write(text);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return {</span></span>
<span class="line"><span>        question: state.question,</span></span>
<span class="line"><span>        k: state.k,</span></span>
<span class="line"><span>        documents: state.documents,</span></span>
<span class="line"><span>        generation,</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(GraphState)</span></span>
<span class="line"><span>    .addNode(&quot;retrieve&quot;, retrieveNode)</span></span>
<span class="line"><span>    .addNode(&quot;generate&quot;, generateNode)</span></span>
<span class="line"><span>    .addEdge(START, &quot;retrieve&quot;)</span></span>
<span class="line"><span>    .addEdge(&quot;retrieve&quot;, &quot;generate&quot;)</span></span>
<span class="line"><span>    .addEdge(&quot;generate&quot;, END)</span></span>
<span class="line"><span>    .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>    const question = &quot;阿朱的结局是什么？&quot;;</span></span>
<span class="line"><span>    const kArg = 5;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>    const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>    const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>    console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;连接到 Milvus...&quot;);</span></span>
<span class="line"><span>    vectorStore = await Milvus.fromExistingCollection(embeddings, {</span></span>
<span class="line"><span>        collectionName: COLLECTION_NAME,</span></span>
<span class="line"><span>        url: &quot;localhost:19530&quot;,</span></span>
<span class="line"><span>        textField: &quot;content&quot;,</span></span>
<span class="line"><span>        primaryField: &quot;id&quot;,</span></span>
<span class="line"><span>        vectorField: &quot;vector&quot;,</span></span>
<span class="line"><span>        indexCreateOptions: {</span></span>
<span class="line"><span>            metric_type: &quot;COSINE&quot;,</span></span>
<span class="line"><span>            index_type: &quot;HNSW&quot;,</span></span>
<span class="line"><span>            params: { M: 16, efConstruction: 200 },</span></span>
<span class="line"><span>            search_params: { ef: 64 },</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    vectorStore.indexSearchParams = { metric_type: &quot;COSINE&quot;, params: JSON.stringify({ ef: 64 }) };</span></span>
<span class="line"><span>    console.log(&quot;✓ 已连接\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>        await vectorStore.client.loadCollection({ collection_name: COLLECTION_NAME });</span></span>
<span class="line"><span>        console.log(\`✓ 集合 \${COLLECTION_NAME} 已加载\\n\`);</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>        if (!error.message.includes(&quot;already loaded&quot;)) {</span></span>
<span class="line"><span>            throw error;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        console.log(\`✓ 集合 \${COLLECTION_NAME} 已处于加载状态\\n\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span>    console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>    console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await graph.invoke({</span></span>
<span class="line"><span>        question,</span></span>
<span class="line"><span>        k: Number.isFinite(kArg) ? kArg : TOP_K,</span></span>
<span class="line"><span>        documents: [],</span></span>
<span class="line"><span>        generation: &quot;&quot;,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n【检索相关内容】&quot;);</span></span>
<span class="line"><span>    if (result.documents.length === 0) {</span></span>
<span class="line"><span>        console.log(&quot;未找到相关内容&quot;);</span></span>
<span class="line"><span>        console.log(&quot;\\n【AI 回答】&quot;);</span></span>
<span class="line"><span>        console.log(&quot;抱歉，我没有找到相关的《天龙八部》内容。&quot;);</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        result.documents.forEach((item, i) =&gt; {</span></span>
<span class="line"><span>            console.log(\`\\n[片段 \${i + 1}] 相似度: \${item.score.toFixed(4)}\`);</span></span>
<span class="line"><span>            console.log(\`书籍: \${item.book_id}\`);</span></span>
<span class="line"><span>            console.log(\`章节: 第 \${item.chapter_num} 章\`);</span></span>
<span class="line"><span>            console.log(\`片段索引: \${item.index}\`);</span></span>
<span class="line"><span>            console.log(</span></span>
<span class="line"><span>                \`内容: \${item.content.substring(0, 200)}\${item.content.length &gt; 200 ? &quot;...&quot; : &quot;&quot;}\`,</span></span>
<span class="line"><span>            );</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (!result.generation) {</span></span>
<span class="line"><span>        console.log(&quot;\\n【AI 回答】&quot;);</span></span>
<span class="line"><span>        console.log(&quot;模型未返回内容。&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main()</span></span></code></pre></div><p>RAG 是一个线性的流程，之前用 LCEL 的链写过，这次用 langgraph 来写：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdunicrEhUzRHtsAjCgxK1OcgyjWBCnCdVtnPdQsapia3pAuwibAOicFFwoTzL7qRSanVlcgxRR13hy67N6VMCoXQkfru2vlqBUOMY/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffgNLicibiayx6jqvo7nmWhsOTVzIGzJSp1duKg5RR4X6el90uwltnkpvxM0JGSYAOb8hMGymiadWjGIoCuTiaSfGricGUEZ7TVgeKsQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=3" alt="图片" referrerpolicy="no-referrer"></p><p>检索节点就是把 query 向量化从 Milvus 里检索相关文档：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeP9fxEGFibd13jYLq70Wpfup6NrYYHKVBwhFvG3oOTicMnicJPnY9FwFyydz4Jib0h1cxvNDd383KyeDMmRDLTtvPszI93UxExkj0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=4" alt="图片" referrerpolicy="no-referrer"></p><p>生成节点是把检索的文档放到 prompt 里，调用大模型生成回答：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcJTGhXsHDiaLpWew3qxA4zZiabbWo5gP2fmWeMZ7f5NJ8CUXiaj0Gs4qhDdWa6UMHUeK4rdQRwSsFJLpBiau0BIQDg7wVauq4to0o/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=5" alt="图片" referrerpolicy="no-referrer"></p><p>然后我们一条条来解决上面的问题。</p><p>首先是这个：</p><ul><li>让模型根据问题类型选择检索策略，简单问题直接回答，复杂问题才走完整检索</li></ul><p>这个就是加一个节点来做判断，是直接回答，还是先检索向量数据库再回答</p><p>src/rag-query-router.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { Milvus } from&quot;@langchain/community/vectorstores/milvus&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const llm = new ChatOpenAI({</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>model: &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>      baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>model: &quot;text-embedding-v3&quot;,</span></span>
<span class="line"><span>dimensions: 1024,</span></span>
<span class="line"><span>configuration: { </span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL </span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const RouteSchema = z.object({</span></span>
<span class="line"><span>strategy: z.enum([&quot;simple&quot;, &quot;complex&quot;]),</span></span>
<span class="line"><span>reason: z.string(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const GraphState = Annotation.Root({</span></span>
<span class="line"><span>question: Annotation,</span></span>
<span class="line"><span>k: Annotation,</span></span>
<span class="line"><span>strategy: Annotation,</span></span>
<span class="line"><span>routeReason: Annotation,</span></span>
<span class="line"><span>documents: Annotation,</span></span>
<span class="line"><span>generation: Annotation,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let vectorStore;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction retrieveRelevantContent(question, k) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const docsWithScores = await vectorStore.similaritySearchWithScore(question, k);</span></span>
<span class="line"><span>    return docsWithScores.map(([doc, score]) =&gt; ({</span></span>
<span class="line"><span>      score,</span></span>
<span class="line"><span>      content: doc.pageContent,</span></span>
<span class="line"><span>      id: doc.metadata?.id ?? &quot;unknown&quot;,</span></span>
<span class="line"><span>      book_id: doc.metadata?.book_id ?? &quot;未知&quot;,</span></span>
<span class="line"><span>      chapter_num: doc.metadata?.chapter_num ?? &quot;未知&quot;,</span></span>
<span class="line"><span>      index: doc.metadata?.index ?? &quot;未知&quot;,</span></span>
<span class="line"><span>    }));</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;检索内容时出错:&quot;, error.message);</span></span>
<span class="line"><span>    return [];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const routeQuestionNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---ROUTE_QUESTION---&quot;);</span></span>
<span class="line"><span>const router = llm.withStructuredOutput(RouteSchema);</span></span>
<span class="line"><span>const route = await router.invoke(\`</span></span>
<span class="line"><span>你是问答路由器。请判断用户问题是否需要外部检索。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>规则：</span></span>
<span class="line"><span>- simple: 常识问答、简短定义、无需特定小说细节即可回答。</span></span>
<span class="line"><span>- complex: 需要《天龙八部》具体情节、人物关系、章节事实、原文细节或证据支持。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题：\${state.question}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`路由策略: \${route.strategy} (\${route.reason})\`);</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    question: state.question,</span></span>
<span class="line"><span>    k: state.k,</span></span>
<span class="line"><span>    strategy: route.strategy,</span></span>
<span class="line"><span>    routeReason: route.reason,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retrieveNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---RETRIEVE---&quot;);</span></span>
<span class="line"><span>const documents = await retrieveRelevantContent(state.question, state.k);</span></span>
<span class="line"><span>if (documents.length === 0) {</span></span>
<span class="line"><span>    console.log(&quot;RETRIEVE结果: 未命中文档&quot;);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    console.log(\`RETRIEVE结果: 命中 \${documents.length} 条\`);</span></span>
<span class="line"><span>    documents.forEach((item, i) =&gt; {</span></span>
<span class="line"><span>      const preview =</span></span>
<span class="line"><span>        item.content.length &gt; 120 ? \`\${item.content.substring(0, 120)}...\` : item.content;</span></span>
<span class="line"><span>      console.log(</span></span>
<span class="line"><span>        \`[R\${i + 1}] score=\${Number(item.score).toFixed(4)} chapter=\${item.chapter_num} index=\${item.index}\`,</span></span>
<span class="line"><span>      );</span></span>
<span class="line"><span>      console.log(\`      \${preview}\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    question: state.question,</span></span>
<span class="line"><span>    k: state.k,</span></span>
<span class="line"><span>    strategy: state.strategy,</span></span>
<span class="line"><span>    routeReason: state.routeReason,</span></span>
<span class="line"><span>    documents,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const directAnswerNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---DIRECT_ANSWER---&quot;);</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>let generation = &quot;&quot;;</span></span>
<span class="line"><span>const stream = await llm.stream(\`你是一个中文问答助手，请直接简洁回答问题。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题：\${state.question}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span>forawait (const chunk of stream) {</span></span>
<span class="line"><span>    const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>    if (!text) continue;</span></span>
<span class="line"><span>    generation += text;</span></span>
<span class="line"><span>    process.stdout.write(text);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    question: state.question,</span></span>
<span class="line"><span>    k: state.k,</span></span>
<span class="line"><span>    strategy: state.strategy,</span></span>
<span class="line"><span>    routeReason: state.routeReason,</span></span>
<span class="line"><span>    documents: [],</span></span>
<span class="line"><span>    generation,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const ragGenerateNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---RAG_GENERATE---&quot;);</span></span>
<span class="line"><span>const context = state.documents</span></span>
<span class="line"><span>    .map(</span></span>
<span class="line"><span>      (item, i) =&gt;</span></span>
<span class="line"><span>        \`[片段 \${i + 1}]</span></span>
<span class="line"><span>章节: 第 \${item.chapter_num} 章</span></span>
<span class="line"><span>内容: \${item.content}\`,</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span>    .join(&quot;\\n\\n━━━━━\\n\\n&quot;);</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>let generation = &quot;&quot;;</span></span>
<span class="line"><span>const stream = await llm.stream(\`你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确、详细的语言。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请根据以下《天龙八部》小说片段内容回答问题：</span></span>
<span class="line"><span>\${context || &quot;（未检索到相关内容）&quot;}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题: \${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回答要求：</span></span>
<span class="line"><span>1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答</span></span>
<span class="line"><span>2. 可以综合多个片段的内容，提供完整的答案</span></span>
<span class="line"><span>3. 如果片段中没有相关信息，请如实告知用户</span></span>
<span class="line"><span>4. 回答要准确，符合小说的情节和人物设定</span></span>
<span class="line"><span>5. 可以引用原文内容来支持你的回答</span></span>
<span class="line"><span></span></span>
<span class="line"><span>AI 助手的回答:\`);</span></span>
<span class="line"><span>forawait (const chunk of stream) {</span></span>
<span class="line"><span>    const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>    if (!text) continue;</span></span>
<span class="line"><span>    generation += text;</span></span>
<span class="line"><span>    process.stdout.write(text);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    question: state.question,</span></span>
<span class="line"><span>    k: state.k,</span></span>
<span class="line"><span>    strategy: state.strategy,</span></span>
<span class="line"><span>    routeReason: state.routeReason,</span></span>
<span class="line"><span>    documents: state.documents,</span></span>
<span class="line"><span>    generation,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function decideNext(state) {</span></span>
<span class="line"><span>return state.strategy === &quot;simple&quot; ? &quot;direct_answer&quot; : &quot;retrieve&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(GraphState)</span></span>
<span class="line"><span>  .addNode(&quot;route_question&quot;, routeQuestionNode)</span></span>
<span class="line"><span>  .addNode(&quot;direct_answer&quot;, directAnswerNode)</span></span>
<span class="line"><span>  .addNode(&quot;retrieve&quot;, retrieveNode)</span></span>
<span class="line"><span>  .addNode(&quot;rag_generate&quot;, ragGenerateNode)</span></span>
<span class="line"><span>  .addEdge(START, &quot;route_question&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;route_question&quot;, decideNext, {</span></span>
<span class="line"><span>    direct_answer: &quot;direct_answer&quot;,</span></span>
<span class="line"><span>    retrieve: &quot;retrieve&quot;,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .addEdge(&quot;retrieve&quot;, &quot;rag_generate&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;direct_answer&quot;, END)</span></span>
<span class="line"><span>  .addEdge(&quot;rag_generate&quot;, END)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const question = &quot;阿朱的结局是什么？&quot;;</span></span>
<span class="line"><span>const k = 5;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 导出为 Mermaid：可复制到 https://mermaid.live 或 Markdown 的 \`\`\`mermaid 代码块</span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>const mermaid = drawable.drawMermaid({ withStyles: true });</span></span>
<span class="line"><span>console.log(mermaid);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;连接到 Milvus...&quot;);</span></span>
<span class="line"><span>  vectorStore = await Milvus.fromExistingCollection(embeddings, {</span></span>
<span class="line"><span>    collectionName: &quot;ebook_collection&quot;,</span></span>
<span class="line"><span>    url: &quot;localhost:19530&quot;,</span></span>
<span class="line"><span>    textField: &quot;content&quot;,</span></span>
<span class="line"><span>    primaryField: &quot;id&quot;,</span></span>
<span class="line"><span>    vectorField: &quot;vector&quot;,</span></span>
<span class="line"><span>    indexCreateOptions: {</span></span>
<span class="line"><span>      metric_type: &quot;COSINE&quot;,</span></span>
<span class="line"><span>      index_type: &quot;HNSW&quot;,</span></span>
<span class="line"><span>      params: { M: 16, efConstruction: 200 },</span></span>
<span class="line"><span>      search_params: { ef: 64 },</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  vectorStore.indexSearchParams = { metric_type: &quot;COSINE&quot;, params: JSON.stringify({ ef: 64 }) };</span></span>
<span class="line"><span>console.log(&quot;✓ 已连接\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    await vectorStore.client.loadCollection({ collection_name: &quot;ebook_collection&quot; });</span></span>
<span class="line"><span>    console.log(&quot;✓ 集合 ebook_collection 已加载\\n&quot;);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    if (!error.message.includes(&quot;already loaded&quot;)) {</span></span>
<span class="line"><span>      throw error;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    console.log(&quot;✓ 集合 ebook_collection 已处于加载状态\\n&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span>console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await graph.invoke({</span></span>
<span class="line"><span>    question,</span></span>
<span class="line"><span>    k: Number.isFinite(k) ? k : 5,</span></span>
<span class="line"><span>    strategy: &quot;&quot;,</span></span>
<span class="line"><span>    routeReason: &quot;&quot;,</span></span>
<span class="line"><span>    documents: [],</span></span>
<span class="line"><span>    generation: &quot;&quot;,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (result.strategy === &quot;complex&quot;) {</span></span>
<span class="line"><span>    console.log(&quot;\\n【检索相关内容】&quot;);</span></span>
<span class="line"><span>    if (result.documents.length === 0) {</span></span>
<span class="line"><span>      console.log(&quot;未找到相关内容&quot;);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      result.documents.forEach((item, i) =&gt; {</span></span>
<span class="line"><span>        console.log(\`\\n[片段 \${i + 1}] 相似度: \${item.score.toFixed(4)}\`);</span></span>
<span class="line"><span>        console.log(\`书籍: \${item.book_id}\`);</span></span>
<span class="line"><span>        console.log(\`章节: 第 \${item.chapter_num} 章\`);</span></span>
<span class="line"><span>        console.log(\`片段索引: \${item.index}\`);</span></span>
<span class="line"><span>        console.log(</span></span>
<span class="line"><span>          \`内容: \${item.content.substring(0, 200)}\${item.content.length &gt; 200 ? &quot;...&quot; : &quot;&quot;}\`,</span></span>
<span class="line"><span>        );</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`\\n最终策略: \${result.strategy}\`);</span></span>
<span class="line"><span>if (!result.generation?.trim()) {</span></span>
<span class="line"><span>    console.log(&quot;模型未返回内容。&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main()</span></span></code></pre></div><p>现在的 graph 如下：<img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwff8uy93W35QiaQF8rLu7uG1GtgUvNn7JsBZUDGyhjjsnRy1ysCJv9G5IBmicbnj2TUmqjUG9ot4qkO82wOP0bjgHxby6XMoVZ0gQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=6" alt="图片" referrerpolicy="no-referrer"></p><p>我们加了一个对问题做路由的节点：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdIvqQ3nGpVTrGMQiafERibF3qibYDpp7AV3N573oqJ2JaRwDtVx4H5kicxOTFmEqTWKPsrflbMPQ5GLfMhqLxQoPC2s102jKiaFRNw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" alt="图片" referrerpolicy="no-referrer"></p><p>根据问题返回不同的类型，然后用 conditional edge 转到不同节点来处理</p><p>这个路由节点用 withStructuredOutput 来控制结构化输出</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcaUsM7gZ1ibddicxbVibuicicTzzhExjeacALra2n1C8Ws3HDHawRJF1lb1bibotIzhwmbjqmwIWXm5MU5tSQfFjAruEHquBTXNYc2k/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=8" alt="图片" referrerpolicy="no-referrer"></p><p>用大模型识别 query 是哪种类型，并给出原因</p><p>简单问题直接调大模型回答，复杂的问题先检索向量数据库再生成回答</p><p>这样就能识别出与小说相关的问题才走检索了。</p><p>继续来优化现在 RAG 的问题：</p><ul><li>处理不了需要多步检索的复杂问题，比如先查 A、再查 B 才能得出结论</li></ul><p>比如这种：段誉遇到的第一个神仙姐姐画像，是谁的弟子？</p><p>直接把这个 query 向量化匹配显然不够准确</p><p>应该是先检索神仙姐姐画像是谁，有了结果再去检索她是谁的弟子。</p><p>所以我们要支持下子问题的拆分：</p><p>src/rag-multihop.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { Milvus } from&quot;@langchain/community/vectorstores/milvus&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const llm = new ChatOpenAI({</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>model: &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>model: &quot;text-embedding-v3&quot;,</span></span>
<span class="line"><span>dimensions: 1024,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * complex：先拆解子问题序列，再按序检索</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>const GraphState = Annotation.Root({</span></span>
<span class="line"><span>question: Annotation,</span></span>
<span class="line"><span>k: Annotation,</span></span>
<span class="line"><span>strategy: Annotation,</span></span>
<span class="line"><span>routeReason: Annotation,</span></span>
<span class="line"><span>/** 拆解得到的有序子问题，仅用于检索 */</span></span>
<span class="line"><span>subQuestions: Annotation,</span></span>
<span class="line"><span>/** 下一轮 retrieve 要用的下标（指向 subQuestions 中尚未检索的那一条） */</span></span>
<span class="line"><span>nextSubIdx: Annotation,</span></span>
<span class="line"><span>documents: Annotation,</span></span>
<span class="line"><span>currentQuery: Annotation,</span></span>
<span class="line"><span>retrievalCount: Annotation,</span></span>
<span class="line"><span>maxRetrievals: Annotation,</span></span>
<span class="line"><span>plannedNext: Annotation,</span></span>
<span class="line"><span>generation: Annotation,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let vectorStore;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction retrieveRelevantContent(question, k) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const docsWithScores = await vectorStore.similaritySearchWithScore(question, k);</span></span>
<span class="line"><span>    return docsWithScores.map(([doc, score]) =&gt; ({</span></span>
<span class="line"><span>      score,</span></span>
<span class="line"><span>      content: doc.pageContent,</span></span>
<span class="line"><span>      id: doc.metadata?.id ?? &quot;unknown&quot;,</span></span>
<span class="line"><span>      book_id: doc.metadata?.book_id ?? &quot;未知&quot;,</span></span>
<span class="line"><span>      chapter_num: doc.metadata?.chapter_num ?? &quot;未知&quot;,</span></span>
<span class="line"><span>      index: doc.metadata?.index ?? &quot;未知&quot;,</span></span>
<span class="line"><span>    }));</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;检索内容时出错:&quot;, error.message);</span></span>
<span class="line"><span>    return [];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 按 id 合并；同 id 保留更高 score */</span></span>
<span class="line"><span>function mergeUnique(existingDocs, newDocs) {</span></span>
<span class="line"><span>const map = newMap();</span></span>
<span class="line"><span>for (const d of [...existingDocs, ...newDocs]) {</span></span>
<span class="line"><span>    const key = String(d.id);</span></span>
<span class="line"><span>    const prev = map.get(key);</span></span>
<span class="line"><span>    if (!prev || Number(d.score) &gt; Number(prev.score)) {</span></span>
<span class="line"><span>      map.set(key, d);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>returnArray.from(map.values()).sort((a, b) =&gt;Number(b.score) - Number(a.score));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const RouteSchema = z.object({</span></span>
<span class="line"><span>strategy: z.enum([&quot;simple&quot;, &quot;complex&quot;]),</span></span>
<span class="line"><span>reason: z.string(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const DecomposeSchema = z.object({</span></span>
<span class="line"><span>sub_questions: z.array(z.string()).min(1).max(8),</span></span>
<span class="line"><span>reason: z.string(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const NextStepSchema = z.object({</span></span>
<span class="line"><span>nextAction: z.enum([&quot;retrieve&quot;, &quot;generate&quot;]),</span></span>
<span class="line"><span>reason: z.string(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const routeQuestionNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---ROUTE_QUESTION---&quot;);</span></span>
<span class="line"><span>const router = llm.withStructuredOutput(RouteSchema);</span></span>
<span class="line"><span>const route = await router.invoke(\`</span></span>
<span class="line"><span>你是问答路由器。请判断用户问题是否需要外部检索。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>规则：</span></span>
<span class="line"><span>- simple: 常识问答、简短定义、无需特定小说细节即可回答。</span></span>
<span class="line"><span>- complex: 需要《天龙八部》具体情节、人物关系、章节事实、原文细节或证据支持。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题：\${state.question}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`路由策略: \${route.strategy} (\${route.reason})\`);</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    strategy: route.strategy,</span></span>
<span class="line"><span>    routeReason: route.reason,</span></span>
<span class="line"><span>    retrievalCount: 0,</span></span>
<span class="line"><span>    maxRetrievals: state.maxRetrievals ?? 8,</span></span>
<span class="line"><span>    documents: [],</span></span>
<span class="line"><span>    subQuestions: [],</span></span>
<span class="line"><span>    nextSubIdx: 0,</span></span>
<span class="line"><span>    currentQuery: &quot;&quot;,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const decomposeQuestionNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---DECOMPOSE_QUESTION---&quot;);</span></span>
<span class="line"><span>const decomposer = llm.withStructuredOutput(DecomposeSchema);</span></span>
<span class="line"><span>const out = await decomposer.invoke(\`你是《天龙八部》多跳问答的「子问题拆解器」。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户原始问题：</span></span>
<span class="line"><span>\${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>任务：将问题拆成**有序**子问题列表 sub_questions，用于**依次向量检索**。要求：</span></span>
<span class="line"><span>1. 链式推理、多层关系、因果先后的问题，必须拆成多条；单跳即可答的也可只输出 1 条。</span></span>
<span class="line"><span>2. 每条子问题必须是**可独立检索**的完整中文问句，**禁止**使用「他/她/此人/上文」等指代；可写全人物名与事件名。</span></span>
<span class="line"><span>3. 顺序必须符合推理链：先搞清前置实体/事实，再查后续结论。</span></span>
<span class="line"><span>4. **不要**把整句原题原样复制成唯一一条（除非确实无法拆分）；不要拆成过碎的关键词列表。</span></span>
<span class="line"><span>5. 输出 1～8 条即可。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请输出 sub_questions 与简短 reason。\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const subQuestions = out.sub_questions.map((s) =&gt; s.trim()).filter(Boolean);</span></span>
<span class="line"><span>if (subQuestions.length === 0) {</span></span>
<span class="line"><span>    thrownewError(&quot;decompose_question: sub_questions 为空&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`拆解 \${subQuestions.length} 条子问题 (\${out.reason})\`);</span></span>
<span class="line"><span>  subQuestions.forEach((q, i) =&gt; {</span></span>
<span class="line"><span>    console.log(\`  [\${i + 1}] \${q}\`);</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    subQuestions,</span></span>
<span class="line"><span>    nextSubIdx: 0,</span></span>
<span class="line"><span>    currentQuery: subQuestions[0],</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retrieveNode = async (state) =&gt; {</span></span>
<span class="line"><span>const subs = state.subQuestions ?? [];</span></span>
<span class="line"><span>const idx = state.nextSubIdx ?? 0;</span></span>
<span class="line"><span>const q = subs[idx]?.trim();</span></span>
<span class="line"><span>if (!q) {</span></span>
<span class="line"><span>    thrownewError(\`retrieve: 子问题下标 \${idx} 无有效文本（共 \${subs.length} 条）\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const round = state.retrievalCount + 1;</span></span>
<span class="line"><span>console.log(\`---RETRIEVE (第 \${round} 轮，子问题 \${idx + 1}/\${subs.length})---\`);</span></span>
<span class="line"><span>console.log(\`查询: \${q}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const newDocs = await retrieveRelevantContent(q, state.k);</span></span>
<span class="line"><span>const merged = mergeUnique(state.documents ?? [], newDocs);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (newDocs.length === 0) {</span></span>
<span class="line"><span>    console.log(&quot;本轮未命中文档&quot;);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    console.log(\`本轮命中 \${newDocs.length} 条，累计去重后 \${merged.length} 条\`);</span></span>
<span class="line"><span>    newDocs.forEach((item, i) =&gt; {</span></span>
<span class="line"><span>      const preview =</span></span>
<span class="line"><span>        item.content.length &gt; 120 ? \`\${item.content.substring(0, 120)}...\` : item.content;</span></span>
<span class="line"><span>      console.log(</span></span>
<span class="line"><span>        \`[R\${i + 1}] score=\${Number(item.score).toFixed(4)} chapter=\${item.chapter_num} index=\${item.index}\`,</span></span>
<span class="line"><span>      );</span></span>
<span class="line"><span>      console.log(\`      \${preview}\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    documents: merged,</span></span>
<span class="line"><span>    retrievalCount: round,</span></span>
<span class="line"><span>    nextSubIdx: idx + 1,</span></span>
<span class="line"><span>    currentQuery: q,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const planNextStepNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---PLAN_NEXT_STEP---&quot;);</span></span>
<span class="line"><span>const subs = state.subQuestions ?? [];</span></span>
<span class="line"><span>const nextIdx = state.nextSubIdx ?? 0;</span></span>
<span class="line"><span>const remaining = subs.length - nextIdx;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const subList = subs.map((s, i) =&gt;\`\${i + 1}. \${s}\${i &lt; nextIdx ? &quot; （已检索）&quot; : i === nextIdx ? &quot; （下一轮将检索，若选择继续）&quot; : &quot; （未检索）&quot;}\`).join(&quot;\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const docStr =</span></span>
<span class="line"><span>    state.documents.length === 0</span></span>
<span class="line"><span>      ? &quot;（尚无检索结果）&quot;</span></span>
<span class="line"><span>      : state.documents</span></span>
<span class="line"><span>          .slice(0, 6)</span></span>
<span class="line"><span>          .map(</span></span>
<span class="line"><span>            (d, i) =&gt;</span></span>
<span class="line"><span>              \`[\${i + 1}] score=\${Number(d.score).toFixed(4)} 第\${d.chapter_num}章: \${d.content.slice(0, 200)}\${d.content.length &gt; 200 ? &quot;...&quot; : &quot;&quot;}\`,</span></span>
<span class="line"><span>          )</span></span>
<span class="line"><span>          .join(&quot;\\n\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = \`你是多跳 RAG 规划器。检索查询已由前置步骤拆解为**有序子问题**；若需继续检索，下一轮将自动使用「下一条子问题」做向量检索，你**不要**自拟新的检索句。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户原始问题：\${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>子问题序列：</span></span>
<span class="line"><span>\${subList || &quot;（无）&quot;}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>已检索轮数：\${state.retrievalCount}；剩余未检索子问题条数：\${remaining}</span></span>
<span class="line"><span>最大检索轮数上限：\${state.maxRetrievals}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>已召回文档摘要：</span></span>
<span class="line"><span>\${docStr}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请判断下一步：</span></span>
<span class="line"><span>1) 已有足够依据回答用户原始问题 → nextAction=generate</span></span>
<span class="line"><span>2) 仍缺关键事实、且仍存在未检索的子问题、且未超过轮数上限 → nextAction=retrieve</span></span>
<span class="line"><span></span></span>
<span class="line"><span>硬性规则：</span></span>
<span class="line"><span>- 若剩余未检索子问题条数为 0，必须 nextAction=generate。</span></span>
<span class="line"><span>- 若已检索轮数已达到或超过最大检索轮数，必须 nextAction=generate。\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = llm.withStructuredOutput(NextStepSchema);</span></span>
<span class="line"><span>const { nextAction, reason } = await model.invoke(prompt);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let finalNext = nextAction;</span></span>
<span class="line"><span>if (state.retrievalCount &gt;= state.maxRetrievals) finalNext = &quot;generate&quot;;</span></span>
<span class="line"><span>if (remaining &lt;= 0) finalNext = &quot;generate&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`[决策] plannedNext=\${finalNext} (模型建议=\${nextAction}) (\${reason})\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    plannedNext: finalNext,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function afterRoute(state) {</span></span>
<span class="line"><span>return state.strategy === &quot;simple&quot; ? &quot;direct_answer&quot; : &quot;decompose_question&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function afterPlan(state) {</span></span>
<span class="line"><span>return state.plannedNext === &quot;retrieve&quot; ? &quot;retrieve&quot; : &quot;generate&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const directAnswerNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---DIRECT_ANSWER---&quot;);</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>let generation = &quot;&quot;;</span></span>
<span class="line"><span>const stream = await llm.stream(\`你是一个中文问答助手，请直接简洁回答问题。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题：\${state.question}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span>forawait (const chunk of stream) {</span></span>
<span class="line"><span>    const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>    if (!text) continue;</span></span>
<span class="line"><span>    generation += text;</span></span>
<span class="line"><span>    process.stdout.write(text);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span>return { generation };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const generateNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---GENERATE---&quot;);</span></span>
<span class="line"><span>const context = state.documents</span></span>
<span class="line"><span>    .map(</span></span>
<span class="line"><span>      (item, i) =&gt;</span></span>
<span class="line"><span>        \`[片段 \${i + 1}]</span></span>
<span class="line"><span>章节: 第 \${item.chapter_num} 章</span></span>
<span class="line"><span>内容: \${item.content}\`,</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span>    .join(&quot;\\n\\n━━━━━\\n\\n&quot;);</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>let generation = &quot;&quot;;</span></span>
<span class="line"><span>const stream = await llm.stream(\`你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确、详细的语言。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请根据以下《天龙八部》小说片段内容回答问题：</span></span>
<span class="line"><span>\${context || &quot;（未检索到相关内容）&quot;}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题: \${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回答要求：</span></span>
<span class="line"><span>1. 如果片段中有相关信息，请结合小说内容给出详细、准确的回答</span></span>
<span class="line"><span>2. 可以综合多个片段的内容，提供完整的答案</span></span>
<span class="line"><span>3. 如果片段中没有相关信息，请如实告知用户</span></span>
<span class="line"><span>4. 回答要准确，符合小说的情节和人物设定</span></span>
<span class="line"><span>5. 可以引用原文内容来支持你的回答</span></span>
<span class="line"><span></span></span>
<span class="line"><span>AI 助手的回答:\`);</span></span>
<span class="line"><span>forawait (const chunk of stream) {</span></span>
<span class="line"><span>    const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>    if (!text) continue;</span></span>
<span class="line"><span>    generation += text;</span></span>
<span class="line"><span>    process.stdout.write(text);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span>return { generation };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(GraphState)</span></span>
<span class="line"><span>  .addNode(&quot;route_question&quot;, routeQuestionNode)</span></span>
<span class="line"><span>  .addNode(&quot;direct_answer&quot;, directAnswerNode)</span></span>
<span class="line"><span>  .addNode(&quot;decompose_question&quot;, decomposeQuestionNode)</span></span>
<span class="line"><span>  .addNode(&quot;retrieve&quot;, retrieveNode)</span></span>
<span class="line"><span>  .addNode(&quot;plan_next_step&quot;, planNextStepNode)</span></span>
<span class="line"><span>  .addNode(&quot;generate&quot;, generateNode)</span></span>
<span class="line"><span>  .addEdge(START, &quot;route_question&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;route_question&quot;, afterRoute, {</span></span>
<span class="line"><span>    direct_answer: &quot;direct_answer&quot;,</span></span>
<span class="line"><span>    decompose_question: &quot;decompose_question&quot;,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .addEdge(&quot;decompose_question&quot;, &quot;retrieve&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;retrieve&quot;, &quot;plan_next_step&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;plan_next_step&quot;, afterPlan, {</span></span>
<span class="line"><span>    retrieve: &quot;retrieve&quot;,</span></span>
<span class="line"><span>    generate: &quot;generate&quot;,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .addEdge(&quot;direct_answer&quot;, END)</span></span>
<span class="line"><span>  .addEdge(&quot;generate&quot;, END)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const question =</span></span>
<span class="line"><span>    &quot;《天龙八部》中「四大恶人」排行第二的是谁？此人之子在身世揭晓前，其生父在武林中的公开身份是什么？&quot;;</span></span>
<span class="line"><span>const k = 5;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>console.log(drawable.drawMermaid({ withStyles: true }));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;连接到 Milvus...&quot;);</span></span>
<span class="line"><span>  vectorStore = await Milvus.fromExistingCollection(embeddings, {</span></span>
<span class="line"><span>    collectionName: &quot;ebook_collection&quot;,</span></span>
<span class="line"><span>    url: &quot;localhost:19530&quot;,</span></span>
<span class="line"><span>    textField: &quot;content&quot;,</span></span>
<span class="line"><span>    primaryField: &quot;id&quot;,</span></span>
<span class="line"><span>    vectorField: &quot;vector&quot;,</span></span>
<span class="line"><span>    indexCreateOptions: {</span></span>
<span class="line"><span>      metric_type: &quot;COSINE&quot;,</span></span>
<span class="line"><span>      index_type: &quot;HNSW&quot;,</span></span>
<span class="line"><span>      params: { M: 16, efConstruction: 200 },</span></span>
<span class="line"><span>      search_params: { ef: 64 },</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  vectorStore.indexSearchParams = { metric_type: &quot;COSINE&quot;, params: JSON.stringify({ ef: 64 }) };</span></span>
<span class="line"><span>console.log(&quot;✓ 已连接\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    await vectorStore.client.loadCollection({ collection_name: &quot;ebook_collection&quot; });</span></span>
<span class="line"><span>    console.log(&quot;✓ 集合 ebook_collection 已加载\\n&quot;);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    if (!error.message.includes(&quot;already loaded&quot;)) {</span></span>
<span class="line"><span>      throw error;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    console.log(&quot;✓ 集合 ebook_collection 已处于加载状态\\n&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span>console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await graph.invoke({</span></span>
<span class="line"><span>    question,</span></span>
<span class="line"><span>    k: Number.isFinite(k) ? k : 5,</span></span>
<span class="line"><span>    strategy: &quot;&quot;,</span></span>
<span class="line"><span>    routeReason: &quot;&quot;,</span></span>
<span class="line"><span>    subQuestions: [],</span></span>
<span class="line"><span>    nextSubIdx: 0,</span></span>
<span class="line"><span>    documents: [],</span></span>
<span class="line"><span>    currentQuery: &quot;&quot;,</span></span>
<span class="line"><span>    retrievalCount: 0,</span></span>
<span class="line"><span>    maxRetrievals: 8,</span></span>
<span class="line"><span>    plannedNext: &quot;&quot;,</span></span>
<span class="line"><span>    generation: &quot;&quot;,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (result.strategy === &quot;complex&quot;) {</span></span>
<span class="line"><span>    if (result.subQuestions?.length) {</span></span>
<span class="line"><span>      console.log(&quot;\\n【子问题序列】&quot;);</span></span>
<span class="line"><span>      result.subQuestions.forEach((s, i) =&gt;console.log(\`  \${i + 1}. \${s}\`));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    console.log(&quot;\\n【检索相关内容（累计）】&quot;);</span></span>
<span class="line"><span>    if (result.documents.length === 0) {</span></span>
<span class="line"><span>      console.log(&quot;未找到相关内容&quot;);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      result.documents.forEach((item, i) =&gt; {</span></span>
<span class="line"><span>        console.log(\`\\n[片段 \${i + 1}] 相似度: \${Number(item.score).toFixed(4)}\`);</span></span>
<span class="line"><span>        console.log(\`书籍: \${item.book_id}\`);</span></span>
<span class="line"><span>        console.log(\`章节: 第 \${item.chapter_num} 章\`);</span></span>
<span class="line"><span>        console.log(\`片段索引: \${item.index}\`);</span></span>
<span class="line"><span>        console.log(</span></span>
<span class="line"><span>          \`内容: \${item.content.substring(0, 200)}\${item.content.length &gt; 200 ? &quot;...&quot; : &quot;&quot;}\`,</span></span>
<span class="line"><span>        );</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    console.log(\`\\n检索轮数: \${result.retrievalCount} / \${result.maxRetrievals}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`\\n最终策略: \${result.strategy}\`);</span></span>
<span class="line"><span>if (!result.generation?.trim()) {</span></span>
<span class="line"><span>    console.log(&quot;模型未返回内容。&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main().catch((err) =&gt; {</span></span>
<span class="line"><span>console.error(&quot;运行失败:&quot;, err);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>整体流程如图：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffUL51YnDm6INJZugEM5LZTlTGXoqXqh11l3ZSRzuicTplskrfKn2YkMUibiacp1gTYEowToI4gvfDuL9ia92EZjxWFPePqnhpqNQg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=9" alt="图片" referrerpolicy="no-referrer"></p><p>首先拆分成多个子问题：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffZZGC3iaGVabVfrdMbQbsuXKjaPrJAbJGAYNP7gZnLSoIrFYEibleEbeg9LxGc5NWQot3jwXIZBp6r2V2Lj6uzfCHVibAPiauW2EA/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=10" alt="图片" referrerpolicy="no-referrer"></p><p>把原始问题拆成多个子问题的数组。</p><p>然后检索的时候根据 state 里的当前下标来检索对应问题的文档：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcZib9OfanJXMI6kzHZAibpVxmZAtka6yoLI34pVB2wXenskrUWIriafFqmVYB2D6qdb28dSHtiakgcsjaQw85fcewKQrAfnkKAcho/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=11" alt="图片" referrerpolicy="no-referrer"></p><p>这里因为会检索多轮，所以做了一下 id 的去重。</p><p>接下来判断是否检索完了，如果没有就继续检索：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcJr6WJiaibhqqVyFVZRmicVlQvSo1pfZbnkyjQOiazd35suYdp30kS44RRK8dEjcfGicZkuql6dUicJyTXVq0XTl3qVlPkxLuNT2b0E/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=12" alt="图片" referrerpolicy="no-referrer"></p><p>直到循环完，就检索完了所有子问题，接下来就生成回答就好了。</p><p>然后继续来看传统 RAG 的其他问题：</p><ul><li>本地知识库没有的内容，不会主动去网络搜索补充，容易编造答案</li></ul><p>如果知识库中没有的内容，这时候 agent 就不知道怎么回答了。</p><p>这种情况我们可以调用网络搜索来兜底，把搜索结果放到 prompt 里来参考生成回答。</p><p>src/rag-webfallback.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { z } from&quot;zod&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { Milvus } from&quot;@langchain/community/vectorstores/milvus&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const llm = new ChatOpenAI({</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>model: &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>model: &quot;text-embedding-v3&quot;,</span></span>
<span class="line"><span>dimensions: 1024,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const GraphState = Annotation.Root({</span></span>
<span class="line"><span>question: Annotation,</span></span>
<span class="line"><span>k: Annotation,</span></span>
<span class="line"><span>strategy: Annotation,</span></span>
<span class="line"><span>routeReason: Annotation,</span></span>
<span class="line"><span>retrievedDocs: Annotation,</span></span>
<span class="line"><span>localContext: Annotation,</span></span>
<span class="line"><span>webContext: Annotation,</span></span>
<span class="line"><span>evaluation: Annotation,</span></span>
<span class="line"><span>generation: Annotation,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let vectorStore;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction retrieveRelevantContent(query, k) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const docsWithScores = await vectorStore.similaritySearchWithScore(query, k);</span></span>
<span class="line"><span>    return docsWithScores.map(([doc, score]) =&gt; ({</span></span>
<span class="line"><span>      score,</span></span>
<span class="line"><span>      content: doc.pageContent,</span></span>
<span class="line"><span>      id: doc.metadata?.id ?? &quot;unknown&quot;,</span></span>
<span class="line"><span>      book_id: doc.metadata?.book_id ?? &quot;未知&quot;,</span></span>
<span class="line"><span>      chapter_num: doc.metadata?.chapter_num ?? &quot;未知&quot;,</span></span>
<span class="line"><span>      index: doc.metadata?.index ?? &quot;未知&quot;,</span></span>
<span class="line"><span>    }));</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;检索内容时出错:&quot;, error.message);</span></span>
<span class="line"><span>    return [];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const RouteSchema = z.object({</span></span>
<span class="line"><span>strategy: z.enum([&quot;simple&quot;, &quot;complex&quot;]),</span></span>
<span class="line"><span>reason: z.string(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const routeQuestionNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---ROUTE_QUESTION---&quot;);</span></span>
<span class="line"><span>const router = llm.withStructuredOutput(RouteSchema);</span></span>
<span class="line"><span>const route = await router.invoke(\`</span></span>
<span class="line"><span>你是问答路由器。请判断用户问题是否需要外部检索。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>规则：</span></span>
<span class="line"><span>- simple: 常识问答、简短定义、无需特定小说细节即可回答。</span></span>
<span class="line"><span>- complex: 需要《天龙八部》具体情节、人物关系、章节事实、原文细节或证据支持。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题：\${state.question}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span>console.log(\`路由策略: \${route.strategy} (\${route.reason})\`);</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    strategy: route.strategy,</span></span>
<span class="line"><span>    routeReason: route.reason,</span></span>
<span class="line"><span>    retrievedDocs: [],</span></span>
<span class="line"><span>    localContext: &quot;&quot;,</span></span>
<span class="line"><span>    webContext: &quot;&quot;,</span></span>
<span class="line"><span>    evaluation: &quot;&quot;,</span></span>
<span class="line"><span>    generation: &quot;&quot;,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const directAnswerNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---DIRECT_ANSWER---&quot;);</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>let generation = &quot;&quot;;</span></span>
<span class="line"><span>const stream = await llm.stream(\`你是一个中文问答助手，请直接简洁回答问题。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题：\${state.question}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span>forawait (const chunk of stream) {</span></span>
<span class="line"><span>    const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>    if (!text) continue;</span></span>
<span class="line"><span>    generation += text;</span></span>
<span class="line"><span>    process.stdout.write(text);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span>return { generation };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retrieveLocalNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---LOCAL_RETRIEVE---&quot;);</span></span>
<span class="line"><span>const retrievedDocs = await retrieveRelevantContent(state.question, state.k);</span></span>
<span class="line"><span>console.log(\`本地检索命中: \${retrievedDocs.length} 条\`);</span></span>
<span class="line"><span>const localContext = (retrievedDocs ?? []).map((d) =&gt; d.content).join(&quot;\\n\\n&quot;);</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    retrievedDocs,</span></span>
<span class="line"><span>    localContext,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const EvaluateSchema = z.object({</span></span>
<span class="line"><span>enough: z.boolean(),</span></span>
<span class="line"><span>missing: z.array(z.string()).max(6),</span></span>
<span class="line"><span>reason: z.string(),</span></span>
<span class="line"><span>web_query: z.string().optional(),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const evaluateNode = async (state) =&gt; {</span></span>
<span class="line"><span>const hasWeb = Boolean(state.webContext &amp;&amp; String(state.webContext).trim());</span></span>
<span class="line"><span>console.log(hasWeb ? &quot;---EVALUATE_CONTEXT_WITH_WEB---&quot; : &quot;---EVALUATE_LOCAL_CONTEXT---&quot;);</span></span>
<span class="line"><span>const evaluator = llm.withStructuredOutput(EvaluateSchema);</span></span>
<span class="line"><span>const out = await evaluator.invoke(\`你是信息充分性评估器。判断当前上下文是否足以回答用户问题。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题：\${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>已检索上下文（来自本地知识库）：</span></span>
<span class="line"><span>\${state.localContext || &quot;（空）&quot;}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${hasWeb ? \`联网搜索结果：\\n\${state.webContext || &quot;（空）&quot;}\\n\` : &quot;&quot;}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>输出字段：</span></span>
<span class="line"><span>- enough: 是否足够回答（true/false）</span></span>
<span class="line"><span>- missing: 若不够，列出缺失信息点（最多 6 条）</span></span>
<span class="line"><span>- reason: 简短原因</span></span>
<span class="line"><span>\${hasWeb ? &quot;&quot; : &quot;- web_query: 若不够，给出一个适合联网搜索的中文查询句（完整句，不用代词；为空也可）&quot;}</span></span>
<span class="line"><span>\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`\${hasWeb ? &quot;二次评估&quot; : &quot;评估&quot;}: enough=\${out.enough} (\${out.reason})\`);</span></span>
<span class="line"><span>if (!out.enough &amp;&amp; out.missing?.length) {</span></span>
<span class="line"><span>    out.missing.forEach((m, i) =&gt;console.log(\`  缺失\${i + 1}: \${m}\`));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    evaluation: JSON.stringify(out),</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Call Bocha Web Search API</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction bochaWebSearch(query, count) {</span></span>
<span class="line"><span>const apiKey = process.env.BOCHA_API_KEY;</span></span>
<span class="line"><span>if (!apiKey) {</span></span>
<span class="line"><span>    thrownewError(&quot;Bocha Web Search 的 API Key 未配置（环境变量 BOCHA_API_KEY）。&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>const url = &quot;https://api.bochaai.com/v1/web-search&quot;;</span></span>
<span class="line"><span>const body = {</span></span>
<span class="line"><span>    query,</span></span>
<span class="line"><span>    freshness: &quot;noLimit&quot;,</span></span>
<span class="line"><span>    summary: true,</span></span>
<span class="line"><span>    count: count ?? 10,</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let response;</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    response = await fetch(url, {</span></span>
<span class="line"><span>      method: &quot;POST&quot;,</span></span>
<span class="line"><span>      headers: {</span></span>
<span class="line"><span>        Authorization: \`Bearer \${apiKey}\`,</span></span>
<span class="line"><span>        &quot;Content-Type&quot;: &quot;application/json&quot;,</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      body: JSON.stringify(body),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    thrownewError(\`搜索 API 请求失败（网络错误）：\${error.message}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (!response.ok) {</span></span>
<span class="line"><span>    const errorText = await response.text().catch(() =&gt;&quot;&quot;);</span></span>
<span class="line"><span>    thrownewError(\`搜索 API 请求失败，状态码: \${response.status}, 错误信息: \${errorText}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let json;</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    json = await response.json();</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    thrownewError(\`搜索结果解析失败：\${error.message}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>if (json?.code !== 200 || !json?.data) {</span></span>
<span class="line"><span>    thrownewError(\`搜索 API 返回失败：\${json?.msg ?? &quot;未知错误&quot;}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const webpages = json.data.webPages?.value ?? [];</span></span>
<span class="line"><span>if (!webpages.length) {</span></span>
<span class="line"><span>    return&quot;未找到相关结果。&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return webpages</span></span>
<span class="line"><span>    .map(</span></span>
<span class="line"><span>      (page, idx) =&gt;\`引用: \${idx + 1}</span></span>
<span class="line"><span>标题: \${page.name}</span></span>
<span class="line"><span>URL: \${page.url}</span></span>
<span class="line"><span>摘要: \${page.summary}</span></span>
<span class="line"><span>网站名称: \${page.siteName}</span></span>
<span class="line"><span>网站图标: \${page.siteIcon}</span></span>
<span class="line"><span>发布时间: \${page.dateLastCrawled}\`,</span></span>
<span class="line"><span>    )</span></span>
<span class="line"><span>    .join(&quot;\\n\\n&quot;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const webSearchNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---WEB_SEARCH---&quot;);</span></span>
<span class="line"><span>const parsed = (() =&gt; {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      returnJSON.parse(state.evaluation || &quot;{}&quot;);</span></span>
<span class="line"><span>    } catch {</span></span>
<span class="line"><span>      return {};</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  })();</span></span>
<span class="line"><span>const query = (parsed.web_query ?? &quot;&quot;).trim() || state.question;</span></span>
<span class="line"><span>console.log(\`联网查询: \${query}\`);</span></span>
<span class="line"><span>const webContext = await bochaWebSearch(query, 8);</span></span>
<span class="line"><span>console.log(\`联网结果长度: \${webContext.length}\`);</span></span>
<span class="line"><span>return { webContext };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const generateNode = async (state) =&gt; {</span></span>
<span class="line"><span>console.log(&quot;---GENERATE---&quot;);</span></span>
<span class="line"><span>const context = [state.localContext, state.webContext].filter(Boolean).join(&quot;\\n\\n===== 联网补充 =====\\n\\n&quot;);</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n【AI 回答（流式）】\\n&quot;);</span></span>
<span class="line"><span>let generation = &quot;&quot;;</span></span>
<span class="line"><span>const stream = await llm.stream(\`你是一个严谨的中文问答助手。优先依据上下文作答，不要编造。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>上下文（本地知识库 + 可选联网补充）：</span></span>
<span class="line"><span>\${context || &quot;（空）&quot;}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题：\${state.question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回答要求：</span></span>
<span class="line"><span>1. 如果上下文足够，给出清晰、可核对的回答；需要时引用“引用: n / URL”或小说片段来支撑。</span></span>
<span class="line"><span>2. 如果上下文仍不足以确定关键事实，明确说明“不确定/无法从上下文确认”，并说明缺失点。</span></span>
<span class="line"><span>3. 不要输出表情符号。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回答：\`);</span></span>
<span class="line"><span>forawait (const chunk of stream) {</span></span>
<span class="line"><span>    const text = typeof chunk.content === &quot;string&quot; ? chunk.content : &quot;&quot;;</span></span>
<span class="line"><span>    if (!text) continue;</span></span>
<span class="line"><span>    generation += text;</span></span>
<span class="line"><span>    process.stdout.write(text);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  process.stdout.write(&quot;\\n&quot;);</span></span>
<span class="line"><span>return { generation };</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function afterRoute(state) {</span></span>
<span class="line"><span>return state.strategy === &quot;simple&quot; ? &quot;direct_answer&quot; : &quot;local_retrieve&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function afterEvaluateLocal(state) {</span></span>
<span class="line"><span>if (state.webContext &amp;&amp; String(state.webContext).trim()) {</span></span>
<span class="line"><span>    return&quot;generate&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>const parsed = (() =&gt; {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      returnJSON.parse(state.evaluation || &quot;{}&quot;);</span></span>
<span class="line"><span>    } catch {</span></span>
<span class="line"><span>      return {};</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  })();</span></span>
<span class="line"><span>return parsed.enough === true ? &quot;generate&quot; : &quot;web_search&quot;;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(GraphState)</span></span>
<span class="line"><span>  .addNode(&quot;route_question&quot;, routeQuestionNode)</span></span>
<span class="line"><span>  .addNode(&quot;direct_answer&quot;, directAnswerNode)</span></span>
<span class="line"><span>  .addNode(&quot;local_retrieve&quot;, retrieveLocalNode)</span></span>
<span class="line"><span>  .addNode(&quot;evaluate_local&quot;, evaluateNode)</span></span>
<span class="line"><span>  .addNode(&quot;web_search&quot;, webSearchNode)</span></span>
<span class="line"><span>  .addNode(&quot;generate&quot;, generateNode)</span></span>
<span class="line"><span>  .addEdge(START, &quot;route_question&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;route_question&quot;, afterRoute, {</span></span>
<span class="line"><span>    direct_answer: &quot;direct_answer&quot;,</span></span>
<span class="line"><span>    local_retrieve: &quot;local_retrieve&quot;,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .addEdge(&quot;local_retrieve&quot;, &quot;evaluate_local&quot;)</span></span>
<span class="line"><span>  .addConditionalEdges(&quot;evaluate_local&quot;, afterEvaluateLocal, {</span></span>
<span class="line"><span>    generate: &quot;generate&quot;,</span></span>
<span class="line"><span>    web_search: &quot;web_search&quot;,</span></span>
<span class="line"><span>  })</span></span>
<span class="line"><span>  .addEdge(&quot;web_search&quot;, &quot;evaluate_local&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;direct_answer&quot;, END)</span></span>
<span class="line"><span>  .addEdge(&quot;generate&quot;, END)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const question =</span></span>
<span class="line"><span>    &quot;请回答《天龙八部》小说里“雁门关事件”的主谋是谁，并说明其儿子的最终结局；另外请补充：在《天龙八部》2013 版电视剧中，这段“雁门关事件”主要出现在哪几集？请给出可核对的来源链接。&quot;;</span></span>
<span class="line"><span>const k = 8;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const drawable = await graph.getGraphAsync();</span></span>
<span class="line"><span>console.log(drawable.drawMermaid({ withStyles: true }));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;连接到 Milvus...&quot;);</span></span>
<span class="line"><span>  vectorStore = await Milvus.fromExistingCollection(embeddings, {</span></span>
<span class="line"><span>    collectionName: &quot;ebook_collection&quot;,</span></span>
<span class="line"><span>    url: &quot;localhost:19530&quot;,</span></span>
<span class="line"><span>    textField: &quot;content&quot;,</span></span>
<span class="line"><span>    primaryField: &quot;id&quot;,</span></span>
<span class="line"><span>    vectorField: &quot;vector&quot;,</span></span>
<span class="line"><span>    indexCreateOptions: {</span></span>
<span class="line"><span>      metric_type: &quot;COSINE&quot;,</span></span>
<span class="line"><span>      index_type: &quot;HNSW&quot;,</span></span>
<span class="line"><span>      params: { M: 16, efConstruction: 200 },</span></span>
<span class="line"><span>      search_params: { ef: 64 },</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  vectorStore.indexSearchParams = { metric_type: &quot;COSINE&quot;, params: JSON.stringify({ ef: 64 }) };</span></span>
<span class="line"><span>console.log(&quot;✓ 已连接\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    await vectorStore.client.loadCollection({ collection_name: &quot;ebook_collection&quot; });</span></span>
<span class="line"><span>    console.log(&quot;✓ 集合 ebook_collection 已加载\\n&quot;);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    if (!error.message.includes(&quot;already loaded&quot;)) throw error;</span></span>
<span class="line"><span>    console.log(&quot;✓ 集合 ebook_collection 已处于加载状态\\n&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span>console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await graph.invoke({</span></span>
<span class="line"><span>    question,</span></span>
<span class="line"><span>    k,</span></span>
<span class="line"><span>    strategy: &quot;&quot;,</span></span>
<span class="line"><span>    routeReason: &quot;&quot;,</span></span>
<span class="line"><span>    retrievedDocs: [],</span></span>
<span class="line"><span>    localContext: &quot;&quot;,</span></span>
<span class="line"><span>    webContext: &quot;&quot;,</span></span>
<span class="line"><span>    evaluation: &quot;&quot;,</span></span>
<span class="line"><span>    generation: &quot;&quot;,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`\\n最终策略: \${result.strategy}\`);</span></span>
<span class="line"><span>if (!result.generation?.trim()) {</span></span>
<span class="line"><span>    console.log(&quot;模型未返回内容。&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main()</span></span></code></pre></div><p>现在的流程如下：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfec1XlDKPibxibGmC4YDzcLhQ7icicX07TwK30zMyZtBDmlfdoxMRI28ibIfQzaY6FqfhNlpMPZAibZ0ZKw9CU7AyVsOZUvFKdG4hegc/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=13" alt="图片" referrerpolicy="no-referrer"></p><p>检索完向量数据库，会评估一下信息是否足够：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdWDrwT0MbL82Q83zOB7AiakAicdibGJKmWPHvA7kV9JxQdiblU1IJnLf0WlPia3rVRRxYiczl8ANV1GERlbSeZaGHNIib0QadsOAP4oM/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=14" alt="图片" referrerpolicy="no-referrer"></p><p>根据问题和检索的文档判断信息是否足够</p><p>不够的话生成一个 web search 用的 query，走网络搜索节点：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwferlcqsTyMaicvIkMubBPoCPLguRjv7OEDA1v9PIyrGuAsw5MKapfXjeAS1NHMjXnBZoQVLm63TBTEkM708GG1B26YJmgQVicvIw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=15" alt="图片" referrerpolicy="no-referrer"></p><p>取出 state 里的网络搜索 query，调用博查来搜索。</p><p>这里配置下博查的 api key：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfftAyaMH1OhIjlCFHWY6GSGgx1tINEJIMkHjEwIicqYRHxfE96FI1PPMSEg1Nbiaq5nK7L6ZLDToubx59L40oBicapfU6iciboDjctY/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=16" alt="图片" referrerpolicy="no-referrer"></p><p>继续来看 RAG 其他问题：</p><ul><li>没有纠错和评估机制，无法判断检索内容是否准确、是否足够</li><li>专业术语、精确实体更适合关键词检索，纯语义检索容易匹配不准</li></ul><p>评估阶段我们现在已经加了。</p><p>而关键词检索需要用到 ElasticSearch 全文检索数据库，后面再讲。</p><p>至此，我们基于 LangGraph 的多 Agent 架构实现了自主决策的 Agentic RAG 流程。</p><p>什么是 Agentic RAG 呢？</p><p><strong>将 LLM 作为系统的决策大脑，让它自主决定如何检索、检索多少次、判断检索结果是否足够可靠，以及是否需要补充检索、优化查询或切换数据源，这种自我决策、自我反思、自我修正的自主检索闭环，就叫 Agentic RAG。</strong></p><p>当然，具体要根据业务场景来设计实际方案。</p><p>比如我们公司项目的 RAG 是这样的：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwff3sBFvLjegHvfcnEIXcAhO9MFlPUtzWotCO60u8ILg7n4eC1SiaK1SpmbLSV9Byqs4ribGL7htD7bLlp7wrO7b4aicPAiaHxrKy5k/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=17" alt="图片" referrerpolicy="no-referrer"></p><p>有意图识别也就是路由，后面按照不同的流程来检索，之后合并生成回答</p><p>并不是完全按照 Agentic RAG 那种有评估、有重新检索的闭环来的。</p><p>但这是适合我们业务场景的 RAG 流程。</p><p>所以，学了 Agentic RAG 的各种策略并不是说都得用上，具体还是得根据业务场景来设计方案。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>传统的 RAG 流程很固定，用户问题向量化 → 相似度检索 → prompt 拼接 → 生成回答</p><p>但它有一系列的问题：</p><ul><li>简单常识问题也走向量检索，造成资源浪费</li><li>缺乏检索结果的评估与纠错机制，无法判断信息是否准确充足</li><li>无法处理需多步检索的链式推理问题</li><li>纯语义检索对专业术语、精确实体匹配不准</li><li>无联网补充能力，知识库缺失信息时易编造答案</li></ul><p>解决方案就是 Agentic RAG。</p><p>Agentic RAG 是由大模型作为决策中枢，自主控制检索方式、评估检索效果、判断是否需要补充检索或发起网络搜索，形成自主思考与迭代优化的闭环检索系统。</p><p>我们基于 LangGraph 的图，实现了这个闭环的决策循环，用多 Agent 架构实现了 Agentic RAG。</p><p>比如加入了意图识别路由、多跳检索的循环、效果评估和网络搜索（ElasticSearch 的关键词检索后面再学）</p><p>当然，具体的 Agentic RAG 还是要根据业务场景来设计，不是完全照搬，比如我们公司项目就是简化版相对固定的检索流程。</p><p>主要是理解什么是 Agentic RAG，如何基于 LangGraph 实现这个决策循环，然后针对传统 RAG 的不同的问题怎么解决就可以了。</p>`,104)])])}const d=s(l,[["render",t]]);export{m as __pageData,d as default};
