document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    const newsArticleContent = document.getElementById('news-article-content');
    const searchBar = document.getElementById('search-bar');
    let allNewsData = [];

    const fetchNews = async () => {
        try {
            // Add a cache-busting query parameter to get the latest data
            const response = await fetch(`data/newsData.json?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allNewsData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            return allNewsData;
        } catch (error) {
            console.error("Could not fetch news data:", error);
            const errorMessage = `<p class="error-message">Failed to load news. Please ensure you are running this on a server (like VS Code's 'Live Server') and the 'data/newsData.json' file exists.</p>`;
            if (newsGrid) newsGrid.innerHTML = errorMessage;
            if (newsArticleContent) newsArticleContent.innerHTML = errorMessage;
            return [];
        }
    };

    const renderNewsCards = (newsData) => {
        if (!newsGrid) return;
        newsGrid.innerHTML = '';
        
        if (newsData.length === 0) {
            newsGrid.innerHTML = `<p class="info-message">No news found matching your search.</p>`;
            return;
        }

        newsData.forEach((news, index) => {
            const newsCard = document.createElement('article');
            newsCard.className = 'card';
            newsCard.innerHTML = `
                <img src="${news.thumbnail}" alt="${news.title}" class="card-thumbnail" loading="lazy">
                <div class="card-content">
                    <div class="card-tags">
                        ${news.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <h2 class="card-title">${news.title}</h2>
                    <p class="card-summary">${news.summary}</p>
                    <a href="news.html?id=${news.id}" class="read-more-btn">Read More</a>
                </div>
            `;
            newsGrid.appendChild(newsCard);

            // Inject in-feed ads (728x90 Banner)
            if (index === 1 || index === 5) {
                const adContainer = document.createElement('div');
                adContainer.className = 'ad-placeholder ad-in-feed';
                adContainer.innerHTML = `
                    <script type="text/javascript">
                        atOptions = {
                            'key' : 'a4865b7ef060ebcfa9a02db3af6569bc',
                            'format' : 'iframe',
                            'height' : 90,
                            'width' : 728,
                            'params' : {}
                        };
                    <\/script>
                    <script type="text/javascript" src="//www.highperformanceformat.com/a4865b7ef060ebcfa9a02db3af6569bc/invoke.js"><\/script>
                `;
                newsGrid.appendChild(adContainer);
            }
        });
    };
    
    const renderSingleArticle = async () => {
        if (!newsArticleContent) return;
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');
        if (!newsId) {
            newsArticleContent.innerHTML = `<p class="error-message">Article ID not found.</p>`;
            return;
        }

        const newsData = await fetchNews();
        const article = newsData.find(item => item.id == newsId);

        if (article) {
            document.title = `${article.title} | News 580`;
            document.querySelector('meta[name="description"]').setAttribute("content", article.summary);
            const contentWithAds = injectAdsIntoContent(article.content);
            newsArticleContent.innerHTML = `
                <header class="article-header">
                    <h1 class="article-title">${article.title}</h1>
                    <p class="article-meta">Published on ${new Date(article.date).toLocaleDateString()} | Tags: ${article.tags.join(', ')}</p>
                </header>
                <img src="${article.thumbnail}" alt="${article.title}" class="article-thumbnail" loading="lazy">
                <div class="article-body">${contentWithAds}</div>
            `;
        } else {
            newsArticleContent.innerHTML = `<p class="error-message">Article not found.</p>`;
        }
    };

    const injectAdsIntoContent = (content) => {
        // In-article ads (468x60 Banner)
        const ad1 = `<div class="ad-placeholder ad-in-article"><script type="text/javascript"> atOptions = {'key' : '64ec21bcf50c2c2878c9f37a11f41697', 'format' : 'iframe', 'height' : 60, 'width' : 468, 'params' : {} }; <\/script><script type="text/javascript" src="//www.highperformanceformat.com/64ec21bcf50c2c2878c9f37a11f41697/invoke.js"><\/script></div>`;
        const ad2 = `<div class="ad-placeholder ad-in-article"><script type="text/javascript"> atOptions = {'key' : '64ec21bcf50c2c2878c9f37a11f41697', 'format' : 'iframe', 'height' : 60, 'width' : 468, 'params' : {} }; <\/script><script type="text/javascript" src="//www.highperformanceformat.com/64ec21bcf50c2c2878c9f37a11f41697/invoke.js"><\/script></div>`;
        
        const paragraphs = content.split('</p>');
        if (paragraphs.length > 2) {
            paragraphs.splice(2, 0, ad1);
        }
        if (paragraphs.length > 5) {
            paragraphs.splice(5, 0, ad2);
        }
        return paragraphs.join('</p>');
    };

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredNews = allNewsData.filter(news => 
            news.title.toLowerCase().includes(searchTerm) || 
            news.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        renderNewsCards(filteredNews);
    };

    // Initialize page
    if (newsGrid) {
        fetchNews().then(renderNewsCards);
        if (searchBar) searchBar.addEventListener('input', handleSearch);
    }
    if (newsArticleContent) {
        renderSingleArticle();
    }
});
