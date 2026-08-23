import{_ as n,o as a,c as p,ag as e}from"./chunks/framework.lghGfHnE.js";const t="/ai-docs/assets/1.D637WLVf.mp4",l="/ai-docs/assets/2.BjTZyVyr.mp4",h=JSON.parse('{"title":"Nest 进阶：企业级 Node.js 后端最主流框架","description":"","frontmatter":{},"headers":[],"relativePath":"前端转AI Agent/34-Nest 进阶：企业级 Node.js 后端最主流框架/index.md","filePath":"前端转AI Agent/34-Nest 进阶：企业级 Node.js 后端最主流框架/index.md"}'),i={name:"前端转AI Agent/34-Nest 进阶：企业级 Node.js 后端最主流框架/index.md"};function r(c,s,o,d,u,m){return a(),p("div",null,[...s[0]||(s[0]=[e(`<h1 id="nest-进阶-企业级-node-js-后端最主流框架" tabindex="-1">Nest 进阶：企业级 Node.js 后端最主流框架 <a class="header-anchor" href="#nest-进阶-企业级-node-js-后端最主流框架" aria-label="Permalink to &quot;Nest 进阶：企业级 Node.js 后端最主流框架&quot;">​</a></h1><p>业务项目的 Agent 都是跑在后端的，所以除了学习 Agent 框架外，我们还要学后端框架。</p><p>Node.js 最主流的后端框架是 Nest。</p><p>有的同学可能会说，那 Express 呢？</p><p>Express 其实算不上一个真正的后端框架，它只是一个轻量的 HTTP 库、一个路由工具。</p><p>Express 没有模块化、没有统一架 构、没有依赖注入、没有强类型约束、没有拦截器、没有统一的异常处理。</p><p>它几乎什么都不提供，只给你最基础的 req 和 res。</p><p>小 Demo、小接口用 Express 很快，但一上企业级 Agent 项目，立刻暴露致命问题：</p><p>代码乱、结构散、多个模块混在一起，后期根本维护不住。</p><p>而 Nest 是真正为企业级服务设计的完备框架，它自带一整套成熟架构：</p><p>模块化、依赖注入、TypeScript 强类型、统一生命周期、拦截器、管道、守卫、全局异常处理。</p><p>这些能力，正是开发复杂 Agent 服务最需要、最刚需的。</p><p>Nest 能让整个服务结构清晰、可扩展、可维护、可上线。</p><p><img src="https://mmbiz.qpic.cn/mmbiz_jpg/NMByQQfVwfcicjKhNos03uWpQs8VEic2KYic00yAWn4cGictdQkvEEIYQPl0Yz2ia4icKiatj1Sz7wmg0KZoQT9hp5MCCwxktickiaOcxZqkaAVesAkw/640?wx_fmt=jpeg&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>Nest 并不是从零写的新框架。它底层默认封装的就是 Express，底层收发请求是靠 Express 支撑。</p><p>相当于 Nest 站在了 Express 的肩膀上，保留了它的生态，又补上了它缺失的架构、规范和工程化能力。</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfeelbIKLJ4qnRicZE2MRzUeUSu50rqQ2Dy2SVbm1EVxJfN19A3qNsgHj4ABZoLYvBCANTHtuQQpM47gLk90jsxgNOCEXwueibysk/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>接下来我们就来学一下 Nest 特有的架构能力：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest new nest-feature</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfehTNmGBuBVMZX0jjepcqu1eqYl2CAicaibbJaSzjvnUHAp6FMMcWIdkcTKJPzfEtnf5MIBhLK8HX1RiaE2HpbryicNLwN0nDF0xI8/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>在 Express 里，你需要手动 new 所有的对象</p><p>在 Nest 里不需要，它实现了 DI（依赖注入）</p><ul><li>统一管理所有类（Controller、Service、Module、工具类）的实例</li><li>自动创建对象、自动注入依赖，不用开发者手动 new</li></ul><p>我们在 @Module 的 providers 里配置的 provider：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfdsPfuQkdvb6mPLg66IMVf3QCWuTYlaEbT72sOqlBTVpyBIhGk3mD2KfyTFToYJG9KDvV3wMicMQpeuZVslGZoaGzDBUEJNvwoI/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>用 @Inejctable 声明的 class：</p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwffqPGpflhC1HIIiamUYzOlW8krVBiasDHFia5PkHI0vO2ICFubIw1W9FAIItEhwq9zHAhJs7MBFFqibV90iaXv6RQ6MKc4MncAmute8/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>都可以自动根据名字或者 class 注入：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdhLMGtzRt1Cz0fCEIPtPJwg587syY9vx2qhatPjbpSObjntXxvAM8ZibjS8ibmWuQlGAyxNP7zgpHWXPJpNmCWCFANO4mve9DRA/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/NMByQQfVwfd58SiarsHyiaxEbp8kw9zDqeqXSToFV5ctu1SpujvquQVTwbMGVzYKnDyBWyWXBZibm2t8bwa66pjMVUsggicmYLycIeQfQMF85DI/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>这就是 IoC（控制反转）或者叫 DI（依赖注入）</p><p>这个特性我们用过好多次了。</p><p>主要是来学一下 AOP（面向切面编程）</p><p>我们将系统比作一个纵向的、由多个业务模块（如用户模块、订单模块、支付模块）组成的结构。</p><p>而日志、权限、缓存、异常处理等功能，它们像一把“横向的刀”，切穿了所有的业务模块。</p><p>AOP 的本质就是：在代码运行的“特定位置”（切点），动态地插入这些横向逻辑。</p><p>如果没有 AOP，你可能需要在每一个 Controller 方法的开头都写一遍 checkUserAuth()。</p><p>这会导致：</p><ul><li>维护噩梦：一旦权限校验逻辑变动，你需要修改项目里所有涉及该逻辑的文件。</li><li>代码污染：业务逻辑被大量的辅助代码包围，核心业务意图变得模糊。</li></ul><p>Nest 的 AOP 可以在不修改原始代码的情况下，像“插件”一样为接口添加功能。</p><p>比如这样：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Controller(&#39;orders&#39;)</span></span>
<span class="line"><span>@UseGuards(RolesGuard) // 这一行即实现了 AOP，为该类所有接口挂载了权限切面</span></span>
<span class="line"><span>export class OrdersController {</span></span>
<span class="line"><span>  @Get()</span></span>
<span class="line"><span>  @UseInterceptors(LoggingInterceptor) // 为单个接口挂载日志切面</span></span>
<span class="line"><span>  findAll() {</span></span>
<span class="line"><span>    // 这里只关心业务逻辑，不需要知道谁在校验权限，谁在记录日志</span></span>
<span class="line"><span>    return this.ordersService.findAll();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>通过 @UseGuards 装饰器给这个类所有接口加上了权限校验逻辑</p><p>通过 @UseInterceptors 装饰器给这个接口加了日志打印</p><p>这就是 AOP 的好处：</p><ul><li>职责清晰：业务代码只做“业务”该做的事。</li><li>声明式编程：通过装饰器来描述需求（如 @Role(&#39;admin&#39;)），而不是通过命令式代码去实现需求。</li><li>集中化治理：所有的兜底异常处理（Exception Filters）和监控逻辑，可以在全局配置中一处修改，全站生效。</li></ul><p>Nest 有这 4 种 AOP 的机制：</p><ul><li>守卫（Guard）：请求进入控制器前执行，负责身份认证、权限校验，决定是否放行请求</li><li>管道（Pipe）：负责请求入参的校验、类型转换、数据清洗</li><li>拦截器（Interceptor）：环绕控制器方法执行，前置 / 后置处理，做日志、耗时统计、响应封装</li><li>异常过滤器（Exception Filter）：统一捕获程序异常，统一格式化返回错误信息</li></ul><p>我们来用一下：</p><p>生成一个带 CURD 接口的 user 模块：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>nest g res user</span></span></code></pre></div><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwfdibM00ic7Vx7AOcZ3OEktGNcnJFkPajqUiak54DGbDja6U7fIzLWIZN7S2oiaXyT9BaticiaejkiaZib4SUBa7g9ibTVo9uI1ab7sX5VbQ/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>代码可以从仓库复制，这里我们用一遍各种 AOP 组件：</p><p><video src="`+t+`"></video></p><p>我们定义了两个 Pipe：</p><ul><li>ParsePositiveIntPipe：参数字符串转为正整数；非法值抛 400 BadRequestException</li><li>ParseAgePipe：将 age 查询参数字符串转为数字；非法值抛 400</li></ul><p>定义了一个 Guard：</p><ul><li>AuthGuard：校验 Bearer Token，并将当前用户信息挂到 request.user，token 有效且有权限就放行，否则返回阻止访问返回无权限 403</li></ul><p>定义了一个 Interceptor：</p><ul><li>TransformInterceptor：打印请求、响应日志，转换响应格式</li></ul><p>定义了一个 ExceptionFilter：</p><ul><li>AllExceptionsFilter：捕获所有异常，统一错误格式的响应</li></ul><p>还有一个自定义装饰器：</p><ul><li>@CurrentUser()：从 request.user 读取当前登录用户</li></ul><p>通过这个综合小实战，你应该能体会到 AOP 的好处了。</p><p>把这些通用逻辑抽离出来，用到的时候启用，不用每个 controller 的 handler 里都写一遍。</p><p>这里我们还用到了几个取请求参数的装饰器：</p><ul><li>@Body()：获取 POST、PUT 等请求的请求体数据</li><li>@Param()：获取路由路径参数</li><li>@Query()：获取 URL 后面的查询参数</li><li>@Headers()：获取请求头信息</li></ul><p>这里我们还用到了 token，一般现在常用的方案是 JWT</p><p>就是在 Authorization 的 header 里通过 Bearer xxx 携带：</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/NMByQQfVwffmpdJ7j4aQJoZiaeom4ia43HXicxKQ6tsOPkJMxXXgEZuUiaicicDuQylWeBlypuls2XEcicHFEwGRfdsicKdgEQEpZIKKEMtDdVqPTlo/640?wx_fmt=png&amp;from=appmsg" alt="图片" referrerpolicy="no-referrer"></p><p>token 可以解码出用户信息</p><p>校验通过后放到 request 对象上</p><p>前面是模拟实现的，接下来我们换成真实的 jwt：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>pnpm install @nestjs/jwt</span></span></code></pre></div><p>创建 jwt-test 模块：</p><p>jwt-test.module.ts</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Module } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { JwtModule } from&#39;@nestjs/jwt&#39;;</span></span>
<span class="line"><span>import { JwtTestController } from&#39;./jwt-test.controller&#39;;</span></span>
<span class="line"><span>import { JwtTestService } from&#39;./jwt-test.service&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Module({</span></span>
<span class="line"><span>imports: [</span></span>
<span class="line"><span>    JwtModule.register({</span></span>
<span class="line"><span>      secret: &#39;jwt-test-secret-key&#39;,</span></span>
<span class="line"><span>      signOptions: { expiresIn: &#39;1h&#39; },</span></span>
<span class="line"><span>    }),</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>controllers: [JwtTestController],</span></span>
<span class="line"><span>providers: [JwtTestService],</span></span>
<span class="line"><span>})</span></span>
<span class="line"><span>exportclass JwtTestModule {}</span></span></code></pre></div><p>jwt-test.service.ts</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import { Injectable, UnauthorizedException } from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { JwtService } from&#39;@nestjs/jwt&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export interface JwtTestPayload {</span></span>
<span class="line"><span>sub: number;</span></span>
<span class="line"><span>  username: string;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Injectable()</span></span>
<span class="line"><span>exportclass JwtTestService {</span></span>
<span class="line"><span>constructor(private readonly jwtService: JwtService) {}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  sign(payload: JwtTestPayload): string {</span></span>
<span class="line"><span>    returnthis.jwtService.sign(payload);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  verify(token: string): JwtTestPayload {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      returnthis.jwtService.verify&lt;JwtTestPayload&gt;(token);</span></span>
<span class="line"><span>    } catch {</span></span>
<span class="line"><span>      thrownew UnauthorizedException(&#39;Token 无效或已过期&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>jwt-test.controller.ts</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import {</span></span>
<span class="line"><span>  Body,</span></span>
<span class="line"><span>  Controller,</span></span>
<span class="line"><span>  Get,</span></span>
<span class="line"><span>  Headers,</span></span>
<span class="line"><span>  Post,</span></span>
<span class="line"><span>  UnauthorizedException,</span></span>
<span class="line"><span>} from&#39;@nestjs/common&#39;;</span></span>
<span class="line"><span>import { JwtTestService } from&#39;./jwt-test.service&#39;;</span></span>
<span class="line"><span>import type { JwtTestPayload } from&#39;./jwt-test.service&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Controller(&#39;jwt-test&#39;)</span></span>
<span class="line"><span>exportclass JwtTestController {</span></span>
<span class="line"><span>constructor(private readonly jwtTestService: JwtTestService) {}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 签发 JWT */</span></span>
<span class="line"><span>  @Post(&#39;sign&#39;)</span></span>
<span class="line"><span>  sign(@Body() payload: JwtTestPayload) {</span></span>
<span class="line"><span>    const accessToken = this.jwtTestService.sign(payload);</span></span>
<span class="line"><span>    return { access_token: accessToken };</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/** 校验 JWT 并返回 payload */</span></span>
<span class="line"><span>  @Get(&#39;verify&#39;)</span></span>
<span class="line"><span>  verify(@Headers(&#39;authorization&#39;) authorization?: string) {</span></span>
<span class="line"><span>    const token = this.extractBearerToken(authorization);</span></span>
<span class="line"><span>    if (!token) {</span></span>
<span class="line"><span>      thrownew UnauthorizedException(&#39;请携带 Bearer Token&#39;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    returnthis.jwtTestService.verify(token);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private extractBearerToken(authorization?: string): string | null {</span></span>
<span class="line"><span>    if (!authorization) {</span></span>
<span class="line"><span>      returnnull;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    const [type, token] = authorization.split(&#39; &#39;);</span></span>
<span class="line"><span>    if (type !== &#39;Bearer&#39; || !token) {</span></span>
<span class="line"><span>      returnnull;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return token;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>和之前的 JWT 流程一样， 不过这次是用真正的 token</p><p>curl-test2.md</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span># 1. 签发 JWT → 200</span></span>
<span class="line"><span>curl -X POST http://localhost:3000/jwt-test/sign \\</span></span>
<span class="line"><span>  -H &quot;Content-Type: application/json&quot; \\</span></span>
<span class="line"><span>  -d &#39;{&quot;sub&quot;: 1, &quot;username&quot;: &quot;testuser&quot;}&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 2. 校验 JWT → 200（把 &lt;token&gt; 换成第 1 步返回的 access_token）</span></span>
<span class="line"><span>curl http://localhost:3000/jwt-test/verify \\</span></span>
<span class="line"><span>  -H &quot;Authorization: Bearer &lt;token&gt;&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 3. 未携带 Token → 401</span></span>
<span class="line"><span>curl http://localhost:3000/jwt-test/verify</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 4. Token 无效 → 401</span></span>
<span class="line"><span>curl http://localhost:3000/jwt-test/verify \\</span></span>
<span class="line"><span>  -H &quot;Authorization: Bearer invalid-token&quot;</span></span></code></pre></div><p>测一下：</p><p><video src="`+l+'"></video></p><blockquote><p>代码上传了课程仓库： <a href="https://github.com/QuarkGluonPlasma/ai-agent-course-code" target="_blank" rel="noreferrer">https://github.com/QuarkGluonPlasma/ai-agent-course-code</a></p></blockquote><h2 id="总结" tabindex="-1"><strong>总结</strong> <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;**总结**&quot;">​</a></h2><p>我们过了一遍 Nest 的核心特性 IoC/DI、AOP。</p><p>依赖注入用过很多了，就是声明的 provider 可以在 @Inject 的地方自动注入，不用手动 new</p><p>AOP 则是把通用逻辑抽离到 Pipe、Guard、Interceptor、ExceptionFilter 组件里，用到的时候动态加上。</p><p>我们还过了一下常用的 JWT 在 nest 里的实现。</p><p>如果你在 Express 里做这些还是挺麻烦的，没有模块化、没有这些组件的拆分。</p><p>而用 Nest 就可以很好的管理项目架构、规范代码的写法，这就是框架的意义。</p>',95)])])}const f=n(i,[["render",r]]);export{h as __pageData,f as default};
