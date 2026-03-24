import{_ as s,a,b as p,c as e,d as t,e as l,f as i,g as c,h as o,i as r,j as u,k as m,l as g,m as d,n as h,o as k,p as x,q as v,r as S,s as C,t as q,u as b,v as _,w as T,x as D,y as f,z as R,A as w,B as E}from"./chunks/image-20260128152230917.BkvjV8bf.js";import{_ as j,o as I,c as N,ag as y}from"./chunks/framework.lghGfHnE.js";const U=JSON.parse('{"title":"LangChain 全部 Splitter","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/08-LangChain 全部 Splitter，其实只需要其中的一个/README.md","filePath":"前端转AI Agent/08-LangChain 全部 Splitter，其实只需要其中的一个/README.md"}'),O={name:"前端转AI Agent/08-LangChain 全部 Splitter，其实只需要其中的一个/README.md"};function A(F,n,z,L,P,M){return I(),N("div",null,[...n[0]||(n[0]=[y('<h1 id="langchain-全部-splitter" tabindex="-1">LangChain 全部 Splitter <a class="header-anchor" href="#langchain-全部-splitter" aria-label="Permalink to &quot;LangChain 全部 Splitter&quot;">​</a></h1><p>上节我们学了 loader 和 splitter</p><p><img src="'+s+'" alt="image-20260128152004429"></p><p>知识可能有各种来源，比如一个视频、一个 pdf、一个网页、一个 word 文档</p><p>这时候就需要通过各种 loader 从中提取信息，把它们转换成 Document</p><p>但是 Document 可能会很大，需要用 Splitter 分割成一个个的比较小的 Document（chunk）</p><p>之后用嵌入模型，把分块的文档向量化后存入向量数据库。</p><p>上节跑通了这个流程：</p><video src="'+a+'" controls></video><p>这节我们把所有的 Splitter 过一遍。</p><p>首先要区分 sperator 和 chunk size 的概念：</p><p>比如上节我们这样分割的 Document：</p><p><img src="'+p+'" alt="image-20260128152011683"></p><p>首先按照 。的 sperator 来分割字符串，然后按照 chunk size 放入一个个 Document，也就是这样：</p><p><img src="'+e+'" alt="image-20260128152017402"></p><p>如果分割后还是大于 chunk size，就需要按照后面的 sperator 继续分割，然后加上 overlap：</p><p><img src="'+t+'" alt="image-20260128152026090"></p><p>注意，<strong>overloap 只有文本超过 chunk size，文本被打断了才会加</strong>，不是所有的块都会有 overlap</p><p>比如上面那段话超过了 chunk size，分割到两个 chunk 里，第二个 chunk 就会按照设置重复一部分内容</p><p><img src="'+l+'" alt="image-20260128152031999"></p><p>设置这个是为了保证语义连贯性</p><p>通常设置为 chunkSize 的 10% - 20%</p><p>牺牲了一点存储空间（因为数据重复了），换取了模型对上下文理解的完整性。</p><p>那 langchain 都有哪些 splitter 呢？</p><p>我们看下 @langchain/textsplitters 这个包：</p><video src="'+i+'" controls></video><p>可以看到这个包导出的 splitter，以及它们的继承关系：</p><p><img src="'+c+'" alt="image-20260128152039521"></p><p>所有的 Splitter 都继承自 TextSplitter，包括 RecursiveCharacterTextSplitter 等。</p><p>而 MarkdownTextSplitter、LatexTextSplitter 又继承自 RecursiveCharacterTextSplitter。</p><p>其实很容易理解：</p><p>CharacterTextSplitter 是按照某个字符来分割，比如按照句号</p><p>RecursiveCharacterTextSplitter 是递归分割，比如“ 。 ？ ！”就是先尝试按照 。 分割，如果分割后大于 chunk 剩余空间再按照 ？ 分割，是一个递归过程。</p><p>而 MarkdownTextSplitter 自然就是按照 #、##、### 等一级级标题来递归分割，所以是 RecursiveCharacterTextSplitter 的子类。</p><p>Latex 是写数学公式的语法，比如这样：</p><p><a href="https://www.latexlive.com/" target="_blank" rel="noreferrer">https://www.latexlive.com/</a></p><video src="'+o+'" controls></video><p>它就是一种描述数学公式的语法，和 markdown 一样，自然也是递归按照某些字符分割的。</p><p>所以也是继承自 RecursiveCharacterTextSplitter</p><p>那 TokenTextSplitter 呢？</p><p>这个是另一种分割策略。</p><p>我们按照字符分割，分割出来的文档的 token 大小是不一定的。</p><p>token 是大模型输入的一个单位，可能一个单词是 1 到 2 个 token：</p><p>apple 是 1 个 token</p><p>pineapple 是 2 个 token</p><p>苹果是 1-2 个 token</p><p>我们试一下就知道了，用 js-tiktoken 这个包，它是 openai 模型的分词器</p><p><img src="'+r+`" alt="image-20260128152048976"></p><p>安装下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install js-tiktoken</span></span></code></pre></div><p>创建 src/tiktoken-test.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { getEncodingNameForModel } from &quot;js-tiktoken&quot;; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>const modelName = &quot;gpt-4&quot;; </span></span>
<span class="line"><span>const encodingName = getEncodingNameForModel(modelName);</span></span>
<span class="line"><span>console.log(encodingName);</span></span></code></pre></div><p>我们打印下 gpt-4 这个模型的编码的名字</p><video src="`+u+`" controls></video><p>然后可以用这个编码来计算下 token 数量：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { getEncoding, getEncodingNameForModel } from &quot;js-tiktoken&quot;; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>const modelName = &quot;gpt-4&quot;; </span></span>
<span class="line"><span>const encodingName = getEncodingNameForModel(modelName);</span></span>
<span class="line"><span>console.log(encodingName);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span>console.log(&#39;apple&#39;, enc.encode(&quot;apple&quot;).length);</span></span>
<span class="line"><span>console.log(&#39;pineapple&#39;, enc.encode(&quot;pineapple&quot;).length);</span></span>
<span class="line"><span>console.log(&#39;苹果&#39;, enc.encode(&quot;苹果&quot;).length);</span></span>
<span class="line"><span>console.log(&#39;吃饭&#39;, enc.encode(&quot;吃饭&quot;).length);</span></span>
<span class="line"><span>console.log(&#39;一二三&#39;, enc.encode(&quot;一二三&quot;).length);</span></span></code></pre></div><video src="`+m+'" controls></video><p>可以看到，字符和 token 数量并没有一个确定的关系，与不同模型的分词器有关。</p><p>这样我们按照字符数来计算 chunk size 就没法准确估算 token 大小。</p><p>对于需要精准控制 token 数量的场景就不大合适了。</p><p>这时候就可以用 TokenTextSplitter，它是按照 token 数来分割的。</p><p>回过头来再看下所有的 Splitter：</p><p><img src="'+g+`" alt="image-20260128152057440"></p><p>关系就比较清晰了。</p><p>先用一下 CharacterTextSplitter</p><p>创建 src/CharacterTextSplitter-test.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { CharacterTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { getEncoding } from&quot;js-tiktoken&quot;; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logDocument = new Document({</span></span>
<span class="line"><span>    pageContent: \`[2024-01-15 10:00:00] INFO: Application started</span></span>
<span class="line"><span>[2024-01-15 10:00:05] DEBUG: Loading configuration file</span></span>
<span class="line"><span>[2024-01-15 10:00:10] INFO: Database connection established</span></span>
<span class="line"><span>[2024-01-15 10:00:15] WARNING: Rate limit approaching</span></span>
<span class="line"><span>[2024-01-15 10:00:20] ERROR: Failed to process request</span></span>
<span class="line"><span>[2024-01-15 10:00:25] INFO: Retrying operation</span></span>
<span class="line"><span>[2024-01-15 10:00:30] SUCCESS: Operation completed\`</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logTextSplitter = new CharacterTextSplitter({</span></span>
<span class="line"><span>    separator: &#39;\\n&#39;,</span></span>
<span class="line"><span>    chunkSize: 200,</span></span>
<span class="line"><span>    chunkOverlap: 20</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await logTextSplitter.splitDocuments([logDocument]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// console.log(splitDocuments);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span>splitDocuments.forEach(document =&gt; {</span></span>
<span class="line"><span>    console.log(document);</span></span>
<span class="line"><span>    console.log(&#39;charater length:&#39;,document.pageContent.length);</span></span>
<span class="line"><span>    console.log(&#39;token length:&#39;,enc.encode(document.pageContent).length);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>一段日志文本，按照换行符来分割，每个块 200 字符。</p><p>打印下每个块的字符数，然后用 js-tiktoken 看一下 token数</p><p>跑一下：</p><video src="`+d+`" controls></video><p>可以看到，按照换行符分割文本，然后按照 chunk size 放到了 3 个块里。</p><p>有同学可能会问，chunk 的大小也没有到 200 啊？</p><p>因为 splitter 会优先保证语义完整，宁愿 chunk 小一点。</p><p>这里到了 160 左右字符的时候，发现加上下一个文本就超过 200 了，所以会放到下一个块。</p><p>这里因为没有被断开的文本，所以就没有需要加 overlap 重复的，<strong>只有被断开的文本才有 overlap</strong></p><p>我们加一个长的文本试一下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const logDocument = new Document({</span></span>
<span class="line"><span>    pageContent: \`[2024-01-15 10:00:00] INFO: Application started</span></span>
<span class="line"><span>[2024-01-15 10:00:05] DEBUG: Loading configuration file</span></span>
<span class="line"><span>[2024-01-15 10:00:10] INFO: Database connection established</span></span>
<span class="line"><span>[2024-01-15 10:00:15] WARNING: Rate limit approaching</span></span>
<span class="line"><span>[2024-01-15 10:00:20] ERROR: Failed to process request</span></span>
<span class="line"><span>[2024-01-15 10:00:25] INFO: Retrying operation</span></span>
<span class="line"><span>[2024-01-15 10:00:30] SUCCESS: Operation completed</span></span>
<span class="line"><span>[2026-01-10 14:30:00] INFO: 系统开始执行大规模数据迁移任务，本次迁移涉及核心业务数据库中的用户表、订单表、商品库存表、物流信息表、支付记录表、评论数据表等共计十二个关键业务表，预计处理数据量约500万条记录，数据总大小预估为280GB，迁移过程将采用分批次增量更新策略以减少对生产环境的影响，同时启用双写机制确保数据一致性，任务预计总耗时约3小时15分钟，迁移完成后将自动触发全面的数据一致性校验流程以及性能基准测试，请相关运维人员和DBA团队密切关注系统资源使用情况、网络带宽占用率以及任务执行进度，如遇异常情况请立即启动应急预案并通知技术负责人</span></span>
<span class="line"><span>\`</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>看到问题了么？</p><p>CharacterTextSplitter 非常死板，你告诉它按照换行符分割，它就会严格按照这个，就算超过了 chunk size 也不拆分。</p><p>所以一般还是用 RecursiveCharacterTextSplitter</p><p>创建 src/RecursiveCharacterTextSplitter-test.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { RecursiveCharacterTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { getEncoding } from&quot;js-tiktoken&quot;; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logDocument = new Document({</span></span>
<span class="line"><span>    pageContent: \`[2024-01-15 10:00:00] INFO: Application started</span></span>
<span class="line"><span>[2024-01-15 10:00:05] DEBUG: Loading configuration file</span></span>
<span class="line"><span>[2024-01-15 10:00:10] INFO: Database connection established</span></span>
<span class="line"><span>[2024-01-15 10:00:15] WARNING: Rate limit approaching</span></span>
<span class="line"><span>[2024-01-15 10:00:20] ERROR: Failed to process request</span></span>
<span class="line"><span>[2024-01-15 10:00:25] INFO: Retrying operation</span></span>
<span class="line"><span>[2024-01-15 10:00:30] SUCCESS: Operation completed</span></span>
<span class="line"><span>[2026-01-10 14:30:00] INFO: 系统开始执行大规模数据迁移任务，本次迁移涉及核心业务数据库中的用户表、订单表、商品库存表、物流信息表、支付记录表、评论数据表等共计十二个关键业务表，预计处理数据量约500万条记录，数据总大小预估为280GB，迁移过程将采用分批次增量更新策略以减少对生产环境的影响，同时启用双写机制确保数据一致性，任务预计总耗时约3小时15分钟，迁移完成后将自动触发全面的数据一致性校验流程以及性能基准测试，请相关运维人员和DBA团队密切关注系统资源使用情况、网络带宽占用率以及任务执行进度，如遇异常情况请立即启动应急预案并通知技术负责人</span></span>
<span class="line"><span>\`</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logTextSplitter = new RecursiveCharacterTextSplitter({</span></span>
<span class="line"><span>    chunkSize: 150,</span></span>
<span class="line"><span>    chunkOverlap: 20,</span></span>
<span class="line"><span>    separators: [&#39;\\n&#39;, &#39;。&#39;, &#39;，&#39;]</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await logTextSplitter.splitDocuments([logDocument]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// console.log(splitDocuments);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span>splitDocuments.forEach(document =&gt; {</span></span>
<span class="line"><span>    console.log(document);</span></span>
<span class="line"><span>    console.log(&#39;charater length:&#39;,document.pageContent.length);</span></span>
<span class="line"><span>    console.log(&#39;token length:&#39;,enc.encode(document.pageContent).length);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>它可以指定多个分隔符：</p><p><img src="`+h+'" alt="image-20260128152107144"></p><p>当 “\\n” 分割后还是大，就会用 “。” 还是不行再尝试用 “，”</p><video src="'+k+'" controls></video><p>这样就明显好很多：</p><p><img src="'+x+'" alt="image-20260128152116395"></p><p>这两段文本是用换行符分割的。</p><p>按照换行符分割后下面的文本超过 chunk size，就会尝试按照句号逗号分割，然后加上 overlap：</p><p><img src="'+v+'" alt="image-20260128152125937"></p><p>最后这个是按照逗号分隔的，也没超过 chunk size，就没有 overlap了：</p><p><img src="'+S+`" alt="image-20260128152132779"></p><p>所以说 RecursiveCharacterTextSplitter 这种递归的方式灵活太多了。</p><p>绝大多数情况下，用这个就可以了。</p><p>然后我们再来试一下 TokenTextSplitter：</p><p>创建 src/TokenTextSplitter-test.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { TokenTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { getEncoding } from&quot;js-tiktoken&quot;; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logDocument = new Document({</span></span>
<span class="line"><span>    pageContent: \`[2024-01-15 10:00:00] INFO: Application started</span></span>
<span class="line"><span>[2024-01-15 10:00:05] DEBUG: Loading configuration file</span></span>
<span class="line"><span>[2024-01-15 10:00:10] INFO: Database connection established</span></span>
<span class="line"><span>[2024-01-15 10:00:15] WARNING: Rate limit approaching</span></span>
<span class="line"><span>[2024-01-15 10:00:20] ERROR: Failed to process request</span></span>
<span class="line"><span>[2024-01-15 10:00:25] INFO: Retrying operation</span></span>
<span class="line"><span>[2024-01-15 10:00:30] SUCCESS: Operation completed\`</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logTextSplitter = new TokenTextSplitter({</span></span>
<span class="line"><span>    chunkSize: 50,        // 每个块最多 50 个 Token</span></span>
<span class="line"><span>    chunkOverlap: 10,    // 块之间重叠 10 个 Token</span></span>
<span class="line"><span>    encodingName: &#39;cl100k_base&#39;,  // OpenAI 使用的编码方式</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await logTextSplitter.splitDocuments([logDocument]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// console.log(splitDocuments);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span>splitDocuments.forEach(document =&gt; {</span></span>
<span class="line"><span>    console.log(document);</span></span>
<span class="line"><span>    console.log(&#39;charater length:&#39;,document.pageContent.length);</span></span>
<span class="line"><span>    console.log(&#39;token length:&#39;,enc.encode(document.pageContent).length);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>用这个 splitter，然后指定下编码：</p><p><img src="`+C+'" alt="image-20260128152140170"></p><p>跑一下：</p><p><img src="'+q+'" alt="image-20260128152149472"></p><p>可以看到，它优先保证 token 正好是 50，为了这个不惜强行打断文本。</p><p>当然，打断后也加了 overlap：</p><p><img src="'+b+'" alt="image-20260128152156745"></p><p>RecursiveCharacterTextSplitter 分出的 chunk 可能大于 chunk size，也可以小，优先保证语义完整，是按照分割符来分割。</p><p>但是 TokenTextSplitter 不是，它会只会保证 token 数量</p><p>这种不管不顾的分割显然不靠谱，不一定在什么地方就断开了。</p><p>还是 RecursiveCharacterTextSplitter 那种更科学。</p><p>那能不能用 RecursiveCharacterTextSplitter 的分割方式，然后按照 token 长度来设置 chunk size 呢？</p><p>可以的。重写一下它的长度计算函数就可以了：</p><p><img src="'+_+`" alt="image-20260128152203318"></p><p>这样，chunk size 指的就是 token 的长度</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>const enc = getEncoding(&quot;cl100k_base&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const logTextSplitter = new RecursiveCharacterTextSplitter({</span></span>
<span class="line"><span>    chunkSize: 150,</span></span>
<span class="line"><span>    chunkOverlap: 20,</span></span>
<span class="line"><span>    separators: [&#39;\\n&#39;, &#39;。&#39;, &#39;，&#39;],</span></span>
<span class="line"><span>    lengthFunction: (text) =&gt; enc.encode(text).length,</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>现在就是按照现在的 token 数量作为分割依据了：</p><p><img src="`+T+`" alt="image-20260128152209323"></p><p>这样就完全不需要用 TokenTextSplitter。</p><p>最后再来看一下 markdown、latex、代码的分割。</p><p>其实这些很明显，都是 RecursiveCharacterTextSplitter 实现的。</p><p>比如 markdown 是按照 #、##、### 的子标题来递归分割</p><p>latex 是按照那些数学公式的语法来分割</p><p>代码则是分语言来用不同的分割符。</p><p>但总体来说都是递归分割，所以他们都是用 RecursiveCharacterTextSplitter 实现的。</p><p>我们快速测一下：</p><p>创建 recursive-splitter-markdown.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { MarkdownTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const readmeText = \`# Project Name</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&gt; A brief description of your project</span></span>
<span class="line"><span></span></span>
<span class="line"><span>[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## Features</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- ✨ Feature 1</span></span>
<span class="line"><span>- 🚀 Feature 2</span></span>
<span class="line"><span>- 💡 Feature 3</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## Installation</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\\\`\\\`\\\`bash</span></span>
<span class="line"><span>npm install project-name</span></span>
<span class="line"><span>\\\`\\\`\\\`</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## Usage</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### Basic Usage</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\\\`\\\`\\\`javascript</span></span>
<span class="line"><span>import { Project } from &#39;project-name&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const project = new Project();</span></span>
<span class="line"><span>project.init();</span></span>
<span class="line"><span>\\\`\\\`\\\`</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### Advanced Usage</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\\\`\\\`\\\`javascript</span></span>
<span class="line"><span>const project = new Project({</span></span>
<span class="line"><span>  config: {</span></span>
<span class="line"><span>    apiKey: &#39;your-api-key&#39;,</span></span>
<span class="line"><span>    timeout: 5000,</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await project.run();</span></span>
<span class="line"><span>\\\`\\\`\\\`</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## API Reference</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### \\\`Project\\\`</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Main class for the project.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#### Methods</span></span>
<span class="line"><span></span></span>
<span class="line"><span>- \\\`init()\\\`: Initialize the project</span></span>
<span class="line"><span>- \\\`run()\\\`: Run the project</span></span>
<span class="line"><span>- \\\`stop()\\\`: Stop the project</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## Contributing</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md).</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## License</span></span>
<span class="line"><span></span></span>
<span class="line"><span>MIT License\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const readmeDoc = new Document({</span></span>
<span class="line"><span>    pageContent: readmeText</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const markdownTextSplitter = new MarkdownTextSplitter({</span></span>
<span class="line"><span>    chunkSize: 400,</span></span>
<span class="line"><span>    chunkOverlap: 80</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await markdownTextSplitter.splitDocuments([readmeDoc]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// console.log(splitDocuments);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>splitDocuments.forEach(document =&gt; {</span></span>
<span class="line"><span>    console.log(document);</span></span>
<span class="line"><span>    console.log(&#39;charater length:&#39;,document.pageContent.length);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>创建 MarkdownTextSplitter，不用指定分割符，内置了。</p><p><img src="`+D+'" alt="image-20260128152216985"></p><p>跑一下：</p><video src="'+f+`" controls></video><p>可以看到，都是从标题处断开的，也就是根据语法分割的。</p><p>再来试下 letex</p><p>创建 src/recursive-splitter-latex.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { LatexTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const latexText = \`\\int x^{\\mu}\\mathrm{d}x=\\frac{x^{\\mu +1}}{\\mu +1}+C, \\left({\\mu \\neq -1}\\right) \\int \\frac{1}{\\sqrt{1-x^{2}}}\\mathrm{d}x= \\arcsin x +C \\int \\frac{1}{\\sqrt{1-x^{2}}}\\mathrm{d}x= \\arcsin x +C \\begin{pmatrix}  </span></span>
<span class="line"><span>  a_{11} &amp; a_{12} &amp; a_{13} \\\\  </span></span>
<span class="line"><span>  a_{21} &amp; a_{22} &amp; a_{23} \\\\  </span></span>
<span class="line"><span>  a_{31} &amp; a_{32} &amp; a_{33}  </span></span>
<span class="line"><span>\\end{pmatrix} \`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const latexDoc = new Document({</span></span>
<span class="line"><span>    pageContent: latexText</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const markdownTextSplitter = new LatexTextSplitter({</span></span>
<span class="line"><span>    chunkSize: 200,</span></span>
<span class="line"><span>    chunkOverlap: 40</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await markdownTextSplitter.splitDocuments([latexDoc]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// console.log(splitDocuments);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>splitDocuments.forEach(document =&gt; {</span></span>
<span class="line"><span>    console.log(document);</span></span>
<span class="line"><span>    console.log(&#39;charater length:&#39;,document.pageContent.length);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>跑一下：</p><p><img src="`+R+`" alt="image-20260128152223923"></p><p>也是按照正确的语法分割的。</p><p>最后来试下代码的：</p><p>创建 src/recursive-splitter-code.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import&quot;cheerio&quot;;</span></span>
<span class="line"><span>import { Document } from&quot;@langchain/core/documents&quot;;</span></span>
<span class="line"><span>import { LatexTextSplitter, RecursiveCharacterTextSplitter } from&quot;@langchain/textsplitters&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const jsCode = \`// Complete shopping cart implementation</span></span>
<span class="line"><span>class Product {</span></span>
<span class="line"><span>  constructor(id, name, price, description) {</span></span>
<span class="line"><span>    this.id = id;</span></span>
<span class="line"><span>    this.name = name;</span></span>
<span class="line"><span>    this.price = price;</span></span>
<span class="line"><span>    this.description = description;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  getFormattedPrice() {</span></span>
<span class="line"><span>    return &#39;$&#39; + this.price.toFixed(2);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class ShoppingCart {</span></span>
<span class="line"><span>  constructor() {</span></span>
<span class="line"><span>    this.items = [];</span></span>
<span class="line"><span>    this.discountCode = null;</span></span>
<span class="line"><span>    this.taxRate = 0.08;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  addItem(product, quantity = 1) {</span></span>
<span class="line"><span>    const existingItem = this.items.find(item =&gt; item.product.id === product.id);</span></span>
<span class="line"><span>    if (existingItem) {</span></span>
<span class="line"><span>      existingItem.quantity += quantity;</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      this.items.push({ product, quantity, addedAt: new Date() });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return this;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  removeItem(productId) {</span></span>
<span class="line"><span>    this.items = this.items.filter(item =&gt; item.product.id !== productId);</span></span>
<span class="line"><span>    return this;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  calculateSubtotal() {</span></span>
<span class="line"><span>    return this.items.reduce((total, item) =&gt; {</span></span>
<span class="line"><span>      return total + (item.product.price * item.quantity);</span></span>
<span class="line"><span>    }, 0);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  calculateTotal() {</span></span>
<span class="line"><span>    const subtotal = this.calculateSubtotal();</span></span>
<span class="line"><span>    const discount = this.calculateDiscount();</span></span>
<span class="line"><span>    const tax = (subtotal - discount) * this.taxRate;</span></span>
<span class="line"><span>    return subtotal - discount + tax;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  calculateDiscount() {</span></span>
<span class="line"><span>    if (!this.discountCode) return 0;</span></span>
<span class="line"><span>    const discounts = { &#39;SAVE10&#39;: 0.10, &#39;SAVE20&#39;: 0.20, &#39;WELCOME&#39;: 0.15 };</span></span>
<span class="line"><span>    return this.calculateSubtotal() * (discounts[this.discountCode] || 0);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Usage example</span></span>
<span class="line"><span>const product1 = new Product(1, &#39;Laptop&#39;, 999.99, &#39;High-performance laptop&#39;);</span></span>
<span class="line"><span>const product2 = new Product(2, &#39;Mouse&#39;, 29.99, &#39;Wireless mouse&#39;);</span></span>
<span class="line"><span>const cart = new ShoppingCart();</span></span>
<span class="line"><span>cart.addItem(product1, 1).addItem(product2, 2);</span></span>
<span class="line"><span>console.log(&#39;Total:&#39;, cart.calculateTotal());\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const jsCodeDoc = new Document({</span></span>
<span class="line"><span>    pageContent: jsCode</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const codeSplitter = RecursiveCharacterTextSplitter.fromLanguage(&#39;js&#39;, {</span></span>
<span class="line"><span>    chunkSize: 300,</span></span>
<span class="line"><span>    chunkOverlap: 60,</span></span>
<span class="line"><span>})</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const splitDocuments = await codeSplitter.splitDocuments([jsCodeDoc]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// console.log(splitDocuments);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>splitDocuments.forEach(document =&gt; {</span></span>
<span class="line"><span>    console.log(document);</span></span>
<span class="line"><span>    console.log(&#39;charater length:&#39;,document.pageContent.length);</span></span>
<span class="line"><span>});</span></span></code></pre></div><p>用 RecursiveCharacterTextSplitter.fromLanguage 这个方法，指定语言，就会按照对应的语法来分割。</p><p>支持的语言有很多，包括： java、go、js、html、python、rust、swift、markdown 等</p><p>我们用最熟悉的 js 来测试下这个分割。</p><video src="`+w+'" controls></video><p>可以看到，完全没有破坏代码完整性，确实是按照语法分割的。</p><p>这样，我们就把所有 splitter 过了一遍：</p><p><img src="'+E+'" alt="image-20260128152230917"></p><p>其实看到这里你应该也有答案了，基本就用 RecursiveCharacterTextSplitter 就行。</p><p>另外两个都有很明显的缺点：</p><p>CharacterTextSplitter 功能 RecursiveCharacterTextSplitter 里都有</p><p>TokenTextSplitter 严格按照 token，会破坏文档语义，不如 RecursiveCharacterTextSplitter 重写 lengthFunction</p><p>另外两个则是 RecursiveCharacterTextSplitter 的子功能。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><span style="color:rgb(46,161,33);background-color:inherit;">总结</span> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;&lt;span style=&quot;color: rgb(46,161,33); background-color: inherit&quot;&gt;总结&lt;/span&gt;&quot;">​</a></h2><p>这节我们把所有 splitter 过了一遍。</p><p>结论是直接用 RecursiveCharacterTextSplitter 就行。</p><p>splitter 是先按照 sperator 来分割，然后按照 chunk size 放到一个个 chunk 里。</p><p>chunk 的实际大小可能小于 chunk size 也可以大于。</p><p>如果分割后文本长度大于 chunk size，会继续按照后面的 sperator 拆分，然后放到两个 chunk 里，加上 overlap 来保证语义连贯。</p><p>如果从前到后尝试 sperator，尝试到最后一个，拆分完还是大于 chunk size 就不会再拆分了。</p><p>默认是按照字符计数，如果你想严格控制 token 大小，比如需要计费的场景，就可以实现 lengthFunction 用 token 的方式计算长度。</p><p>RecursiveCharacterTextSplitter 还支持代码分割，用 fromLanguage 的静态方法，这个在处理代码文档的时候很有用。</p><p>虽然这节讲了很多，但是结论很简单，就是用 RecursiveCharacterTextSplitter 就好了。</p><p><strong>测试搜索关键词：ChatGPT OpenAI 深度学习 机器学习 自然语言处理 向量化 语义搜索</strong></p><p>这个文档讲解了 LangChain 的 Splitter 技术，用于分割文档成小块，便于后续的向量化处理和语义搜索。</p>',166)])])}const W=j(O,[["render",A]]);export{U as __pageData,W as default};
