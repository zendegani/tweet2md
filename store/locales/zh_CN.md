tweet2md 是一个开源 Chrome 扩展，可将 x.com 内容转换为适用于研究、笔记记录、AI 工作流和离线归档的高质量 Markdown。

最新更新

查看最新版本与更新：
https://github.com/zendegani/tweet2md/blob/main/CHANGELOG.md

主要功能：

- 三种触发方式：工具栏弹窗、推文内联按钮、右键菜单
- 复制 Markdown、下载文件或发送到 Obsidian
- 一键添加到 Obsidian
- 可选的 Obsidian vault 子文件夹：笔记保存到指定文件夹（如 Tweets 或 Inbox/Tweets），留空则使用 vault 根目录
- 面向 Obsidian 的 frontmatter
- 捕获推文链接卡片
- 完整支持长篇 X Articles
- 提取推文、线程和引用推文
- 仅导出单条推文（不含线程）——通过右键菜单或 Shift/Alt 点击内嵌按钮
- 保留引用内容结构与上下文
- 多视图弹窗界面
- 可显示或隐藏内联按钮
- 内联按钮可改为复制模式
- 导出后自动关闭标签页
- 本地下载图片与媒体
- 可选的下载子文件夹：Markdown 文件与图片保存到所选子文件夹中，不再直接堆放在下载根目录
- 可自定义的文件名模板：使用 {date}、{datetime}、{handle}、{author}、{id}、{slug}、{type} 等占位符构建导出文件名，设置中提供实时预览 —— 留空则保持默认
- 丰富的 YAML frontmatter 元数据
- 可选 X 风格互动统计行
- 自动展开被截断内容
- 多语言界面
- 支持深色与浅色模式

适用于：

- 导入内容到 Obsidian、Notion、Logseq 或 Hugo
- 导出文本用于 LLM 与 RAG 工作流
- 离线归档研究线程与文章
- 构建可搜索的 Second Brain
- 为写作、翻译与总结准备素材

为什么使用它：

- 一键工作流
- 强大的 Obsidian 集成
- 干净、结构化的 Markdown 输出
- 本地图片归档避免链接失效
- 无需 API
- 所有处理均在本地完成

当前限制：

- 专注于 x.com 内容提取
- 视频与 GIF 不会作为可播放媒体导出
- 安装或更新扩展后可能需要刷新页面
- 如果 x.com 大幅修改页面结构，部分功能可能失效

这是一个开源项目。
tweet2md 是独立工具，与 X 或 x.com 无关联。
