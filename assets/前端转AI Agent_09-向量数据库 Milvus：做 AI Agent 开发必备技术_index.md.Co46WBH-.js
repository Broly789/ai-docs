import{_ as n,a,b as p,c as e,d as l,e as i,f as c,g as t,h as o,i as r,j as d,k as m,l as g,m as u,n as _,o as v,p as h,q as y,r as b,s as E,t as I,u as A,v as C,w as M,x as k,y as O,z as x,A as f,B as q,C as N,D as L,E as D,F as w,G as T,H as R,I as $,J as P,K as S,L as V}from"./chunks/8.D8mRP_je.js";import{_ as z,o as G,c as B,ag as Q}from"./chunks/framework.D5NWgsO2.js";const Z=JSON.parse('{"title":"09-向量数据库 Milvus：做 AI Agent 开发必备技术","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/09-向量数据库 Milvus：做 AI Agent 开发必备技术/index.md","filePath":"前端转AI Agent/09-向量数据库 Milvus：做 AI Agent 开发必备技术/index.md"}'),U={name:"前端转AI Agent/09-向量数据库 Milvus：做 AI Agent 开发必备技术/index.md"};function j(K,s,F,Y,J,H){return G(),B("div",null,[...s[0]||(s[0]=[Q('<h1 id="_09-向量数据库-milvus-做-ai-agent-开发必备技术" tabindex="-1">09-向量数据库 Milvus：做 AI Agent 开发必备技术 <a class="header-anchor" href="#_09-向量数据库-milvus-做-ai-agent-开发必备技术" aria-label="Permalink to &quot;09-向量数据库 Milvus：做 AI Agent 开发必备技术&quot;">​</a></h1><p>前面我们实现了 RAG：</p><p><img src="'+n+'" alt="image-20260128152305563"></p><p>文档向量化放到向量数据库，每次查询根据向量化的 query 去数据库做相似度匹配，查出相关文档放到 prompt 里给大模型，大模型来生成回答。</p><p>但之前向量数据库是放在内存里的：</p><p><img src="'+a+'" alt="image-20260128152311540"></p><p>而实际上 AI Agent 产品都会用 Milvus 这种向量数据库。</p><p>就像 web 应用会把数据存在 mysql 里，基于对数据的增删改查实现各种业务功能。</p><p><img src="'+p+'" alt="image-20260128152316678"></p><p>根据 id 或者关键词去关联查询一系列表的数据。</p><p>而 AI Agent 应用会把知识、记忆放在 Milvus 数据库中，基于对知识的检索、增删改实现各种功能。</p><p><img src="'+e+'" alt="image-20260128152321910"></p><p>不同的是这里涉及到向量化，就需要嵌入模型，比如检索、新增、修改。</p><p>但是删除直接根据 id，不需要嵌入模型。</p><p>有同学可能会问，把数据存在 MySQL 里，和现在存在 Milvus 里有什么不同么？</p><p>你在 MySQL 里查询数据，只能用 id、关键词匹配。</p><p>而在 Milvus 里查询知识，是根据语义匹配的，你可以用自然语言来检索。</p><p>这两种功能一般都需要。</p><p>比如你做了一个 AI 日记本：</p><ul><li><p>查询日记列表可以从 MySQL 来查，不走 AI</p></li><li><p>查询“我哪几天的日记心情比较好”，就要去 Milvus 做向量相似度检索，然后交给 AI 生成回答</p></li></ul><p>所以一般会做 mysql 和 milvus 的双写，也就是同时对两个数据库做增删改，保持数据同步。</p><p><img src="'+l+'" alt="image-20260128152328048"></p><p>这节我们先学下 Milvus，做下增删改查，跑通基于 Mivlus 的 RAG 流程。</p><p>本地跑 Milvus 需要安装 docker：</p><p><a href="https://www.docker.com/" target="_blank" rel="noreferrer">https://www.docker.com/</a></p><p><img src="'+i+'" alt="image-20260128152333957"></p><p>下载后安装，会有桌面端和命令行工具：</p><p><img src="'+c+'" alt="image-20260128152340696"></p><p><img src="'+t+'" alt="image-20260128152348567"></p><p>如果 docker 命令可用了，就代表装好了。</p><p>打开桌面端：</p><p><img src="'+o+'" alt="image-20260128152355636"></p><p>images 是下载的镜像列表。</p><p>containers 是镜像跑起来的容器列表。</p><p>这里对 docker 不熟也没关系，下节会讲，这节重点是 mivlus。</p><p>创建一个目录用来放 milvus 的 docker 配置文件和数据：</p><p><img src="'+r+'" alt="image-20260128152401006"></p><p>从这里下载 milvus 的 docker compose 配置文件：</p><p><a href="https://github.com/milvus-io/milvus/releases" target="_blank" rel="noreferrer">https://github.com/milvus-io/milvus/releases</a></p><p><img src="'+d+'" alt="image-20260128152409169"></p><p>把配置文件拿到刚才这个目录，跑一下 docker compose</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>docker compose -f ./milvus-standalone-docker-compose.yml up -d</span></span></code></pre></div><p>用到的镜像根据配置文件自动下载：</p><video src="'+m+'" controls></video><p>跑起来之后，在 docker 桌面端这里也可以看到：</p><p>下载的镜像：</p><p><img src="'+g+'" alt="image-20260128152421169"></p><p>跑起来的容器：</p><p><img src="'+u+'" alt="image-20260128152427654"></p><p>milvus 数据库是跑在 19530 这个端口。</p><p>访问这个 url 可以做健康度检查：</p><p><a href="http://localhost:9091/healthz" target="_blank" rel="noreferrer">http://localhost:9091/healthz</a></p><p><img src="'+_+`" alt="image-20260128152433384"></p><p>然后我们用 node 来连接 milvus 服务做增删改查。</p><p>创建项目：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir milvus-test</span></span>
<span class="line"><span>cd milvus-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+v+`" alt="image-20260128152440209"></p><p>安装 milvus 的 node sdk：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @zilliz/milvus2-sdk-node</span></span></code></pre></div><p>还有 langchain：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/openai dotenv</span></span></code></pre></div><p>这里的配置文件 .env 大家自己创建下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># OpenAI API 配置</span></span>
<span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span>EMBEDDINGS_MODEL_NAME=text-embedding-v3</span></span></code></pre></div><p>写下插入数据的代码：</p><p>创建 src/insert.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient, DataType, MetricType, IndexType } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ai_diary&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
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
<span class="line"><span>async function getEmbedding(text) {</span></span>
<span class="line"><span>  const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function main() {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;Connecting to Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ Connected\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 创建集合</span></span>
<span class="line"><span>    console.log(&#39;Creating collection...&#39;);</span></span>
<span class="line"><span>    await client.createCollection({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      fields: [</span></span>
<span class="line"><span>        { name: &#39;id&#39;, data_type: DataType.VarChar, max_length: 50, is_primary_key: true },</span></span>
<span class="line"><span>        { name: &#39;vector&#39;, data_type: DataType.FloatVector, dim: VECTOR_DIM },</span></span>
<span class="line"><span>        { name: &#39;content&#39;, data_type: DataType.VarChar, max_length: 5000 },</span></span>
<span class="line"><span>        { name: &#39;date&#39;, data_type: DataType.VarChar, max_length: 50 },</span></span>
<span class="line"><span>        { name: &#39;mood&#39;, data_type: DataType.VarChar, max_length: 50 },</span></span>
<span class="line"><span>        { name: &#39;tags&#39;, data_type: DataType.Array, element_type: DataType.VarChar, max_capacity: 10, max_length: 50 }</span></span>
<span class="line"><span>      ]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(&#39;Collection created&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 创建索引</span></span>
<span class="line"><span>    console.log(&#39;\\nCreating index...&#39;);</span></span>
<span class="line"><span>    await client.createIndex({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      field_name: &#39;vector&#39;,</span></span>
<span class="line"><span>      index_type: IndexType.IVF_FLAT,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>      params: { nlist: 1024 }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(&#39;Index created&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 加载集合</span></span>
<span class="line"><span>    console.log(&#39;\\nLoading collection...&#39;);</span></span>
<span class="line"><span>    await client.loadCollection({ collection_name: COLLECTION_NAME });</span></span>
<span class="line"><span>    console.log(&#39;Collection loaded&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 插入日记数据</span></span>
<span class="line"><span>    console.log(&#39;\\nInserting diary entries...&#39;);</span></span>
<span class="line"><span>    const diaryContents = [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;diary_001&#39;,</span></span>
<span class="line"><span>        content: &#39;今天天气很好，去公园散步了，心情愉快。看到了很多花开了，春天真美好。&#39;,</span></span>
<span class="line"><span>        date: &#39;2026-01-10&#39;,</span></span>
<span class="line"><span>        mood: &#39;happy&#39;,</span></span>
<span class="line"><span>        tags: [&#39;生活&#39;, &#39;散步&#39;]</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;diary_002&#39;,</span></span>
<span class="line"><span>        content: &#39;今天工作很忙，完成了一个重要的项目里程碑。团队合作很愉快，感觉很有成就感。&#39;,</span></span>
<span class="line"><span>        date: &#39;2026-01-11&#39;,</span></span>
<span class="line"><span>        mood: &#39;excited&#39;,</span></span>
<span class="line"><span>        tags: [&#39;工作&#39;, &#39;成就&#39;]</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;diary_003&#39;,</span></span>
<span class="line"><span>        content: &#39;周末和朋友去爬山，天气很好，心情也很放松。享受大自然的感觉真好。&#39;,</span></span>
<span class="line"><span>        date: &#39;2026-01-12&#39;,</span></span>
<span class="line"><span>        mood: &#39;relaxed&#39;,</span></span>
<span class="line"><span>        tags: [&#39;户外&#39;, &#39;朋友&#39;]</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;diary_004&#39;,</span></span>
<span class="line"><span>        content: &#39;今天学习了 Milvus 向量数据库，感觉很有意思。向量搜索技术真的很强大。&#39;,</span></span>
<span class="line"><span>        date: &#39;2026-01-12&#39;,</span></span>
<span class="line"><span>        mood: &#39;curious&#39;,</span></span>
<span class="line"><span>        tags: [&#39;学习&#39;, &#39;技术&#39;]</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        id: &#39;diary_005&#39;,</span></span>
<span class="line"><span>        content: &#39;晚上做了一顿丰盛的晚餐，尝试了新菜谱。家人都说很好吃，很有成就感。&#39;,</span></span>
<span class="line"><span>        date: &#39;2026-01-13&#39;,</span></span>
<span class="line"><span>        mood: &#39;proud&#39;,</span></span>
<span class="line"><span>        tags: [&#39;美食&#39;, &#39;家庭&#39;]</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    ];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&#39;Generating embeddings...&#39;);</span></span>
<span class="line"><span>    const diaryData = await Promise.all(</span></span>
<span class="line"><span>      diaryContents.map(async (diary) =&gt; ({</span></span>
<span class="line"><span>        ...diary,</span></span>
<span class="line"><span>        vector: await getEmbedding(diary.content)</span></span>
<span class="line"><span>      }))</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const insertResult = await client.insert({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      data: diaryData</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    console.log(\`✓ Inserted \${insertResult.insert_cnt} records\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;Error:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>在 milvus 里是这样存储数据的：</p><p><img src="`+h+'" alt="image-20260128152449055"></p><p>可以分为多个 database，每个 database 下有多个 collection</p><p>每个 collection 下是符合 schema 的 entity，也就是数据。</p><p>所以我们插入数据，就定义一个 schema，然后插入 entity 就好了。</p><p>同时要建立一个向量字段的索引，用来快速查询。</p><p>也就是这样：</p><p><img src="'+y+'" alt="image-20260128152455049"></p><p>这就是 schema，创建 collection 集合的时候需要指定。</p><p>具体字段包含 id、vector、content、date、mode、tags</p><p>其实和 mysql 的表差不多，唯一的区别是 vector 这个字段，我们设置了 FloatVector 类型，也就是向量，指定维度是 1024 维。</p><p>这样我们后面插入数据，也要把嵌入模型指定为 1024 的维度。</p><p><img src="'+b+'" alt="image-20260128152502993"></p><p>这个集合名是 ai_diary，用来放日记数据的。</p><p>向量字段需要建立索引：</p><p><img src="'+E+'" alt="image-20260128152509662"></p><p>metric_type 指定用余弦相似度作为距离度量</p><p>余弦相似度的原理前面讲过：</p><p><img src="'+I+'" alt="image-20260128152515871"></p><p>之后就可以插入数据了：</p><p><img src="'+A+'" alt="image-20260128152523045"></p><p><img src="'+C+'" alt="image-20260128152529264"></p><p>插入数据比较简单，就是调用 insert 方法，指定 collection name 和 data</p><p>只不过这里的 vector 字段需要用嵌入模型来向量化一下。</p><p>跑一下：</p><video src="'+M+'" controls></video><p>接下来做一下查询。</p><p>先不着急用代码写，我们可以安装一个 GUI 工具：</p><p><a href="https://github.com/zilliztech/attu?tab=readme-ov-file#quick-start" target="_blank" rel="noreferrer">https://github.com/zilliztech/attu?tab=readme-ov-file#quick-start</a></p><p>Attu 是 Milvus 生态最好的 GUI 工具。</p><p><a href="https://github.com/zilliztech/attu/releases" target="_blank" rel="noreferrer">https://github.com/zilliztech/attu/releases</a></p><p><img src="'+k+'" alt="image-20260128152535985"></p><p>下载后安装下：</p><p><img src="'+O+'" alt="image-20260128152541115"></p><p>用默认配置连接就行：</p><p><img src="'+x+'" alt="image-20260128152547118"></p><p>和 node.js 那边一样。</p><video src="'+f+'" controls></video><p>可以看到所有的集合，集合下所有的 Entity</p><p><img src="'+q+`" alt="image-20260128152620158"></p><p>可以看到我们刚创建的 ai_diary 的 collection，以及下面的 5 条数据</p><p>vector 是向量，用来做语义检索的。</p><p>其他字段是元信息，会一并查出来返回。</p><p>我们写下查询：</p><p>创建 src/query.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient, MetricType } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ai_diary&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
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
<span class="line"><span>async function getEmbedding(text) {</span></span>
<span class="line"><span>  const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function main() {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;Connecting to Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ Connected\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 向量搜索</span></span>
<span class="line"><span>    console.log(&#39;Searching for similar diary entries...&#39;);</span></span>
<span class="line"><span>    const query = &#39;我想看看关于户外活动的日记&#39;;</span></span>
<span class="line"><span>    console.log(\`Query: &quot;\${query}&quot;\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const queryVector = await getEmbedding(query);</span></span>
<span class="line"><span>    const searchResult = await client.search({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      vector: queryVector,</span></span>
<span class="line"><span>      limit: 2,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>      output_fields: [&#39;id&#39;, &#39;content&#39;, &#39;date&#39;, &#39;mood&#39;, &#39;tags&#39;]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`Found \${searchResult.results.length} results:\\n\`);</span></span>
<span class="line"><span>    searchResult.results.forEach((item, index) =&gt; {</span></span>
<span class="line"><span>      console.log(\`\${index + 1}. [Score: \${item.score.toFixed(4)}]\`);</span></span>
<span class="line"><span>      console.log(\`   ID: \${item.id}\`);</span></span>
<span class="line"><span>      console.log(\`   Date: \${item.date}\`);</span></span>
<span class="line"><span>      console.log(\`   Mood: \${item.mood}\`);</span></span>
<span class="line"><span>      console.log(\`   Tags: \${item.tags?.join(&#39;, &#39;)}\`);</span></span>
<span class="line"><span>      console.log(\`   Content: \${item.content}\\n\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;Error:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>是把 query 向量化，做余弦相似度的检索：</p><p><img src="`+N+'" alt="image-20260128152627671"></p><p>跑一下：</p><video src="'+L+'" controls></video><p>可以看到，检索出了两条户外活动的日记。</p><p>改一下 query，查询做饭、学习的日记：</p><p>再试一下：</p><video src="'+D+`" controls></video><p>这次查了做饭和学习的日记，也搜出来了。</p><p>你用 MySQL 做关键词搜索可以做到么？</p><p>很明显不能，这就是为啥用向量数据库！</p><p>然后我们把它和 RAG 流程结合来跑一下完整流程：</p><p>创建 src/rag.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient, MetricType } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ai_diary&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 OpenAI Chat 模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>  temperature: 0.7,</span></span>
<span class="line"><span>  model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Embeddings 模型</span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
<span class="line"><span>  configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
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
<span class="line"><span> * 从 Milvus 中检索相关的日记条目</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>async function retrieveRelevantDiaries(question, k = 2) {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    // 生成问题的向量</span></span>
<span class="line"><span>    const queryVector = await getEmbedding(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 在 Milvus 中搜索相似的日记</span></span>
<span class="line"><span>    const searchResult = await client.search({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      vector: queryVector,</span></span>
<span class="line"><span>      limit: k,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>      output_fields: [&#39;id&#39;, &#39;content&#39;, &#39;date&#39;, &#39;mood&#39;, &#39;tags&#39;]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return searchResult.results;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;检索日记时出错:&#39;, error.message);</span></span>
<span class="line"><span>    return [];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 使用 RAG 回答关于日记的问题</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>async function answerDiaryQuestion(question, k = 2) {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span>    console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 1. 检索相关日记</span></span>
<span class="line"><span>    console.log(&#39;\\n【检索相关日记】&#39;);</span></span>
<span class="line"><span>    const retrievedDiaries = await retrieveRelevantDiaries(question, k);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (retrievedDiaries.length === 0) {</span></span>
<span class="line"><span>      console.log(&#39;未找到相关日记&#39;);</span></span>
<span class="line"><span>      return &#39;抱歉，我没有找到相关的日记内容。&#39;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 2. 打印检索到的日记及相似度</span></span>
<span class="line"><span>    retrievedDiaries.forEach((diary, i) =&gt; {</span></span>
<span class="line"><span>      console.log(\`\\n[日记 \${i + 1}] 相似度: \${diary.score.toFixed(4)}\`);</span></span>
<span class="line"><span>      console.log(\`日期: \${diary.date}\`);</span></span>
<span class="line"><span>      console.log(\`心情: \${diary.mood}\`);</span></span>
<span class="line"><span>      console.log(\`标签: \${diary.tags?.join(&#39;, &#39;)}\`);</span></span>
<span class="line"><span>      console.log(\`内容: \${diary.content}\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 3. 构建上下文</span></span>
<span class="line"><span>    const context = retrievedDiaries</span></span>
<span class="line"><span>      .map((diary, i) =&gt; {</span></span>
<span class="line"><span>        return \`[日记 \${i + 1}]</span></span>
<span class="line"><span>日期: \${diary.date}</span></span>
<span class="line"><span>心情: \${diary.mood}</span></span>
<span class="line"><span>标签: \${diary.tags?.join(&#39;, &#39;)}</span></span>
<span class="line"><span>内容: \${diary.content}\`;</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>      .join(&#39;\\n\\n━━━━━\\n\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 4. 构建 prompt</span></span>
<span class="line"><span>    const prompt = \`你是一个温暖贴心的 AI 日记助手。基于用户的日记内容回答问题，用亲切自然的语言。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请根据以下日记内容回答问题：</span></span>
<span class="line"><span>\${context}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题: \${question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>回答要求：</span></span>
<span class="line"><span>1. 如果日记中有相关信息，请结合日记内容给出详细、温暖的回答</span></span>
<span class="line"><span>2. 可以总结多篇日记的内容，找出共同点或趋势</span></span>
<span class="line"><span>3. 如果日记中没有相关信息，请温和地告知用户</span></span>
<span class="line"><span>4. 用第一人称&quot;你&quot;来称呼日记的作者</span></span>
<span class="line"><span>5. 回答要有同理心，让用户感到被理解和关心</span></span>
<span class="line"><span></span></span>
<span class="line"><span>AI 助手的回答:\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 5. 调用 LLM 生成回答</span></span>
<span class="line"><span>    console.log(&#39;\\n【AI 回答】&#39;);</span></span>
<span class="line"><span>    const response = await model.invoke(prompt);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span>    console.log(&#39;\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return response.content;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;回答问题时出错:&#39;, error.message);</span></span>
<span class="line"><span>    return &#39;抱歉，处理您的问题时出现了错误。&#39;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function main() {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;连接到 Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ 已连接\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    await answerDiaryQuestion(&quot;我最近做了什么让我感到快乐的事情？&quot;, 2);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;错误:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>这次把温度调高点，让 AI 可以发挥创造性回答：</p><p><img src="`+w+'" alt="image-20260128152638852"></p><p>我们先把 query 向量化，去 Milvus 里查出相关数据：</p><p><img src="'+T+'" alt="image-20260128152647119"></p><p>然后把这些加到 prompt 里让大模型回答：</p><p><img src="'+R+'" alt="image-20260128152654322"></p><p>跑一下：</p><video src="'+$+`" controls></video><p>可以看到，大模型基于我们的问题，查询了相关的日记，然后做了回答。</p><p>完全是根据语义检索的！</p><p>实际的 AI Agent 里就是这样来做 RAG 的。</p><p>最后，我们做了 query、insert，自然要把 update 和 delete 也测一下：</p><p>创建 src/update.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from &quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ai_diary&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>  apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>  model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
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
<span class="line"><span>async function getEmbedding(text) {</span></span>
<span class="line"><span>  const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>  return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function main() {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;Connecting to Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ Connected\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 更新数据（Milvus 通过 upsert 实现更新）</span></span>
<span class="line"><span>    console.log(&#39;Updating diary entry...&#39;);</span></span>
<span class="line"><span>    const updateId = &#39;diary_001&#39;;</span></span>
<span class="line"><span>    const updatedContent = {</span></span>
<span class="line"><span>      id: updateId,</span></span>
<span class="line"><span>      content: &#39;今天下了一整天的雨，心情很糟糕。工作上遇到了很多困难，感觉压力很大。一个人在家，感觉特别孤独。&#39;,</span></span>
<span class="line"><span>      date: &#39;2026-01-10&#39;,</span></span>
<span class="line"><span>      mood: &#39;sad&#39;,</span></span>
<span class="line"><span>      tags: [&#39;生活&#39;, &#39;散步&#39;, &#39;朋友&#39;]</span></span>
<span class="line"><span>    };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&#39;Generating new embedding...&#39;);</span></span>
<span class="line"><span>    const vector = await getEmbedding(updatedContent.content);</span></span>
<span class="line"><span>    const updateData = { ...updatedContent, vector };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await client.upsert({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      data: [updateData]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`✓ Updated diary entry: \${updateId}\`);</span></span>
<span class="line"><span>    console.log(\`  New content: \${updatedContent.content}\`);</span></span>
<span class="line"><span>    console.log(\`  New mood: \${updatedContent.mood}\`);</span></span>
<span class="line"><span>    console.log(\`  New tags: \${updatedContent.tags.join(&#39;, &#39;)}\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;Error:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>因为要向量化，所以也要嵌入模型。</p><p><img src="`+P+'" alt="image-20260128152702586"></p><p>调用 upsert 方法，数据里带上 id 即可。</p><video src="'+S+`" controls></video><p>这样，更新就完成了。</p><p>最后测一下删除：</p><p>创建 src/delete.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient } from &#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ai_diary&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new MilvusClient({</span></span>
<span class="line"><span>  address: &#39;localhost:19530&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async function main() {</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    console.log(&#39;Connecting to Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ Connected\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 删除单条数据</span></span>
<span class="line"><span>    console.log(&#39;Deleting diary entry...&#39;);</span></span>
<span class="line"><span>    const deleteId = &#39;diary_005&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await client.delete({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      filter: \`id == &quot;\${deleteId}&quot;\`</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`✓ Deleted \${result.delete_cnt} record(s)\`);</span></span>
<span class="line"><span>    console.log(\`  ID: \${deleteId}\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 批量删除</span></span>
<span class="line"><span>    console.log(&#39;Batch deleting diary entries...&#39;);</span></span>
<span class="line"><span>    const deleteIds = [&#39;diary_002&#39;, &#39;diary_003&#39;];</span></span>
<span class="line"><span>    const idsStr = deleteIds.map(id =&gt; \`&quot;\${id}&quot;\`).join(&#39;, &#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const batchResult = await client.delete({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      filter: \`id in [\${idsStr}]\`</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`✓ Batch deleted \${batchResult.delete_cnt} record(s)\`);</span></span>
<span class="line"><span>    console.log(\`  IDs: \${deleteIds.join(&#39;, &#39;)}\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 条件删除</span></span>
<span class="line"><span>    console.log(&#39;Deleting by condition...&#39;);</span></span>
<span class="line"><span>    const conditionResult = await client.delete({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      filter: \`mood == &quot;sad&quot;\`</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`✓ Deleted \${conditionResult.delete_cnt} record(s) with mood=&quot;sad&quot;\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;Error:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>这个不用向量化数据，也就不用嵌入模型。</p><p>这里用了 filter</p><p>根据条件来删除，或者 id in [1,2,3] 这样来批量删除。</p><p>我们这里删了一个 mood 为 sad 的，一个 id 为 2、3 的，一个 id 为 5 的</p><p>跑一下：</p><video src="`+V+'" controls></video><p>可以看到，数据都被正确删除了。</p><p>这样我们就完成了对 Milvus 数据的增删改查。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>这节我们学了 Milvus 向量数据库。</p><p>MySQL 数据库只能根据 id、关键词去检索，涉及到语义检索的，我们都会存到 Milvus 里。</p><p>我们用 docker compose 跑了 Milvus 数据库，然后在 attu （GUI 工具） 和 node 代码里连上，并做了增删改查。</p><p>Milvus 分为 database、collection、entity 这三级，collection 要指定数据结构也就是 schema。</p><p>vector 向量字段需要做索引，用来快速检索。</p><p>我们把 Milvus 接入了 RAG 流程，实现了 AI 日记本的功能。可以根据自然语言去做语义检索，查出最相关的日记。</p><p>MySQL 和 Milvus 分别用于不同的场景，一个是做精确查询，可以关联查出很多表的数据，一个是做语义检索，可以用自然语言来查询。</p><p>实际上一般会做双写，同时对两者做增删改查。</p><p>后面项目里我们也会同时用 MySQL 和 Milvus。</p><p>做 AI Agent 项目，Milvus 向量数据库是是必备技术，可以写到简历上，围绕这个聊很多功能的实现，比如知识、记忆等，需要重点掌握。</p>',168)])])}const ss=z(U,[["render",j]]);export{Z as __pageData,ss as default};
