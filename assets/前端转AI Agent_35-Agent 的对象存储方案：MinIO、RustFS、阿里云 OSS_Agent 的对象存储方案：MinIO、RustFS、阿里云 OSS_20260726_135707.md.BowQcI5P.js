import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const i="/ai-docs/assets/img_01.DJiGAJU4.jpeg",t="/ai-docs/assets/img_02.Bh45csLd.png",l="/ai-docs/assets/img_03.B2D-o94I.png",c="/ai-docs/assets/img_04.IDLUhZKg.png",o="/ai-docs/assets/img_05.BFzAQA5S.jpeg",r="/ai-docs/assets/img_06.CoIXVzAl.png",d="/ai-docs/assets/img_07.CpqWKwhp.png",m="/ai-docs/assets/img_08.BdTdmrLl.png",g="/ai-docs/assets/img_09.CBBwVfhj.png",S="/ai-docs/assets/img_10.gJe7QEde.png",_="/ai-docs/assets/img_11.DzgQ0G8p.png",u="/ai-docs/assets/img_12.CNoPJylx.png",v="/ai-docs/assets/img_13.0XAlyeRN.png",h="/ai-docs/assets/video_01_1663632983299397313.Do8Bqm-M.mp4",O="/ai-docs/assets/video_02_12576743006460362621.IzmMKPWs.mp4",b="/ai-docs/assets/video_03_16918581314092838999.mFOtXtvH.mp4",C="/ai-docs/assets/img_14.BxDs4REV.png",I="/ai-docs/assets/video_04_10967198882128626644.Bem3t26m.mp4",A="/ai-docs/assets/img_15.PXVxKhDo.png",k="/ai-docs/assets/video_05_10559215108342567782.VwWtU5ro.mp4",y="/ai-docs/assets/img_16.281zdr7i.png",f="/ai-docs/assets/video_06_16157662950408939160.Dse4TVSN.mp4",E="/ai-docs/assets/img_17.Di-3oQcr.png",R="/ai-docs/assets/video_07_10548171237836221156.YwTnLMQ2.mp4",M="/ai-docs/assets/video_08_9238703743299217788.bW11a1oU.mp4",K="/ai-docs/assets/video_09_594738870279875485.ByXjRvA0.mp4",B=JSON.parse('{"title":"Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/35-Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS/Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS_20260726_135707.md","filePath":"前端转AI Agent/35-Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS/Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS_20260726_135707.md"}'),T={name:"前端转AI Agent/35-Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS/Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS_20260726_135707.md"};function D(P,s,F,w,q,x){return a(),p("div",null,[...s[0]||(s[0]=[e('<h1 id="agent-的对象存储方案-minio、rustfs、阿里云-oss" tabindex="-1">Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS <a class="header-anchor" href="#agent-的对象存储方案-minio、rustfs、阿里云-oss" aria-label="Permalink to &quot;Agent 的对象存储方案：MinIO、RustFS、阿里云 OSS&quot;">​</a></h1><p>AI Agent 在跑业务的时候，时时刻刻都要读写各种文件。</p><p>不管是上传的文档，还是 AI 自己生成的报表、图片视频</p><p>普通本地文件夹根本扛不住海量文件的生产场景。</p><p>所以要用对象存储（Object Storage）</p><p>比如这三类场景：</p><ul><li>存放 RAG 知识库所有原始文件，给智能问答提供数据源</li><li>保存 Agent 自动运行产出的报表、图表、运行日志</li><li>统一存图片、音频、视频，支撑多模态 AI 处理任务</li></ul><p><img src="'+i+'" alt="img_01.jpeg"></p><p>（MinIO 是常用的对象存储方案）</p><p>单独拿知识库场景来说：</p><p><img src="'+t+'" alt="img_02.png"></p><p>MinIO 承担着原始文件的存储重任。</p><p>各类文档、PDF、网页素材都会先进入数据处理环节，完成文件解析、文本切分、内容清洗与元数据提取。</p><p>处理完成后的原始文件，会完整存入 MinIO 对象存储中长久保存。</p><p>同时文件对应的名称、来源、切片等元数据写入关系型数据库（PostgreSQL）。</p><p>而切分后的文本分片会用嵌入模型向量化，存入向量数据库。</p><p>这就走完了知识库完整的数据入库流程。</p><p><img src="'+l+'" alt="img_03.png"></p><p>等到用户发起提问检索时，先把用户问题用嵌入模型向量化，去向量库做语义检索</p><p>向量数据库返回相似度高的文本片段，同时附带对应的文件 ID</p><p>检索服务拿着文件 ID 去元数据库，调取这份文件的基础信息</p><p>再根据文件 ID 从 MinIO 拉取完整原始文件、原文片段内容</p><p>最终把原文内容和检索结果一并返回给提问的用户。</p><p><img src="'+c+'" alt="img_04.png"></p><p>整套流程里 MinIO 对象存储的作用不可替代。</p><p>向量库只存文本向量，不会存放完整原始文件。</p><p>关系数据库仅保管元数据，无法承载大体积二进制附件。</p><p>只有 MinIO 能统一存放 PDF、图片、各类附件等大容量素材。</p><p>既能保障文件长期安全归档，又能随时按需调取原文溯源。</p><p>能和向量库、业务数据库无缝联动。</p><p><img src="'+o+'" alt="img_05.jpeg"></p><p>当然，对象存储不止有 MinIO</p><p>市面上主流可选方案主要分为三类：阿里云 OSS、MinIO、RustFS。</p><p>先说阿里云 OSS，属于公有云托管服务。</p><p>不用自己搭建服务器，零运维，开箱就能用。</p><p>完美适配云上业务，能和阿里云各类产品打通联动。</p><p>采用按量计费模式，自动扩容，业务规模越大扩容越省心。</p><p>适合线上 SaaS 平台、在线教育这类不想维护存储的团队。</p><p>再就是 MinIO，是轻量化私有化方案。</p><p>支持 Docker 一键部署，单机、小型集群都能快速搭建。</p><p>日常小批量文档存取流畅，搭建成本几乎为零。</p><p>但短板也很明显，大批量大文件并发时容易卡顿。</p><p>开源协议为 AGPL，如果商用落地会存在版权风险。</p><p>更适合中小企业小型知识库、本地测试环境使用。</p><p>最后是 RustFS，面向大型私有化集群设计。</p><p>支持多服务器分布式部署，海量文件并发场景稳定性更强。</p><p>底层基于 Rust 开发，运行时内存占用更低。</p><p>同时兼容 S3、POSIX、WebDAV 多种访问协议，适配更广。</p><p>开源协议是宽松的 Apache2.0，商用无任何版权约束。</p><p>专门匹配集团级多模态知识库、海量音视频、国产化政务国企项目。</p><p>综上：</p><ul><li>如果业务跑在公有云上、想省去运维压力，直接选阿里云 OSS。</li><li>如果只是小型本地自建知识库、低成本快速落地，优先 MinIO。</li><li>如果是海量音视频存储、大型集团国产化项目，推荐 RustFS。</li></ul><p><img src="'+r+'" alt="img_06.png"></p><p>这节我们把这三种都用一下：</p><p>我们本地文件存储是目录 - 文件的真实树状组织方式：</p><p><img src="'+d+'" alt="img_07.png"></p><p>而 OSS 对象存储底层是扁平化结构：</p><p><img src="'+m+'" alt="img_08.png"></p><p>所有文件都平铺在同一个桶内，不存在原生文件夹。</p><p>阿里云 OSS 官方文档也明确说明，对象存储底层没有真实目录层级：</p><p><img src="'+g+'" alt="img_09.png"></p><p>控制台里我们看到的文件夹视图，只是系统模拟出来的效果：</p><p><img src="'+S+'" alt="img_10.png"></p><p>这套虚拟目录的实现逻辑和文件元数据无关。</p><p>每个 Object 对象包含三部分核心信息：唯一 Key 标识、文件二进制内容、自定义元数据：</p><p><img src="'+_+'" alt="img_11.png"></p><p>OSS 只是解析文件 Key 里的/斜杠分隔符，渲染出目录分层视图。</p><p>用 Key 前缀做分组检索。</p><p>手动创建空文件夹时，本质是生成一个以/结尾的 0 字节占位对象。</p><p><img src="'+u+'" alt="img_12.png"></p><p>除了对象存储 OSS，阿里云也提供了文件存储和块存储的方式：</p><p><img src="'+v+'" alt="img_13.png"></p><p>块存储就是把整块磁盘给你用，你需要自己格式化，存储容量有限。</p><p>文件存储就是有目录层次结构，你可以上传下载文件，存储容量有限。</p><p>对象存储就是 key-value 存储，分布式的方式实现的，存储容量无限。</p><p>这些简单了解就行，绝大多数情况下，我们都是用 OSS 对象存储。</p><p>我们买一下阿里云 OSS 服务，5 块钱够用半年：</p><p><a href="https://www.aliyun.com/product/oss" target="_blank" rel="noreferrer">https://www.aliyun.com/product/oss</a></p><p><video src="'+h+'"></video></p><p>进到控制台，创建 Bucket，上传文件：</p><p><video src="'+O+'"></video></p><p>很多时候，我们需要在代码里上传，比如知识库里，用户上传的文件，要传到 OSS。</p><p><video src="'+b+`"></video></p><p>创建项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir oss-test</span></span>
<span class="line"><span>cd oss-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="`+C+`" alt="img_14.png"></p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install ali-oss dotenv</span></span></code></pre></div><p>创建 src/oss-upload.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import OSS from&#39;ali-oss&#39;;</span></span>
<span class="line"><span>import fs from&#39;fs&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const client = new OSS({</span></span>
<span class="line"><span>// yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。</span></span>
<span class="line"><span>region: process.env.OSS_REGION,</span></span>
<span class="line"><span>accessKeyId: process.env.OSS_ACCESS_KEY_ID,</span></span>
<span class="line"><span>accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,</span></span>
<span class="line"><span>authorizationV4: true,</span></span>
<span class="line"><span>bucket: process.env.OSS_BUCKET,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction putStream () {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    // 使用chunked encoding。使用putStream接口时，SDK默认会发起一个chunked encoding的HTTP PUT请求。</span></span>
<span class="line"><span>    let stream = fs.createReadStream(&#39;./zao.png&#39;);</span></span>
<span class="line"><span>    // 填写Object完整路径，例如exampledir/exampleobject.txt。Object完整路径中不能包含Bucket名称。</span></span>
<span class="line"><span>    let result = await client.putStream(&#39;aaa/bbb/first.png&#39;, stream);</span></span>
<span class="line"><span>    console.log(result);</span></span>
<span class="line"><span>  } catch (e) {</span></span>
<span class="line"><span>    console.log(e)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>putStream();</span></span></code></pre></div><p>还有 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OSS_REGION=</span></span>
<span class="line"><span>OSS_ACCESS_KEY_ID=</span></span>
<span class="line"><span>OSS_ACCESS_KEY_SECRET=</span></span>
<span class="line"><span>OSS_BUCKET=</span></span></code></pre></div><p><video src="`+I+'"></video></p><p>这样，我们就通过代码完成了 OSS 文件上传。</p><p>直接用阿里云的 OSS 是挺方便，但是要花钱，而且企业内部有的资料也不希望上云。</p><p>这种情况就要自己搭 OSS 服务了：</p><p>比如 MinIO 或者 RustFS</p><p><img src="'+A+`" alt="img_15.png"></p><p>创建 docker-compose.yml</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>version: &quot;3.8&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>minio:</span></span>
<span class="line"><span>    image:minio/minio:RELEASE.2025-04-22T22-12-26Z</span></span>
<span class="line"><span>    container_name:minio-server</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      # S3 对象存储API端口（程序对接用）</span></span>
<span class="line"><span>      -&quot;9000:9000&quot;</span></span>
<span class="line"><span>      # Web图形控制台端口（浏览器访问UI）</span></span>
<span class="line"><span>      -&quot;9001:9001&quot;</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      # 登录控制台、S3接口的账号（至少3位）</span></span>
<span class="line"><span>      MINIO_ROOT_USER:admin</span></span>
<span class="line"><span>      # 登录密码（至少8位，数字+字母）</span></span>
<span class="line"><span>      MINIO_ROOT_PASSWORD:Admin@123456</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      # 持久化数据到本地 ./minio-data 文件夹</span></span>
<span class="line"><span>      -./minio-data:/data</span></span>
<span class="line"><span>    command:server/data--console-address&quot;:9001&quot;</span></span></code></pre></div><p>跑一下：</p><p><video src="`+k+'"></video></p><p>这样我们就在本地跑了一个 OSS 服务：</p><p><img src="'+y+`" alt="img_16.png"></p><p>然后我们在代码里用 sdk 上传</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install minio</span></span></code></pre></div><p>创建 src/minio-upload.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import fs from&#39;fs&#39;;</span></span>
<span class="line"><span>import * as Minio from&#39;minio&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const minioClient = new Minio.Client({</span></span>
<span class="line"><span>endPoint: &#39;localhost&#39;,</span></span>
<span class="line"><span>port: 9000,</span></span>
<span class="line"><span>useSSL: false,</span></span>
<span class="line"><span>accessKey: process.env.MINIO_ACCESS_KEY,</span></span>
<span class="line"><span>secretKey: process.env.MINIO_SECRET_KEY,</span></span>
<span class="line"><span>})</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction putStream() {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>        const stream = fs.createReadStream(&#39;./zao.png&#39;);</span></span>
<span class="line"><span>        const result = await minioClient.putObject(&#39;aaa&#39;, &#39;ccc/ddd/hello.png&#39;, stream);</span></span>
<span class="line"><span>        console.log(result);</span></span>
<span class="line"><span>        console.log(&#39;上传成功&#39;);</span></span>
<span class="line"><span>    } catch (err) {</span></span>
<span class="line"><span>        console.log(err);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>putStream();</span></span></code></pre></div><p><video src="`+f+'"></video></p><p>你会发现代码和之前阿里云 OSS 的差不多，为什么 OSS 服务都这么相似呢？</p><p>因为它们都是遵循 AWS 的 Simple Storage Service（S3）规范的，简称 S3 规范。</p><p>所以不管哪家的 OSS，用起来都是差不多的。</p><p><img src="'+E+'" alt="img_17.png"></p><p>简单试一下 minio 新版的改动：</p><p><video src="'+R+`"></video></p><p>最后再来用一下 RustFS</p><p>改下配置文件：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>version: &quot;3.8&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>rustfs:</span></span>
<span class="line"><span>    image:rustfs/rustfs:latest</span></span>
<span class="line"><span>    container_name:rustfs-server</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;9000:9000&quot;    # S3 API 端口</span></span>
<span class="line"><span>      -&quot;9001:9001&quot;    # Web控制台端口</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      TZ:Asia/Shanghai</span></span>
<span class="line"><span>      # S3/后台登录账号密钥</span></span>
<span class="line"><span>      RUSTFS_ACCESS_KEY:admin</span></span>
<span class="line"><span>      RUSTFS_SECRET_KEY:Admin@123456</span></span>
<span class="line"><span>      # 开启Web管理控制台</span></span>
<span class="line"><span>      RUSTFS_CONSOLE_ENABLE:&quot;true&quot;</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -./volumes/rustfs-data:/data</span></span>
<span class="line"><span>      -./volumes/rustfs-logs:/logs</span></span>
<span class="line"><span>    command:server/data</span></span></code></pre></div><p>跑一下：</p><p><video src="`+M+`"></video></p><p>除了界面不大一样，功能都是差不多的。</p><p>然后在代码里上传个文件；</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @aws-sdk/client-s3</span></span></code></pre></div><p>因为都兼容 S3 协议，所以所有对象存储服务都可直接使用 AWS 官方 S3 SDK；</p><p>前面我们用 ali-oss、minio 写的代码也都可以换成这个 sdk</p><p>创建 src/s3-upload.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &#39;dotenv/config&#39;;</span></span>
<span class="line"><span>import { S3Client, PutObjectCommand } from&#39;@aws-sdk/client-s3&#39;;</span></span>
<span class="line"><span>import fs from&#39;fs&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 初始化统一S3客户端（RustFS/MinIO/阿里云OSS通用）</span></span>
<span class="line"><span>const s3Client = new S3Client({</span></span>
<span class="line"><span>endpoint: process.env.S3_ENDPOINT,</span></span>
<span class="line"><span>credentials: {</span></span>
<span class="line"><span>    accessKeyId: process.env.S3_ACCESS_KEY_ID,</span></span>
<span class="line"><span>    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>forcePathStyle: true,</span></span>
<span class="line"><span>signatureVersion: &#39;v4&#39;,</span></span>
<span class="line"><span>region: &#39;aaa&#39;// 本地私有存储随便填，不影响</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * 文件流上传</span></span>
<span class="line"><span> * @param {string} objectKey 对象路径 aaa/bbb/first.png</span></span>
<span class="line"><span> * @param {ReadableStream} stream fs可读流</span></span>
<span class="line"><span> * @param {string} contentType 文件类型（图片/pdf等）</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>asyncfunction putStream(objectKey, stream, contentType = &#39;image/png&#39;) {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    const uploadCmd = new PutObjectCommand({</span></span>
<span class="line"><span>      Bucket: &#39;hello&#39;,</span></span>
<span class="line"><span>      Key: objectKey,</span></span>
<span class="line"><span>      Body: stream,</span></span>
<span class="line"><span>      ContentType: contentType</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    await s3Client.send(uploadCmd);</span></span>
<span class="line"><span>    console.log(&#39;上传成功&#39;);</span></span>
<span class="line"><span>  } catch (err) {</span></span>
<span class="line"><span>    console.error(&#39;上传失败&#39;, err);</span></span>
<span class="line"><span>    throw err;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction main() {</span></span>
<span class="line"><span>const stream = fs.createReadStream(&#39;./zao.png&#39;);</span></span>
<span class="line"><span>await putStream(&#39;aaa/bbb/first.png&#39;, stream, &#39;image/png&#39;);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>main();</span></span></code></pre></div><p>改一下 .env</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>S3_ENDPOINT=http://localhost:9000</span></span>
<span class="line"><span>S3_ACCESS_KEY_ID=admin</span></span>
<span class="line"><span>S3_SECRET_ACCESS_KEY=Admin@123456</span></span></code></pre></div><p>跑一下：</p><p><video src="`+K+'"></video></p><p>至此，我们阿里云 OSS、MinIO、RustFS 就都用了一遍了。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><p><strong>总结</strong></p><p>AI Agent 运行过程中会持续产生、读取大量各类文件。</p><p>用户上传的文档、程序自动生成的图表、音视频等都需要稳定存储。</p><p>普通本地文件夹无法支撑海量文件并发读写的业务场景</p><p>所以做 AI 知识库、多模态 Agent 项目，必须使用对象存储。</p><p>比如 RAG 知识库的完整流程：</p><p>用户上传的 PDF、网页素材先经过解析、清洗、切片处理。</p><p>原始文件会完整存入对象存储长期归档保存。</p><p>文件名称、来源、切片信息这类元数据存入 PostgreSQL 关系库。</p><p>文本切片经过向量化后，单独存入向量数据库用于语义检索。</p><p>用户提问时，向量库返回匹配片段并附带对应文件 ID</p><p>程序拿着 ID 去数据库读取文件基础信息</p><p>再通过对象存储拉取完整原始文档做溯源展示。</p><p>向量库只存向量、数据库只存文字信息，都存不了大体积二进制文件。</p><p>只有对象存储能统一承载图片、PDF、音视频等大容量素材。</p><p>目前主流可选三类对象存储方案，分别是阿里云 OSS、MinIO、RustFS</p><p>阿里云 OSS 是公有云托管服务，不用自己维护服务器，按量自动扩容</p><p>适合线上 SaaS、不想投入运维人力的业务团队</p><p>MinIO 可以 Docker 快速私有化部署，本地测试、小型知识库用着很方便</p><p>但新版社区版阉割了可视化管理功能，商用还存在 AGPL 开源版权风险</p><p>RustFS 专为私有化海量文件场景打造，Rust 底层内存占用低、并发稳定</p><p>商用无约束，适配多模态国产化项目</p><p>三类存储底层全部遵循 S3 标准协议，核心能力基本一致。</p><p>只是后台管理界面、商用约束存在区别。</p><p>安装 @aws-sdk/client-s3 这一个 aws 的包就能对接所有 OSS 服务，也可以分别用 ali-oss、minio 来对接。</p><p>对象存储是各类 AI Agent 存储文件的底层核心支撑，后面会大量用到。</p>',159)])])}const N=n(T,[["render",D]]);export{B as __pageData,N as default};
