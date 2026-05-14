// 数据管理
const DataManager = {
    STORAGE_KEY: 'ai_articles_data',
    FAVORITES_KEY: 'ai_articles_favorites',

    getAllArticles() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveArticles(articles) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
    },

    getFavorites() {
        const data = localStorage.getItem(this.FAVORITES_KEY);
        return data ? JSON.parse(data) : [];
    },

    addFavorite(article) {
        const favorites = this.getFavorites();
        if (!favorites.find(a => a.url === article.url)) {
            favorites.push(article);
            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
        }
    },

    removeFavorite(url) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(a => a.url !== url);
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    },

    isFavorite(url) {
        return this.getFavorites().some(a => a.url === url);
    }
};

// 热度计算
function calculateHeatScore(article) {
    const now = new Date();
    const publishDate = new Date(article.publishedAt || article.createdAt || now);
    const daysSince = (now - publishDate) / (1000 * 60 * 60 * 24);

    // 新鲜度评分 (7天内最高)
    let recencyScore = Math.max(0, 10 - daysSince * (10 / 7));

    // Stars 评分
    let starsScore = Math.log(Math.max(1, article.stars || article.stargazers_count || 0) + 1) * 3;

    // 浏览量/参与度评分
    let engagementScore = Math.log(Math.max(1, article.views || article.watchers_count || article.forks || 0) + 1) * 2;

    const totalScore = recencyScore + starsScore + engagementScore;

    return totalScore;
}

function getHeatBadge(score) {
    if (score > 30) return { text: '🔥 热门', class: 'heat-hot' };
    if (score > 15) return { text: '🌡️ 温暖', class: 'heat-warm' };
    if (score > 5) return { text: '📌 常规', class: 'heat-normal' };
    return { text: '❄️ 冷门', class: 'heat-cold' };
}

// 分类识别
function categorizeArticle(title, description, content) {
    const text = (title + ' ' + (description || '') + ' ' + (content || '')).toLowerCase();

    const categories = {
        'Agent 框架': ['agent', 'langchain', 'autogpt', 'camel', 'metagpt', 'crewai', 'framework'],
        '大语言模���': ['llm', 'gpt', 'claude', 'llama', 'model', 'mistral', 'qwen', 'language model'],
        '提示工程': ['prompt', 'prompt engineering', 'priming', 'shot', 'few-shot', 'zero-shot'],
        '检索增强生成': ['rag', 'retrieval', 'augmented', 'generation', 'llamaindex', 'vector', 'embedding'],
        '工具使用': ['tool', 'function calling', 'api', 'tools', 'plugin', 'integration']
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return category;
        }
    }

    return '其他';
}

