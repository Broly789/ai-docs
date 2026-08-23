import{_ as n,a,b as p,c as e,d as l,e as t,f as o,g as i,h as c,i as r,j as d,k as u,l as m}from"./chunks/6.BuT0NGEs.js";import{_ as h,o as g,c as _,ag as q}from"./chunks/framework.lghGfHnE.js";const S=JSON.parse('{"title":"07-知识库的 loader 和 splitter：从各种来源加载文档并分割成小块","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/07-知识库的 loader 和 splitter：从各种来源加载文档并分割成小块/index.md","filePath":"前端转AI Agent/07-知识库的 loader 和 splitter：从各种来源加载文档并分割成小块/index.md"}'),v={name:"前端转AI Agent/07-知识库的 loader 和 splitter：从各种来源加载文档并分割成小块/index.md"};function b(k,s,x,f,A,y){return g(),_("div",null,[...s[0]||(s[0]=[q('<h1 id="_07-知识库的-loader-和-splitter-从各种来源加载文档并分割成小块" tabindex="-1">07-知识库的 loader 和 splitter：从各种来源加载文档并分割成小块 <a class="header-anchor" href="#_07-知识库的-loader-和-splitter-从各种来源加载文档并分割成小块" aria-label="Permalink to &quot;07-知识库的 loader 和 splitter：从各种来源加载文档并分割成小块&quot;">​</a></h1><p>上节我们学了 RAG<em>()</em>，它可以解决大模型的幻觉问题。</p><p>幻觉就是大模型对于它不知道的知识，会以为自己知道，然后胡乱回答。</p><p>解决方案 RAG 就是根据用户的 prompt，去知识库查询相关文档，加到 prompt 里给到大模型作为背景知识来回答。</p><p><img src="'+n+'" alt="image-20260128150820285"></p><p>这种相关文档的检索，要根据 prompt 的语义来搜，所以一般要结合向量来实现：</p><p>基于嵌入模型把文档向量化，存入向量数据库<em>()</em>，查询的时候把 prompt 向量化，根据余弦相似度，来检索最相近的向量，然后把相关文档放到 prompt 里。</p><p><img src="'+a+'" alt="image-20260128150826468"></p><p>上节我们跑通了这个流程：</p><video src="'+p+'" controls></video><p>会查询出几个相似度最高的文档放到 prompt 里，大模型基于这些来回答。</p><p>但上节我们是直接创建的 Document 对象，然后用嵌入模型存入了向量数据库：</p><p><img src="'+e+'" alt="image-20260128150834844"></p><p>实际上知识的来源可能有很多：</p><p>一个 word 文档、一个 pdf 文件、一个 youtube 视频、一个 url、一个 x 的推文等。</p><p>这种显然就不是直接创建 Document 对象了，而是要用各种 loader 来转换：</p><p><img src="'+l+'" alt="image-20260128150841857"></p><p>经过对应的 loader 处理后，变成 Document，之后再由嵌入模型向量化后存入知识库。</p><p>知识有各种来源，所以对应的各种 loader 也很多：</p><p>现在 langchain 文档里有 180+ loader：</p><p><a href="https://docs.langchain.com/oss/python/integrations/document_loaders" target="_blank" rel="noreferrer">https://docs.langchain.com/oss/python/integrations/document_loaders</a></p><video src="'+t+'" controls></video><p>你可以把各种知识来源通过 loader 转化为文档存入知识库。</p><p>当然，有的文档可能会很大，比如一个 pdf 文件可能是一本书的大小。</p><p>这种很明显不能直接把转化后的 Document 向量化，需要先拆分文档。</p><p>也就是需要 Splitter</p><p><img src="'+o+'" alt="image-20260128150848941"></p><p>大的文档经过 TextSplitter 分割后，变成一个个小文档，再给到嵌入模型做向量化。</p><p>分割最简单的就是按照字符，比如换行符 \\n</p><p>但并不是每一行一个 Document，而是要设置一个 chunk size，按照换行符分割好的内容加入到这个 Chunk，当达到 chunk size 后，再继续生成下个 Chunk。</p><p><img src="'+i+`" alt="image-20260128150855163"></p><p>这个 Chunk 也是 Document 对象，只是文档内容是分割好的一个个大小合适的块。</p><p>我们写代码来跑一边这个流程。</p><p>在上节的 rag-test 项目里继续写：</p><p>创建 src/loader-and-splitter.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { CheerioWebBaseLoader } from&quot;@langchain/community/document_loaders/web/cheerio&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const cheerioLoader = new CheerioWebBaseLoader(</span></span>
<span class="line"><span>&quot;https://juejin.cn/post/7233327509919547452&quot;,</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    selector: &#39;.main-area p&#39;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const documents = await cheerioLoader.load();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(documents);</span></span></code></pre></div><p>我们用 CheerioWebBaseLoader 这个 loader 来加载一个网页。</p><p>安装下用到的包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install cheerio @langchain/community</span></span></code></pre></div><p>各种 loader 显然是社区维护，所以在 @langchain/community 这个包下。</p><video src="`+c+'" controls></video><p>这里我们用 loader 加载网页，取出 .main-area 下所有 p 标签的内容。</p><p>跑一下：</p><video src="'+r+'" controls></video><p>可以看到，网页内容中选择器的部分被取出来了，放入了 Document 对象。</p><p>现在的 Document 太大了，我们分割下：</p><p><img src="'+d+'" alt="image-20260128150903468"></p><p>splitter 在 @langchain/textsplitters 这个包下，安装下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/textsplitters</span></span></code></pre></div><p>我们指定了 chunkSize 是 400 个字符，然后前后重复 50 个字符。</p><p>分割符是优先 。 其次 ！？</p><p>跑一下：</p><video src="'+u+`" controls></video><p>可以看到，文档被分成了 4 个小的文档。</p><p>每个文档是都是 400 字符左右，前后重复了 50 个字符。</p><p>这样分割好的文档用来做 RAG 性能显然会更好，不需要加载整个大文档。</p><p>我们把完整的 RAG 流程写一下：</p><p>创建 src/loader-and-splitter2.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { RecursiveCharacterTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span>import { MemoryVectorStore } from&quot;@langchain/classic/vectorstores/memory&quot;;</span></span>
<span class="line"><span>import { CheerioWebBaseLoader } from&quot;@langchain/community/document_loaders/web/cheerio&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const embeddings = new OpenAIEmbeddings({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>model: process.env.EMBEDDINGS_MODEL_NAME,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const cheerioLoader = new CheerioWebBaseLoader(</span></span>
<span class="line"><span>&quot;https://juejin.cn/post/7233327509919547452&quot;,</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    selector: &#39;.main-area p&#39;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const documents = await cheerioLoader.load();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.assert(documents.length === 1);</span></span>
<span class="line"><span>console.log(\`Total characters: \${documents[0].pageContent.length}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const textSplitter = new RecursiveCharacterTextSplitter({</span></span>
<span class="line"><span>chunkSize: 500,  // 每个分块的字符数</span></span>
<span class="line"><span>chunkOverlap: 50,  // 分块之间的重叠字符数</span></span>
<span class="line"><span>separators: [&quot;。&quot;, &quot;！&quot;, &quot;？&quot;],  // 分割符，优先使用段落分隔</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await textSplitter.splitDocuments(documents);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(\`文档分割完成，共 \${splitDocuments.length} 个分块\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;正在创建向量存储...&quot;);</span></span>
<span class="line"><span>const vectorStore = await MemoryVectorStore.fromDocuments(</span></span>
<span class="line"><span>  splitDocuments,</span></span>
<span class="line"><span>  embeddings,</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>console.log(&quot;向量存储创建完成\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retriever = vectorStore.asRetriever({ k: 2 });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const questions = [</span></span>
<span class="line"><span>&quot;父亲的去世对作者的人生态度产生了怎样的根本性逆转？&quot;</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// RAG 流程：对每个问题进行检索和回答</span></span>
<span class="line"><span>for (const question of questions) {</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span>console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 retriever 获取相关文档</span></span>
<span class="line"><span>const retrievedDocs = await retriever.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 similaritySearchWithScore 获取相似度评分</span></span>
<span class="line"><span>const scoredResults = await vectorStore.similaritySearchWithScore(question, 2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 打印检索到的文档和相似度评分</span></span>
<span class="line"><span>console.log(&quot;\\n【检索到的文档及相似度评分】&quot;);</span></span>
<span class="line"><span>  retrievedDocs.forEach((doc, i) =&gt; {</span></span>
<span class="line"><span>    // 找到对应的评分</span></span>
<span class="line"><span>    const scoredResult = scoredResults.find(([scoredDoc]) =&gt;</span></span>
<span class="line"><span>      scoredDoc.pageContent === doc.pageContent</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    const score = scoredResult ? scoredResult[1] : null;</span></span>
<span class="line"><span>    const similarity = score !== null ? (1 - score).toFixed(4) : &quot;N/A&quot;;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    console.log(\`\\n[文档 \${i + 1}] 相似度: \${similarity}\`);</span></span>
<span class="line"><span>    console.log(\`内容: \${doc.pageContent}\`);</span></span>
<span class="line"><span>    if (doc.metadata &amp;&amp; Object.keys(doc.metadata).length &gt; 0) {</span></span>
<span class="line"><span>      console.log(\`元数据:\`, doc.metadata);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 构建 prompt</span></span>
<span class="line"><span>const context = retrievedDocs</span></span>
<span class="line"><span>    .map((doc, i) =&gt;\`[片段\${i + 1}]\\n\${doc.pageContent}\`)</span></span>
<span class="line"><span>    .join(&quot;\\n\\n━━━━━\\n\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = \`你是一个文章辅助阅读助手，根据文章内容来解答：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>文章内容：</span></span>
<span class="line"><span>\${context}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题: \${question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>你的回答:\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;\\n【AI 回答】&quot;);</span></span>
<span class="line"><span>const response = await model.invoke(prompt);</span></span>
<span class="line"><span>console.log(response.content);</span></span>
<span class="line"><span>console.log(&quot;\\n&quot;);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>整体流程和上节一样：用嵌入模型把文档存入向量数据库，先检索和用户的问题相似度最高的 2 个文档，把它加入 prompt，然后调用大模型基于文档回答。</p><video src="`+m+'" controls></video><p>可以看到，loader 加载了文档，用 splitter 分成了 4 个分块（chunk）。</p><p>回答的时候检索了相似度最高的 2 个文档块，基于这个做了回答。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>这节我们学了 loader 和 splitter。</p><p>loader 可以从各种地方加载内容作为 Document，比如 word、pdf、网页、youtube、x 的推文等等。</p><p>现在有 180+ 的 loader，社区维护，所以是在 @langchain/community 这个包。</p><p>加载后的 Document 可能会很大，需要分割成一个个小的文档，所以需要 Splitter。</p><p>splitter 在 @langchain/text-splitters 这个包。</p><p>我们写了一个读取网页里的文章内容作为文档，分割后放入知识库的 RAG 案例。</p><p>这节只要理解这俩概念就行，具体 loader 和 splitter 有很多类型，下节我们详细过一遍</p>',72)])])}const E=h(v,[["render",b]]);export{S as __pageData,E as default};
