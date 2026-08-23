import{_ as s,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const g=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/28-LangSmith 全链路观测：从 Agent 调试到 RAG 量化评估/index.md","filePath":"前端转AI Agent/28-LangSmith 全链路观测：从 Agent 调试到 RAG 量化评估/index.md"}'),l={name:"前端转AI Agent/28-LangSmith 全链路观测：从 Agent 调试到 RAG 量化评估/index.md"};function t(i,n,c,o,u,r){return a(),p("div",null,[...n[0]||(n[0]=[e(`<p>我们学了基于 LangChain、LangGraph 开发 Agent，但总有一种强烈的“盲盒感”。</p><p>现在可以看到终端不断流出的 Token，但是：</p><p>它调用了哪个工具？每一步耗时多少？消耗了多少 token？</p><p>而且，当你试图复现那个偶尔出现的 Bug 时，它又消失了。</p><p>软件工程界有一句名言：“如果你无法度量它，你就无法管理它。”</p><p>所以我们要给 Agent 加上全生命周期的可观测性。</p><p>这就是 LangSmith。</p><p>如果说大模型是引擎，那么 LangSmith 就是那个不可或缺的仪表盘。</p><p>这节我们就来学一下 LangSmith</p><p>首先打开 langsmith 的网站：</p><p><a href="https://smith.langchain.com/" target="_blank" rel="noreferrer">https://smith.langchain.com/</a></p><p>点击左下角 setting 创建 api key</p><p>然后我们在项目 .env 里加几个环境变量：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 用于身份验证，实现链路上报  </span></span>
<span class="line"><span>LANGCHAIN_API_KEY=你的key</span></span>
<span class="line"><span># 指定LangSmith中的项目，追踪结果会归类到该项目下</span></span>
<span class="line"><span>LANGCHAIN_PROJECT=项目名</span></span>
<span class="line"><span># 开启LangSmith追踪功能</span></span>
<span class="line"><span>LANGCHAIN_TRACING_V2=true</span></span></code></pre></div><p>LANGCHAIN_API_KEY 就是你刚才创建的 api key，可以标识哪个用户</p><p>LANGCHAIN_PROJECT 是用户的哪个项目</p><p>LANGCHAIN_TRACING_V2 是开启追踪</p><p>只要加上这几个环境变量跑，不需要做什么，就会自动上报 trace 数据：</p><p>这个是 trigger-error.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 故意在图节点里抛错，用于验证 LangSmith / 本地日志是否能看到失败 run。</span></span>
<span class="line"><span> * 运行：node src/trigger-error.mjs</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 若需要「未捕获的 Promise rejection」观察进程行为，可删掉下方 try/catch，</span></span>
<span class="line"><span> * 仅保留 await graph.invoke(...)。</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>const StateAnnotation = Annotation.Root({</span></span>
<span class="line"><span>text: Annotation({</span></span>
<span class="line"><span>    reducer: (_prev, next) =&gt; next,</span></span>
<span class="line"><span>    default: () =&gt;&quot;&quot;,</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const stepOk = (state) =&gt; ({ text: \`\${state.text}[ok]\` });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const stepThrow = () =&gt; {</span></span>
<span class="line"><span>thrownewError(&quot;DemoError: 节点内故意抛错（trigger-error.mjs）&quot;);</span></span>
<span class="line"><span>};</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const graph = new StateGraph(StateAnnotation)</span></span>
<span class="line"><span>  .addNode(&quot;step_ok&quot;, stepOk)</span></span>
<span class="line"><span>  .addNode(&quot;step_throw&quot;, stepThrow)</span></span>
<span class="line"><span>  .addEdge(START, &quot;step_ok&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;step_ok&quot;, &quot;step_throw&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;step_throw&quot;, END)</span></span>
<span class="line"><span>  .compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>await graph.invoke({ text: &quot;start&quot; });</span></span>
<span class="line"><span>console.log(&quot;不应执行到这里&quot;);</span></span>
<span class="line"><span>} catch (err) {</span></span>
<span class="line"><span>console.error(&quot;已捕获:&quot;, err?.message ?? err);</span></span>
<span class="line"><span>  process.exitCode = 1;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们收集了几个 graph 的运行的 trace 数据，看到了整体统计的 monitor 数据。</p><p>我们 Agent 的运行情况就一目了然了，非常方便就接入了全链路的观测。</p><p>除了日常监控观测之外，我们还需要对业务效果做标准化评估。</p><p>这时候就可以使用 LangSmith 的 Dataset 功能，也就是测试样本，统一存放用户提问和标准答案。</p><p>搭建好数据集后，再通过 Evaluation 设定打分规则，批量完成自动化评测，精准衡量回答质量，用量化数据来优化 Agent 和 RAG 相关业务逻辑。</p><p>我们写个 rag 的 agent 案例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir langsmith-test</span></span>
<span class="line"><span>cd langsmith-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcdxgFkzlN3CaRO0m6Eb5C33BWVWF13PkoUp4qibac34xnF1sCEryelzspx81lgkFtfzgWd8j948FETaJWxTW7rEVibeFoTtFDks/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/langgraph @langchain/community @langchain/openai @langchain/textsplitters @zilliz/milvus2-sdk-node dotenv langsmith</span></span></code></pre></div><p>创建 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Milvus</span></span>
<span class="line"><span>MILVUS_URI=http://localhost:19530</span></span>
<span class="line"><span>MILVUS_COLLECTION=rag_docs</span></span>
<span class="line"><span># Embedding</span></span>
<span class="line"><span>EMBEDDING_MODEL=text-embedding-v3</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 用于身份验证，实现链路上报  </span></span>
<span class="line"><span>LANGCHAIN_API_KEY=xxx</span></span>
<span class="line"><span># 指定LangSmith中的项目，追踪结果会归类到该项目下</span></span>
<span class="line"><span>LANGCHAIN_PROJECT=langsmith-test</span></span>
<span class="line"><span># 开启LangSmith追踪功能</span></span>
<span class="line"><span>LANGCHAIN_TRACING_V2=true</span></span></code></pre></div><p>然后我们先用 docker compose 把 Milvus 跑起来：</p><p>docker-compose.yml</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>services:</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Milvus</span></span>
<span class="line"><span>etcd:</span></span>
<span class="line"><span>    container_name:etcd-container</span></span>
<span class="line"><span>    image:quay.io/coreos/etcd:v3.5.18</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      -ETCD_AUTO_COMPACTION_MODE=revision</span></span>
<span class="line"><span>      -ETCD_AUTO_COMPACTION_RETENTION=1000</span></span>
<span class="line"><span>      -ETCD_QUOTA_BACKEND_BYTES=4294967296</span></span>
<span class="line"><span>      -ETCD_SNAPSHOT_COUNT=50000</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd</span></span>
<span class="line"><span>    command:etcd-advertise-client-urls=http://etcd:2379-listen-client-urlshttp://0.0.0.0:2379--data-dir/etcd</span></span>
<span class="line"><span>    healthcheck:</span></span>
<span class="line"><span>      test:[&quot;CMD&quot;,&quot;etcdctl&quot;,&quot;endpoint&quot;,&quot;health&quot;]</span></span>
<span class="line"><span>      interval:30s</span></span>
<span class="line"><span>      timeout:20s</span></span>
<span class="line"><span>      retries:3</span></span>
<span class="line"><span></span></span>
<span class="line"><span>minio:</span></span>
<span class="line"><span>    container_name:minio-container</span></span>
<span class="line"><span>    image:minio/minio:RELEASE.2024-05-28T17-19-04Z</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      MINIO_ACCESS_KEY:minioadmin</span></span>
<span class="line"><span>      MINIO_SECRET_KEY:minioadmin</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;9001:9001&quot;</span></span>
<span class="line"><span>      -&quot;9000:9000&quot;</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data</span></span>
<span class="line"><span>    command:minioserver/minio_data--console-address&quot;:9001&quot;</span></span>
<span class="line"><span>    healthcheck:</span></span>
<span class="line"><span>      test:[&quot;CMD&quot;,&quot;curl&quot;,&quot;-f&quot;,&quot;http://localhost:9000/minio/health/live&quot;]</span></span>
<span class="line"><span>      interval:30s</span></span>
<span class="line"><span>      timeout:20s</span></span>
<span class="line"><span>      retries:3</span></span>
<span class="line"><span></span></span>
<span class="line"><span>standalone:</span></span>
<span class="line"><span>    container_name:standalone</span></span>
<span class="line"><span>    image:milvusdb/milvus:v2.5.25</span></span>
<span class="line"><span>    command:[&quot;milvus&quot;,&quot;run&quot;,&quot;standalone&quot;]</span></span>
<span class="line"><span>    security_opt:</span></span>
<span class="line"><span>      -seccomp:unconfined</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      MINIO_REGION:us-east-1</span></span>
<span class="line"><span>      ETCD_ENDPOINTS:etcd:2379</span></span>
<span class="line"><span>      MINIO_ADDRESS:minio:9000</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus</span></span>
<span class="line"><span>    healthcheck:</span></span>
<span class="line"><span>      test:[&quot;CMD&quot;,&quot;curl&quot;,&quot;-f&quot;,&quot;http://localhost:9091/healthz&quot;]</span></span>
<span class="line"><span>      interval:30s</span></span>
<span class="line"><span>      start_period:90s</span></span>
<span class="line"><span>      timeout:20s</span></span>
<span class="line"><span>      retries:3</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;19530:19530&quot;</span></span>
<span class="line"><span>      -&quot;9091:9091&quot;</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      -&quot;etcd&quot;</span></span>
<span class="line"><span>      -&quot;minio&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>networks:</span></span>
<span class="line"><span>default:</span></span>
<span class="line"><span>    name:common-network</span></span></code></pre></div><p>创建插入数据的代码：</p><p>src/milvus_insert.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { existsSync, readFileSync, readdirSync } from&quot;fs&quot;;</span></span>
<span class="line"><span>import { join } from&quot;path&quot;;</span></span>
<span class="line"><span>import { MilvusClient, DataType, IndexType, MetricType } from&quot;@zilliz/milvus2-sdk-node&quot;;</span></span>
<span class="line"><span>import { RecursiveCharacterTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION = process.env.MILVUS_COLLECTION ?? &quot;rag_docs&quot;;</span></span>
<span class="line"><span>const MILVUS_ADDRESS =</span></span>
<span class="line"><span>  process.env.MILVUS_URI?.replace(/^https?:\\/\\//, &quot;&quot;) ?? &quot;localhost:19530&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>model: process.env.EMBEDDING_MODEL ?? &quot;text-embedding-v3&quot;,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new MilvusClient({ address: MILVUS_ADDRESS });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction loadChunks(dataDir = &quot;./data&quot;) {</span></span>
<span class="line"><span>if (!existsSync(dataDir)) {</span></span>
<span class="line"><span>    thrownewError(\`数据目录不存在: \${dataDir}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>const files = readdirSync(dataDir).filter((f) =&gt;/\\.(txt|md)$/i.test(f));</span></span>
<span class="line"><span>if (files.length === 0) {</span></span>
<span class="line"><span>    thrownewError(\`目录内无 .txt/.md 文件: \${dataDir}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const docs = files.map((f) =&gt; ({</span></span>
<span class="line"><span>    pageContent: readFileSync(join(dataDir, f), &quot;utf-8&quot;),</span></span>
<span class="line"><span>    metadata: { source: f },</span></span>
<span class="line"><span>  }));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitter = new RecursiveCharacterTextSplitter({</span></span>
<span class="line"><span>    chunkSize: 500,</span></span>
<span class="line"><span>    chunkOverlap: 50,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>return splitter.splitDocuments(docs);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&quot;Connecting to Milvus...&quot;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&quot;✓ Connected\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const chunks = await loadChunks();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if ((await client.hasCollection({ collection_name: COLLECTION })).value) {</span></span>
<span class="line"><span>      await client.dropCollection({ collection_name: COLLECTION });</span></span>
<span class="line"><span>      console.log(\`Dropped collection: \${COLLECTION}\\n\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;Generating embeddings...&quot;);</span></span>
<span class="line"><span>    const vectors = await embeddings.embedDocuments(</span></span>
<span class="line"><span>      chunks.map((c) =&gt; c.pageContent),</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    const dim = vectors[0].length;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;Creating collection...&quot;);</span></span>
<span class="line"><span>    await client.createCollection({</span></span>
<span class="line"><span>      collection_name: COLLECTION,</span></span>
<span class="line"><span>      fields: [</span></span>
<span class="line"><span>        {</span></span>
<span class="line"><span>          name: &quot;langchain_primaryid&quot;,</span></span>
<span class="line"><span>          data_type: DataType.Int64,</span></span>
<span class="line"><span>          is_primary_key: true,</span></span>
<span class="line"><span>          autoID: true,</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        { name: &quot;langchain_vector&quot;, data_type: DataType.FloatVector, dim },</span></span>
<span class="line"><span>        { name: &quot;langchain_text&quot;, data_type: DataType.VarChar, max_length: 8000 },</span></span>
<span class="line"><span>        { name: &quot;source&quot;, data_type: DataType.VarChar, max_length: 256 },</span></span>
<span class="line"><span>      ],</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(&quot;Collection created&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\nCreating index...&quot;);</span></span>
<span class="line"><span>    await client.createIndex({</span></span>
<span class="line"><span>      collection_name: COLLECTION,</span></span>
<span class="line"><span>      field_name: &quot;langchain_vector&quot;,</span></span>
<span class="line"><span>      index_type: IndexType.IVF_FLAT,</span></span>
<span class="line"><span>      metric_type: MetricType.L2,</span></span>
<span class="line"><span>      params: { nlist: 128 },</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(&quot;Index created&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\nLoading collection...&quot;);</span></span>
<span class="line"><span>    await client.loadCollection({ collection_name: COLLECTION });</span></span>
<span class="line"><span>    console.log(&quot;Collection loaded&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\nInserting...&quot;);</span></span>
<span class="line"><span>    const data = chunks.map((chunk, i) =&gt; ({</span></span>
<span class="line"><span>      langchain_text: chunk.pageContent,</span></span>
<span class="line"><span>      langchain_vector: vectors[i],</span></span>
<span class="line"><span>      source: chunk.metadata.source,</span></span>
<span class="line"><span>    }));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await client.insert({</span></span>
<span class="line"><span>      collection_name: COLLECTION,</span></span>
<span class="line"><span>      data,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(\`✓ Inserted \${result.insert_cnt} records\\n\`);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;Error:&quot;, error.message);</span></span>
<span class="line"><span>    process.exit(1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>跑一下：</p><p>然后来写一下 RAG 检索的 Agent：</p><p>src/rag_agent.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { Annotation, END, START, StateGraph } from&quot;@langchain/langgraph&quot;;</span></span>
<span class="line"><span>import { ChatPromptTemplate } from&quot;@langchain/core/prompts&quot;;</span></span>
<span class="line"><span>import { StringOutputParser } from&quot;@langchain/core/output_parsers&quot;;</span></span>
<span class="line"><span>import { RunnableSequence } from&quot;@langchain/core/runnables&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { Milvus } from&quot;@langchain/community/vectorstores/milvus&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>model: process.env.EMBEDDING_MODEL ?? &quot;text-embedding-v3&quot;,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const llm = new ChatOpenAI({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>model: process.env.MODEL_NAME ?? &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const vectorStore = await Milvus.fromExistingCollection(embeddings, {</span></span>
<span class="line"><span>collectionName: process.env.MILVUS_COLLECTION ?? &quot;rag_docs&quot;,</span></span>
<span class="line"><span>url: process.env.MILVUS_URI ?? &quot;http://localhost:19530&quot;,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retriever = vectorStore.asRetriever({ k: 4 });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = ChatPromptTemplate.fromMessages([</span></span>
<span class="line"><span>  [</span></span>
<span class="line"><span>    &quot;system&quot;,</span></span>
<span class="line"><span>    &quot;你是客服助手。仅根据下面「上下文」回答；上下文没有的信息请明确说不知道，不要编造。\\n\\n上下文：\\n{context}&quot;,</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>  [&quot;human&quot;, &quot;{question}&quot;],</span></span>
<span class="line"><span>]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const GraphState = Annotation.Root({</span></span>
<span class="line"><span>question: Annotation,</span></span>
<span class="line"><span>context: Annotation,</span></span>
<span class="line"><span>answer: Annotation,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction retrieve(state) {</span></span>
<span class="line"><span>const docs = await retriever.invoke(state.question);</span></span>
<span class="line"><span>return { context: docs };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction generate(state) {</span></span>
<span class="line"><span>const contextText = state.context.map((d) =&gt; d.pageContent).join(&quot;\\n\\n&quot;);</span></span>
<span class="line"><span>const answer = await chain.invoke({</span></span>
<span class="line"><span>    context: contextText,</span></span>
<span class="line"><span>    question: state.question,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>return { answer };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const workflow = new StateGraph(GraphState)</span></span>
<span class="line"><span>  .addNode(&quot;retrieve&quot;, retrieve)</span></span>
<span class="line"><span>  .addNode(&quot;generate&quot;, generate)</span></span>
<span class="line"><span>  .addEdge(START, &quot;retrieve&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;retrieve&quot;, &quot;generate&quot;)</span></span>
<span class="line"><span>  .addEdge(&quot;generate&quot;, END);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportconst ragApp = workflow.compile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportasyncfunction ask(question) {</span></span>
<span class="line"><span>const result = await ragApp.invoke({ question });</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    answer: result.answer,</span></span>
<span class="line"><span>    context: result.context ?? [],</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这里就是一个检索节点、一个生成节点，用来检索向量数据库，生成回答。</p><p>然后加一个 cli.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { ask } from&quot;./rag_agent.mjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const DEFAULT_QUESTIONS = [</span></span>
<span class="line"><span>&quot;无理由退货要在几天内？&quot;,</span></span>
<span class="line"><span>&quot;满多少元包邮？&quot;,</span></span>
<span class="line"><span>&quot;金卡会员有什么折扣？&quot;,</span></span>
<span class="line"><span>&quot;电子发票多久能开好？&quot;,</span></span>
<span class="line"><span>&quot;手机保修多久？&quot;,</span></span>
<span class="line"><span>&quot;紧急问题怎么联系客服？&quot;,</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const args = process.argv.slice(2);</span></span>
<span class="line"><span>const questions = args.length &gt; 0 ? [args.join(&quot; &quot;)] : DEFAULT_QUESTIONS;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function printContext(context) {</span></span>
<span class="line"><span>if (!context.length) {</span></span>
<span class="line"><span>    console.log(&quot;\\n引用片段: （无）&quot;);</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>// console.log(&quot;\\n引用片段:&quot;);</span></span>
<span class="line"><span>// context.forEach((doc, i) =&gt; {</span></span>
<span class="line"><span>//   const source = doc.metadata?.source ?? &quot;未知&quot;;</span></span>
<span class="line"><span>//   const text = doc.pageContent.replace(/\\s+/g, &quot; &quot;).trim();</span></span>
<span class="line"><span>//   const preview = text.length &gt; 100 ? \`\${text.slice(0, 100)}…\` : text;</span></span>
<span class="line"><span>//   console.log(\`  [\${i + 1}] \${source}\`);</span></span>
<span class="line"><span>//   console.log(\`      \${preview}\`);</span></span>
<span class="line"><span>// });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (let i = 0; i &lt; questions.length; i++) {</span></span>
<span class="line"><span>const question = questions[i];</span></span>
<span class="line"><span>console.log(\`\\n\${&quot;=&quot;.repeat(50)}\`);</span></span>
<span class="line"><span>console.log(\`问题 \${i + 1}: \${question}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const { answer, context } = await ask(question);</span></span>
<span class="line"><span>console.log(\`\\n答: \${answer}\`);</span></span>
<span class="line"><span>  printContext(context);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`\\n\${&quot;=&quot;.repeat(50)}\`);</span></span>
<span class="line"><span>console.log(\`共 \${questions.length} 个问题\`);</span></span></code></pre></div><p>RAG 的 Agent 跑通后，我们来做一下 RAG 的评估。</p><p>怎么评估呢？</p><p>其实很容易想到：</p><p>整理一批问题和对应的标准答案，挨个拿去提问 Agent，对比实际回答和标准回答的差距，以此来完成打分评判。</p><p>没错，实际落地也正是这个思路。</p><p>我们直接借助 LangSmith 来实现，用里面的 dataset 专门管理评测数据集，统一存放各类问题与标准答案。</p><p>再通过 evaluation 配置好各类评估指标与打分规则，就能自动批量发起测试，对照实际输出和标准答案，按照不同维度自动完成评分，高效完成整套 RAG 效果评估。</p><p>首先创建 dataset：</p><p>src/eval/build_dataset.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { Client } from&quot;langsmith&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const DATASET_NAME = &quot;rag-eval-v1&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const EXAMPLES = [</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;无理由退货要在几天内申请？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;自签收之日起 7 天内支持无理由退货。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;质量问题换货期限是多久？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;15 天内出现质量问题可免费换货。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;无理由退货运费谁承担？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;无理由退货由买家承担退货运费。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;客服工作时间是什么？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;周一至周五 9:00-18:00，周六 10:00-17:00，法定节假日顺延。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;满多少元包邮？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;满 99 元包邮（部分大件/冷链除外）。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;现货商品多久发货？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;付款后 24 小时内发货，大促期间 48 小时内。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;支持哪些支付方式？&quot; },</span></span>
<span class="line"><span>    outputs: {</span></span>
<span class="line"><span>      answer: &quot;支持微信支付、支付宝、银联云闪付、花呗/信用卡分期（满 500 元可选 3/6/12 期）。&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;价保是多久？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;下单后 7 天内同款降价可申请差价退还。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;金卡会员有什么折扣？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;金卡享 95 折，并有专属客服和每月满 200 减 30 券。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;积分多少可以抵 1 元？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;100 积分可抵 1 元，单笔最多抵扣实付金额的 30%。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;手机保修多久？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;手机、平板、耳机全国联保 1 年。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    inputs: { question: &quot;紧急问题怎么联系？&quot; },</span></span>
<span class="line"><span>    outputs: { answer: &quot;可拨打 400-800-1234 转 2，接通后报订单号。&quot; },</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const client = new Client({ apiKey: process.env.LANGCHAIN_API_KEY });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>let dataset;</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    dataset = await client.readDataset({ datasetName: DATASET_NAME });</span></span>
<span class="line"><span>    console.log(\`数据集已存在: \${DATASET_NAME}\`);</span></span>
<span class="line"><span>  } catch {</span></span>
<span class="line"><span>    dataset = await client.createDataset(DATASET_NAME, {</span></span>
<span class="line"><span>      description: &quot;RAG Agent 回归评估集&quot;,</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(\`已创建数据集: \${DATASET_NAME}\`);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const created = await client.createExamples(</span></span>
<span class="line"><span>    EXAMPLES.map((e) =&gt; ({</span></span>
<span class="line"><span>      dataset_id: dataset.id,</span></span>
<span class="line"><span>      inputs: e.inputs,</span></span>
<span class="line"><span>      outputs: e.outputs,</span></span>
<span class="line"><span>    })),</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`已创建 \${created.length} 条样例\`);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main().catch((err) =&gt; {</span></span>
<span class="line"><span>console.error(err);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>安装 langsmith 包：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install langsmith</span></span></code></pre></div><p>跑一下：</p><p>然后我们来创建 evaluator 跑下评估</p><p>当然，不用自己创建，langchain 官方提供了 openevals 这个包，内置了很多评估器</p><p>安装下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install openevals</span></span></code></pre></div><p>创建 src/evals/evaluators.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * OpenEvals 内置 RAG 指标</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  createLLMAsJudge,</span></span>
<span class="line"><span>  RAG_GROUNDEDNESS_PROMPT,</span></span>
<span class="line"><span>  RAG_HELPFULNESS_PROMPT,</span></span>
<span class="line"><span>  RAG_RETRIEVAL_RELEVANCE_PROMPT,</span></span>
<span class="line"><span>} from&quot;openevals&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const judge = new ChatOpenAI({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>model: process.env.MODEL_NAME ?? &quot;qwen-plus&quot;,</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// RAG_GROUNDEDNESS_PROMPT —— 忠实度：答案是否被检索上下文支撑，有无幻觉</span></span>
<span class="line"><span>const ragGroundednessJudge = createLLMAsJudge({</span></span>
<span class="line"><span>prompt: RAG_GROUNDEDNESS_PROMPT,</span></span>
<span class="line"><span>feedbackKey: &quot;rag_groundedness&quot;,</span></span>
<span class="line"><span>  judge,</span></span>
<span class="line"><span>continuous: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// RAG_HELPFULNESS_PROMPT —— 回答有用性：是否切题、是否答非所问</span></span>
<span class="line"><span>const ragHelpfulnessJudge = createLLMAsJudge({</span></span>
<span class="line"><span>prompt: RAG_HELPFULNESS_PROMPT,</span></span>
<span class="line"><span>feedbackKey: &quot;rag_helpfulness&quot;,</span></span>
<span class="line"><span>  judge,</span></span>
<span class="line"><span>continuous: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// RAG_RETRIEVAL_RELEVANCE_PROMPT —— 检索相关性：召回片段与问题是否相关</span></span>
<span class="line"><span>const ragRetrievalRelevanceJudge = createLLMAsJudge({</span></span>
<span class="line"><span>prompt: RAG_RETRIEVAL_RELEVANCE_PROMPT,</span></span>
<span class="line"><span>feedbackKey: &quot;rag_retrieval_relevance&quot;,</span></span>
<span class="line"><span>  judge,</span></span>
<span class="line"><span>continuous: true,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportasyncfunction ragGroundednessEvaluator({ outputs }) {</span></span>
<span class="line"><span>return ragGroundednessJudge({</span></span>
<span class="line"><span>    context: { documents: outputs.context },</span></span>
<span class="line"><span>    outputs: { answer: outputs.answer },</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportasyncfunction ragHelpfulnessEvaluator({ inputs, outputs }) {</span></span>
<span class="line"><span>return ragHelpfulnessJudge({ inputs, outputs: { answer: outputs.answer } });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportasyncfunction ragRetrievalRelevanceEvaluator({ inputs, outputs }) {</span></span>
<span class="line"><span>return ragRetrievalRelevanceJudge({</span></span>
<span class="line"><span>    inputs,</span></span>
<span class="line"><span>    context: { documents: outputs.context },</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportconst ragEvaluators = [</span></span>
<span class="line"><span>  ragGroundednessEvaluator,</span></span>
<span class="line"><span>  ragHelpfulnessEvaluator,</span></span>
<span class="line"><span>  ragRetrievalRelevanceEvaluator,</span></span>
<span class="line"><span>];</span></span></code></pre></div><p>我们是用大模型来做评估，openevals 内置了一些评估器可以用，直接引入对应的 prompt 即可，不用自己写。</p><ul><li>RAG_GROUNDEDNESS_PROMPT —— <strong>忠实度</strong>：答案是否被检索上下文支撑，有无幻觉</li><li>RAG_HELPFULNESS_PROMPT —— <strong>回答有用性</strong>：是否切题、是否答非所问</li><li>RAG_RETRIEVAL_RELEVANCE_PROMPT —— <strong>检索相关性</strong>：召回片段与问题是否相关</li></ul><p>然后跑一下：</p><p>src/evals/run_eval.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * RAG 评测入口：dataset（问题+标准答案） + evaluate</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>import&quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { Client } from&quot;langsmith&quot;;</span></span>
<span class="line"><span>import { evaluate } from&quot;langsmith/evaluation&quot;;</span></span>
<span class="line"><span>import { ask } from&quot;../rag_agent.mjs&quot;;</span></span>
<span class="line"><span>import { ragEvaluators } from&quot;./evaluators.mjs&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const DATASET_NAME = &quot;rag-eval-v1&quot;;</span></span>
<span class="line"><span>const client = new Client({ apiKey: process.env.LANGCHAIN_API_KEY });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 被评测的 RAG Agent */</span></span>
<span class="line"><span>asyncfunction runRagAgent(inputs) {</span></span>
<span class="line"><span>const { answer, context } = await ask(inputs.question);</span></span>
<span class="line"><span>return {</span></span>
<span class="line"><span>    answer,</span></span>
<span class="line"><span>    context: context.map((d) =&gt; d.pageContent),</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const result = await evaluate(runRagAgent, {</span></span>
<span class="line"><span>    data: DATASET_NAME,</span></span>
<span class="line"><span>    evaluators: ragEvaluators,</span></span>
<span class="line"><span>    client,</span></span>
<span class="line"><span>    experimentPrefix: \`rag-openevals-\${process.env.MODEL_NAME ?? &quot;qwen&quot;}\`,</span></span>
<span class="line"><span>    maxConcurrency: 2,</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 等待全部样例跑完</span></span>
<span class="line"><span>forawait (const _row of result) {</span></span>
<span class="line"><span>    /* drain */</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const project = process.env.LANGCHAIN_PROJECT ?? &quot;default&quot;;</span></span>
<span class="line"><span>console.log(&quot;✅ 评测完成&quot;);</span></span>
<span class="line"><span>console.log(&quot;实验名:&quot;, result.experimentName);</span></span>
<span class="line"><span>console.log(</span></span>
<span class="line"><span>    &quot;指标: rag_groundedness | rag_helpfulness | rag_retrieval_relevance&quot;,</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>console.log(</span></span>
<span class="line"><span>    \`报告: https://smith.langchain.com/o/default/projects/p/\${encodeURIComponent(project)}\`,</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main().catch((err) =&gt; {</span></span>
<span class="line"><span>console.error(err);</span></span>
<span class="line"><span>  process.exit(1);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>跑一下：</p><p>这样，我们就能把 RAG 的效果给量化，根据指标来评估。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdV4WyOHSdIfibChrpaXCS20hflj0vuzIVVDAUgsMibPZtKxyrfuKics5fAfAWAgf0iaGT7TXiahd6RxcyPfic7ueKJbYrw4fRdLsRhg/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>一目了然看到问题、标准答案、我们的答案，大模型各种维度的打分。</p><p>这样跑一次评估叫做一次实验 experiment</p><p>RAG 的量化评估，写简历必备的点。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>这节我们学了 LangSmith，包括 trace、monitor、dataset、evaluator、experiment 这些概念</p><p>trace 就是 Agent 运行过程数据的收集，比如 LangGraph 的 graph，LangChain 的 chain</p><p>可以看到每个节点的输入输出，tool 的参数返回值、token 消耗、耗时、报错等数据</p><p>只要在环境变量加上 LANGCHAIN_API_KEY、LANGCHAIN_PROJECT 标识用户和项目，然后开启 LANGCHAIN_TRACING_V2 就可以了，不用改代码，自动收集上报数据</p><p>monitor 是一些统计指标，比如 tool 调用了几次、token 消耗的变化等</p><p>dataset 是问题和标准答案的数据集，可以用它来跑实验</p><p>也就是用评估器从各种维度来打分，可以用 langchain 官方提供的 openevals 这个包的内置的 evaluator 评估器</p><p>用 langsmith 的包的 evaluate 方法来跑实验， 指定 evaluator 和 dataset 就能够对 Agent 的效果做评估</p><p>这样有了量化的指标后，就知道我们的 Agent 或者 RAG 效果怎么样了，比如忠实度、回答有用性、检索相关性等指标</p><p>Agent 的可观测性以及效果量化评估，是做 Agent 很重要的一个点，也是面试必问的。</p>`,87)])])}const q=s(l,[["render",t]]);export{g as __pageData,q as default};