// 文章收集器
const ArticleCollector = {
    searchTerms: [
        'agent',
        'langchain',
        'llm',
        'prompt engineering',
        'rag retrieval',
        'autogpt',
        'gpt-4',
        'function calling',
        'multi-agent',
        'ai tools'
    ],

    async collectArticles(onProgress) {
        const allArticles = [];
        const seenUrls = new Set();

        for (let i = 0; i < this.searchTerms.length; i++) {
            const term = this.searchTerms[i];
            onProgress((i + 1) / this.searchTerms.length);

            try {
                // 模拟 GitHub API 搜索
                const articles = this.generateMockArticles(term);
                for (const article of articles) {
                    if (!seenUrls.has(article.url)) {
                        seenUrls.add(article.url);
                        article.heatScore = calculateHeatScore(article);
                        article.category = categorizeArticle(article.title, article.description);
                        allArticles.push(article);
                    }
                }
            } catch (error) {
                console.error(`Error collecting for term: ${term}`, error);
            }
        }

        return allArticles;
    },

    generateMockArticles(searchTerm) {
        // 模拟文章数据（实际使用中应该调用真实的 GitHub API）
        const mockArticles = {
            'agent': [
                {
                    url: 'https://github.com/langchain-ai/langchain',
                    title: 'LangChain - Building applications with LLMs through composability',
                    description: 'A framework for developing applications powered by language models. Build agents, RAG systems, and more.',
                    stars: 65000,
                    forks: 10000,
                    watchers_count: 1500,
                    createdAt: '2023-10-01',
                    updatedAt: new Date().toISOString()
                },
                {
                    url: 'https://github.com/yoheinakajima/instagraph',
                    title: 'InstagGraph - Convert text into knowledge graphs using LLMs',
                    description: 'A tool for converting text documents into knowledge graphs using large language models.',
                    stars: 5000,
                    forks: 800,
                    watchers_count: 300,
                    createdAt: '2023-09-15',
                    updatedAt: new Date().toISOString()
                }
            ],
            'langchain': [
                {
                    url: 'https://github.com/langchain-ai/langchainjs',
                    title: 'LangChain.js - JavaScript/TypeScript implementation',
                    description: 'JavaScript and TypeScript bindings for LangChain, enabling agent development in Node.js.',
                    stars: 10000,
                    forks: 1500,
                    watchers_count: 400,
                    createdAt: '2023-11-01',
                    updatedAt: new Date().toISOString()
                }
            ],
            'llm': [
                {
                    url: 'https://github.com/meta-llama/llama',
                    title: 'Llama - Open foundation language models',
                    description: 'LLaMA is a foundational large language model developed by Meta for research purposes.',
                    stars: 40000,
                    forks: 6000,
                    watchers_count: 1200,
                    createdAt: '2023-02-27',
                    updatedAt: new Date().toISOString()
                }
            ],
            'prompt engineering': [
                {
                    url: 'https://github.com/f/awesome-chatgpt-prompt',
                    title: 'Awesome ChatGPT Prompts - Curated prompts for ChatGPT',
                    description: 'A collection of prompt examples to be used with the OpenAI API.',
                    stars: 100000,
                    forks: 15000,
                    watchers_count: 3000,
                    createdAt: '2023-01-01',
                    updatedAt: new Date().toISOString()
                }
            ],
            'rag retrieval': [
                {
                    url: 'https://github.com/run-llama/llama_index',
                    title: 'LlamaIndex - Data framework for LLM applications',
                    description: 'LlamaIndex is a data framework for building RAG applications over your data.',
                    stars: 25000,
                    forks: 3500,
                    watchers_count: 800,
                    createdAt: '2022-12-10',
                    updatedAt: new Date().toISOString()
                }
            ],
            'autogpt': [
                {
                    url: 'https://github.com/Significant-Gravitas/AutoGPT',
                    title: 'AutoGPT - An autonomous AI agent',
                    description: 'An experimental open-source application showcasing GPT-4 capabilities.',
                    stars: 160000,
                    forks: 35000,
                    watchers_count: 5000,
                    createdAt: '2023-03-30',
                    updatedAt: new Date().toISOString()
                }
            ],
            'gpt-4': [
                {
                    url: 'https://github.com/openai/gpt-4-samples',
                    title: 'GPT-4 Sample Code and Usage',
                    description: 'Sample code and usage examples for GPT-4 API.',
                    stars: 12000,
                    forks: 2000,
                    watchers_count: 600,
                    createdAt: '2023-03-15',
                    updatedAt: new Date().toISOString()
                }
            ],
            'function calling': [
                {
                    url: 'https://github.com/openai/openai-cookbook',
                    title: 'OpenAI Cookbook - Examples and guides',
                    description: 'Examples and guides for using the OpenAI API, including function calling.',
                    stars: 45000,
                    forks: 8000,
                    watchers_count: 2000,
                    createdAt: '2022-06-01',
                    updatedAt: new Date().toISOString()
                }
            ],
            'multi-agent': [
                {
                    url: 'https://github.com/verifiednpc/multi-agent-collaboration',
                    title: 'Multi-Agent Collaboration Framework',
                    description: 'A framework for managing collaboration between multiple AI agents.',
                    stars: 8000,
                    forks: 1200,
                    watchers_count: 400,
                    createdAt: '2023-08-20',
                    updatedAt: new Date().toISOString()
                }
            ],
            'ai tools': [
                {
                    url: 'https://github.com/huggingface/huggingface_hub',
                    title: 'Hugging Face Hub - Community and models',
                    description: 'The official Python library for Hugging Face Hub interaction.',
                    stars: 8000,
                    forks: 1500,
                    watchers_count: 500,
                    createdAt: '2022-07-01',
                    updatedAt: new Date().toISOString()
                }
            ]
        };

        return mockArticles[searchTerm] || [];
    }
};

