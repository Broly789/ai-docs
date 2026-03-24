---
prev: false
next: /前端转AI Agent/01-AI Agent 开发要学什么？/
---

<script setup>
 import { onMounted } from "vue";
 console.log("index.md", process.env.NODE_ENV);
const target = `${process.env.NODE_ENV === 'production'? '/ai-docs/': ''}/前端转AI Agent/00-使用前必看/`;
onMounted(() => {
  // 最稳：原生跳转，VitePress base 自动拼接
  window.location.href = target
});
</script>

正在跳转...
