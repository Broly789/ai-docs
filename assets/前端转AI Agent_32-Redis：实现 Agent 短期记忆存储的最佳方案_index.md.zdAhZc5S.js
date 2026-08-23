import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const l="/ai-docs/assets/video1.C5LRLAJZ.mp4",i="/ai-docs/assets/video2.CZR0hUD8.mp4",c="/ai-docs/assets/video3.B5BxKjgf.mp4",t="/ai-docs/assets/video4.ClD1S-pi.mp4",k=JSON.parse('{"title":"Redis：实现 Agent 短期记忆存储的最佳方案已付费","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/32-Redis：实现 Agent 短期记忆存储的最佳方案/index.md","filePath":"前端转AI Agent/32-Redis：实现 Agent 短期记忆存储的最佳方案/index.md"}'),o={name:"前端转AI Agent/32-Redis：实现 Agent 短期记忆存储的最佳方案/index.md"};function r(d,s,u,g,m,h){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="redis-实现-agent-短期记忆存储的最佳方案已付费" tabindex="-1">Redis：实现 Agent 短期记忆存储的最佳方案已付费 <a class="header-anchor" href="#redis-实现-agent-短期记忆存储的最佳方案已付费" aria-label="Permalink to &quot;Redis：实现 Agent 短期记忆存储的最佳方案已付费&quot;">​</a></h1><p>原创 神说要有光 [神光的幸福生活](&lt;javascript:void(0);&gt;) <em>2026年6月1日 12:41</em> <em>山东</em> 1人</p><p>用户和 Agent 聊了几轮之后，对话上下文该存放在哪里呢？</p><p>CLI 版的单机 Agent 很简单：</p><p>所有对话、截断、摘要都直接放在进程内存里，不需要任何外部存储。</p><p>但后端服务不一样：</p><p>线上服务一般会部署多个服务实例做负载均衡，单实例内存无法共享会话数据；同时对话属于高频读写的热数据，对响应延迟要求极高，还需要实现会话闲置自动失效。</p><p>这种场景下，最近几轮对话、动态截断、历史摘要，这些运行时上下文必须放在 Redis 里。</p><p>依靠 Redis 低延迟读写、天然支持 TTL 过期、多实例数据共享的特性，完美支撑短期会话运行。</p><p>Redis 只负责承载运行时短期记忆，不会长期保存数据。</p><p>每一条消息本身，最终都会异步写入 PostgreSQL 保存，作为永久的聊天记录和可语义检索的长期记忆。</p><p>写消息的流程是这样的：</p><ul><li>用户发消息</li><li>写入 Redis（更新短期记忆）</li><li>同时写入 PostgreSQL（落库永久保存）</li><li>截断、摘要都在 Redis 里做</li><li>长期记忆检索从 PostgreSQL + 向量查</li></ul><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfc2Z3uLVPbQwfhdhGppYoibYKnoVE1n89z2HasWGC0pNylSw6ficcXqpnuPlh38dqNuvgeuIVfEj8hUx0p5c7bzVian0LrRthBSAw/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>我们先学下 Redis，然后基于它实现短期记忆。</p><p>Redis 是一个高性能的<strong>键值型内存数据库</strong>，也是后端开发中最常用的缓存中间件之一。</p><p>它的数据默认都存在内存里，读写延迟通常在亚毫秒级，天生就适合处理像对话上下文这样的高频读写场景。</p><p>它的几个特性，刚好完美适配 Agent 短期记忆的需求：</p><ul><li><strong>支持 TTL（过期时间）</strong></li></ul><p>会话闲置一段时间后，数据会自动过期清理，不用我们写额外的定时清理逻辑，非常省心。</p><ul><li><strong>多实例共享数据</strong></li></ul><p>所有 Agent 服务实例都能连接同一个 Redis，用户的会话上下文在任何实例上都能被读取，完美解决了负载均衡下的会话共享问题。</p><ul><li><strong>丰富的数据结构</strong></li></ul><p>我们可以用 List 直接存对话列表，用 Hash 存会话元信息，用 String 存对话摘要，实现起来非常灵活。</p><ul><li><strong>支持持久化</strong></li></ul><p>如果需要，Redis 也能通过 RDB/AOF 做数据备份，避免极端情况下会话数据丢失，兼顾性能与可靠性。</p><p>接下来，我们就来用一下 Redis</p><p>创建项目：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mkdir redis-test</span></span>
<span class="line"><span>cd redis-test</span></span>
<span class="line"><span>npm init -y</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffUSkMmLdR4HPORNR2icCx0IOO2s2icMyoWmQMAgsbLrCsmj2FSmwgtg4lJ4Ow3mkePFjZibIfFTqUe3rjib8PibXxPZFAVPFHwvDm4/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>创建 docker-compose.yml</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>services:</span></span>
<span class="line"><span>  # Redis</span></span>
<span class="line"><span>redis:</span></span>
<span class="line"><span>    image:redis:7-alpine</span></span>
<span class="line"><span>    container_name:agent_redis</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;6379:6379&quot;</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/redis:/data</span></span>
<span class="line"><span>    command:redis-server--appendonlyyes</span></span>
<span class="line"><span>    healthcheck:</span></span>
<span class="line"><span>      test:[&quot;CMD&quot;,&quot;redis-cli&quot;,&quot;ping&quot;]</span></span>
<span class="line"><span>      interval:5s</span></span>
<span class="line"><span>      timeout:5s</span></span>
<span class="line"><span>      retries:5</span></span>
<span class="line"><span></span></span>
<span class="line"><span># Redis 官方 Web GUI（类似 pgAdmin）</span></span>
<span class="line"><span>redisinsight:</span></span>
<span class="line"><span>    image:redis/redisinsight:2.50</span></span>
<span class="line"><span>    container_name:redis_insight</span></span>
<span class="line"><span>    restart:always</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      -&quot;5540:5540&quot;</span></span>
<span class="line"><span>    volumes:</span></span>
<span class="line"><span>      -\${DOCKER_VOLUME_DIRECTORY:-.}/volumes/redisinsight:/data</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      -RI_HOST=0.0.0.0</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      -redis</span></span>
<span class="line"><span></span></span>
<span class="line"><span>networks:</span></span>
<span class="line"><span>default:</span></span>
<span class="line"><span>    name:common-network</span></span></code></pre></div><p>跑下 redis 以及它的 GUI</p><p><video src="`+l+`"></video></p><p>我们通过命令创建了 string 类型的 key，并设置了 TTL 过期时间。</p><p>redis 还有很多数据类型：<img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfexpvicMkUe2eq0QbTel3wPwKGbqaQIeftmL8tIOv351DibSkqKu22icO3BXhhzQC5MHf9lrj4x9saUSDIVc01olZnySvUYcnriaLk/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>我们过一遍常用的 7 种：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfcaImgKsVVTv8RAkRVLhibpRctLIbReds2gq5nPlZ2HZyJ6icJL9QJdpATxBkTa6kmh5spbAJBvZkRjIXDKtdqJd5y9smfSZ7CmM/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>创建 redis-data-types.md</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># Redis 核心数据类型手册</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 一、String 字符串</span></span>
<span class="line"><span>适用场景：验证码、Token、登录会话、计数器、分布式锁、配置项、文本类短期记忆</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>set key value</span></span>
<span class="line"><span>get key</span></span>
<span class="line"><span>setex key 秒数 value</span></span>
<span class="line"><span>set key value nx ex 秒数</span></span>
<span class="line"><span>incr key</span></span>
<span class="line"><span>decr key</span></span>
<span class="line"><span>incrby key 步长</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>手机验证码，5 分钟过期</span></span>
<span class="line"><span>setex verification:mobile:13800138000 300 &quot;666888&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户登录 Token，24 小时过期</span></span>
<span class="line"><span>setex session:token:adf245kjndsa3 86400 &quot;userid:1001&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>文章阅读量自增</span></span>
<span class="line"><span>incr counter:article:1024</span></span>
<span class="line"><span></span></span>
<span class="line"><span>分布式锁，10 秒过期，防止重复执行</span></span>
<span class="line"><span>set lock:order:2001 &quot;locked&quot; nx ex 10</span></span>
<span class="line"><span></span></span>
<span class="line"><span>AI 对话摘要，1 小时过期</span></span>
<span class="line"><span>setex agent:memory:user:1001 3600 &quot;用户想学习 PostgreSQL 向量检索&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 二、Hash 哈希</span></span>
<span class="line"><span>适用场景：用户信息、商品资料、电商购物车、结构化对话上下文</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>hset key field value</span></span>
<span class="line"><span>hmset key field1 value1 field2 value2</span></span>
<span class="line"><span>hget key field</span></span>
<span class="line"><span>hgetall key</span></span>
<span class="line"><span>hkeys key</span></span>
<span class="line"><span>hvals key</span></span>
<span class="line"><span>hincrby key field 增量</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>存储用户基础信息</span></span>
<span class="line"><span>hset user:info:1001 name &quot;张三&quot; age 28 phone &quot;13800138000&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>电商购物车，字段为商品 ID，值为购买数量</span></span>
<span class="line"><span>hset cart:user:1001 product:10086 2 product:10087 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>存储 AI 会话完整上下文</span></span>
<span class="line"><span>hset agent:session:user:1001 messages &quot;最近 5 轮对话&quot; summary &quot;对话摘要&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 三、List 列表</span></span>
<span class="line"><span>适用场景：消息队列、任务队列、操作日志、聊天历史、有序记录</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>lpush key value1 value2</span></span>
<span class="line"><span>rpush key value1 value2</span></span>
<span class="line"><span>lrange key 0 -1</span></span>
<span class="line"><span>lpop key</span></span>
<span class="line"><span>rpop key</span></span>
<span class="line"><span>llen key</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>订单消息队列，右侧入队</span></span>
<span class="line"><span>rpush queue:order &quot;order_1001&quot;&quot;order_1002&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户浏览历史，左侧插入最新记录</span></span>
<span class="line"><span>lpush user:history:1001 &quot;查看了 AI 课程&quot;&quot;查看了 Redis 教程&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>后台任务队列</span></span>
<span class="line"><span>rpush queue:task &quot;生成对话摘要&quot;&quot;向量入库&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 四、Set 集合</span></span>
<span class="line"><span>适用场景：数据去重、每日签到、IP 黑名单、共同好友、权限标签</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sadd key value1 value2</span></span>
<span class="line"><span>smembers key</span></span>
<span class="line"><span>sismember key value</span></span>
<span class="line"><span>sinter key1 key2</span></span>
<span class="line"><span>sunion key1 key2</span></span>
<span class="line"><span>sdiff key1 key2</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>记录当日签到用户</span></span>
<span class="line"><span>sadd sign:20250820:user 1001 1002 1003</span></span>
<span class="line"><span></span></span>
<span class="line"><span>网站 IP 黑名单</span></span>
<span class="line"><span>sadd blacklist:ip &quot;192.168.1.100&quot;&quot;192.168.1.101&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>查询两位用户的共同好友</span></span>
<span class="line"><span>sinter user:friend:1001 user:friend:1002</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 五、ZSet 有序集合</span></span>
<span class="line"><span>适用场景：各类排行榜、内容热度排序、用户积分排名、权重队列</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>zadd key score member</span></span>
<span class="line"><span>zrange key 0 -1</span></span>
<span class="line"><span>zrevrange key 0 -1</span></span>
<span class="line"><span>zscore key member</span></span>
<span class="line"><span>zrank key member</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>课程热度排行榜，数值为热度分数</span></span>
<span class="line"><span>zadd rank:course 98 &quot;PostgreSQL 实战&quot; 95 &quot;AI Agent 开发&quot; 92 &quot;Redis 从入门到精通&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>用户积分排行榜</span></span>
<span class="line"><span>zadd rank:user:points 1000 &quot;张三&quot; 850 &quot;李四&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>文章热度排序</span></span>
<span class="line"><span>zadd hot:article 1200 &quot;article:1024&quot; 980 &quot;article:1025&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 六、Bitmap 位图</span></span>
<span class="line"><span>适用场景：海量用户签到记录、在线状态统计、布尔型数据存储，极致节省内存</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>setbit key 偏移量 0/1</span></span>
<span class="line"><span>getbit key 偏移量</span></span>
<span class="line"><span>bitcount key</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>记录用户当月签到，第 5 天、第 10 天完成签到</span></span>
<span class="line"><span>setbit user:sign:1001:202508 5 1</span></span>
<span class="line"><span>setbit user:sign:1001:202508 10 1</span></span>
<span class="line"><span></span></span>
<span class="line"><span>统计该用户当月总签到天数</span></span>
<span class="line"><span>bitcount user:sign:1001:202508</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 七、Geo 地理位置</span></span>
<span class="line"><span>适用场景：附近门店、附近的人、两地距离计算、位置检索</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**核心命令**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>geoadd key 经度 纬度 名称</span></span>
<span class="line"><span>geodist key 名称1 名称2 km</span></span>
<span class="line"><span></span></span>
<span class="line"><span>**真实业务示例**</span></span>
<span class="line"><span></span></span>
<span class="line"><span>添加线下门店经纬度信息</span></span>
<span class="line"><span>geoadd shop:location 116.481028 39.921983 &quot;北京总店&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>计算两家门店之间的直线距离，单位千米</span></span>
<span class="line"><span>geodist shop:location &quot;北京总店&quot;&quot;上海分店&quot; km</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## 数据类型场景速查表</span></span>
<span class="line"><span>| 数据类型 | 典型业务场景 |</span></span>
<span class="line"><span>| ---- | ---- |</span></span>
<span class="line"><span>| String | 验证码、Token、计数器、分布式锁、文本记忆 |</span></span>
<span class="line"><span>| Hash | 用户信息、商品数据、购物车、结构化会话 |</span></span>
<span class="line"><span>| List | 消息队列、任务队列、浏览/聊天历史 |</span></span>
<span class="line"><span>| Set | 签到、数据去重、黑名单、好友关系 |</span></span>
<span class="line"><span>| ZSet | 排行榜、热度排序、积分排名 |</span></span>
<span class="line"><span>| Bitmap | 批量签到、海量布尔状态统计 |</span></span>
<span class="line"><span>| Geo | 位置检索、距离计算、附近门店/人群 |</span></span></code></pre></div><p>试一下：</p><p><video src="`+i+`"></video></p><p>这样我们过了一遍 7 种常用 Redis 数据类型，以及各自适合的业务场景。</p><p>那在代码里咋用 redis 呢？</p><p>安装依赖：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install ioredis</span></span></code></pre></div><p>创建 src/redis-test.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import Redis from&#39;ioredis&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 创建 Redis 客户端</span></span>
<span class="line"><span>const redis = new Redis({</span></span>
<span class="line"><span>host: &#39;localhost&#39;,</span></span>
<span class="line"><span>port: 6379,</span></span>
<span class="line"><span>db: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 监听连接</span></span>
<span class="line"><span>redis.on(&#39;connect&#39;, () =&gt; {</span></span>
<span class="line"><span>console.log(&#39;✅ ioredis 连接成功（mjs 版）&#39;);</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 错误监听</span></span>
<span class="line"><span>redis.on(&#39;error&#39;, (err) =&gt; {</span></span>
<span class="line"><span>console.error(&#39;❌ Redis 连接失败：&#39;, err);</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 执行操作</span></span>
<span class="line"><span>asyncfunction runRedisDemo() {</span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    // 1. String 字符串</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    await redis.set(&#39;name&#39;, &#39;张三&#39;);</span></span>
<span class="line"><span>    await redis.set(&#39;code&#39;, &#39;6666&#39;, &#39;EX&#39;, 300); // 5 分钟过期</span></span>
<span class="line"><span>    console.log(&#39;String name:&#39;, await redis.get(&#39;name&#39;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    // 2. Hash 哈希</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    await redis.hset(&#39;user:1001&#39;, &#39;name&#39;, &#39;李四&#39;, &#39;age&#39;, 28);</span></span>
<span class="line"><span>    console.log(&#39;Hash user:&#39;, await redis.hgetall(&#39;user:1001&#39;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    // 3. List 列表</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    await redis.lpush(&#39;task:list&#39;, &#39;任务1&#39;, &#39;任务2&#39;);</span></span>
<span class="line"><span>    await redis.rpush(&#39;task:list&#39;, &#39;任务3&#39;);</span></span>
<span class="line"><span>    console.log(&#39;List:&#39;, await redis.lrange(&#39;task:list&#39;, 0, -1));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    // 4. Set 集合</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    await redis.sadd(&#39;tag:set&#39;, &#39;redis&#39;, &#39;nest&#39;, &#39;node&#39;);</span></span>
<span class="line"><span>    console.log(&#39;Set:&#39;, await redis.smembers(&#39;tag:set&#39;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    // 5. ZSet 有序集合</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    await redis.zadd(&#39;score:rank&#39;, 99, &#39;小明&#39;, 95, &#39;小红&#39;);</span></span>
<span class="line"><span>    console.log(&#39;ZSet 排名:&#39;, await redis.zrange(&#39;score:rank&#39;, 0, -1));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    // 6. 分布式锁（标准写法）</span></span>
<span class="line"><span>    // =========================</span></span>
<span class="line"><span>    const lockKey = &#39;lock:order:1001&#39;;</span></span>
<span class="line"><span>    const lockResult = await redis.set(lockKey, &#39;locked&#39;, &#39;NX&#39;, &#39;EX&#39;, 10);</span></span>
<span class="line"><span>    console.log(&#39;分布式锁:&#39;, lockResult ? &#39;加锁成功&#39; : &#39;加锁失败&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  } catch (err) {</span></span>
<span class="line"><span>    console.error(&#39;执行异常：&#39;, err);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 运行</span></span>
<span class="line"><span>runRedisDemo();</span></span></code></pre></div><p>跑一下：</p><p><video src="`+c+`"></video></p><p>redis 的数据结构、应用场景，代码里怎么操作都会了。</p><p>接下来我们可以实现刚开始的需求：</p><p>基于 redis 实现 agent 短期记忆的存储。</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdZPbCgolelTWyDicYsiaJickKia51zeojBYIks28IN8eib7wRNqsTsCHHebdp4K60R2XRKHaibTsMq3oXxnhrhCdqV9uZj3SXlxsREk/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>安装 langgraph 和 deepagents：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @langchain/langgraph @langchain/openai deepagents dotenv langchain zod</span></span></code></pre></div><p>创建 src/agent-with-redis-memory.mjs</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * 基于 Redis 的 Agent 短期记忆</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 模式：</span></span>
<span class="line"><span> * - invoke 前：从 Redis 读取该会话的 messages</span></span>
<span class="line"><span> * - invoke 后：把 agent 返回的 messages 写回 Redis（带 TTL）</span></span>
<span class="line"><span> * - 压缩：由 langchain summarizationMiddleware 在 agent 内部完成</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 前置：docker compose up -d redis</span></span>
<span class="line"><span> *</span></span>
<span class="line"><span> * 运行：node src/agent-with-redis-memory.mjs</span></span>
<span class="line"><span> * 输入 exit / quit / :q 退出；:clear 清空当前会话记忆</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>import&quot;dotenv/config&quot;;</span></span>
<span class="line"><span>import Redis from&quot;ioredis&quot;;</span></span>
<span class="line"><span>import * as readline from&quot;node:readline/promises&quot;;</span></span>
<span class="line"><span>import { stdin , stdout } from&quot;node:process&quot;;</span></span>
<span class="line"><span>import { ChatOpenAI } from&quot;@langchain/openai&quot;;</span></span>
<span class="line"><span>import {</span></span>
<span class="line"><span>  mapChatMessagesToStoredMessages,</span></span>
<span class="line"><span>  mapStoredMessagesToChatMessages,</span></span>
<span class="line"><span>} from&quot;@langchain/core/messages&quot;;</span></span>
<span class="line"><span>import { createAgent, HumanMessage, summarizationMiddleware } from&quot;langchain&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const REDIS_HOST = process.env.REDIS_HOST ?? &quot;localhost&quot;;</span></span>
<span class="line"><span>const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);</span></span>
<span class="line"><span>const REDIS_DB = Number(process.env.REDIS_DB ?? 0);</span></span>
<span class="line"><span>const MEMORY_TTL = Number(process.env.MEMORY_TTL_SECONDS ?? 1800);</span></span>
<span class="line"><span>const KEY_PREFIX = process.env.MEMORY_KEY_PREFIX ?? &quot;agent:short_memory&quot;;</span></span>
<span class="line"><span>const SESSION_ID = process.env.MEMORY_SESSION_ID ?? &quot;demo_user_001&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const summaryPrompt = \`你是对话摘要助手。请用中文总结以下对话，包含：</span></span>
<span class="line"><span>1. 讨论的主要话题</span></span>
<span class="line"><span>2. 用户提到的重要事实（姓名、偏好、日期等，务必保留原文信息）</span></span>
<span class="line"><span>3. 继续对话所需的关键上下文</span></span>
<span class="line"><span></span></span>
<span class="line"><span>保持简洁，不要编造，不要遗漏用户明确说过的信息。</span></span>
<span class="line"><span></span></span>
<span class="line"><span>待摘要的对话：</span></span>
<span class="line"><span>{messages}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>摘要：\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>class RedisMessageStore {</span></span>
<span class="line"><span>constructor({ redis, keyPrefix, ttlSeconds }) {</span></span>
<span class="line"><span>    this.redis = redis;</span></span>
<span class="line"><span>    this.keyPrefix = keyPrefix;</span></span>
<span class="line"><span>    this.ttlSeconds = ttlSeconds;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  messagesKey(sessionId) {</span></span>
<span class="line"><span>    return\`\${this.keyPrefix}:\${sessionId}:messages\`;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async loadMessages(sessionId) {</span></span>
<span class="line"><span>    const raw = awaitthis.redis.get(this.messagesKey(sessionId));</span></span>
<span class="line"><span>    if (!raw) return [];</span></span>
<span class="line"><span>    return mapStoredMessagesToChatMessages(JSON.parse(raw));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async saveMessages(sessionId, messages) {</span></span>
<span class="line"><span>    const payload = JSON.stringify(mapChatMessagesToStoredMessages(messages));</span></span>
<span class="line"><span>    awaitthis.redis.set(this.messagesKey(sessionId), payload, &quot;EX&quot;, this.ttlSeconds);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async clear(sessionId) {</span></span>
<span class="line"><span>    awaitthis.redis.del(this.messagesKey(sessionId));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>async ttl(sessionId) {</span></span>
<span class="line"><span>    returnthis.redis.ttl(this.messagesKey(sessionId));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>asyncfunction invokeWithMemory(agent, store, sessionId, userText) {</span></span>
<span class="line"><span>const history = await store.loadMessages(sessionId);</span></span>
<span class="line"><span>console.log(\`  ↳ 从 Redis 加载 \${history.length} 条历史\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const result = await agent.invoke(</span></span>
<span class="line"><span>    { messages: [...history, new HumanMessage(userText)] },</span></span>
<span class="line"><span>    { recursionLimit: 30 },</span></span>
<span class="line"><span>  );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await store.saveMessages(sessionId, result.messages);</span></span>
<span class="line"><span>const ttl = await store.ttl(sessionId);</span></span>
<span class="line"><span>console.log(\`  ↳ 写回 Redis \${result.messages.length} 条 (TTL \${ttl}s)\`);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>return result;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>redis.on(&quot;connect&quot;, () =&gt; console.log(&quot;✅ Redis 已连接&quot;));</span></span>
<span class="line"><span>redis.on(&quot;error&quot;, (err) =&gt; console.error(&quot;❌ Redis 错误:&quot;, err.message));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const store = new RedisMessageStore({</span></span>
<span class="line"><span>  redis,</span></span>
<span class="line"><span>keyPrefix: KEY_PREFIX,</span></span>
<span class="line"><span>ttlSeconds: MEMORY_TTL,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const model = new ChatOpenAI({</span></span>
<span class="line"><span>model: process.env.MODEL_NAME,</span></span>
<span class="line"><span>apiKey: process.env.OPENAI_API_KEY,</span></span>
<span class="line"><span>configuration: { baseURL: process.env.OPENAI_BASE_URL },</span></span>
<span class="line"><span>temperature: 0,</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const agent = createAgent({</span></span>
<span class="line"><span>  model,</span></span>
<span class="line"><span>tools: [],</span></span>
<span class="line"><span>systemPrompt:</span></span>
<span class="line"><span>    &quot;你是会话助手。记住用户提到的关键事实，中文简短回答。若消息中有对话摘要，请据此继续对话。&quot;,</span></span>
<span class="line"><span>middleware: [</span></span>
<span class="line"><span>    summarizationMiddleware({</span></span>
<span class="line"><span>      model,</span></span>
<span class="line"><span>      summaryPrompt,</span></span>
<span class="line"><span>      trigger: { messages: 8 },</span></span>
<span class="line"><span>      keep: { messages: 4 },</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>});</span></span>
<span class="line"><span></span></span>
<span class="line"><span>console.log(&quot;输入 exit / quit / :q 退出，:clear 清空记忆\\n&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>const rl = readline.createInterface({ input: stdin, output: stdout });</span></span>
<span class="line"><span>let prevCount = (await store.loadMessages(SESSION_ID)).length;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>try {</span></span>
<span class="line"><span>while (true) {</span></span>
<span class="line"><span>    const userText = (await rl.question(&quot;你: &quot;)).trim();</span></span>
<span class="line"><span>    if (!userText) continue;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if ([&quot;exit&quot;, &quot;quit&quot;, &quot;:q&quot;].includes(userText.toLowerCase())) break;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (userText === &quot;:clear&quot;) {</span></span>
<span class="line"><span>      await store.clear(SESSION_ID);</span></span>
<span class="line"><span>      prevCount = 0;</span></span>
<span class="line"><span>      console.log(&quot;已清空当前会话记忆\\n&quot;);</span></span>
<span class="line"><span>      continue;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const { messages } = await invokeWithMemory(agent, store, SESSION_ID, userText);</span></span>
<span class="line"><span>    console.log(&quot;\\n助手:&quot;, messages.at(-1)?.content);</span></span>
<span class="line"><span>    console.log(\`当前消息数: \${messages.length}\`);</span></span>
<span class="line"><span>    if (messages.length &lt; prevCount + 2) {</span></span>
<span class="line"><span>      console.log(&quot;  ⚡ 已触发压缩&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    prevCount = messages.length;</span></span>
<span class="line"><span>    console.log();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>} finally {</span></span>
<span class="line"><span>  rl.close();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>await redis.quit();</span></span></code></pre></div><p>用到的环境变量在 .env 里配置：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># Redis（默认与 docker-compose 一致）</span></span>
<span class="line"><span>REDIS_HOST=localhost</span></span>
<span class="line"><span>REDIS_PORT=6379</span></span>
<span class="line"><span>REDIS_DB=0</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 短期记忆：key 前缀、会话 ID、过期时间（秒）</span></span>
<span class="line"><span>MEMORY_KEY_PREFIX=agent:short_memory</span></span>
<span class="line"><span>MEMORY_SESSION_ID=demo_user_001</span></span>
<span class="line"><span>MEMORY_TTL_SECONDS=1800</span></span></code></pre></div><p>跑一下：</p><p><video src="`+t+'"></video></p><p>这样我们就基于 redis 实现了短期记忆的存储，具体的摘要 + 截断的压缩逻辑是用的 deepagents 的。</p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>Agent 基本都是用 Redis 做短期记忆的存储，用 PostgreSQL 做历史消息、长期记忆存储。</p><p>我们学了 Redis 的 7 种常用数据类型 string、hash、list、set、zset(有序集合）、bitmap（位图）、geo（地理位置)</p><p>过了一遍它们的读写命令，以及各自典型的业务场景。</p><p>然后基于 Redis + DeepAgents 实现了短期记忆。</p><p>DeepAgents 的压缩中间件做消息的摘要 + 截断，Redis 做短期记忆的存储。</p><p>一般会把每轮消息存入 PostgreSQL 做历史消息，还能用来基于向量做长期记忆的检索。</p><p>Redis 基本是 Agent 做短期记忆存储的最佳方案了。</p>',72)])])}const y=n(o,[["render",r]]);export{k as __pageData,y as default};
