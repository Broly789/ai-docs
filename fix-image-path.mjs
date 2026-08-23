import fs from "fs/promises";
import path from "path";

// 你的目标文档目录
const TARGET_DIR = "/Users/brolylee/2026vite-docs/docs/前端转AI Agent";
const isCheck = process.argv.includes("--check");
// 匹配 ![任意文字](assets/
const reg = /(!\[.*?\]\()assets\//g;

async function scanFolder(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanFolder(fullPath);
    } else if (entry.name.endsWith(".md")) {
      let text = await fs.readFile(fullPath, "utf8");
      const hit = text.match(reg);
      if (!hit) continue;

      if (isCheck) {
        console.log(`[预检] ${fullPath} 存在${hit.length}处需要添加./`);
      } else {
        // 核心替换：assets/ → ./assets/
        const newText = text.replace(reg, "$1./assets/");
        await fs.writeFile(fullPath, newText, "utf8");
        console.log(`[已处理] ${fullPath}`);
      }
    }
  }
}

scanFolder(TARGET_DIR).then(() => {
  console.log(isCheck ? "✅ 预检结束，未修改任何文件" : "✅ 全部md图片路径已补全 ./");
});
