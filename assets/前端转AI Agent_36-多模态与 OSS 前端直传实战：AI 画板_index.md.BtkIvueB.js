import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const i="/ai-docs/assets/img_01._XlL6LpD.png",l="/ai-docs/assets/video_01_wxv_4594371682894872576.DPIyP4t8.mp4",t="/ai-docs/assets/img_02.BoW0nniW.png",c="/ai-docs/assets/video_02_wxv_4594372960748240897.DaqCPNDq.mp4",o="/ai-docs/assets/img_03.UxsuG_Qk.png",d="/ai-docs/assets/img_04.D7cPJKuP.png",g="/ai-docs/assets/video_03_wxv_4594374995606503425.Dzt5Eax5.mp4",r="/ai-docs/assets/img_05.Ckfv2F3t.png",m="/ai-docs/assets/img_06.50RXbkXT.png",u="/ai-docs/assets/video_04_wxv_4594376755536297987.CEDpzRKg.mp4",_="/ai-docs/assets/video_05_wxv_4594377498398081028.C4Kq19Yd.mp4",h="/ai-docs/assets/img_07.BjslbwrJ.png",v="/ai-docs/assets/img_08.gpwPVgGX.png",S="/ai-docs/assets/img_09.DS2L73aR.webp",b="/ai-docs/assets/img_10.YnH8e2tA.webp",f="/ai-docs/assets/video_06_wxv_4597935188352974851.CGSv4I3X.mp4",y="/ai-docs/assets/img_11.Dmem4vDu.webp",I="/ai-docs/assets/img_12.CfnoRPo2.webp",E=JSON.parse('{"title":"多模态与 OSS 前端直传实战：AI 画板","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/36-多模态与 OSS 前端直传实战：AI 画板/index.md","filePath":"前端转AI Agent/36-多模态与 OSS 前端直传实战：AI 画板/index.md"}'),k={name:"前端转AI Agent/36-多模态与 OSS 前端直传实战：AI 画板/index.md"};function A(C,s,O,w,x,q){return a(),p("div",null,[...s[0]||(s[0]=[e('<h1 id="多模态与-oss-前端直传实战-ai-画板" tabindex="-1">多模态与 OSS 前端直传实战：AI 画板 <a class="header-anchor" href="#多模态与-oss-前端直传实战-ai-画板" aria-label="Permalink to &quot;多模态与 OSS 前端直传实战：AI 画板&quot;">​</a></h1><p>之前我们的 Agent 都是输入文字、返回文字。</p><p>但平时用的很多 Agent 都支持输入图片、返回图片</p><p><img src="'+i+'" alt="img_01.png"></p><p>这是怎么实现的呢？</p><p>首先模型要用支持多模态的：</p><p><video src="'+l+'" controls></video></p><p><img src="'+t+'" alt="img_02.png"></p><p>然后我们要用 OSS 来存储图片，拿到 url：</p><p><video src="'+c+'" controls></video></p><p><img src="'+o+`" alt="img_03.png"></p><p>基于多模态的大模型 + OSS，我们就可以实现支持多模态的 Agent</p><p>创建项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir multi-modal-agent</span></span>
<span class="line"><span>cd multi-modal-agent</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+d+`" alt="img_04.png"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/core @langchain/openai dashscope-sdk-official dotenv ali-oss</span></span></code></pre></div><p>创建 src/image-understanding.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * 图像理解 — qwen-vl-plus</span></span>
<span class="line"><span> * DashScope OpenAI 兼容接口 + ChatOpenAI</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>import&#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&#39;@langchain/openai&#39;;</span></span>
<span class="line"><span>import { HumanMessage } from&#39;@langchain/core/messages&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>model: &#39;qwen-vl-plus&#39;,</span></span>
<span class="line"><span>configuration: {</span></span>
<span class="line"><span>    baseURL: process.env.OPENAI_BASE_URL,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const response = await model.invoke([</span></span>
<span class="line"><span>new HumanMessage({</span></span>
<span class="line"><span>    content: [</span></span>
<span class="line"><span>      { type: &#39;text&#39;, text: &#39;详细描述这张图片的内容&#39; },</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        type: &#39;image_url&#39;,</span></span>
<span class="line"><span>        image_url: {</span></span>
<span class="line"><span>          url: &#39;https://dashscope.oss-cn-beijing.aliyuncs.com/./images/dog_and_girl.jpeg&#39;,</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>    ],</span></span>
<span class="line"><span>  }),</span></span>
<span class="line"><span>]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&#39;model: qwen-vl-plus&#39;);</span></span>
<span class="line"><span>console.log(response.content);</span></span></code></pre></div><p>其余案例代码从仓库复制。</p><p>跑一下：</p><p><video src="`+g+'" controls></video></p><p>兼容 openai 协议的大模型就可以用 ChatOpenAI 来调用，其余的直接用 dashscope 的 SDK 来调。</p><p>这个过程涉及到了 OSS，传入的图片、视频、音频 url、生成的视频、音频、图片的保存等。</p><p><img src="'+r+'" alt="img_05.png"></p><p>我们来完整实现下这个流程。</p><p>生成图片传到 OSS 直接后端做就行，返回 oss 的 url</p><p>但是用户上传视频，有必要先传到我们服务器，再传到 oss 么？</p><p>没必要，这种可以用 OSS 直传。</p><p><img src="'+m+'" alt="img_06.png"></p><p>阿里云文档里有写：</p><p><a href="https://help.aliyun.com/zh/oss/user-guide/uploading-objects-to-oss-directly-from-clients/" target="_blank" rel="noreferrer">https://help.aliyun.com/zh/oss/user-guide/uploading-objects-to-oss-directly-from-clients/</a></p><p>（微信最近文章内容不能复制了，代码部分可以直接从仓库复制，文字可以截图让豆包之类的提取）</p><p><video src="'+u+`" controls></video></p><p>写一下生成 sts 的代码：</p><p>src/sts-gen.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import OSS from&#39;ali-oss&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const config = {</span></span>
<span class="line"><span>        region: &#39;oss-cn-beijing&#39;,</span></span>
<span class="line"><span>        bucket: &#39;agent-bucket123&#39;,</span></span>
<span class="line"><span>        accessKeyId: process.env.OSS_ACCESS_KEY_ID,</span></span>
<span class="line"><span>        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const client = new OSS(config);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const date = newDate();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    date.setDate(date.getDate() + 1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const res = client.calculatePostSignature({</span></span>
<span class="line"><span>        expiration: date.toISOString(),</span></span>
<span class="line"><span>        conditions: [</span></span>
<span class="line"><span>            [&quot;content-length-range&quot;, 0, 1048576000], //设置上传文件的大小限制。</span></span>
<span class="line"><span>        ]</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(res);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const location = await client.getBucketLocation();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const host = \`http://\${config.bucket}.\${location.location}.aliyuncs.com\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    console.log(host);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>创建一个前端的 html</p><p>public/index.html</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;!DOCTYPE html&gt;</span></span>
<span class="line"><span>&lt;html lang=&quot;en&quot;&gt;</span></span>
<span class="line"><span>&lt;head&gt;</span></span>
<span class="line"><span>    &lt;meta charset=&quot;UTF-8&quot;&gt;</span></span>
<span class="line"><span>    &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;&gt;</span></span>
<span class="line"><span>    &lt;title&gt;Document&lt;/title&gt;</span></span>
<span class="line"><span>    &lt;script src=&quot;https://unpkg.com/axios@1.6.5/dist/axios.min.js&quot;&gt;&lt;/script&gt;</span></span>
<span class="line"><span>&lt;/head&gt;</span></span>
<span class="line"><span>&lt;body&gt;</span></span>
<span class="line"><span>    &lt;input id=&quot;fileInput&quot; type=&quot;file&quot;/&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;script&gt;</span></span>
<span class="line"><span>        const fileInput = document.getElementById(&#39;fileInput&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        asyncfunctiongetOSSInfo() {</span></span>
<span class="line"><span>            await&#39;请求应用服务器拿到临时凭证&#39;;</span></span>
<span class="line"><span>            return {</span></span>
<span class="line"><span>                OSSAccessKeyId: &#39;&#39;,</span></span>
<span class="line"><span>                Signature: &#39;&#39;,</span></span>
<span class="line"><span>                policy: &#39;&#39;,</span></span>
<span class="line"><span>                host: &#39;&#39;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        fileInput.onchange = async () =&gt; {</span></span>
<span class="line"><span>            const file = fileInput.files[0];</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            const ossInfo = await getOSSInfo();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            const formdata = new FormData()</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            formdata.append(&#39;key&#39;, file.name);</span></span>
<span class="line"><span>            formdata.append(&#39;OSSAccessKeyId&#39;, ossInfo.OSSAccessKeyId)</span></span>
<span class="line"><span>            formdata.append(&#39;policy&#39;, ossInfo.policy)</span></span>
<span class="line"><span>            formdata.append(&#39;signature&#39;, ossInfo.Signature)</span></span>
<span class="line"><span>            formdata.append(&#39;success_action_status&#39;, &#39;200&#39;)</span></span>
<span class="line"><span>            formdata.append(&#39;file&#39;, file)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            const res = await axios.post(ossInfo.host, formdata);</span></span>
<span class="line"><span>            if(res.status === 200) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                const img = document.createElement(&#39;img&#39;);</span></span>
<span class="line"><span>                img.src = ossInfo.host + &#39;/&#39; + file.name</span></span>
<span class="line"><span>                document.body.append(img);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                alert(&#39;上传成功&#39;);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    &lt;/script&gt;</span></span>
<span class="line"><span>&lt;/body&gt;</span></span>
<span class="line"><span>&lt;/html&gt;</span></span></code></pre></div><p>跑一下：</p><p><video src="`+_+'" controls></video></p><p>多模态大模型调用、前端直传 OSS 都跑通了，我们来做一个小实战：AI 画板。</p><p><img src="'+h+'" alt="img_07.png"></p><p><img src="'+v+'" alt="img_08.png"></p><p>先来写一下后端的接口：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest new ai-canvas</span></span></code></pre></div><p><img src="'+S+'" alt="img_09.webp"></p><p>进入项目，创建个新模块：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest g res ai --no-spec</span></span></code></pre></div><p><img src="'+b+'" alt="img_10.webp"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install dashscope-sdk-official dotenv ali-oss  @nestjs/config @nestjs/serve-static</span></span></code></pre></div><p>把我们前面写的那个图片修改的逻辑拿过来，放到 service 里：</p><p>具体代码从仓库复制。</p><p><video src="'+f+'" controls></video></p><p><img src="'+y+'" alt="img_11.webp"></p><p><img src="'+I+'" alt="img_12.webp"></p><p>这样我们就把前端直传 OSS，与多模态大模型，综合用了一遍。</p><p><strong>总结</strong></p><p>Agent 很多都支持多模态，比如上传图片识别、生成图片、视频等。</p><p>我们用了一下多模态的大模型，阿里的模型有的不支持 openai 协议，需要用 dashscope 的 sdk 来调用。</p><p>生成的图片、视频等会放到临时的 oss，有效期大概 24 小时，我们要传到自己的 oss 持久保存。</p><p>我们实现了前端直传 OSS，服务端只返回 sts 信息就可以了。</p><p>然后把多模态大模型与前端直传 oss 做了一个综合的小实战：AI 画板。</p><p>前端直传 OSS + 多模态大模型，会免回经常用到。</p>',66)])])}const P=n(k,[["render",A]]);export{E as __pageData,P as default};