// UI 管理
const UI = {
    init() {
        document.getElementById('collectBtn').addEventListener('click', () => this.collectArticles());
        document.getElementById('favoritesBtn').addEventListener('click', () => this.showFavorites());
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterArticles());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterArticles());
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeSortMethod(e.target));
        });
        document.getElementById('closeModal').addEventListener('click', () => this.closeFavorites());
        document.getElementById('favoritesModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('favoritesModal')) {
                this.closeFavorites();
            }
        });

        this.updateStats();
        this.renderArticles();
    },

    async collectArticles() {
        const btn = document.getElementById('collectBtn');
        btn.disabled = true;
        const originalText = btn.innerHTML;

        try {
            const container = document.getElementById('articlesContainer');
            container.innerHTML = '<div class="loading"><div class="spinner"></div><p>正在收集文章...</p></div>';

            const articles = await ArticleCollector.collectArticles((progress) => {
                const percent = Math.round(progress * 100);
                container.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>正在收集文章... ${percent}%</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
            });

            DataManager.saveArticles(articles);
            this.currentSort = 'heat';
            this.renderArticles();
            this.updateStats();
        } catch (error) {
            console.error('Error collecting articles:', error);
            alert('收集文章时出错，请重试');
        } finally {
            btn.disabled = false;
        }
    },

    renderArticles() {
        const articles = this.getFilteredAndSortedArticles();
        const container = document.getElementById('articlesContainer');

        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p>没有找到符合条件的文章</p>
                    <p style="font-size: 0.9em; color: #999;">尝试修改搜索条件</p>
                </div>
            `;
            return;
        }

        container.innerHTML = articles.map(article => {
            const heat = getHeatBadge(article.heatScore);
            const isFavorited = DataManager.isFavorite(article.url);

            return `
                <div class="article-card">
                    <div class="article-header">
                        <h3 class="article-title" onclick="window.open('${article.url}')">${article.title}</h3>
                        <span class="heat-badge ${heat.class}">${heat.text}</span>
                    </div>
                    <div class="article-category">${article.category}</div>
                    <div class="article-meta">
                        <div class="meta-item">⭐ ${article.stars || 0} Stars</div>
                        <div class="meta-item">👁️ ${article.watchers_count || 0} Watchers</div>
                        <div class="meta-item">🔥 ${article.heatScore.toFixed(1)} 热度</div>
                        <div class="meta-item">📅 ${new Date(article.updatedAt).toLocaleDateString('zh-CN')}</div>
                    </div>
                    <p class="article-description">${article.description}</p>
                    <div class="article-footer">
                        <a href="${article.url}" target="_blank" class="article-link">
                            查看仓库 →
                        </a>
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-url="${article.url}">
                            ${isFavorited ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // 添加收藏按钮事件监听
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const url = btn.dataset.url;
                const article = articles.find(a => a.url === url);

                if (DataManager.isFavorite(url)) {
                    DataManager.removeFavorite(url);
                    btn.textContent = '🤍';
                    btn.classList.remove('favorited');
                } else {
                    DataManager.addFavorite(article);
                    btn.textContent = '❤️';
                    btn.classList.add('favorited');
                }
                this.updateStats();
            });
        });
    },

    filterArticles() {
        this.renderArticles();
    },

    getFilteredAndSortedArticles() {
        let articles = DataManager.getAllArticles();

        // 应用搜索过滤
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(searchTerm) ||
                (a.description && a.description.toLowerCase().includes(searchTerm))
            );
        }

        // 应用分类过滤
        const category = document.getElementById('categoryFilter').value;
        if (category) {
            articles = articles.filter(a => a.category === category);
        }

        // 应用排序
        const sortMethod = this.currentSort || 'heat';
        articles.sort((a, b) => {
            switch (sortMethod) {
                case 'heat':
                    return (b.heatScore || 0) - (a.heatScore || 0);
                case 'date':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'stars':
                    return (b.stars || 0) - (a.stars || 0);
                case 'engagement':
                    return (b.watchers_count || 0) - (a.watchers_count || 0);
                default:
                    return 0;
            }
        });

        return articles;
    },

    changeSortMethod(btn) {
        document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSort = btn.dataset.sort;
        this.renderArticles();
    },

    showFavorites() {
        const modal = document.getElementById('favoritesModal');
        const favoritesList = document.getElementById('favoritesList');
        const favorites = DataManager.getFavorites();

        if (favorites.length === 0) {
            favoritesList.innerHTML = `
                <div class="no-favorites">
                    <div style="font-size: 2em; margin-bottom: 10px;">📭</div>
                    <p>还没有收藏任何文章</p>
                </div>
            `;
        } else {
            favoritesList.innerHTML = favorites.map(article => `
                <div class="article-card" style="margin-bottom: 0;">
                    <div class="article-header">
                        <h4 class="article-title" style="font-size: 1.1em;" onclick="window.open('${article.url}')">${article.title}</h4>
                        <button class="favorite-btn favorited" data-url="${article.url}">
                            ❤️
                        </button>
                    </div>
                    <div class="article-category">${article.category}</div>
                    <a href="${article.url}" target="_blank" class="article-link">
                        查看仓库 →
                    </a>
                </div>
            `).join('');

            // 添加收藏按钮事件
            favoritesList.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = btn.dataset.url;
                    DataManager.removeFavorite(url);
                    this.showFavorites();
                    this.renderArticles();
                    this.updateStats();
                });
            });
        }

        modal.style.display = 'block';
    },

    closeFavorites() {
        document.getElementById('favoritesModal').style.display = 'none';
    },

    updateStats() {
        const articles = DataManager.getAllArticles();
        const favorites = DataManager.getFavorites();
        const hotCount = articles.filter(a => getHeatBadge(a.heatScore).class === 'heat-hot').length;
        const avgHeat = articles.length > 0 ? (articles.reduce((sum, a) => sum + a.heatScore, 0) / articles.length).toFixed(1) : 0;

        document.getElementById('totalArticles').textContent = articles.length;
        document.getElementById('favoriteCount').textContent = favorites.length;
        document.getElementById('hotCount').textContent = hotCount;
        document.getElementById('avgHeat').textContent = avgHeat;
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});