import os, json

translations = {
    "en": {
        "title": "tweet2md: Copy or Download X (Twitter) Articles, Threads & Tweets as Markdown",
        "summary": "One-click export of X (Twitter) threads, tweets, and articles to clean Markdown with images and metadata. Perfect for Obsidian, Notion, and AI/RAG workflows. Works locally—no API, no tracking."
    },
    "de": {
        "title": "tweet2md: Kopieren oder Herunterladen von X (Twitter) Artikeln, Threads & Tweets als Markdown",
        "summary": "Mit einem Klick exportieren Sie X (Twitter) Threads, Tweets und Artikel in sauberes Markdown mit Bildern und Metadaten. Perfekt für Obsidian, Notion und AI/RAG Workflows. Funktioniert lokal – keine API, kein Tracking."
    },
    "fr": {
        "title": "tweet2md : Copier ou Télécharger des Articles, Threads & Tweets X (Twitter) en Markdown",
        "summary": "Exportez en un clic des threads, tweets et articles X (Twitter) en Markdown propre avec images et métadonnées. Parfait pour Obsidian, Notion et les workflows IA/RAG. Fonctionne localement — aucune API, aucun pistage."
    },
    "es": {
        "title": "tweet2md: Copiar o Descargar Artículos, Hilos y Tweets de X (Twitter) como Markdown",
        "summary": "Exporta con un clic hilos, tweets y artículos de X (Twitter) a Markdown limpio con imágenes y metadatos. Perfecto para Obsidian, Notion y flujos de trabajo de IA/RAG. Funciona localmente: sin API, sin rastreo."
    },
    "pt_BR": {
        "title": "tweet2md: Copiar ou Baixar Artigos, Threads e Tweets do X (Twitter) em Markdown",
        "summary": "Exportação em um clique de threads, tweets e artigos do X (Twitter) para Markdown limpo com imagens e metadados. Perfeito para Obsidian, Notion e fluxos de trabalho de IA/RAG. Funciona localmente — sem API, sem rastreamento."
    },
    "ja": {
        "title": "tweet2md: X (Twitter) の記事、スレッド、ツイートをMarkdownとしてコピーまたはダウンロード",
        "summary": "X (Twitter) のスレッド、ツイート、記事を画像やメタデータ付きのクリーンなMarkdownにワンクリックでエクスポート。Obsidian、Notion、AI/RAGワークフローに最適です。ローカルで動作します — API不要、トラッキングなし。"
    },
    "zh_CN": {
        "title": "tweet2md：一键复制或下载 X (Twitter) 文章、推文和长推为 Markdown",
        "summary": "一键将 X (Twitter) 推文、长推和文章导出为干净的带有图片和元数据的 Markdown。完美适用于 Obsidian、Notion 和 AI/RAG 工作流。纯本地运行——无需 API，无跟踪。"
    },
    "ar": {
        "title": "tweet2md: نسخ أو تنزيل مقالات وسلاسل وتغريدات منصة إكس (تويتر) بتنسيق Markdown",
        "summary": "تصدير بنقرة واحدة لسلاسل وتغريدات ومقالات منصة إكس (تويتر) إلى تنسيق Markdown نظيف مع الصور والبيانات الوصفية. مثالي لـ Obsidian و Notion وسير عمل الذكاء الاصطناعي/RAG. يعمل محليًا — بدون واجهة برمجة تطبيقات (API)، بدون تتبع."
    },
    "fa": {
        "title": "tweet2md: کپی یا دانلود مقالات، رشته‌ها و توییت‌های ایکس (توییتر) با فرمت Markdown",
        "summary": "خروجی گرفتن با یک کلیک از رشته‌ها، توییت‌ها و مقالات ایکس (توییتر) به صورت Markdown تمیز همراه با تصاویر و فراداده. مناسب برای Obsidian, Notion و گردش کارهای هوش مصنوعی/RAG. به صورت محلی کار می‌کند - بدون نیاز به API، بدون ردیابی."
    }
}

for loc, strings in translations.items():
    path = os.path.join("src", "_locales", loc, "messages.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["extensionName"] = {"message": strings["title"]}
        data["extensionDescription"] = {"message": strings["summary"]}
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"Updated {loc}")
