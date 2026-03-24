import{_ as n,a,b as p,c as e,d as l,e as o,f as t,g as i,h as c,i as r,j as u,k as d,l as m,m as g,n as h,o as q,p as _,q as b,r as v,s as y,t as O,u as f,v as k}from"./chunks/image-20260128155429626.DzqDaNHn.js";import{_ as A,o as z,c as E,ag as P}from"./chunks/framework.BYTi4OdY.js";const M=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/12-结构化大模型输出：Output Parser 还是 tool？/README.md","filePath":"前端转AI Agent/12-结构化大模型输出：Output Parser 还是 tool？/README.md"}'),C={name:"前端转AI Agent/12-结构化大模型输出：Output Parser 还是 tool？/README.md"};function I(w,s,N,S,x,$){return z(),E("div",null,[...s[0]||(s[0]=[P(`<p>我们已经调用大模型完成过很多功能了，但输出一直没做控制，都是自然语言的形式。</p><p>而很多情况下，我们希望大模型按照我们的格式要求，返回一个 json</p><p>这就需要用到 Output Parser 的 api 了。</p><p>有同学说，这个不就是在 prompt 里描述下要什么格式，然后按照这种格式解析大模型返回的结果字符串么？</p><p>没错，就是这种思路，只不过 output parser 对这个思路做了一下封装。</p><p>我们直接写代码来试一下：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir output-parser-test</span></span>
<span class="line"><span>cd output-parser-test </span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+n+`" alt="image-20260128155246132"></p><p>创建项目，安装用到的包：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/openai chalk dotenv zod</span></span></code></pre></div><p>然后创建 .env 配置文件：</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># OpenAI API 配置</span></span>
<span class="line"><span>OPENAI_API_KEY=sk-xxx</span></span>
<span class="line"><span>OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1</span></span>
<span class="line"><span>MODEL_NAME=qwen-plus</span></span>
<span class="line"><span>EMBEDDINGS_MODEL_NAME=text-embedding-v3</span></span></code></pre></div><p>写一下测试代码：</p><p>src/normal.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 简单的问题，要求 JSON 格式返回</span></span>
<span class="line"><span>const question = &quot;请介绍一下爱因斯坦的信息。请以 JSON 格式返回，包含以下字段：name（姓名）、birth_year（出生年份）、nationality（国籍）、major_achievements（主要成就，数组）、famous_theory（著名理论）。&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&quot;🤔 正在调用大模型...\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const response = await model.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;✅ 收到响应:\\n&quot;);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 解析 JSON</span></span>
<span class="line"><span>    const jsonResult = JSON.parse(response.content);</span></span>
<span class="line"><span>    console.log(&quot;\\n📋 解析后的 JSON 对象:&quot;);</span></span>
<span class="line"><span>    console.log(jsonResult);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们让大模型用 JSON 格式返回爱因斯坦的信息。</p><p>然后把返回的 json 解析成对象</p><p>跑一下：</p><p><img src="`+a+`" alt="image-20260128155254037"></p><p>返回的内容带了额外的 markdown 语法，解析失败了。</p><p>这是我们经常遇到的一个问题。</p><p>我们用 OutputParser 试一下：</p><p>创建 src/json-output-parser.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { JsonOutputParser } from&#39;@langchain/core/output_parsers&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const parser = new JsonOutputParser();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const question = \`请介绍一下爱因斯坦的信息。请以 JSON 格式返回，包含以下字段：name（姓名）、birth_year（出生年份）、nationality（国籍）、major_achievements（主要成就，数组）、famous_theory（著名理论）。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${parser.getFormatInstructions()}\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;question:&#39;,question)</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&quot;🤔 正在调用大模型（使用 JsonOutputParser）...\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const response = await model.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📤 模型原始响应:\\n&quot;);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await parser.parse(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;✅ JsonOutputParser 自动解析的结果:\\n&quot;);</span></span>
<span class="line"><span>    console.log(result);</span></span>
<span class="line"><span>    console.log(\`姓名: \${result.name}\`);</span></span>
<span class="line"><span>    console.log(\`出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>    console.log(\`国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>    console.log(\`著名理论: \${result.famous_theory}\`);</span></span>
<span class="line"><span>    console.log(\`主要成就:\`, result.major_achievements);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>用了 JsonOutputParser，顾名思义，它就是用来解析 json 结果的。</p><p>就像前面说的，在 prompt 里放一段格式的提示词</p><p>然后对返回的结果按照格式来 parse</p><p>分别对应 parser.getFormatInstructions 和 parser.parse 方法</p><p><img src="`+p+'" alt="image-20260128155300878"></p><p>我们跑一下：</p><video src="'+e+'" controls></video><p>可以看到，虽然大模型返回的还是带了 markdown 语法，但是 JsonOutputParser 能够解析其中的 json。</p><p>因为它做了这种常见情况的处理。</p><p><img src="'+l+`" alt="image-20260128155317656"></p><p>有的同学说，getFormatInstructions 好像没内容啊。</p><p>确实，JsonOutputParser 比较简单，不需要提示词。</p><p>我们换一个 output parser</p><p>创建 src/structured-output-parser.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { StructuredOutputParser } from&#39;@langchain/core/output_parsers&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 定义输出结构</span></span>
<span class="line"><span>const parser = StructuredOutputParser.fromNamesAndDescriptions({</span></span>
<span class="line"><span>    name: &quot;姓名&quot;,</span></span>
<span class="line"><span>    birth_year: &quot;出生年份&quot;,</span></span>
<span class="line"><span>    nationality: &quot;国籍&quot;,</span></span>
<span class="line"><span>    major_achievements: &quot;主要成就，用逗号分隔的字符串&quot;,</span></span>
<span class="line"><span>    famous_theory: &quot;著名理论&quot;</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const question = \`请介绍一下爱因斯坦的信息。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${parser.getFormatInstructions()}\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;question:&#39;, question)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&quot;🤔 正在调用大模型（使用 StructuredOutputParser）...\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const response = await model.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📤 模型原始响应:\\n&quot;);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await parser.parse(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n✅ StructuredOutputParser 自动解析的结果:\\n&quot;);</span></span>
<span class="line"><span>    console.log(result);</span></span>
<span class="line"><span>    console.log(\`姓名: \${result.name}\`);</span></span>
<span class="line"><span>    console.log(\`出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>    console.log(\`国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>    console.log(\`著名理论: \${result.famous_theory}\`);</span></span>
<span class="line"><span>    console.log(\`主要成就: \${result.major_achievements}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这里我们用了 StructuredOutputParser，它可以指定具体的 json 结构</p><p>我们用 fromNamesAndDescriptions 指定了字段和描述</p><p>跑一下：</p><video src="`+o+'" controls></video><p>解析出的对象依然是正确的。</p><p><img src="'+t+'" alt="image-20260128155329412"></p><p>但现在多了一大段提示词：</p><p><img src="'+i+'" alt="image-20260128155335143"></p><p>这就是 output parser 的原理：</p><p>在 prompt 里加入格式描述，根据这个格式来解析响应。</p><p>当然，就像我们之前用 zod 来描述 tool 的参数格式一样：</p><p><img src="'+c+`" alt="image-20260128155340993"></p><p>StructuredOutputParser 也可以用 zod 来描述复杂的对象格式。</p><p>创建 src/structured-output-parser2.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { StructuredOutputParser } from&#39;@langchain/core/output_parsers&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 zod 定义复杂的输出结构</span></span>
<span class="line"><span>const scientistSchema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;科学家的全名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    death_year: z.number().optional().describe(&quot;去世年份，如果还在世则不填&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    fields: z.array(z.string()).describe(&quot;研究领域列表&quot;),</span></span>
<span class="line"><span>    awards: z.array(</span></span>
<span class="line"><span>        z.object({</span></span>
<span class="line"><span>            name: z.string().describe(&quot;奖项名称&quot;),</span></span>
<span class="line"><span>            year: z.number().describe(&quot;获奖年份&quot;),</span></span>
<span class="line"><span>            reason: z.string().optional().describe(&quot;获奖原因&quot;)</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>    ).describe(&quot;获得的重要奖项列表&quot;),</span></span>
<span class="line"><span>    major_achievements: z.array(z.string()).describe(&quot;主要成就列表&quot;),</span></span>
<span class="line"><span>    famous_theories: z.array(</span></span>
<span class="line"><span>        z.object({</span></span>
<span class="line"><span>            name: z.string().describe(&quot;理论名称&quot;),</span></span>
<span class="line"><span>            year: z.number().optional().describe(&quot;提出年份&quot;),</span></span>
<span class="line"><span>            description: z.string().describe(&quot;理论简要描述&quot;)</span></span>
<span class="line"><span>        })</span></span>
<span class="line"><span>    ).describe(&quot;著名理论列表&quot;),</span></span>
<span class="line"><span>    education: z.object({</span></span>
<span class="line"><span>        university: z.string().describe(&quot;主要毕业院校&quot;),</span></span>
<span class="line"><span>        degree: z.string().describe(&quot;学位&quot;),</span></span>
<span class="line"><span>        graduation_year: z.number().optional().describe(&quot;毕业年份&quot;)</span></span>
<span class="line"><span>    }).optional().describe(&quot;教育背景&quot;),</span></span>
<span class="line"><span>    biography: z.string().describe(&quot;简短传记，100字以内&quot;)</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 从 zod schema 创建 parser</span></span>
<span class="line"><span>const parser = StructuredOutputParser.fromZodSchema(scientistSchema);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const question = \`请介绍一下居里夫人（Marie Curie）的详细信息，包括她的教育背景、研究领域、获得的奖项、主要成就和著名理论。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${parser.getFormatInstructions()}\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;📋 生成的提示词:\\n&#39;);</span></span>
<span class="line"><span>console.log(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&quot;🤔 正在调用大模型（使用 Zod Schema）...\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const response = await model.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📤 模型原始响应:\\n&quot;);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await parser.parse(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;✅ StructuredOutputParser 自动解析并验证的结果:\\n&quot;);</span></span>
<span class="line"><span>    console.log(JSON.stringify(result, null, 2));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📊 格式化展示:\\n&quot;);</span></span>
<span class="line"><span>    console.log(\`👤 姓名: \${result.name}\`);</span></span>
<span class="line"><span>    console.log(\`📅 出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>    if (result.death_year) {</span></span>
<span class="line"><span>        console.log(\`⚰️  去世年份: \${result.death_year}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    console.log(\`🌍 国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>    console.log(\`🔬 研究领域: \${result.fields.join(&#39;, &#39;)}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n🎓 教育背景:\`);</span></span>
<span class="line"><span>    if (result.education) {</span></span>
<span class="line"><span>        console.log(\`   院校: \${result.education.university}\`);</span></span>
<span class="line"><span>        console.log(\`   学位: \${result.education.degree}\`);</span></span>
<span class="line"><span>        if (result.education.graduation_year) {</span></span>
<span class="line"><span>            console.log(\`   毕业年份: \${result.education.graduation_year}\`);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n🏆 获得的奖项 (\${result.awards.length}个):\`);</span></span>
<span class="line"><span>    result.awards.forEach((award, index) =&gt; {</span></span>
<span class="line"><span>        console.log(\`   \${index + 1}. \${award.name} (\${award.year})\`);</span></span>
<span class="line"><span>        if (award.reason) {</span></span>
<span class="line"><span>            console.log(\`      原因: \${award.reason}\`);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n💡 著名理论 (\${result.famous_theories.length}个):\`);</span></span>
<span class="line"><span>    result.famous_theories.forEach((theory, index) =&gt; {</span></span>
<span class="line"><span>        console.log(\`   \${index + 1}. \${theory.name}\${theory.year ? \` (\${theory.year})\` : &#39;&#39;}\`);</span></span>
<span class="line"><span>        console.log(\`      \${theory.description}\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n🌟 主要成就 (\${result.major_achievements.length}个):\`);</span></span>
<span class="line"><span>    result.major_achievements.forEach((achievement, index) =&gt; {</span></span>
<span class="line"><span>        console.log(\`   \${index + 1}. \${achievement}\`);</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n📖 传记:\`);</span></span>
<span class="line"><span>    console.log(\`   \${result.biography}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>    if (error.name === &#39;ZodError&#39;) {</span></span>
<span class="line"><span>        console.error(&quot;验证错误详情:&quot;, error.errors);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们用 zod 描述了一个复杂的对象结构，然后用 StructuredOutputParser 生成提示词，以及 parse</p><p>跑一下：</p><video src="`+r+`" controls></video><p>可以看到，StructuredOutputParser 根据格式生成了一大段提示词，并且解析也是正确的。</p><p>有同学说，tool 可以指定参数的对象格式，能不能直接用 tool 来获取结构化的结果呢？</p><p>当然可以的。</p><p>试一下：</p><p>创建 src/tool-call-args.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 定义结构化输出的 schema</span></span>
<span class="line"><span>const scientistSchema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;科学家的全名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    fields: z.array(z.string()).describe(&quot;研究领域列表&quot;),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const modelWithTool = model.bindTools([</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        name: &quot;extract_scientist_info&quot;,</span></span>
<span class="line"><span>        description: &quot;提取和结构化科学家的详细信息&quot;,</span></span>
<span class="line"><span>        schema: scientistSchema</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 调用模型</span></span>
<span class="line"><span>const response = await modelWithTool.invoke(&quot;介绍一下爱因斯坦&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;response.tool_calls:&#39;,response.tool_calls)</span></span>
<span class="line"><span>// 获取结构化结果</span></span>
<span class="line"><span>const result = response.tool_calls[0].args;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;结构化结果:&quot;, JSON.stringify(result, null, 2));</span></span>
<span class="line"><span>console.log(\`\\n姓名: \${result.name}\`);</span></span>
<span class="line"><span>console.log(\`出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>console.log(\`国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>console.log(\`研究领域: \${result.fields.join(&#39;, &#39;)}\`);</span></span></code></pre></div><p>这里没定义 tool 的实现逻辑，因为我们只是告诉大模型有这个 tool、参数是什么格式，不需要执行</p><p><img src="`+u+'" alt="image-20260128155351640"></p><p>跑一下：</p><video src="'+d+`" controls></video><p>可以看到，通过返回的 tool_calls 信息，也能拿到结构化的数据。</p><p>而且，这种方式比 output parser 更好。</p><p>因为模型训练的时候就保证了生成 tool calls 的参数一定是符合格式要求的，如果不符合，会重新生成。</p><p>那岂不是没必要用 output parser 了？</p><p>确实，如果只是要求结构化返回数据，用 tool 就行了。</p><p>所以，现在获取结构化数据一般会用 withStructuredOutput 这个 api</p><p>它会判断模型是否支持 tool calls，支持的话就用 tool 的方式获取结构化数据，否则用 output parser 的方式，不用我们自己去处理。</p><p>创建 with-structured-output.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 定义结构化输出的 schema</span></span>
<span class="line"><span>const scientistSchema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;科学家的全名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    fields: z.array(z.string()).describe(&quot;研究领域列表&quot;),</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 withStructuredOutput 方法</span></span>
<span class="line"><span>const structuredModel = model.withStructuredOutput(scientistSchema);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 调用模型</span></span>
<span class="line"><span>const result = await structuredModel.invoke(&quot;介绍一下爱因斯坦&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;结构化结果:&quot;, JSON.stringify(result, null, 2));</span></span>
<span class="line"><span>console.log(\`\\n姓名: \${result.name}\`);</span></span>
<span class="line"><span>console.log(\`出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>console.log(\`国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>console.log(\`研究领域: \${result.fields.join(&#39;, &#39;)}\`);</span></span></code></pre></div><p>所以说，现在获取结构化数据更简单了。</p><video src="`+m+`" controls></video><p>那岂不是说 output parser 一般用不到了？</p><p>也不是，如果流式打印返回数据的场景，还是需要 output parser 的。</p><p>而且还有一些非 json 格式的，比如 XML、YAML 等格式的内容，也要用 output parser。</p><p>我们先试一下流式：</p><p>创建 src/stream-normal.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = \`详细介绍莫扎特的信息。\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;🌊 普通流式输出演示（无结构化）\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const stream = await model.stream(prompt);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    let fullContent = &#39;&#39;;</span></span>
<span class="line"><span>    let chunkCount = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📡 接收流式数据:\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    forawait (const chunk of stream) {</span></span>
<span class="line"><span>        chunkCount++;</span></span>
<span class="line"><span>        const content = chunk.content;</span></span>
<span class="line"><span>        fullContent += content;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        process.stdout.write(content); // 实时显示流式文本</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n\\n✅ 共接收 \${chunkCount} 个数据块\\n\`);</span></span>
<span class="line"><span>    console.log(\`📝 完整内容长度: \${fullContent.length} 字符\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;\\n❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>把 invoke 换成 stream 方法就可以了，用 for await 打印异步返回的 chunk</p><p>跑一下：</p><video src="`+g+`" controls></video><p>我们先用 withStructuredOutput 做一下流式的结构化输出：</p><p>src/stream-with-structured-output.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 zod 定义结构化输出格式</span></span>
<span class="line"><span>const schema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;姓名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    death_year: z.number().describe(&quot;去世年份&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    occupation: z.string().describe(&quot;职业&quot;),</span></span>
<span class="line"><span>    famous_works: z.array(z.string()).describe(&quot;著名作品列表&quot;),</span></span>
<span class="line"><span>    biography: z.string().describe(&quot;简短传记&quot;)</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const structuredModel = model.withStructuredOutput(schema);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = \`详细介绍莫扎特的信息。\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;🌊 流式结构化输出演示（withStructuredOutput）\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const stream = await structuredModel.stream(prompt);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    let chunkCount = 0;</span></span>
<span class="line"><span>    let result = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📡 接收流式数据:\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    forawait (const chunk of stream) {</span></span>
<span class="line"><span>        chunkCount++;</span></span>
<span class="line"><span>        result = chunk;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        console.log(\`[Chunk \${chunkCount}]\`);</span></span>
<span class="line"><span>        console.log(JSON.stringify(chunk, null, 2));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n✅ 共接收 \${chunkCount} 个数据块\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (result) {</span></span>
<span class="line"><span>        console.log(&quot;📊 最终结构化结果:\\n&quot;);</span></span>
<span class="line"><span>        console.log(JSON.stringify(result, null, 2));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        console.log(&quot;\\n📝 格式化输出:&quot;);</span></span>
<span class="line"><span>        console.log(\`姓名: \${result.name}\`);</span></span>
<span class="line"><span>        console.log(\`出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>        console.log(\`去世年份: \${result.death_year}\`);</span></span>
<span class="line"><span>        console.log(\`国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>        console.log(\`职业: \${result.occupation}\`);</span></span>
<span class="line"><span>        console.log(\`著名作品: \${result.famous_works.join(&#39;, &#39;)}\`);</span></span>
<span class="line"><span>        console.log(\`传记: \${result.biography}\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;\\n❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>跑一下：</p><video src="`+h+`" controls></video><p>可以看到，虽然我们是用的 stream 的流式方式打印的</p><p>但是用了 withStructuredOutput 之后，它会在 json 生成完通过校验后再返回（底层是 tool calls）。</p><p>所以只有一个 chunk 包含完整 json</p><p>这样明显不是真的流式啊。</p><p>我们换 output parser 试试：</p><p>src/stream-structured-partial.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { StructuredOutputParser } from&#39;@langchain/core/output_parsers&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 zod 定义结构化输出格式</span></span>
<span class="line"><span>const schema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;姓名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    death_year: z.number().describe(&quot;去世年份&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    occupation: z.string().describe(&quot;职业&quot;),</span></span>
<span class="line"><span>    famous_works: z.array(z.string()).describe(&quot;著名作品列表&quot;),</span></span>
<span class="line"><span>    biography: z.string().describe(&quot;简短传记&quot;)</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const parser = StructuredOutputParser.fromZodSchema(schema);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const prompt = \`详细介绍莫扎特的信息。\\n\\n\${parser.getFormatInstructions()}\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;🌊 流式结构化输出演示\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const stream = await model.stream(prompt);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    let fullContent = &#39;&#39;;</span></span>
<span class="line"><span>    let chunkCount = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📡 接收流式数据:\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    forawait (const chunk of stream) {</span></span>
<span class="line"><span>        chunkCount++;</span></span>
<span class="line"><span>        const content = chunk.content;</span></span>
<span class="line"><span>        fullContent += content;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        process.stdout.write(content); // 实时显示流式文本</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(\`\\n\\n✅ 共接收 \${chunkCount} 个数据块\\n\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 解析完整内容为结构化数据</span></span>
<span class="line"><span>    const result = await parser.parse(fullContent);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📊 解析后的结构化结果:\\n&quot;);</span></span>
<span class="line"><span>    console.log(JSON.stringify(result, null, 2));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n📝 格式化输出:&quot;);</span></span>
<span class="line"><span>    console.log(\`姓名: \${result.name}\`);</span></span>
<span class="line"><span>    console.log(\`出生年份: \${result.birth_year}\`);</span></span>
<span class="line"><span>    console.log(\`去世年份: \${result.death_year}\`);</span></span>
<span class="line"><span>    console.log(\`国籍: \${result.nationality}\`);</span></span>
<span class="line"><span>    console.log(\`职业: \${result.occupation}\`);</span></span>
<span class="line"><span>    console.log(\`著名作品: \${result.famous_works.join(&#39;, &#39;)}\`);</span></span>
<span class="line"><span>    console.log(\`传记: \${result.biography}\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;\\n❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们用 StructuredOutputParser 解析结果，过程做了流式打印。</p><p>跑一下：</p><video src="`+q+'" controls></video><p>可以看到，现在是边生成边打印，最后再 parse。</p><p>所以流式的情况下，用 output parser 还是更适合的。</p><p>那如果我们就是想用 tool calls 来做结构化输出，但还是想要流式的打印，怎么办呢？</p><p>其实流式输出的情况下，如果你用了 tool call，是这样返回的：</p><p><img src="'+_+`" alt="image-20260128155401447"></p><p>tool_call_chunks 里保存了 tool 参数的部分内容，我们可以用这个来实现流式打印效果</p><p>试一下：</p><p>src/stream-tool-calls-raw.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 定义结构化输出的 schema</span></span>
<span class="line"><span>const scientistSchema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;科学家的全名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    death_year: z.number().optional().describe(&quot;去世年份，如果还在世则不填&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    fields: z.array(z.string()).describe(&quot;研究领域列表&quot;),</span></span>
<span class="line"><span>    achievements: z.array(z.string()).describe(&quot;主要成就&quot;),</span></span>
<span class="line"><span>    biography: z.string().describe(&quot;简短传记&quot;)</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 绑定工具到模型</span></span>
<span class="line"><span>const modelWithTool = model.bindTools([</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        name: &quot;extract_scientist_info&quot;,</span></span>
<span class="line"><span>        description: &quot;提取和结构化科学家的详细信息&quot;,</span></span>
<span class="line"><span>        schema: scientistSchema</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;🌊 流式 Tool Calls 演示 - 直接打印原始 tool_calls_chunk\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    // 开启流式输出</span></span>
<span class="line"><span>    const stream = await modelWithTool.stream(&quot;详细介绍牛顿的生平和成就&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📡 实时输出流式 tool_calls_chunk:\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    let chunkIndex = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    forawait (const chunk of stream) {</span></span>
<span class="line"><span>        chunkIndex++;</span></span>
<span class="line"><span>        // 直接打印每个 chunk 的 tool_calls 信息</span></span>
<span class="line"><span>        if (chunk.tool_call_chunks &amp;&amp; chunk.tool_call_chunks.length &gt; 0) {</span></span>
<span class="line"><span>            process.stdout.write(chunk.tool_call_chunks[0].args);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n\\n✅ 流式输出完成&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;\\n❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>    console.error(error);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>打印 tool_call_chunks 片段，就可以实现流式打印效果：</p><video src="`+b+'" controls></video><p>基于这个可以实现流式打印效果，但是看下 chunk 内容：</p><p><img src="'+v+`" alt="image-20260128155408092"></p><p>这时候是不能调用 tool 的，因为参数还不完整，没有 tool_calls 信息。</p><p>如果我想参数不完整的时候，也能拿到 tool_call 参数的 json 呢？</p><p>这种就可以用 JsonOutputToolsParser 了</p><p>它的作用就是解析 tool_call_chunks 中的内容，拼接成符合 json 格式规范的对象，就算 chunk 还没传输完的时候，也能拿到 json 对象</p><p>试一下：</p><p>src/stream-tool-calls-parser.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { JsonOutputToolsParser } from&#39;@langchain/core/output_parsers/openai_tools&#39;;</span></span>
<span class="line"><span>import { z } from&#39;zod&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 定义结构化输出的 schema</span></span>
<span class="line"><span>const scientistSchema = z.object({</span></span>
<span class="line"><span>    name: z.string().describe(&quot;科学家的全名&quot;),</span></span>
<span class="line"><span>    birth_year: z.number().describe(&quot;出生年份&quot;),</span></span>
<span class="line"><span>    death_year: z.number().optional().describe(&quot;去世年份，如果还在世则不填&quot;),</span></span>
<span class="line"><span>    nationality: z.string().describe(&quot;国籍&quot;),</span></span>
<span class="line"><span>    fields: z.array(z.string()).describe(&quot;研究领域列表&quot;),</span></span>
<span class="line"><span>    achievements: z.array(z.string()).describe(&quot;主要成就&quot;),</span></span>
<span class="line"><span>    biography: z.string().describe(&quot;简短传记&quot;)</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 绑定工具到模型</span></span>
<span class="line"><span>const modelWithTool = model.bindTools([</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>        name: &quot;extract_scientist_info&quot;,</span></span>
<span class="line"><span>        description: &quot;提取和结构化科学家的详细信息&quot;,</span></span>
<span class="line"><span>        schema: scientistSchema</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 1. 绑定工具并挂载解析器</span></span>
<span class="line"><span>const parser = new JsonOutputToolsParser();</span></span>
<span class="line"><span>const chain = modelWithTool.pipe(parser);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    // 2. 开启流</span></span>
<span class="line"><span>    const stream = await chain.stream(&quot;详细介绍牛顿的生平和成就&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    let lastContent = &quot;&quot;; // 记录已打印的完整内容</span></span>
<span class="line"><span>    let finalResult = null; // 存储最终的完整结果</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📡 实时输出流式内容:\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    forawait (const chunk of stream) {</span></span>
<span class="line"><span>        if (chunk.length &gt; 0) {</span></span>
<span class="line"><span>            const toolCall = chunk[0];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            // 获取当前工具调用的完整参数内容</span></span>
<span class="line"><span>            // const currentContent = JSON.stringify(toolCall.args || {}, null, 2);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            // if (currentContent.length &gt; lastContent.length) {</span></span>
<span class="line"><span>            //     const newText = currentContent.slice(lastContent.length);</span></span>
<span class="line"><span>            //     process.stdout.write(newText);</span><span> // 实时输出到控制台</span></span>
<span class="line"><span>            //     lastContent = currentContent;</span><span> // 更新已读进度</span></span>
<span class="line"><span>            // }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            console.log(toolCall.args);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n\\n✅ 流式输出完成&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;\\n❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>    console.error(error);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>JsonOutputToolsParser 会试试解析 tool_call_chunks 生成完整的 tool_calls 信息</p><p>我们跑下试试：</p><video src="`+y+'" controls></video><p>可以看到，就算是流式返回的 tool_call_chunks 还不完整，也会拼成正确格式的 tool_calls</p><p><img src="'+O+`" alt="image-20260128155414574"></p><p>这样你可以实时调用工具，传入部分参数了。</p><p>此外，我们前面说 withStructuredOutput 不适合的场景有两个：</p><ul><li><p>流式打印内容，这种还是需要 Output Parser</p></li><li><p>XML、YAML 等非 json 格式，也需要 Output Parser</p></li></ul><p>我们来试一下 XML 的 output parser</p><p>创建 src/xml-output-parser.mjs</p><div class="language-plain text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">plain text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { XMLOutputParser } from&#39;@langchain/core/output_parsers&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化模型</span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>    modelName: process.env.MODEL_NAME,</span></span>
<span class="line"><span>    apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>    temperature: 0,</span></span>
<span class="line"><span>    configuration: {</span></span>
<span class="line"><span>        baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>    },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const parser = new XMLOutputParser();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const question = \`请提取以下文本中的人物信息：阿尔伯特·爱因斯坦出生于 1879 年，是一位伟大的物理学家。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\${parser.getFormatInstructions()}\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;question:&#39;, question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    console.log(&quot;🤔 正在调用大模型（使用 XMLOutputParser）...\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const response = await model.invoke(question);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;📤 模型原始响应:\\n&quot;);</span></span>
<span class="line"><span>    console.log(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const result = await parser.parse(response.content);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(&quot;\\n✅ XMLOutputParser 自动解析的结果:\\n&quot;);</span></span>
<span class="line"><span>    console.log(result);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} catch (error) {</span></span>
<span class="line"><span>    console.error(&quot;❌ 错误:&quot;, error.message);</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>跑一下：</p><p><img src="`+f+'" alt="image-20260128155423074"></p><p><img src="'+k+'" alt="image-20260128155429626"></p><p>可以看到提示词里加入了一些格式信息，返回的也是 xml 格式，并且正确 parse 了出来。</p><p>这种也用不了 withStructuredOutput（也就是 tool call）来做结构化，还是得用 output parser。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>我们经常需要对大模型输出做一些结构化的限制，这时候就需要 output parser 的 api</p><p>它的原理就是在提示词里加入格式信息，然后对结果做一下 parse</p><p>比如 JsonOutputParser、StructuredOutputParser、XMLOutputParser 等</p><p>当然，用 tool call 的方式也完全可以实现结构化限制，而且可靠性更高，是模型训练的时候就保证的</p><p>所以，如果是做结构化，直接用 withStructuredOutput 这个 api 就行，它底层就是根据模型来决定是用 tool call 还是 output parser。</p><p>但它有两个不适合的场景：</p><ul><li><p>流式打印，这种需要用 output parser</p></li><li><p>xml 等非 json 格式，也需要 output parser</p></li></ul><p>此外，如果流式打印 tool 参数的过程中，想实时拿到 tool_calls 的 json 对象来调用 tool，可以用 JsonOutputToolsParser 这个 output parser</p><p>综上，如果你需要做大模型的输出做结构化，就可以考虑 withStructuredOutput 和 output parser 这两者二选一了。</p>',149)])])}const R=A(C,[["render",I]]);export{M as __pageData,R as default};
