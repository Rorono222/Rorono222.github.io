// 获取DOM元素
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const relatedTopics = document.querySelector('.tags');

// 存储文章数据
let articles = [];

// 加载数据
async function loadData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        articles = data.articles;
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 搜索功能（本地优先+百科兜底）
async function search(keyword) {
    if (!keyword.trim()) return;
    
    const results = articles.filter(article => {
        return article.keywords.some(k => k.includes(keyword)) ||
               article.title.includes(keyword) ||
               article.content.includes(keyword);
    });

    displayResults(results);
    displayRelatedTopics(results);

    // 如果本地没有结果，调用维基百科API兜底
    if (results.length === 0) {
        fetchWikipedia(keyword);
    }
}

// 显示搜索结果
function displayResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">没有找到相关结果</p>';
        return;
    }

    results.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-card';
        articleElement.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.content}</p>
            <div class="article-meta">
                <span class="category">${article.category}</span>
            </div>
        `;
        searchResults.appendChild(articleElement);
    });
}

// 显示相关主题
function displayRelatedTopics(results) {
    relatedTopics.innerHTML = '';
    
    const allKeywords = new Set();
    results.forEach(article => {
        article.keywords.forEach(keyword => allKeywords.add(keyword));
    });

    allKeywords.forEach(keyword => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = keyword;
        tag.onclick = () => search(keyword);
        relatedTopics.appendChild(tag);
    });
}

// 维基百科兜底搜索（优化：获取完整简介）
async function fetchWikipedia(keyword) {
    searchResults.innerHTML = '<p class="no-results">本地无结果，正在从维基百科获取...</p>';
    try {
        // 第一步：查找相关词条
        const searchApiUrl = `https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(keyword)}&format=json&origin=*`;
        const searchResponse = await fetch(searchApiUrl);
        const searchData = await searchResponse.json();
        if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
            const wiki = searchData.query.search[0];
            const pageTitle = wiki.title;
            const pageUrl = `https://zh.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;
            // 第二步：获取词条详细简介
            const extractApiUrl = `https://zh.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
            const extractResponse = await fetch(extractApiUrl);
            const extractData = await extractResponse.json();
            let extractText = '';
            if (extractData.query && extractData.query.pages) {
                const page = Object.values(extractData.query.pages)[0];
                extractText = page.extract || '';
            }
            searchResults.innerHTML = `
                <div class="wiki-card">
                    <h3>${pageTitle}</h3>
                    <p>${extractText ? extractText : wiki.snippet.replace(/<[^>]+>/g, '') + '...'} </p>
                    <a href="${pageUrl}" target="_blank" class="wiki-link">查看维基百科原文</a>
                </div>
            `;
        } else {
            searchResults.innerHTML = '<p class="no-results">本地和维基百科均无相关结果</p>';
        }
    } catch (error) {
        searchResults.innerHTML = '<p class="no-results">维基百科获取失败，请稍后重试</p>';
    }
}

// 事件监听
searchButton.addEventListener('click', () => search(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search(searchInput.value);
    }
});

// 页面加载完成后加载数据
document.addEventListener('DOMContentLoaded', loadData); 