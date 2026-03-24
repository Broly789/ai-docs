import{_ as s,a,b as p,c as l,d as e,e as i,f as c,g as t,h as o,i as r,j as d,k as m,l as u,m as g,n as _,o as h,p as b,q as v}from"./chunks/4.BvGkvdbJ.js";import{_ as E,o as C,c as I,ag as y}from"./chunks/framework.BYTi4OdY.js";const T=JSON.parse('{"title":"10-Milvus + RAG 实战：电子书语义检索助手","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/10-Milvus + RAG 实战：电子书语义检索助手/index.md","filePath":"前端转AI Agent/10-Milvus + RAG 实战：电子书语义检索助手/index.md"}'),k={name:"前端转AI Agent/10-Milvus + RAG 实战：电子书语义检索助手/index.md"};function M(x,n,A,O,f,N){return C(),I("div",null,[...n[0]||(n[0]=[y('<h1 id="_10-milvus-rag-实战-电子书语义检索助手" tabindex="-1">10-Milvus + RAG 实战：电子书语义检索助手 <a class="header-anchor" href="#_10-milvus-rag-实战-电子书语义检索助手" aria-label="Permalink to &quot;10-Milvus + RAG 实战：电子书语义检索助手&quot;">​</a></h1><p>我们学了 loader、splitter、向量数据库 Milvus，这样我们 RAG 流程就完整跑通了：</p><p><img src="'+s+'" alt="image-20260128153611867"></p><p>用 loader 从各种来源加载文档，用 splitter 分块，然后用嵌入模型向量化后存到向量数据库 Milvus。</p><p><img src="'+a+'" alt="image-20260128153618609"></p><p>查询的时候，把 query 也用嵌入模型向量化，根据余弦相似度，匹配最相近的文档返回</p><p><img src="'+p+'" alt="image-20260128153625742"></p><p>也就是这样：</p><p><img src="'+l+'" alt="image-20260128153632023"></p><p>这个流程涉及到的技术我们已经详细了一遍。</p><p>这节我们就来做一个综合性的小实战：电子书语义检索助手。</p><p>我有一些 .epub 格式的电子书：</p><video src="'+e+'" controls></video><p>比如《天龙八部》这本书，还是挺厚的。</p><p>如果我想从中查一下段誉会什么武功</p><p>怎么查？</p><p>用 mysql 那种关键词查询可以么？</p><p>很明显不行，你关键词都不知道怎么定。</p><p>这种只能用向量数据库语义查询，然后交给大模型来生成回答，也就是用 RAG 来做。</p><p>我们来写一下：</p><p>还是在之前 milvus-test 那个项目。</p><p>创建 src/ebook-writer.mjs</p><p>先看下代码：</p><p><img src="'+i+'" alt="image-20260128153654165"></p><p>整体分为 3 步：</p><ul><li><p>连接 Milvus</p></li><li><p>创建 ebook 的集合</p></li><li><p>加载 epub 文件用 splitter 分块存入 Milvus</p></li></ul><p>集合的 schema 是这样的：</p><p><img src="'+c+'" alt="image-20260128153701440"></p><p>首先我们 hasCollection 判断集合是否存在，不存在就 createCollection</p><p>包含 id、book_id、book_name、chapter_num（第几章）、index（第几个分块）、content（内容）、vector（向量）</p><p>向量 vector 字段是做语义匹配的，其余的都是元信息，记录了书名、第几章、第几个分块。</p><p>book_id 这个是用来和 mysql 里 book 表关联的，这里暂时不用。</p><p>然后 createIndex 创建了 vector 字段的索引</p><p>最后要 loadCollection 把这个集合加载到内存才能做快速语义检索。</p><p><img src="'+t+'" alt="image-20260128153709457"></p><p>hasCollection、createCollection、createIndex、loadCollection 这些都很容易理解，后面经常写。</p><p>然后是 loader 加载 epub 的文件，并 splitter 分块：</p><p><img src="'+o+'" alt="image-20260128153716098"></p><p>首先用 EPubLoader 加载 epub 文件，并对每一章做下分割。</p><p>但每一章内容还是太多了，再用 RecursiveCharacterTextSplitter 对每章内容以每 500 个字符分下块：</p><p><img src="'+r+'" alt="image-20260128153722539"></p><p>分块之后调用插入方法。</p><p><img src="'+d+`" alt="image-20260128153732937"></p><p>插入逻辑就是对 content 用嵌入模型向量化，然后调用 insert 方法插入到 Milvus 的集合中。</p><p>完整代码如下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { parse } from&#39;path&#39;;</span></span>
<span class="line"><span>import { MilvusClient, DataType, MetricType, IndexType } from&#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { EPubLoader } from&quot;@langchain/community/document_loaders/fs/epub&quot;;</span></span>
<span class="line"><span>import { RecursiveCharacterTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ebook_collection&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span>const CHUNK_SIZE = 500; // 拆分到 500 个字符</span></span>
<span class="line"><span>const EPUB_FILE = &#39;./天龙八部.epub&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 从文件名提取书名（去掉扩展名）</span></span>
<span class="line"><span>const BOOK_NAME = parse(EPUB_FILE).name;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Embeddings 模型</span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>dimensions: VECTOR_DIM</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Milvus 客户端</span></span>
<span class="line"><span>const client = new MilvusClient({</span></span>
<span class="line"><span>address: &#39;localhost:19530&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 获取文本的向量嵌入</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction getEmbedding(text) {</span></span>
<span class="line"><span>const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 创建或获取集合</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction ensureCollection(bookId) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    // 检查集合是否存在</span></span>
<span class="line"><span>    const hasCollection = await client.hasCollection({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (!hasCollection.value) {</span></span>
<span class="line"><span>      console.log(&#39;创建集合...&#39;);</span></span>
<span class="line"><span>      await client.createCollection({</span></span>
<span class="line"><span>        collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>        fields: [</span></span>
<span class="line"><span>          { name: &#39;id&#39;, data_type: DataType.VarChar, max_length: 100, is_primary_key: true },</span></span>
<span class="line"><span>          { name: &#39;book_id&#39;, data_type: DataType.VarChar, max_length: 100 },</span></span>
<span class="line"><span>          { name: &#39;book_name&#39;, data_type: DataType.VarChar, max_length: 200 },</span></span>
<span class="line"><span>          { name: &#39;chapter_num&#39;, data_type: DataType.Int32 },</span></span>
<span class="line"><span>          { name: &#39;index&#39;, data_type: DataType.Int32 },</span></span>
<span class="line"><span>          { name: &#39;content&#39;, data_type: DataType.VarChar, max_length: 10000 },</span></span>
<span class="line"><span>          { name: &#39;vector&#39;, data_type: DataType.FloatVector, dim: VECTOR_DIM }</span></span>
<span class="line"><span>        ]</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合创建成功&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 创建索引</span></span>
<span class="line"><span>      console.log(&#39;创建索引...&#39;);</span></span>
<span class="line"><span>      await client.createIndex({</span></span>
<span class="line"><span>        collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>        field_name: &#39;vector&#39;,</span></span>
<span class="line"><span>        index_type: IndexType.IVF_FLAT,</span></span>
<span class="line"><span>        metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>        params: { nlist: 1024 }</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>      console.log(&#39;✓ 索引创建成功&#39;);</span></span>
<span class="line"><span>    } </span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>    // 确保集合已加载</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      await client.loadCollection({ collection_name: COLLECTION_NAME });</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合已加载&#39;);</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合已处于加载状态&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;创建集合时出错:&#39;, error.message);</span></span>
<span class="line"><span>    throw error;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 将文档块批量插入到 Milvus（流式处理）</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction insertChunksBatch(chunks, bookId, chapterNum) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    if (chunks.length === 0) {</span></span>
<span class="line"><span>      return0;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 为每个文档块生成向量并构建插入数据</span></span>
<span class="line"><span>    const insertData = awaitPromise.all(</span></span>
<span class="line"><span>      chunks.map(async (chunk, chunkIndex) =&gt; {</span></span>
<span class="line"><span>        const vector = await getEmbedding(chunk);</span></span>
<span class="line"><span>        // 手动生成 ID：book_id_chapterNum_index</span></span>
<span class="line"><span>        return {</span></span>
<span class="line"><span>          id: \`\${bookId}_\${chapterNum}_\${chunkIndex}\`,</span></span>
<span class="line"><span>          book_id: bookId,</span></span>
<span class="line"><span>          book_name: BOOK_NAME,</span></span>
<span class="line"><span>          chapter_num: chapterNum,</span></span>
<span class="line"><span>          index: chunkIndex,</span></span>
<span class="line"><span>          content: chunk,</span></span>
<span class="line"><span>          vector: vector</span></span>
<span class="line"><span>        };</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 批量插入到 Milvus</span></span>
<span class="line"><span>    const insertResult = await client.insert({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      data: insertData</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    returnNumber(insertResult.insert_cnt) || 0;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(\`插入章节 \${chapterNum} 的数据时出错:\`, error.message);</span></span>
<span class="line"><span>    console.error(&#39;错误详情:&#39;, error);</span></span>
<span class="line"><span>    throw error;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 加载 EPUB 文件并进行流式处理（边处理边插入）</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction loadAndProcessEPubStreaming(bookId) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(\`\\n开始加载 EPUB 文件: \${EPUB_FILE}\`);</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 使用 EPubLoader 加载文件，按章节拆分</span></span>
<span class="line"><span>    const loader = new EPubLoader(</span></span>
<span class="line"><span>      EPUB_FILE,</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        splitChapters: true,</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const documents = await loader.load();</span></span>
<span class="line"><span>    console.log(\`✓ 加载完成，共 \${documents.length} 个章节\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 创建文本拆分器，拆分到 500 个字符</span></span>
<span class="line"><span>    const textSplitter = new RecursiveCharacterTextSplitter({</span></span>
<span class="line"><span>      chunkSize: CHUNK_SIZE,</span></span>
<span class="line"><span>      chunkOverlap: 50, // 重叠 50 个字符，保持上下文连贯性</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    let totalInserted = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 遍历每个章节，进行二次拆分并立即插入</span></span>
<span class="line"><span>    for (let chapterIndex = 0; chapterIndex &lt; documents.length; chapterIndex++) {</span></span>
<span class="line"><span>      const chapter = documents[chapterIndex];</span></span>
<span class="line"><span>      const chapterContent = chapter.pageContent;</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      console.log(\`处理第 \${chapterIndex + 1}/\${documents.length} 章...\`);</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      // 使用 splitter 进行二次拆分</span></span>
<span class="line"><span>      const chunks = await textSplitter.splitText(chapterContent);</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      console.log(\`  拆分为 \${chunks.length} 个片段\`);</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      if (chunks.length === 0) {</span></span>
<span class="line"><span>        console.log(\`  跳过空章节\\n\`);</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      console.log(\`  生成向量并插入中...\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 立即生成向量并插入该章节的所有片段</span></span>
<span class="line"><span>      const insertedCount = await insertChunksBatch(chunks, bookId, chapterIndex + 1);</span></span>
<span class="line"><span>      totalInserted += insertedCount;</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      console.log(\`  ✓ 已插入 \${insertedCount} 条记录（累计: \${totalInserted}）\\n\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n总共插入 \${totalInserted} 条记录\\n\`);</span></span>
<span class="line"><span>    return totalInserted;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;加载 EPUB 文件时出错:&#39;, error.message);</span></span>
<span class="line"><span>    throw error;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 主函数</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span>    console.log(&#39;电子书处理程序&#39;);</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 连接 Milvus</span></span>
<span class="line"><span>    console.log(&#39;\\n连接 Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ 已连接\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 设置 book_id（</span></span>
<span class="line"><span>    const bookId = 1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 确保集合存在</span></span>
<span class="line"><span>    await ensureCollection(bookId);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 加载和处理 EPUB 文件（流式处理，边处理边插入）</span></span>
<span class="line"><span>    await loadAndProcessEPubStreaming(bookId);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span>    console.log(&#39;处理完成！&#39;);</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;\\n错误:&#39;, error.message);</span></span>
<span class="line"><span>    console.error(error.stack);</span></span>
<span class="line"><span>    process.exit(1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>安装下用到的依赖包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/community  epub2 html-to-text @langchain/textsplitters</span></span></code></pre></div><p>loader 在 @langchain/community 这个包，因为是社区维护</p><p>splitter 都在 @langchain/textsplitters 这个包</p><p>跑一下：</p><video src="`+m+'" controls></video><p>等《天龙八部》电子书全部拆分存入向量数据库。</p><p>一共 3000 多条记录：</p><p><img src="'+u+'" alt="image-20260128153744147"></p><p><img src="'+g+`" alt="image-20260128153749236"></p><p>每条都记录了元信息，比如章节数、每章的第几个分块。</p><p>不用担心分块多，对数据库来说，海量数据都一样存取。</p><p>接下来我们试下查询：</p><p>创建 src/ebook-query.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient, MetricType } from&#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ebook_collection&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>dimensions: VECTOR_DIM</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new MilvusClient({</span></span>
<span class="line"><span>address: &#39;localhost:19530&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction getEmbedding(text) {</span></span>
<span class="line"><span>const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&#39;Connecting to Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ Connected\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 确保集合已加载</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      await client.loadCollection({ collection_name: COLLECTION_NAME });</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合已加载\\n&#39;);</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      // 如果已经加载，会报错，忽略即可</span></span>
<span class="line"><span>      if (!error.message.includes(&#39;already loaded&#39;)) {</span></span>
<span class="line"><span>        throw error;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合已处于加载状态\\n&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 向量搜索</span></span>
<span class="line"><span>    console.log(&#39;Searching for similar ebook content...&#39;);</span></span>
<span class="line"><span>    const query = &#39;段誉会什么武功？&#39;;</span></span>
<span class="line"><span>    console.log(\`Query: &quot;\${query}&quot;\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const queryVector = await getEmbedding(query);</span></span>
<span class="line"><span>    const searchResult = await client.search({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      vector: queryVector,</span></span>
<span class="line"><span>      limit: 3,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>      output_fields: [&#39;id&#39;, &#39;book_id&#39;, &#39;chapter_num&#39;, &#39;index&#39;, &#39;content&#39;]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`Found \${searchResult.results.length} results:\\n\`);</span></span>
<span class="line"><span>    searchResult.results.forEach((item, index) =&gt; {</span></span>
<span class="line"><span>      console.log(\`\${index + 1}. [Score: \${item.score.toFixed(4)}]\`);</span></span>
<span class="line"><span>      console.log(\`   ID: \${item.id}\`);</span></span>
<span class="line"><span>      console.log(\`   Book ID: \${item.book_id}\`);</span></span>
<span class="line"><span>      console.log(\`   Chapter: 第 \${item.chapter_num} 章\`);</span></span>
<span class="line"><span>      console.log(\`   Index: \${item.index}\`);</span></span>
<span class="line"><span>      console.log(\`   Content: \${item.content}\\n\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;Error:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>把 query 用嵌入模型向量化，然后用余弦相似度做下匹配：</p><p><img src="`+_+'" alt="image-20260128153757472"></p><p>我们问一下鸠摩智会什么武功，匹配最相似的 5 条记录：</p><p>跑一下：</p><video src="'+h+`" controls></video><p>可以看到，根据语义匹配出了一些相关文档。</p><p>你用 mysql 能搜出来么？</p><p>明显不能，这种就得用向量数据库 Milvus 做语义匹配。</p><p>当然，给一堆文档还不够，你得让大模型去理解文档，生成最终的回答。</p><p>我们写一下完整的 RAG 流程：</p><p>创建 src/ebook-reader-rag.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { MilvusClient, MetricType } from&#39;@zilliz/milvus2-sdk-node&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const COLLECTION_NAME = &#39;ebook_collection&#39;;</span></span>
<span class="line"><span>const VECTOR_DIM = 1024;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 OpenAI Chat 模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>temperature: 0.7,</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Embeddings 模型</span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>dimensions: VECTOR_DIM</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化 Milvus 客户端</span></span>
<span class="line"><span>const client = new MilvusClient({</span></span>
<span class="line"><span>address: &#39;localhost:19530&#39;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 获取文本的向量嵌入</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction getEmbedding(text) {</span></span>
<span class="line"><span>const result = await embeddings.embedQuery(text);</span></span>
<span class="line"><span>return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 从 Milvus 中检索相关的电子书内容</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction retrieveRelevantContent(question, k = 3) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    // 生成问题的向量</span></span>
<span class="line"><span>    const queryVector = await getEmbedding(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 在 Milvus 中搜索相似的内容</span></span>
<span class="line"><span>    const searchResult = await client.search({</span></span>
<span class="line"><span>      collection_name: COLLECTION_NAME,</span></span>
<span class="line"><span>      vector: queryVector,</span></span>
<span class="line"><span>      limit: k,</span></span>
<span class="line"><span>      metric_type: MetricType.COSINE,</span></span>
<span class="line"><span>      output_fields: [&#39;id&#39;, &#39;book_id&#39;, &#39;chapter_num&#39;, &#39;index&#39;, &#39;content&#39;]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return searchResult.results;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;检索内容时出错:&#39;, error.message);</span></span>
<span class="line"><span>    return [];</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 使用 RAG 回答关于《天龙八部》的问题</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction answerEbookQuestion(question, k = 3) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span>    console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>    console.log(&#39;=&#39;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 1. 检索相关内容</span></span>
<span class="line"><span>    console.log(&#39;\\n【检索相关内容】&#39;);</span></span>
<span class="line"><span>    const retrievedContent = await retrieveRelevantContent(question, k);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (retrievedContent.length === 0) {</span></span>
<span class="line"><span>      console.log(&#39;未找到相关内容&#39;);</span></span>
<span class="line"><span>      return&#39;抱歉，我没有找到相关的《天龙八部》内容。&#39;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 2. 打印检索到的内容及相似度</span></span>
<span class="line"><span>    retrievedContent.forEach((item, i) =&gt; {</span></span>
<span class="line"><span>      console.log(\`\\n[片段 \${i + 1}] 相似度: \${item.score.toFixed(4)}\`);</span></span>
<span class="line"><span>      console.log(\`书籍: \${item.book_id}\`);</span></span>
<span class="line"><span>      console.log(\`章节: 第 \${item.chapter_num} 章\`);</span></span>
<span class="line"><span>      console.log(\`片段索引: \${item.index}\`);</span></span>
<span class="line"><span>      console.log(\`内容: \${item.content.substring(0, 200)}\${item.content.length &gt; 200 ? &#39;...&#39; : &#39;&#39;}\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 3. 构建上下文</span></span>
<span class="line"><span>    const context = retrievedContent</span></span>
<span class="line"><span>      .map((item, i) =&gt; {</span></span>
<span class="line"><span>        return\`[片段 \${i + 1}]</span></span>
<span class="line"><span>章节: 第 \${item.chapter_num} 章</span></span>
<span class="line"><span>内容: \${item.content}\`;</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>      .join(&#39;\\n\\n━━━━━\\n\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 4. 构建 prompt</span></span>
<span class="line"><span>    const prompt = \`你是一个专业的《天龙八部》小说助手。基于小说内容回答问题，用准确、详细的语言。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请根据以下《天龙八部》小说片段内容回答问题：</span></span>
<span class="line"><span>\${context}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户问题: \${question}</span></span>
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
<span class="line"><span>    // 5. 调用 LLM 生成回答</span></span>
<span class="line"><span>    console.log(&#39;\\n【AI 回答】&#39;);</span></span>
<span class="line"><span>    const response = await model.invoke(prompt);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span>    console.log(&#39;\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return response.content;</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;回答问题时出错:&#39;, error.message);</span></span>
<span class="line"><span>    return&#39;抱歉，处理您的问题时出现了错误。&#39;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&#39;连接到 Milvus...&#39;);</span></span>
<span class="line"><span>    await client.connectPromise;</span></span>
<span class="line"><span>    console.log(&#39;✓ 已连接\\n&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 确保集合已加载</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      await client.loadCollection({ collection_name: COLLECTION_NAME });</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合已加载\\n&#39;);</span></span>
<span class="line"><span>    } catch (error) {</span></span>
<span class="line"><span>      // 如果已经加载，会报错，忽略即可</span></span>
<span class="line"><span>      if (!error.message.includes(&#39;already loaded&#39;)) {</span></span>
<span class="line"><span>        throw error;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      console.log(&#39;✓ 集合已处于加载状态\\n&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 问一个关于《天龙八部》的问题</span></span>
<span class="line"><span>    await answerEbookQuestion(&quot;鸠摩智会什么武功？&quot;,5);</span></span>
<span class="line"><span>  } catch (error) {</span></span>
<span class="line"><span>    console.error(&#39;错误:&#39;, error.message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>根据 query 查询出文档后，放到 prompt 里：</p><p><img src="`+b+'" alt="image-20260128153805941"></p><p>让大模型根据文档回答，并且引用原文片段。</p><p>跑一下：</p><video src="'+v+'" controls></video><p>可以看到，大模型根据片段内容做了回答，并且引用了原文。</p><p>（等很久是因为我们还没做流式输出，其实一直在生成）</p><p>这样，电子书语义检索助手就完成了。</p><p>你也可以把电子书换成公司内部的文档，实现文档检索，流程一样。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>这节我们把 loader、splitter、Milvus 向量数据库串了起来，做了一个电子书语义检索助手的小实战。</p><p>实际上公司项目就是这样来做 RAG 的，只不过 Milvus 存的内容不同，但流程一样。</p><p>现在语义检索出 Milvus 相关记录后，返回了 book_id，这个是对应 MySQL 里 book 表的 id，那是不是就可以顺带着关联查出 book 表和相关表的数据呢？</p><p>这就涉及到了 MySQL 和 Milvus 的联动，我们后面学到 MySQL 部分再继续深入。</p>',88)])])}const w=E(k,[["render",M]]);export{T as __pageData,w as default};
