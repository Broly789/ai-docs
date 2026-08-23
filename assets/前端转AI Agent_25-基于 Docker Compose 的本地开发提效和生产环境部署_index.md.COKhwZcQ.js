import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const u=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/25-基于 Docker Compose 的本地开发提效和生产环境部署/index.md","filePath":"前端转AI Agent/25-基于 Docker Compose 的本地开发提效和生产环境部署/index.md"}'),l={name:"前端转AI Agent/25-基于 Docker Compose 的本地开发提效和生产环境部署/index.md"};function t(i,s,c,o,r,m){return a(),p("div",null,[...s[0]||(s[0]=[e(`<p>业务项目的 Agent 都是在后端跑的。</p><p>比如业务数据存在 MySQL，知识存在向量数据库 Milvus、短期记忆存 Redis、需要关键词检索的放在 ElasticSearch 等。</p><p>而且你在招聘软件上搜 Agent 岗位，基本都是后端岗，所以做 Agent 开发，必须得学后端技术。</p><p>这节开始，我们集中把后端的数据库与中间件过一遍。</p><p>数据库是业务的“压舱石”，负责持久化存储原始业务数据，比如 MySQL 存用户信息。核心要求是稳健、不丢失。</p><p>而中间件则是各类独立的辅助基础软件。如果说数据库是全能但笨重的“仓库”，中间件就是各怀绝技的“特种兵”，用来补足数据库和业务逻辑的短板：</p><ul><li>检索补足：MySQL 不擅长全文模糊搜索，我们就引入 Elasticsearch 专门做高性能检索</li><li>性能补足：核心数据库读写磁盘太慢，我们就用 Redis 这种内存级中间件来做高速缓存</li><li>异步补足：业务逻辑处理太耗时，我们就用 RabbitMQ 或 BullMQ 这类消息队列中间件来做任务缓冲和解耦。</li></ul><p>简单区分：</p><p>数据库：核心是持久化，存的是业务的“资产”，追求数据的绝对可靠。</p><p>中间件：核心是专项能力，它不负责通用的持久存储，而是提供单一的强力支持（如检索、缓存、消息调度）。</p><p>在全栈开发中，你的代码就像是“指挥官”。懂业务逻辑只是及格，能根据场景精准调度这些中间件去解决性能、并发和搜索痛点，才是真正迈向“后端架构师”的标志。</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcL2cKvlZgGZTibI207VLdDrN2A7f1x9UcibpciaAkk72WIibvbGXZibzzXTjWEKrI6EtDNGRF2s7TmHnKwjITYzcaoibqvsjfJiceTDw/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" alt="图片" referrerpolicy="no-referrer"></p><p><strong>数据库是根，中间件是特种兵。</strong></p><p>如图，mysql存的是业务原始数据，是根，不能丢。</p><p>而 redis 专门做缓存、es 做全文检索、milvus 做语义检索、、bullmq 做消息队列，是用于专门的用途，各司其职、专精专用，它们不是原始数据，丢了也不影响数据完整性。</p><p>而<strong>业务代码是数据库和中间件的调度者，整合所有底层组件，最终实现完整的业务功能，对外提供服务。</strong></p><p>理解了业务代码、中间件、数据库这三者的区别和联系，我们这些先把 docker 学一下。</p><p>因为数据库、中间件、业务代码，我们都会通过 docker 来跑。</p><p>Docker 将应用及其依赖环境统一封装为镜像，镜像运行后就成为容器。</p><p>一台服务器可以同时运行多个容器，容器之间相互隔离，拥有独立的文件系统、网络、端口等环境，互不干扰，专门用来运行各类服务。</p><p>这样整个环境都保存在这个镜像里，部署多个实例只要通过这个镜像跑多个容器就行。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffYXj4f3BL2ketgTIzuZnhdL2Kr3YBHyZl8ialcPAniaCwc1D9lraIgLAB18rKG4LyLeSmCaY5dIka9NfaKcfmnzaOz21XxUcsy8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" alt="图片" referrerpolicy="no-referrer"></p><p>这也是为什么它的 logo 是这样的：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfee3FuSSTJ7k5d0VvMHPO5XxcUvNnPbX4HzdMVusUOzoS39c8qTDw69gt4NRXT62e1Ol7fVhGvksyibzEmRKPK0ARJoPDwria4M4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" alt="图片" referrerpolicy="no-referrer"></p><p>Docker 提供了 Docker Hub 镜像仓库，可以把本地镜像 push 到仓库或者从仓库 pull 镜像到本地。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfesxqTiaWaTXEN6iaHOkFFxN08ZfgGfZJDvzwJY15UxHVBj0qZuad9cvicWOo1JiadaRdrfeKoaVhzNUyd11Ioks2yOHLVJicaONxQU/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=3" alt="图片" referrerpolicy="no-referrer"></p><p>我们之前在 docker desktop 里下载的镜像，就是从 docker hub 搜的。</p><p>当然，通过命令行执行 docker pull 也可以。</p><p>这些就是我们前面下载的镜像（image）</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfelGYcEvOIKLDxibVMpZia9TEaQ7Mm7K8eibDIlicB8HYUD541HqYEjUumSicVt48RUTWwEfJ6rT14gMccNUcrSAqePZDSeRhpFswAE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=4" alt="图片" referrerpolicy="no-referrer"></p><p>这些是镜像跑起来的容器（container）实例：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfd4cHC151Hft8YH7UpHrjpbDB2NK2DWkPUkRSIwmJpJMUUok0xPWHMbqDMEPibv3donOzLvSHNejMaWTtRYcPCLPv8mb3OibFYyE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=5" alt="图片" referrerpolicy="no-referrer"></p><p>跑容器时的参数，基本都讲过：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdBUUOW5W7otXuMnvwj857xSB5JfVlhWMInpn5I4830iabibOyIGhwvayKZHgDiaHnRnJhEO7YpMlob2qCAN3k3ibsKSrFJn4mDeWo/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=6" alt="图片" referrerpolicy="no-referrer"></p><p>port 是映射宿主机的端口到容器内的端口。</p><p>下面是环境变量。</p><p>这个 volume 数据卷是挂载本地某个目录到容器内的。</p><p>虽然在容器内跑数据库，但我们希望数据能持久化保存到宿主机，这样下次跑其他容器，也能用这个目录下的数据。</p><p>这就是数据卷 volume 的作用，把它挂载到容器就好了。</p><p>上面这些用命令行就是这样：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>docker run -d \\</span></span>
<span class="line"><span>  --name mysql-container2 \\</span></span>
<span class="line"><span>  -p 3306:3306 \\</span></span>
<span class="line"><span>  -e MYSQL_ROOT_PASSWORD=admin \\</span></span>
<span class="line"><span>  -v /Users/guang/mysql:/var/lib/mysql \\</span></span>
<span class="line"><span>  mysql:latest</span></span></code></pre></div><p>在界面上填的参数本质上就是这行命令。</p><p>前面是跑的 mysql、milvus 这种镜像，那如果我们想自己创建一个 docker 镜像呢？</p><p>比如把之前的 Nest 项目打包成镜像。</p><p>这种就要写 Dockerfile 了。</p><p>比如这样：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 指定基础镜像（必须第一行）</span></span>
<span class="line"><span>FROM node:24.15-alpine</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 设置容器内工作目录</span></span>
<span class="line"><span>WORKDIR /app</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 先复制 package.json 利用缓存加速</span></span>
<span class="line"><span>COPY package*.json ./</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 构建时执行：安装依赖</span></span>
<span class="line"><span>RUN npm config set registry https://registry.npmmirror.com/</span></span>
<span class="line"><span>RUN npm install</span></span>
<span class="line"><span>RUN npm install -g @nestjs/cli</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 复制项目所有代码到容器内</span></span>
<span class="line"><span>COPY . .</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 构建 Nest 项目（编译成 JS）</span></span>
<span class="line"><span>RUN npm run build</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 声明暴露端口（仅声明）</span></span>
<span class="line"><span>EXPOSE3000</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 容器启动时执行的命令（启动 Nest 服务）</span></span>
<span class="line"><span>CMD [&quot;node&quot;, &quot;dist/main.js&quot;]</span></span></code></pre></div><p>这些指令的含义如下：</p><ul><li>FROM：指定基础镜像，一切从这个镜像开始构建</li><li>WORKDIR：指定容器内的工作目录，后续命令都在这个目录执行</li><li>COPY：将宿主机的文件 / 目录复制到容器内部</li><li>RUN：在构建镜像时执行命令，比如安装依赖、编译项目</li><li>EXPOSE：声明容器要暴露的端口，仅作声明，方便阅读</li><li>CMD：容器启动时执行的默认命令，一个 Dockerfile 只能有一个 CMD</li></ul><p>我们创建个 nest 项目，打包成镜像试试：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest new nest-dockerfile-test</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdibFooibpFkRvjSXrQOoSic87mGjdMkFBVxcpiaxjZxfial2kZKCA6LTKU2eQeOcj7yp4NicHo7B8lXmcUZ2ouVpWsjtXUUj1cr2ibJU/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" alt="图片" referrerpolicy="no-referrer"></p><p>创建一个增删改查模块：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest g res book --no-spec</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcmYP4ESUBZyaxdhxo8yPJQ7jsy8HgnER7HibeMXCKA449Ymuia0U5bGTe5dpwsZnGGfQw8CG9ib6eSVTRXBtueiaicLa3S0RlxTQ4o/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=8" alt="图片" referrerpolicy="no-referrer"></p><p>然后根目录创建 Dockerfile（刚才那个复制过来）</p><p>加一个 .dockerignore</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node_modules/</span></span>
<span class="line"><span>.vscode/</span></span>
<span class="line"><span>.git/</span></span></code></pre></div><p>这些是复制的时候忽略的文件</p><p>打包成镜像：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>docker build -t nest-app .</span></span></code></pre></div><p>-t 是指定镜像名字</p><p>然后跑一下：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>docker run -d \\</span></span>
<span class="line"><span>  --name nest-container \\</span></span>
<span class="line"><span>  -p 3006:3000 \\</span></span>
<span class="line"><span>  nest-app</span></span></code></pre></div><p>现在这样是可以的，但是镜像里会多了一些无关代码</p><p>比如源码、非生产环境的依赖等</p><p>会导致镜像体积更大</p><p>所以我们一般用多阶段构建来写 Dockerfile：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 构建阶段：需要 devDependencies（含 @nestjs/cli、typescript）才能 nest build</span></span>
<span class="line"><span>FROM node:24.15-alpine AS builder</span></span>
<span class="line"><span>WORKDIR /app</span></span>
<span class="line"><span>COPY package*.json ./</span></span>
<span class="line"><span>RUN npm config set registry https://registry.npmmirror.com/</span></span>
<span class="line"><span>RUN npm install</span></span>
<span class="line"><span>COPY . .</span></span>
<span class="line"><span>RUN npm run build</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 运行阶段：仅生产依赖 + 编译产物，镜像更小</span></span>
<span class="line"><span>FROM node:24.15-alpine</span></span>
<span class="line"><span>ENV NODE_ENV=production</span></span>
<span class="line"><span>WORKDIR /app</span></span>
<span class="line"><span>COPY package*.json ./</span></span>
<span class="line"><span>RUN npm config set registry https://registry.npmmirror.com/</span></span>
<span class="line"><span>RUN npm install --production</span></span>
<span class="line"><span>COPY --from=builder /app/dist ./dist</span></span>
<span class="line"><span></span></span>
<span class="line"><span>EXPOSE3000</span></span>
<span class="line"><span>CMD [&quot;node&quot;, &quot;dist/main.js&quot;]</span></span></code></pre></div><p>就是第一个阶段镜像只用于构建</p><p>之后再创建一个镜像，把前一个镜像构建出来的代码复制过去，跑起来</p><p>这样只保留最后一个镜像的文件，显然体积会更小</p><p>这就是多阶段构建</p><p>镜像体积小了 400M</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeo6NGUdJBOdkIxwXLyHOja8dpYicPIuTff5oZqPc6xXQYNu0owzG8CYFBMsoj4AWCeA8m7dPB9VhPic9afb1VmAvEiazrMDn1uW4/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=9" alt="图片" referrerpolicy="no-referrer"></p><p>现在有了 mysql、milvus 等镜像，有了 nest 服务的镜像</p><p>如果想让它们一起跑呢？</p><p>这就需要 Docker Compose 了</p><p>其实之前我们跑 Milvus，就是用 docker compose：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfcfHHejlyS5Qu3VkCwCg9O9q9CQtN335wYnWCVb8ZDCOcfOtTOMt1EU8wXX7ibsibiayr73y7sQ4qY19bmbeIj6K1vtmSTW3u5Xu8/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=10" alt="图片" referrerpolicy="no-referrer"></p><p>它基于 3 个 docker 镜像来跑的。</p><p>当时我们就是基于一个 docker compose 的配置文件跑起来的：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcbga8AGyMiaEV8jUmBXxBaXp7vgR52kwdM0OUCK8Ut1JkxMGoIElF5a178enTu7PxXmuicTDZ22EgMFzvGlvT0vfnia1ztfVvtlQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=11" alt="图片" referrerpolicy="no-referrer"></p><p><strong>Docker Compose 用于编排多个容器，统一管理启动参数、依赖顺序与网络环境。</strong></p><p><strong>所有容器默认处于同一内网，天然互通，可直接用容器名互相调用。</strong></p><p>milvus 是这么跑的，我们自己的项目也是用这种方式来跑。</p><p>首先，本地开发我们要跑 mysql、milvus 等，之前都是手动在 docker desktop 里跑，其实可以用 docker compose 文件统一跑：</p><p>创建 docker-compose.dev.yml</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>version: &#39;3.8&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span># MySQL</span></span>
<span class="line"><span>mysql:</span></span>
<span class="line"><span>    image:mysql:latest</span></span>
<span class="line"><span>    container_name:mysql-dev</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;3306:3306&quot;</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      MYSQL_ROOT_PASSWORD:admin</span></span>
<span class="line"><span>    command:mysqld--character-set-server=utf8mb4--collation-server=utf8mb4_general_ci# 设置默认字符集</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mysql:/var/lib/mysql</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Milvus</span></span>
<span class="line"><span>etcd:</span></span>
<span class="line"><span>    container_name:milvus-etcd</span></span>
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
<span class="line"><span>    container_name:milvus-minio</span></span>
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
<span class="line"><span>    container_name:milvus-standalone</span></span>
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
<span class="line"><span>    name:common-network</span></span></code></pre></div><p>milvus 的部分复制之前那个 docker compose 配置文件的，我们加上了 mysql 的容器</p><p>重点是这里：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdV8DyUdiaKhZNTID80vbJiaWia3Pv00bfORLIF03kib9ztcBogCvXa37oC0PRGf4FV3yEEDhpXlprrOwWybKt6NNWypWIxvoklvj0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=12" alt="图片" referrerpolicy="no-referrer"></p><p>这个 \${DOCKER_VOLUME_DIRECTORY:-.} 的意思是，如果我们指定了环境变量 DOCKER_VOLUME_DIRECTORY 是 /abc</p><p>那路径拼接起来就是：</p><p>/abc/volumes/mysql</p><p>没有指定就是：</p><p>./volumes/mysql</p><p>这样指定默认值，还支持环境变量来修改的方式更灵活。</p><p>在 package.json 里添加两个命令：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffA9LXGjfbMYwibUkZk9ibP9N712tbSXBYlnpeRJrujXvkWj0aN66Ha1J9B2nic3pOPbYxn9OWDc40Ixwljia40j9ImGKQQaNQc7eQ/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=13" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;docker:up&quot;: &quot;DOCKER_VOLUME_DIRECTORY=/Users/guang/ docker compose -f docker-compose.dev.yml up -d&quot;,</span></span>
<span class="line"><span>&quot;docker:down&quot;: &quot;docker compose -f docker-compose.dev.yml down&quot;,</span></span></code></pre></div><p>指定数据卷目录的环境变量，然后跑 docker compose up</p><p>以及停掉这些容器的 docker compose down</p><p>这样，本地环境就可以一键启动了，不用一个个跑 docker 容器。</p><p>接下来再写一下生产环境的 docker-compose.yml</p><p>首先，我们代码里用一下 mysql 做增删改查</p><p>安装 TypeORM 和 mysql 驱动包：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install --save @nestjs/typeorm typeorm mysql2</span></span></code></pre></div><p>在 AppModule 引入：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdicTyZoHVQhr8N2N9AKELPn9AsY1icRsRaSAUCiaQI5XibnmzStQDtdrGpoVbmgwws8DO02zY8x1FgUSNRndwcJvn1BtSSIgWibcWE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=14" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TypeOrmModule.forRoot({</span></span>
<span class="line"><span>  type: &#39;mysql&#39;,</span></span>
<span class="line"><span>host: &#39;localhost&#39;,</span></span>
<span class="line"><span>port: 3306,</span></span>
<span class="line"><span>username: &#39;root&#39;,</span></span>
<span class="line"><span>password: &#39;admin&#39;,</span></span>
<span class="line"><span>database: &#39;book&#39;,</span></span>
<span class="line"><span>synchronize: true,</span></span>
<span class="line"><span>connectorPackage: &#39;mysql2&#39;,</span></span>
<span class="line"><span>logging: true,</span></span>
<span class="line"><span>entities: []</span></span>
<span class="line"><span>}),</span></span></code></pre></div><p>改一下 book/entities/book.entity.ts</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import {</span></span>
<span class="line"><span>  Column,</span></span>
<span class="line"><span>  CreateDateColumn,</span></span>
<span class="line"><span>  Entity,</span></span>
<span class="line"><span>  PrimaryGeneratedColumn,</span></span>
<span class="line"><span>  UpdateDateColumn,</span></span>
<span class="line"><span>} from&#39;typeorm&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Entity({ name: &#39;books&#39; })</span></span>
<span class="line"><span>exportclass Book {</span></span>
<span class="line"><span>  @PrimaryGeneratedColumn()</span></span>
<span class="line"><span>id: number;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Column({ length: 255 })</span></span>
<span class="line"><span>title: string;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Column({ length: 255 })</span></span>
<span class="line"><span>author: string;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Column({ type: &#39;text&#39; })</span></span>
<span class="line"><span>description: string;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Column({ type: &#39;decimal&#39;, precision: 10, scale: 2 })</span></span>
<span class="line"><span>price: number;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Column({ type: &#39;int&#39;, default: 0 })</span></span>
<span class="line"><span>stock: number;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Column({ type: &#39;datetime&#39; })</span></span>
<span class="line"><span>publishedAt: Date;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @CreateDateColumn({ type: &#39;datetime&#39; })</span></span>
<span class="line"><span>createdAt: Date;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @UpdateDateColumn({ type: &#39;datetime&#39; })</span></span>
<span class="line"><span>updatedAt: Date;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>创建 book 的 entity，用 typeorm 做好和数据库表的映射。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfe1KqsvJJNsdCwUR3gcRF0KaCzKjzKteXVoyQtjlq9OxpABDBbXnUSdfwxZfcxrLVRokG1pTuy1KYzrKtlIQ46icQ3kHBRJoqpE/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=15" alt="图片" referrerpolicy="no-referrer"></p><p>引入这个 Entity。</p><p>然后改下 BookService：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Inject, Injectable, NotFoundException } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { EntityManager } from&#39;typeorm&#39;;</span></span>
<span class="line"><span>import { CreateBookDto } from&#39;./dto/create-book.dto&#39;;</span></span>
<span class="line"><span>import { UpdateBookDto } from&#39;./dto/update-book.dto&#39;;</span></span>
<span class="line"><span>import { Book } from&#39;./entities/book.entity&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Injectable()</span></span>
<span class="line"><span>exportclass BookService {</span></span>
<span class="line"><span>  @Inject(EntityManager)</span></span>
<span class="line"><span>  private readonly entityManager: EntityManager;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async create(createBookDto: CreateBookDto) {</span></span>
<span class="line"><span>    const book = this.entityManager.create(Book, {</span></span>
<span class="line"><span>      ...createBookDto,</span></span>
<span class="line"><span>      publishedAt: newDate(createBookDto.publishedAt),</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    returnthis.entityManager.save(Book, book);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async findAll() {</span></span>
<span class="line"><span>    returnthis.entityManager.find(Book, {</span></span>
<span class="line"><span>      order: { id: &#39;DESC&#39; },</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async findOne(id: number) {</span></span>
<span class="line"><span>    const book = awaitthis.entityManager.findOneBy(Book, { id });</span></span>
<span class="line"><span>    if (!book) {</span></span>
<span class="line"><span>      thrownew NotFoundException(\`Book #\${id} not found\`);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return book;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async update(id: number, updateBookDto: UpdateBookDto) {</span></span>
<span class="line"><span>    const book = awaitthis.findOne(id);</span></span>
<span class="line"><span>    const { publishedAt, ...restPayload } = updateBookDto;</span></span>
<span class="line"><span>    const updatePayload: Partial&lt;Book&gt; = { ...restPayload };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (publishedAt !== undefined) {</span></span>
<span class="line"><span>      updatePayload.publishedAt = newDate(publishedAt);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const mergedBook = this.entityManager.merge(Book, book, updatePayload);</span></span>
<span class="line"><span>    returnthis.entityManager.save(Book, mergedBook);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async remove(id: number) {</span></span>
<span class="line"><span>    const book = awaitthis.findOne(id);</span></span>
<span class="line"><span>    awaitthis.entityManager.remove(Book, book);</span></span>
<span class="line"><span>    return { deleted: true };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>就是增删改查逻辑，不用细看。</p><p>对了，跑 docker 容器的时候，要让它自动创建 book 这个 database，然后 typeorm 才能在下面自动建表</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffLmEjcF97E9fnFudmwpibnfprLZMOkGOppHAJ8xiaTmNAYbNeyliaMjxHT7PjSjrhkIyvjQk9WwfKVAoTn3t6hg6DT1evhZe9bLY/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=16" alt="图片" referrerpolicy="no-referrer"></p><p>用 MYSQL_DATABASE 这个环境变量指定。</p><p>你可以用这个 curl 来测试：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 1) 新增（Create）</span></span>
<span class="line"><span>curl -X POST &quot;http://localhost:3000/book&quot; \\</span></span>
<span class="line"><span>  -H &quot;Content-Type: application/json&quot; \\</span></span>
<span class="line"><span>  -d &#39;{</span></span>
<span class="line"><span>    &quot;title&quot;: &quot;Clean Code&quot;,</span></span>
<span class="line"><span>    &quot;author&quot;: &quot;Robert C. Martin&quot;,</span></span>
<span class="line"><span>    &quot;description&quot;: &quot;A handbook of agile software craftsmanship&quot;,</span></span>
<span class="line"><span>    &quot;price&quot;: 99.9,</span></span>
<span class="line"><span>    &quot;stock&quot;: 50,</span></span>
<span class="line"><span>    &quot;publishedAt&quot;: &quot;2008-08-01&quot;</span></span>
<span class="line"><span>  }&#39;</span></span>
<span class="line"><span># 2) 查询全部（Read All）</span></span>
<span class="line"><span>curl -X GET &quot;http://localhost:3000/book&quot;</span></span></code></pre></div><p>我们加一个静态页面来测试：</p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @nestjs/serve-static</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdOicDAUicLCrLpQhMnSOtHzIe3VXmkubpibT2ZAIK3YtqrDqwTljMNZbo3XFqicuiaOJRgULIwkbRB4MtGhfsxo2rMVXZ4yelglJH0/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=17" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ServeStaticModule.forRoot({</span></span>
<span class="line"><span>  rootPath: join(__dirname, &#39;public&#39;),</span></span>
<span class="line"><span>  serveRoot: &#39;/books&#39;,</span></span>
<span class="line"><span>}),</span></span></code></pre></div><p>添加 public/index.html（ai 生成的，不用细看）</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;!doctype html&gt;</span></span>
<span class="line"><span>&lt;html lang=&quot;zh-CN&quot;&gt;</span></span>
<span class="line"><span>&lt;head&gt;</span></span>
<span class="line"><span>    &lt;meta charset=&quot;UTF-8&quot; /&gt;</span></span>
<span class="line"><span>    &lt;meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot; /&gt;</span></span>
<span class="line"><span>    &lt;title&gt;书籍管理&lt;/title&gt;</span></span>
<span class="line"><span>    &lt;style&gt;</span></span>
<span class="line"><span>      :root {</span></span>
<span class="line"><span>        font-family:</span></span>
<span class="line"><span>          Inter,</span></span>
<span class="line"><span>          -apple-system,</span></span>
<span class="line"><span>          BlinkMacSystemFont,</span></span>
<span class="line"><span>          &#39;Segoe UI&#39;,</span></span>
<span class="line"><span>          sans-serif;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      body {</span></span>
<span class="line"><span>        margin: 0;</span></span>
<span class="line"><span>        background: #f7f8fa;</span></span>
<span class="line"><span>        color: #222;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .container {</span></span>
<span class="line"><span>        max-width: 980px;</span></span>
<span class="line"><span>        margin: 32px auto;</span></span>
<span class="line"><span>        padding: 016px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      h1 {</span></span>
<span class="line"><span>        margin-bottom: 16px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .panel {</span></span>
<span class="line"><span>        background: #fff;</span></span>
<span class="line"><span>        border-radius: 12px;</span></span>
<span class="line"><span>        padding: 16px;</span></span>
<span class="line"><span>        box-shadow: 06px18pxrgba(0, 0, 0, 0.08);</span></span>
<span class="line"><span>        margin-bottom: 16px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      form {</span></span>
<span class="line"><span>        display: grid;</span></span>
<span class="line"><span>        grid-template-columns: repeat(2, minmax(0, 1fr));</span></span>
<span class="line"><span>        gap: 12px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      label {</span></span>
<span class="line"><span>        font-size: 14px;</span></span>
<span class="line"><span>        display: flex;</span></span>
<span class="line"><span>        flex-direction: column;</span></span>
<span class="line"><span>        gap: 4px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .full {</span></span>
<span class="line"><span>        grid-column: 1 / -1;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      input,</span></span>
<span class="line"><span>      textarea {</span></span>
<span class="line"><span>        border: 1px solid #d0d4dc;</span></span>
<span class="line"><span>        border-radius: 8px;</span></span>
<span class="line"><span>        padding: 8px10px;</span></span>
<span class="line"><span>        font-size: 14px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      textarea {</span></span>
<span class="line"><span>        min-height: 70px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .actions {</span></span>
<span class="line"><span>        display: flex;</span></span>
<span class="line"><span>        gap: 8px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      button {</span></span>
<span class="line"><span>        border: 0;</span></span>
<span class="line"><span>        border-radius: 8px;</span></span>
<span class="line"><span>        padding: 9px12px;</span></span>
<span class="line"><span>        font-weight: 600;</span></span>
<span class="line"><span>        cursor: pointer;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .primary {</span></span>
<span class="line"><span>        background: #2563eb;</span></span>
<span class="line"><span>        color: #fff;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .muted {</span></span>
<span class="line"><span>        background: #e5e7eb;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      table {</span></span>
<span class="line"><span>        width: 100%;</span></span>
<span class="line"><span>        border-collapse: collapse;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      th,</span></span>
<span class="line"><span>      td {</span></span>
<span class="line"><span>        border-bottom: 1px solid #eceff3;</span></span>
<span class="line"><span>        text-align: left;</span></span>
<span class="line"><span>        padding: 10px8px;</span></span>
<span class="line"><span>        font-size: 14px;</span></span>
<span class="line"><span>        vertical-align: top;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      .danger {</span></span>
<span class="line"><span>        background: #ef4444;</span></span>
<span class="line"><span>        color: #fff;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      #status {</span></span>
<span class="line"><span>        min-height: 20px;</span></span>
<span class="line"><span>        font-size: 14px;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      @media (max-width:700px) {</span></span>
<span class="line"><span>        form {</span></span>
<span class="line"><span>          grid-template-columns: 1fr;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    &lt;/style&gt;</span></span>
<span class="line"><span>&lt;/head&gt;</span></span>
<span class="line"><span>&lt;body&gt;</span></span>
<span class="line"><span>    &lt;div class=&quot;container&quot;&gt;</span></span>
<span class="line"><span>      &lt;h1&gt;书籍管理&lt;/h1&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      &lt;div class=&quot;panel&quot;&gt;</span></span>
<span class="line"><span>        &lt;form id=&quot;book-form&quot;&gt;</span></span>
<span class="line"><span>          &lt;input id=&quot;book-id&quot; type=&quot;hidden&quot; /&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;label&gt;</span></span>
<span class="line"><span>            书名</span></span>
<span class="line"><span>            &lt;input id=&quot;title&quot; required /&gt;</span></span>
<span class="line"><span>          &lt;/label&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;label&gt;</span></span>
<span class="line"><span>            作者</span></span>
<span class="line"><span>            &lt;input id=&quot;author&quot; required /&gt;</span></span>
<span class="line"><span>          &lt;/label&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;label class=&quot;full&quot;&gt;</span></span>
<span class="line"><span>            简介</span></span>
<span class="line"><span>            &lt;textarea id=&quot;description&quot; required&gt;&lt;/textarea&gt;</span></span>
<span class="line"><span>          &lt;/label&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;label&gt;</span></span>
<span class="line"><span>            价格</span></span>
<span class="line"><span>            &lt;input id=&quot;price&quot; type=&quot;number&quot; min=&quot;0&quot; step=&quot;0.01&quot; required /&gt;</span></span>
<span class="line"><span>          &lt;/label&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;label&gt;</span></span>
<span class="line"><span>            库存</span></span>
<span class="line"><span>            &lt;input id=&quot;stock&quot; type=&quot;number&quot; min=&quot;0&quot; required /&gt;</span></span>
<span class="line"><span>          &lt;/label&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;label class=&quot;full&quot;&gt;</span></span>
<span class="line"><span>            出版日期</span></span>
<span class="line"><span>            &lt;input id=&quot;publishedAt&quot; type=&quot;date&quot; required /&gt;</span></span>
<span class="line"><span>          &lt;/label&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          &lt;div class=&quot;actions full&quot;&gt;</span></span>
<span class="line"><span>            &lt;button type=&quot;submit&quot; class=&quot;primary&quot;&gt;保存&lt;/button&gt;</span></span>
<span class="line"><span>            &lt;button type=&quot;button&quot; class=&quot;muted&quot; id=&quot;reset-btn&quot;&gt;清空&lt;/button&gt;</span></span>
<span class="line"><span>          &lt;/div&gt;</span></span>
<span class="line"><span>        &lt;/form&gt;</span></span>
<span class="line"><span>      &lt;/div&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      &lt;div class=&quot;panel&quot;&gt;</span></span>
<span class="line"><span>        &lt;div id=&quot;status&quot;&gt;&lt;/div&gt;</span></span>
<span class="line"><span>        &lt;table&gt;</span></span>
<span class="line"><span>          &lt;thead&gt;</span></span>
<span class="line"><span>            &lt;tr&gt;</span></span>
<span class="line"><span>              &lt;th&gt;ID&lt;/th&gt;</span></span>
<span class="line"><span>              &lt;th&gt;书名&lt;/th&gt;</span></span>
<span class="line"><span>              &lt;th&gt;作者&lt;/th&gt;</span></span>
<span class="line"><span>              &lt;th&gt;价格&lt;/th&gt;</span></span>
<span class="line"><span>              &lt;th&gt;库存&lt;/th&gt;</span></span>
<span class="line"><span>              &lt;th&gt;出版日期&lt;/th&gt;</span></span>
<span class="line"><span>              &lt;th&gt;操作&lt;/th&gt;</span></span>
<span class="line"><span>            &lt;/tr&gt;</span></span>
<span class="line"><span>          &lt;/thead&gt;</span></span>
<span class="line"><span>          &lt;tbody id=&quot;book-rows&quot;&gt;&lt;/tbody&gt;</span></span>
<span class="line"><span>        &lt;/table&gt;</span></span>
<span class="line"><span>      &lt;/div&gt;</span></span>
<span class="line"><span>    &lt;/div&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;script&gt;</span></span>
<span class="line"><span>      const form = document.getElementById(&#39;book-form&#39;);</span></span>
<span class="line"><span>      const rows = document.getElementById(&#39;book-rows&#39;);</span></span>
<span class="line"><span>      const statusNode = document.getElementById(&#39;status&#39;);</span></span>
<span class="line"><span>      const resetBtn = document.getElementById(&#39;reset-btn&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const inputs = {</span></span>
<span class="line"><span>        id: document.getElementById(&#39;book-id&#39;),</span></span>
<span class="line"><span>        title: document.getElementById(&#39;title&#39;),</span></span>
<span class="line"><span>        author: document.getElementById(&#39;author&#39;),</span></span>
<span class="line"><span>        description: document.getElementById(&#39;description&#39;),</span></span>
<span class="line"><span>        price: document.getElementById(&#39;price&#39;),</span></span>
<span class="line"><span>        stock: document.getElementById(&#39;stock&#39;),</span></span>
<span class="line"><span>        publishedAt: document.getElementById(&#39;publishedAt&#39;),</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const setStatus = (text, isError = false) =&gt; {</span></span>
<span class="line"><span>        statusNode.textContent = text;</span></span>
<span class="line"><span>        statusNode.style.color = isError ? &#39;#b91c1c&#39; : &#39;#2563eb&#39;;</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const resetForm = () =&gt; {</span></span>
<span class="line"><span>        form.reset();</span></span>
<span class="line"><span>        inputs.id.value = &#39;&#39;;</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const mapFormData = () =&gt; ({</span></span>
<span class="line"><span>        title: inputs.title.value.trim(),</span></span>
<span class="line"><span>        author: inputs.author.value.trim(),</span></span>
<span class="line"><span>        description: inputs.description.value.trim(),</span></span>
<span class="line"><span>        price: Number(inputs.price.value),</span></span>
<span class="line"><span>        stock: Number(inputs.stock.value),</span></span>
<span class="line"><span>        publishedAt: inputs.publishedAt.value,</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const createActionButton = (label, className, onClick) =&gt; {</span></span>
<span class="line"><span>        const button = document.createElement(&#39;button&#39;);</span></span>
<span class="line"><span>        button.textContent = label;</span></span>
<span class="line"><span>        button.className = className;</span></span>
<span class="line"><span>        button.type = &#39;button&#39;;</span></span>
<span class="line"><span>        button.addEventListener(&#39;click&#39;, onClick);</span></span>
<span class="line"><span>        return button;</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const editBook = (book) =&gt; {</span></span>
<span class="line"><span>        inputs.id.value = book.id;</span></span>
<span class="line"><span>        inputs.title.value = book.title;</span></span>
<span class="line"><span>        inputs.author.value = book.author;</span></span>
<span class="line"><span>        inputs.description.value = book.description;</span></span>
<span class="line"><span>        inputs.price.value = book.price;</span></span>
<span class="line"><span>        inputs.stock.value = book.stock;</span></span>
<span class="line"><span>        inputs.publishedAt.value = newDate(book.publishedAt)</span></span>
<span class="line"><span>          .toISOString()</span></span>
<span class="line"><span>          .split(&#39;T&#39;)[0];</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const deleteBook = async (id) =&gt; {</span></span>
<span class="line"><span>        if (!confirm(\`确认删除书籍 #\${id} 吗？\`)) return;</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          const response = await fetch(\`/book/\${id}\`, { method: &#39;DELETE&#39; });</span></span>
<span class="line"><span>          if (!response.ok) thrownewError(&#39;删除失败&#39;);</span></span>
<span class="line"><span>          setStatus(\`已删除书籍 #\${id}\`);</span></span>
<span class="line"><span>          await loadBooks();</span></span>
<span class="line"><span>        } catch (error) {</span></span>
<span class="line"><span>          setStatus(error.message, true);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const renderRows = (books) =&gt; {</span></span>
<span class="line"><span>        rows.innerHTML = &#39;&#39;;</span></span>
<span class="line"><span>        if (!books.length) {</span></span>
<span class="line"><span>          rows.innerHTML = &#39;&lt;tr&gt;&lt;td colspan=&quot;7&quot;&gt;暂无数据&lt;/td&gt;&lt;/tr&gt;&#39;;</span></span>
<span class="line"><span>          return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        for (const book of books) {</span></span>
<span class="line"><span>          const tr = document.createElement(&#39;tr&#39;);</span></span>
<span class="line"><span>          tr.innerHTML = \`</span></span>
<span class="line"><span>            &lt;td&gt;\${book.id}&lt;/td&gt;</span></span>
<span class="line"><span>            &lt;td&gt;\${book.title}&lt;/td&gt;</span></span>
<span class="line"><span>            &lt;td&gt;\${book.author}&lt;/td&gt;</span></span>
<span class="line"><span>            &lt;td&gt;\${book.price}&lt;/td&gt;</span></span>
<span class="line"><span>            &lt;td&gt;\${book.stock}&lt;/td&gt;</span></span>
<span class="line"><span>            &lt;td&gt;\${new Date(book.publishedAt).toLocaleDateString()}&lt;/td&gt;</span></span>
<span class="line"><span>            &lt;td&gt;&lt;/td&gt;</span></span>
<span class="line"><span>          \`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          const actionCell = tr.lastElementChild;</span></span>
<span class="line"><span>          actionCell.appendChild(</span></span>
<span class="line"><span>            createActionButton(&#39;编辑&#39;, &#39;muted&#39;, () =&gt; editBook(book)),</span></span>
<span class="line"><span>          );</span></span>
<span class="line"><span>          actionCell.appendChild(</span></span>
<span class="line"><span>            createActionButton(&#39;删除&#39;, &#39;danger&#39;, () =&gt; deleteBook(book.id)),</span></span>
<span class="line"><span>          );</span></span>
<span class="line"><span>          rows.appendChild(tr);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      const loadBooks = async () =&gt; {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          const response = await fetch(&#39;/book&#39;);</span></span>
<span class="line"><span>          if (!response.ok) thrownewError(&#39;加载书籍失败&#39;);</span></span>
<span class="line"><span>          const books = await response.json();</span></span>
<span class="line"><span>          renderRows(books);</span></span>
<span class="line"><span>        } catch (error) {</span></span>
<span class="line"><span>          setStatus(error.message, true);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      form.addEventListener(&#39;submit&#39;, async (event) =&gt; {</span></span>
<span class="line"><span>        event.preventDefault();</span></span>
<span class="line"><span>        const id = inputs.id.value.trim();</span></span>
<span class="line"><span>        const payload = mapFormData();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        const method = id ? &#39;PATCH&#39; : &#39;POST&#39;;</span></span>
<span class="line"><span>        const url = id ? \`/book/\${id}\` : &#39;/book&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          const response = await fetch(url, {</span></span>
<span class="line"><span>            method,</span></span>
<span class="line"><span>            headers: { &#39;Content-Type&#39;: &#39;application/json&#39; },</span></span>
<span class="line"><span>            body: JSON.stringify(payload),</span></span>
<span class="line"><span>          });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          if (!response.ok) {</span></span>
<span class="line"><span>            thrownewError(id ? &#39;更新失败&#39; : &#39;创建失败&#39;);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          setStatus(id ? \`已更新书籍 #\${id}\` : &#39;已创建书籍&#39;);</span></span>
<span class="line"><span>          resetForm();</span></span>
<span class="line"><span>          await loadBooks();</span></span>
<span class="line"><span>        } catch (error) {</span></span>
<span class="line"><span>          setStatus(error.message, true);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      resetBtn.addEventListener(&#39;click&#39;, resetForm);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      loadBooks();</span></span>
<span class="line"><span>    &lt;/script&gt;</span></span>
<span class="line"><span>&lt;/body&gt;</span></span>
<span class="line"><span>&lt;/html&gt;</span></span></code></pre></div><p>本地跑通之后，生产环境的 docker-compose.yml 怎么写呢？</p><p>创建 docker-compose.prod.yml</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>services:</span></span>
<span class="line"><span>  mysql-prod:</span></span>
<span class="line"><span>    image: mysql:latest</span></span>
<span class="line"><span>    container_name: mysql-prod</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      MYSQL_ROOT_PASSWORD: admin</span></span>
<span class="line"><span>      MYSQL_DATABASE: book</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - &quot;3306:3306&quot;</span></span>
<span class="line"><span>    command: mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_general_ci</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      - \${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mysql-prod:/var/lib/mysql</span></span>
<span class="line"><span>    restart: always</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  nest-app:</span></span>
<span class="line"><span>    container_name: nest-app</span></span>
<span class="line"><span>    build:</span></span>
<span class="line"><span>      context: .</span></span>
<span class="line"><span>      dockerfile: Dockerfile</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - &quot;3000:3000&quot;</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      NODE_ENV: production</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      - mysql-prod</span></span>
<span class="line"><span>    restart: always</span></span></code></pre></div><p>这里 nest-app 的 docker 容器是从 Dockerfile 构建出来的</p><p>生成环境连接 mysql 是用容器名，也就是 mysql-prod</p><p>所以要改一下：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcm8885mZCYFGW3fRlsqc9Fztt0Yhwx0J6iam8F61nWPTg6gAZh1wFoLAURpRCpRep2ljwdZM3FC42rTGfLQQJY6CqMaPoqibnrs/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=18" alt="图片" referrerpolicy="no-referrer"></p><p>此外，静态文件默认不会输出到 dist 目录，我们要配置下</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeZdZoUXWdgRDWPHceZM0naN16fXVad9eunDDIU9stmuiaXoetgCRVuicblCgo2yRZZdLkLCbcKVMleIxn2FiapWnTLrcnL98ic25s/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=19" alt="图片" referrerpolicy="no-referrer"></p><p>改下 nest-cli.json</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;compilerOptions&quot;: {</span></span>
<span class="line"><span>    &quot;deleteOutDir&quot;: true,</span></span>
<span class="line"><span>    &quot;assets&quot;: [</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>        &quot;include&quot;: &quot;../public/**/*&quot;,</span></span>
<span class="line"><span>        &quot;outDir&quot;: &quot;dist/public&quot;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    ]</span></span>
<span class="line"><span>  }</span></span></code></pre></div><p>加一个生产环境用的命令：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfckb2ZwX0j7SL1f3RmZ2vjpqQueR9vXfed4NtCgbZIkWiacmHsUEw1t3ibicO68Vibc9lm7cia4rTl6HHs2kgkticAr6QYtiaQlv11jds/640?wx_fmt=png&amp;from=appmsg&amp;tp=wxpic&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=20" alt="图片" referrerpolicy="no-referrer"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&quot;docker:prod:up&quot;: &quot;docker compose -f docker-compose.prod.yml up -d --build&quot;,</span></span></code></pre></div><p>这样，我们就用 docker compose 实现了生产环境的部署。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>Agent 开发离不开后端生态，这节我们开始学后端的技术。</p><p>首先我们明确了数据库、中间件、业务代码的区分。</p><p>数据库是根，存的是原始数据，中间件是特种兵，是完成特定用途的组件，比如缓存、全文检索、消息队列等。</p><p>业务代码调度数据库和中间件，实现完整的业务功能，对外提供服务</p><p>我们学了 docker 容器怎么跑，volume 数据卷的作用。</p><p>然后写了 Dockerfile，构建出了自己的 docker 镜像，并且基于多阶段构建实现了镜像大小的优化。</p><p>学了本地如何用 docker compose 一键启动多个容器</p><p>生产环境如何用 docker compose 来部署</p><p>后面我们本地开发、生产环境部署，都是基于 Docker Compose 的。</p>`,157)])])}const g=n(l,[["render",t]]);export{u as __pageData,g as default};
