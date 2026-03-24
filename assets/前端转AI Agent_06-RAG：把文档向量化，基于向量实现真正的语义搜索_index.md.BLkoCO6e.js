import{_ as n,a,b as p,c as e,d as l,e as t,f as i,g as o,h as c,i as r,j as u,k as m,l as d}from"./chunks/image-20260128150734609.BUIMy5Zj.js";import{_ as g,o as q,c as h,ag as _}from"./chunks/framework.D5NWgsO2.js";const f=JSON.parse('{"title":"06-RAG：把文档向量化，基于向量实现真正的语义搜索","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/06-RAG：把文档向量化，基于向量实现真正的语义搜索/index.md","filePath":"前端转AI Agent/06-RAG：把文档向量化，基于向量实现真正的语义搜索/index.md"}'),v={name:"前端转AI Agent/06-RAG：把文档向量化，基于向量实现真正的语义搜索/index.md"};function A(b,s,y,k,R,x){return q(),h("div",null,[...s[0]||(s[0]=[_('<h1 id="_06-rag-把文档向量化-基于向量实现真正的语义搜索" tabindex="-1">06-RAG：把文档向量化，基于向量实现真正的语义搜索 <a class="header-anchor" href="#_06-rag-把文档向量化-基于向量实现真正的语义搜索" aria-label="Permalink to &quot;06-RAG：把文档向量化，基于向量实现真正的语义搜索&quot;">​</a></h1><p>大模型所知道的知识，取决于在训练的时候给它的数据集。</p><p>如果你问它最近发生的事情，或者你企业内部私有文档的一些事情，它是不知道的。</p><p>但它很可能不会说自己不知道，而是会胡乱回答，也就是所谓的<strong>幻觉</strong>（以为自己知道）。</p><p>如何解决大模型的幻觉呢？</p><p>其实也很容易想到：</p><p>用户要查询的内容，我们先去内部知识库里查一下，把它放到 prompt 里再给大模型。</p><p>这样大模型通过这些文档知道了背景知识，就可以回答响应的问题了。</p><p>这就是 RAG<em>()</em>：</p><p>Retrieval 检索 - Augmented 增强 - Generation 生成</p><p>去知识库里<strong>检索</strong>用户问的知识的相关文档片段，作为背景知识加到 prompt 里<strong>增强</strong>它，让大模型根据这些来<strong>生成</strong>回答。</p><p><img src="'+n+'" alt="image-20260128150556122"></p><p>这个是很容易想到的思路，也是很贴切的名字。</p><p>但有个问题：</p><p>用户问了一个问题，你怎么把相关的文档片段查出来呢？</p><p>比如用户查水果的信息，你要把苹果、香蕉、草莓的相关文档查出来。</p><p>想想怎么做？</p><p>关键词搜索可以么？</p><p>很明显不行。</p><p>这种语义搜索就需要向量（Vector）了。</p><p>比如如果按照两个维度存储信息，分为可食用性、硬度：</p><ul><li><p>维度 1： 食用性（0 = 无，1 = 高）</p></li><li><p>维度 2： 硬度（0 = 软/液体，1 = 硬）</p></li></ul><p>那这几个概念大概是这样的向量：</p><ul><li><p>水果：[0.9, 0.3] 极高食用性，中低硬度</p></li><li><p>苹果：[0.9, 0.5] 高食用性，硬度适中</p></li><li><p>香蕉：[0.9, 0.1] 高食用性，非常软</p></li><li><p>石头：[0.1, 0.9] 几乎不可食用，非常硬</p></li></ul><p>可视化一下是这样：</p><p><img src="'+a+'" alt="image-20260128150604827"></p><p>明显可以看出来，苹果、水果、香蕉，这三个概念相关性很大，而水果和石头相关性就不大。</p><p>计算的话，可以通过夹角判断相似度，夹角越小相似度越高：</p><p><img src="'+p+'" alt="image-20260128150611878"></p><p>也就是<strong>余弦相似度</strong>（两个向量夹角的余弦值）。</p><p>当然，具体的向量数据肯定不会只有二维，可能会是几百维。</p><p>虽然高纬度没法可视化，但是原理是一样的。</p><p>我们都是通过两个概念对应的向量的余弦相似度来判断相关性。</p><p>也就是说<strong>通过向量计算实现语义检索！</strong></p><p>是不是很巧妙！</p><p>这就是为啥 RAG 一般都结合向量化来做，虽然基于关键词来做也是 RAG，但是那种没法语义搜索，意义不大。</p><p>有的同学可能会问，那给你一个概念，怎么计算它的向量值呢？</p><p>这个需要用到专门的模型，叫<strong>嵌入模型（Embedding Model）</strong>。</p><p>它和大语言模型（LLM）是不一样的，它的功能就只有把知识转成向量。</p><p>这个知识可以是文本、图片、语音等，向量化之后，就都可以实现语义搜索了！</p><p><img src="'+e+'" alt="image-20260128150618894"></p><p>我们写代码会用专门的嵌入模型，收费比大模型便宜很多很多。</p><p>那加上向量化之后的 RAG 流程是什么样的呢？</p><p><img src="'+l+`" alt="image-20260128150626169"></p><p>用户的 prompt 会通过嵌入模型转成向量，然后 retriever 基于这个向量去向量数据库中检索，找到相似的向量，把对应的文档块返回，加到 prompt 里作为背景知识，给大模型。</p><p>存的不是向量么？怎么记录向量关联的文档？</p><p>文档在向量化的时候，会在向量的元信息里记录来源文档。</p><p>综上，我们可以<strong>在原始 prompt 给到大模型之前，查询下知识库，把相关的文档作为背景知识加入到 Prompt 里，再让大模型回答，这就是 RAG。</strong></p><p>RAG 要实现语义查询，需要基于向量来做，把文档向量化存储到向量数据库<em>()</em>，查询的时候也把 Prompt 向量化，去数据库中做相似度检索，这样就可以找到语义相近的文档块。</p><p>知道了什么是 RAG，我们来写代码试一下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir rag-test</span></span>
<span class="line"><span>cd rag-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+t+`" alt="image-20260128150633424"></p><p>进入项目，安装下依赖：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/openai dotenv</span></span></code></pre></div><p>创建 src/hello-rag.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI, OpenAIEmbeddings } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { MemoryVectorStore } from&quot;@langchain/classic/vectorstores/memory&quot;;</span></span>
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
<span class="line"><span>const documents = [</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`光光是一个活泼开朗的小男孩，他有一双明亮的大眼睛，总是带着灿烂的笑容。光光最喜欢的事情就是和朋友们一起玩耍，他特别擅长踢足球，每次在球场上奔跑时，就像一道阳光一样充满活力。\`,</span></span>
<span class="line"><span>    metadata: { </span></span>
<span class="line"><span>      chapter: 1, </span></span>
<span class="line"><span>      character: &quot;光光&quot;, </span></span>
<span class="line"><span>      type: &quot;角色介绍&quot;, </span></span>
<span class="line"><span>      mood: &quot;活泼&quot;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`东东是光光最好的朋友，他是一个安静而聪明的男孩。东东喜欢读书和画画，他的画总是充满了想象力。虽然性格不同，但东东和光光从幼儿园就认识了，他们一起度过了无数个快乐的时光。\`,</span></span>
<span class="line"><span>    metadata: { </span></span>
<span class="line"><span>      chapter: 2, </span></span>
<span class="line"><span>      character: &quot;东东&quot;, </span></span>
<span class="line"><span>      type: &quot;角色介绍&quot;, </span></span>
<span class="line"><span>      mood: &quot;温馨&quot;</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`有一天，学校要举办一场足球比赛，光光非常兴奋，他邀请东东一起参加。但是东东从来没有踢过足球，他担心自己会拖累光光。光光看出了东东的担忧，他拍着东东的肩膀说：&quot;没关系，我们一起练习，我相信你一定能行的！&quot;\`,</span></span>
<span class="line"><span>    metadata: {</span></span>
<span class="line"><span>      chapter: 3,</span></span>
<span class="line"><span>      character: &quot;光光和东东&quot;,</span></span>
<span class="line"><span>      type: &quot;友情情节&quot;,</span></span>
<span class="line"><span>      mood: &quot;鼓励&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`接下来的日子里，光光每天放学后都会教东东踢足球。光光耐心地教东东如何控球、传球和射门，而东东虽然一开始总是踢不好，但他从不放弃。东东也用自己的方式回报光光，他画了一幅画送给光光，画上是两个小男孩在球场上一起踢球的场景。\`,</span></span>
<span class="line"><span>    metadata: {</span></span>
<span class="line"><span>      chapter: 4,</span></span>
<span class="line"><span>      character: &quot;光光和东东&quot;,</span></span>
<span class="line"><span>      type: &quot;友情情节&quot;,</span></span>
<span class="line"><span>      mood: &quot;互助&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`比赛那天终于到了，光光和东东一起站在球场上。虽然东东的技术还不够熟练，但他非常努力，而且他用自己的观察力帮助光光找到了对手的弱点。在关键时刻，东东传出了一个漂亮的球，光光接球后射门得分！他们赢得了比赛，更重要的是，他们的友谊变得更加深厚了。\`,</span></span>
<span class="line"><span>    metadata: {</span></span>
<span class="line"><span>      chapter: 5,</span></span>
<span class="line"><span>      character: &quot;光光和东东&quot;,</span></span>
<span class="line"><span>      type: &quot;高潮转折&quot;,</span></span>
<span class="line"><span>      mood: &quot;激动&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`从那以后，光光和东东成为了学校里最要好的朋友。光光教东东运动，东东教光光画画，他们互相学习，共同成长。每当有人问起他们的友谊，他们总是笑着说：&quot;真正的朋友就是互相帮助，一起变得更好的人！&quot;\`,</span></span>
<span class="line"><span>    metadata: {</span></span>
<span class="line"><span>      chapter: 6,</span></span>
<span class="line"><span>      character: &quot;光光和东东&quot;,</span></span>
<span class="line"><span>      type: &quot;结局&quot;,</span></span>
<span class="line"><span>      mood: &quot;欢乐&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>new Document({</span></span>
<span class="line"><span>    pageContent: \`多年后，光光成为了一名职业足球运动员，而东东成为了一名优秀的插画师。虽然他们走上了不同的道路，但他们的友谊从未改变。东东为光光设计了球衣上的图案，光光在每场比赛后都会给东东打电话分享喜悦。他们证明了，真正的友情可以跨越时间和距离，永远闪闪发光。\`,</span></span>
<span class="line"><span>    metadata: {</span></span>
<span class="line"><span>      chapter: 7,</span></span>
<span class="line"><span>      character: &quot;光光和东东&quot;,</span></span>
<span class="line"><span>      type: &quot;尾声&quot;,</span></span>
<span class="line"><span>      mood: &quot;温馨&quot;,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const vectorStore = await MemoryVectorStore.fromDocuments(</span></span>
<span class="line"><span>  documents,</span></span>
<span class="line"><span>  embeddings,</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const retriever = vectorStore.asRetriever({ k: 3 });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const questions = [</span></span>
<span class="line"><span>&quot;东东和光光是怎么成为朋友的？&quot;</span></span>
<span class="line"><span>];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>for (const question of questions) {</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span>console.log(\`问题: \${question}\`);</span></span>
<span class="line"><span>console.log(&quot;=&quot;.repeat(80));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 retriever 获取文档</span></span>
<span class="line"><span>const retrievedDocs = await retriever.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 similaritySearchWithScore 获取相似度评分</span></span>
<span class="line"><span>const scoredResults = await vectorStore.similaritySearchWithScore(question, 3);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 打印用到的文档和相似度评分</span></span>
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
<span class="line"><span>    console.log(\`元数据: 章节=\${doc.metadata.chapter}, 角色=\${doc.metadata.character}, 类型=\${doc.metadata.type}, 心情=\${doc.metadata.mood}\`);</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 构建 prompt</span></span>
<span class="line"><span>const context = retrievedDocs</span></span>
<span class="line"><span>    .map((doc, i) =&gt;\`[片段\${i + 1}]\\n\${doc.pageContent}\`)</span></span>
<span class="line"><span>    .join(&quot;\\n\\n━━━━━\\n\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = \`你是一个讲友情故事的老师。基于以下故事片段回答问题，用温暖生动的语言。如果故事中没有提到，就说&quot;这个故事里还没有提到这个细节&quot;。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>故事片段:</span></span>
<span class="line"><span>\${context}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题: \${question}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>老师的回答:\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;\\n【AI 回答】&quot;);</span></span>
<span class="line"><span>const response = await model.invoke(prompt);</span></span>
<span class="line"><span>console.log(response.content);</span></span>
<span class="line"><span>console.log(&quot;\\n&quot;);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>安装下用到的包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/classic</span></span></code></pre></div><p>这里我们用到了大语言模型 LLM，还有嵌入模型 OpenAIEmbeddings</p><p><img src="`+i+'" alt="image-20260128150646759"></p><p>具体的 model name 在 .env 里配置下：</p><p><img src="'+o+`" alt="image-20260128150655073"></p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># OpenAI API 配置</span></span>
<span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span>EMBEDDINGS_MODEL_NAME=text-embedding-v3</span></span></code></pre></div><p>这几个 Document 比较容易理解。这个故事直接问大模型，显然它是不知道的：</p><p><img src="`+c+'" alt="image-20260128150703251"></p><p>知识库里存的就是这些文档，可以加一些元数据。</p><p><img src="'+r+'" alt="image-20260128150711603"></p><p>用嵌入模型把这些文档向量化之后存入向量数据库。</p><p>并且返回一个 retriever，k 是 3 就是返回余弦相似度最大的 3 个 Document。</p><p><img src="'+u+'" alt="image-20260128150720443"></p><p>用 retriever 把 query 传入，通过向量的余弦相似度，找到语义最相关的 3 个文档片段，传入 prompt：</p><p><img src="'+m+'" alt="image-20260128150728604"></p><p>这就是增强后的 Prompt 了，之后问大模型问题的时候，它就有背景知识了。</p><p>跑一下：</p><p>可以看到，根据你的问题，查询到了 3 个文档，然后大模型基于这些做了回答。</p><p>这样我们就跑通了 RAG 的流程！</p><p>回过头来再看下这张图：</p><p><img src="'+d+'" alt="image-20260128150734609"></p><p>是不是就很清楚了！</p><p>我们对 query 通过嵌入模型向量化，然后查询出了余弦相似度最大的 3 个文档，用它增强 Prompt 后再问大模型，大模型基于这个生成回答。</p><p>这就是 RAG。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><span style="color:rgb(46,161,33);background-color:inherit;">总结</span> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;&lt;span style=&quot;color: rgb(46,161,33); background-color: inherit&quot;&gt;总结&lt;/span&gt;&quot;">​</a></h2><p>大模型训练完后，知识就不再更新了，它没法知道最新的一些信息，以及一些非互联网上公开的信息。</p><p>所以对于它不知道的东西，会胡乱回答，也就是幻觉问题。</p><p>解决这个问题的方式就是 RAG。</p><p>RAG 是检索、增强、生成，会基于用户的 query 去检索知识库，拿到相关文档后放到 Prompt 里增强它，之后给大大模型来生成回答。</p><p>检索肯定是要语义检索，但是关键词检索做不到这点，我们需要用向量来做，通过嵌入模型把知识向量化，这样就可以通过向量的余弦相似度（也就是夹角大小）来计算出两个知识的相关性，从而根据用户的 query 查询出相关的文档。</p><p>我们基于 LangChain 写了 RAG 的代码：</p><ul><li><p>fromDocuments api 基于 embeddings 模型把文档向量化存入数据库。</p></li><li><p>asRetriever 指定查询相似度最大的几个文档。</p></li><li><p>similaritySearchWithScore 相似度评分</p></li><li><p>retriever.invoke 来查询文档。</p></li></ul><p>只要你理解了 RAG 的流程，这些 api 自然也就会用了。</p><p>想一下，如果你要做公司内部文档的智能助手，是不是就可以用 RAG 来实现呢？</p>',92)])])}const C=g(v,[["render",A]]);export{f as __pageData,C as default};
