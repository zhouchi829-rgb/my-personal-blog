// 全局变量
let currentUser = null;
let currentPage = 1;
let articlesPerPage = 10;

// API基础URL - 自动检测环境
const API_BASE_URL = (() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000/api';
    }
    return '/api';
})();

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        updateNavigation();
    }
    
    // 绑定表单提交事件
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('writeForm').addEventListener('submit', handleWriteArticle);
    document.getElementById('editForm').addEventListener('submit', handleEditArticle);
    
    // 初始化图片上传功能
    initializeImageUpload();
    
    // 初始化夜间模式
    initializeTheme();
    
    // 初始化回到顶部按钮
    initializeBackToTop();
    
    // 加载首页数据
    loadHomePage();
}

// 更新导航栏状态
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const writeLink = document.getElementById('writeLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        writeLink.style.display = 'block';
        profileLink.style.display = 'block';
        logoutLink.style.display = 'block';
        userInfo.style.display = 'block';
        userInfo.textContent = `欢迎，${currentUser.username}`;
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        writeLink.style.display = 'none';
        profileLink.style.display = 'none';
        logoutLink.style.display = 'none';
        userInfo.style.display = 'none';
    }
}

// 显示/隐藏加载指示器
function showLoading(show = true) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

// 显示消息提示
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type} show`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// 页面切换函数
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showHome() {
    showPage('homePage');
    loadHomePage();
}

function showCategories() {
    showPage('categoriesPage');
    loadCategoriesPage();
}

function showLogin() {
    showPage('loginPage');
}

function showRegister() {
    showPage('registerPage');
}

function showWriteArticle() {
    if (!currentUser) {
        showMessage('请先登录', 'error');
        showLogin();
        return;
    }
    showPage('writePage');
    loadCategoriesForWritePage();
}

function showProfile() {
    if (!currentUser) {
        showMessage('请先登录', 'error');
        showLogin();
        return;
    }
    showPage('profilePage');
    loadProfile();
}

// ========== 夜间模式 ==========
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ========== 回到顶部 ==========
function initializeBackToTop() {
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('backToTop');
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 首页 ==========
async function loadHomePage() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles?page=${currentPage}&limit=${articlesPerPage}`);
        const data = await response.json();
        
        if (response.ok) {
            displayArticles(data.articles);
            displayPagination(data.pagination);
            loadCategories();
            loadHotArticles();
        } else {
            showMessage('加载文章失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// 显示文章列表
function displayArticles(articles) {
    const articlesList = document.getElementById('articlesList');
    
    if (articles.length === 0) {
        articlesList.innerHTML = '<p class="no-articles">暂无文章</p>';
        return;
    }
    
    articlesList.innerHTML = articles.map(article => `
        <div class="article-card">
            ${article.cover_image ? `<img src="${article.cover_image}" class="article-card-cover" alt="${article.title}" onerror="this.style.display='none'">` : ''}
            <div class="article-card-header">
                <h3 class="article-title" onclick="showArticleDetail(${article.id})">${article.title}</h3>
                ${currentUser && article.author_name === currentUser.username ? `
                    <div class="article-actions">
                        <button class="edit-btn" onclick="handleEditArticleClick(event, ${article.id})">编辑</button>
                        <button class="delete-btn" onclick="handleDeleteArticle(event, ${article.id})">删除</button>
                    </div>
                ` : ''}
            </div>
            <div class="article-meta">
                <span>👤 ${article.author_name}</span>
                <span>📂 ${article.category}</span>
                <span>📅 ${formatDate(article.created_at)}</span>
                ${article.tags ? `<span>🏷️ ${article.tags}</span>` : ''}
            </div>
            <p class="article-excerpt" onclick="showArticleDetail(${article.id})">${getExcerpt(article.content, 150)}</p>
            <div class="article-stats">
                <span>👁️ ${article.views}</span>
                <span>💬 ${article.comment_count || 0}</span>
                <span>❤️ ${article.likes || 0}</span>
            </div>
        </div>
    `).join('');
}

// 显示分页控件
function displayPagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    const { page, totalPages } = pagination;
    
    let paginationHTML = '';
    
    if (page > 1) {
        paginationHTML += `<button onclick="changePage(${page - 1})">上一页</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === page) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    if (page < totalPages) {
        paginationHTML += `<button onclick="changePage(${page + 1})">下一页</button>`;
    }
    
    paginationEl.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    loadHomePage();
}

// ========== 热门文章 ==========
async function loadHotArticles() {
    try {
        const response = await fetch(`${API_BASE_URL}/articles?page=1&limit=10`);
        const data = await response.json();
        
        if (response.ok) {
            const sorted = data.articles.sort((a, b) => b.views - a.views).slice(0, 5);
            displayHotArticles(sorted);
        }
    } catch (error) {
        console.error('加载热门文章失败:', error);
    }
}

function displayHotArticles(articles) {
    const list = document.getElementById('hotArticlesList');
    if (!articles.length) {
        list.innerHTML = '<p style="color: var(--gray-color);">暂无文章</p>';
        return;
    }
    
    list.innerHTML = articles.map((article, index) => `
        <div class="hot-article-item" onclick="showArticleDetail(${article.id})">
            <span class="hot-article-rank ${index < 3 ? 'top' + (index + 1) : ''}">${index + 1}</span>
            <span class="hot-article-title">${article.title}</span>
            <span class="hot-article-views">👁️ ${article.views}</span>
        </div>
    `).join('');
}

// ========== 分类 ==========
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        
        if (response.ok) {
            displayCategories(categories);
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

async function loadCategoriesForWritePage() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        
        if (response.ok) {
            populateCategorySelect(categories, 'articleCategory');
            populateCategorySelect(categories, 'editCategory');
        }
    } catch (error) {
        console.error('加载分类失败:', error);
    }
}

function populateCategorySelect(categories, selectId) {
    const categorySelect = document.getElementById(selectId);
    if (!categorySelect) return;
    
    const currentValue = categorySelect.value;
    
    while (categorySelect.options.length > 2) {
        categorySelect.remove(2);
    }
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category;
        option.textContent = `${category.category} (${category.count})`;
        categorySelect.appendChild(option);
    });
    
    if (currentValue && Array.from(categorySelect.options).some(opt => opt.value === currentValue)) {
        categorySelect.value = currentValue;
    }
}

function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    
    categoriesList.innerHTML = categories.map(category => `
        <div class="category-item" onclick="showArticlesByCategory('${category.category}')">
            <span class="category-name">${category.category}</span>
            <span class="category-count">${category.count}</span>
        </div>
    `).join('');
}

// ========== 文章详情 ==========
async function showArticleDetail(articleId) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
        const article = await response.json();
        
        if (response.ok) {
            displayArticleDetail(article);
            showPage('articlePage');
        } else {
            showMessage('加载文章失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

function displayArticleDetail(article) {
    const articleContent = document.getElementById('articleContent');
    
    const htmlContent = convertMarkdownToHTML(article.content);
    
    articleContent.innerHTML = `
        <h1 class="article-detail-title">${article.title}</h1>
        <div class="article-detail-meta">
            <span>👤 ${article.author_name}</span>
            <span>📂 ${article.category}</span>
            <span>📅 ${formatDate(article.created_at)}</span>
            <span>👁️ ${article.views}</span>
            <span>❤️ ${article.likes || 0}</span>
            ${article.tags ? `<span>🏷️ ${article.tags}</span>` : ''}
        </div>
        ${article.cover_image ? `<img src="${article.cover_image}" class="article-detail-cover" alt="${article.title}" onerror="this.style.display='none'">` : ''}
        <div class="article-detail-content markdown-preview">
            ${htmlContent}
        </div>
        <div class="article-actions-bar">
            <button class="btn-primary" onclick="handleLikeArticle(${article.id})">
                ❤️ 点赞 (${article.likes || 0})
            </button>
            ${currentUser && article.author_name === currentUser.username ? `
                <button class="btn-secondary" onclick="handleEditArticleClick(event, ${article.id})">
                    ✏️ 编辑文章
                </button>
            ` : ''}
        </div>
        <div class="comments-section">
            <h3>💬 评论 (${article.comments ? article.comments.length : 0})</h3>
            <div class="comment-form">
                <form onsubmit="handleAddComment(event, ${article.id})">
                    <div class="form-group">
                        <input type="text" id="commentName" placeholder="您的昵称" required>
                    </div>
                    <div class="form-group">
                        <textarea id="commentContent" placeholder="写下您的评论..." rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn-primary">发表评论</button>
                </form>
            </div>
            <div class="comment-list" id="commentList">
                ${article.comments ? article.comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author">${comment.user_name}</span>
                            <span class="comment-date">${formatDate(comment.created_at)}</span>
                        </div>
                        <p>${comment.content}</p>
                    </div>
                `).join('') : ''}
            </div>
        </div>
    `;
    
    // 生成文章目录
    generateTOC(article.content);
}

// ========== 文章目录 ==========
function generateTOC(content) {
    const tocContainer = document.getElementById('articleToc');
    const tocList = document.getElementById('tocList');
    
    // 提取标题
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
        headings.push({
            level: match[1].length,
            text: match[2],
            id: match[2].toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
        });
    }
    
    if (headings.length < 2) {
        tocContainer.style.display = 'none';
        return;
    }
    
    tocContainer.style.display = 'block';
    tocList.innerHTML = headings.map(h => 
        `<a href="#${h.id}" class="toc-item h${h.level}">${h.text}</a>`
    ).join('');
}

// ========== Markdown 转换 ==========
function convertMarkdownToHTML(markdown) {
    if (typeof marked !== 'undefined') {
        return marked.parse(markdown);
    }
    // 降级方案：简单转换
    return markdown
        .replace(/### (.+)/g, '<h3>$1</h3>')
        .replace(/## (.+)/g, '<h2>$1</h2>')
        .replace(/# (.+)/g, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, '<br>');
}

// ========== 点赞 ==========
async function handleLikeArticle(articleId) {
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/like`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (response.ok) {
            showMessage('点赞成功！', 'success');
            showArticleDetail(articleId);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('网络错误', 'error');
    }
}

// ========== 登录 ==========
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            updateNavigation();
            showMessage('登录成功', 'success');
            showHome();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 注册 ==========
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const registerData = {
        username: formData.get('username'),
        password: formData.get('password'),
        email: formData.get('email')
    };
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('注册成功，请登录', 'success');
            showLogin();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 写文章 ==========
async function handleWriteArticle(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const articleData = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: formData.get('tags'),
        cover_image: formData.get('cover_image') || ''
    };
    
    showLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(articleData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('文章发布成功', 'success');
            event.target.reset();
            showHome();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 编辑文章 ==========
async function handleEditArticleClick(event, articleId) {
    event.stopPropagation();
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
        const article = await response.json();
        
        if (response.ok) {
            document.getElementById('editArticleId').value = article.id;
            document.getElementById('editTitle').value = article.title;
            document.getElementById('editContent').value = article.content;
            document.getElementById('editTags').value = article.tags || '';
            document.getElementById('editCover').value = article.cover_image || '';
            
            await loadCategoriesForWritePage();
            
            const categorySelect = document.getElementById('editCategory');
            if (categorySelect) {
                categorySelect.value = article.category;
            }
            
            showPage('editPage');
        } else {
            showMessage('加载文章失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleEditArticle(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    const articleId = document.getElementById('editArticleId').value;
    const formData = new FormData(event.target);
    const articleData = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        tags: formData.get('tags'),
        cover_image: formData.get('cover_image') || ''
    };
    
    showLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(articleData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('文章更新成功', 'success');
            showHome();
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 删除文章 ==========
async function handleDeleteArticle(event, articleId) {
    event.stopPropagation();
    
    if (!currentUser) {
        showMessage('请先登录', 'error');
        return;
    }
    
    if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
        return;
    }
    
    showLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('文章删除成功', 'success');
            loadHomePage();
        } else {
            showMessage(data.error || '删除失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 评论 ==========
async function handleAddComment(event, articleId) {
    event.preventDefault();
    
    const commentData = {
        user_name: document.getElementById('commentName').value,
        content: document.getElementById('commentContent').value
    };
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles/${articleId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commentData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('评论发表成功', 'success');
            document.getElementById('commentName').value = '';
            document.getElementById('commentContent').value = '';
            showArticleDetail(articleId);
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 分类页面 ==========
async function loadCategoriesPage() {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        
        if (response.ok) {
            displayCategoriesGrid(categories);
        }
    } catch (error) {
        showMessage('加载分类失败', 'error');
    } finally {
        showLoading(false);
    }
}

function displayCategoriesGrid(categories) {
    const categoriesGrid = document.getElementById('categoriesGrid');
    
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" onclick="showArticlesByCategory('${category.category}')">
            <div class="category-name">${category.category}</div>
            <div class="category-count">${category.count} 篇文章</div>
        </div>
    `).join('');
}

async function showArticlesByCategory(category) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles/category/${encodeURIComponent(category)}`);
        const articles = await response.json();
        
        if (response.ok) {
            const articlesList = document.getElementById('articlesList');
            articlesList.innerHTML = articles.map(article => `
                <div class="article-card" onclick="showArticleDetail(${article.id})">
                    ${article.cover_image ? `<img src="${article.cover_image}" class="article-card-cover" alt="${article.title}" onerror="this.style.display='none'">` : ''}
                    <h3 class="article-title">${article.title}</h3>
                    <div class="article-meta">
                        <span>👤 ${article.author_name}</span>
                        <span>📅 ${formatDate(article.created_at)}</span>
                    </div>
                    <p class="article-excerpt">${getExcerpt(article.content, 150)}</p>
                </div>
            `).join('');
            
            showPage('homePage');
            showMessage(`显示分类: ${category}`, 'info');
        }
    } catch (error) {
        showMessage('加载文章失败', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 个人中心 ==========
async function loadProfile() {
    if (!currentUser) return;
    
    showLoading(true);
    try {
        const token = localStorage.getItem('token');
        
        // 加载用户信息
        const profileResponse = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileResponse.json();
        
        if (profileResponse.ok) {
            document.getElementById('profileUsername').textContent = profileData.user.username;
            document.getElementById('profileEmail').textContent = `📧 ${profileData.user.email || '未设置邮箱'}`;
            document.getElementById('profileJoinDate').textContent = `📅 注册时间: ${formatDate(profileData.user.created_at)}`;
            document.getElementById('statArticles').textContent = profileData.statistics.totalArticles;
            document.getElementById('statViews').textContent = profileData.statistics.totalViews;
            document.getElementById('statComments').textContent = profileData.statistics.totalComments;
        }
        
        // 加载用户文章
        const articlesResponse = await fetch(`${API_BASE_URL}/user/articles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const articlesData = await articlesResponse.json();
        
        if (articlesResponse.ok) {
            const myArticlesList = document.getElementById('myArticlesList');
            if (articlesData.articles.length === 0) {
                myArticlesList.innerHTML = '<p style="color: var(--gray-color); text-align: center; padding: 2rem;">还没有发布文章</p>';
            } else {
                myArticlesList.innerHTML = articlesData.articles.map(article => `
                    <div class="article-card" onclick="showArticleDetail(${article.id})">
                        <div class="article-card-header">
                            <h3 class="article-title">${article.title}</h3>
                            <span style="font-size: 0.85rem; color: var(--gray-color);">${article.status === 'published' ? '✅ 已发布' : '📝 草稿'}</span>
                        </div>
                        <div class="article-meta">
                            <span>👁️ ${article.views}</span>
                            <span>💬 ${article.comment_count || 0}</span>
                            <span>📅 ${formatDate(article.created_at)}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        showMessage('加载个人中心失败', 'error');
    } finally {
        showLoading(false);
    }
}

// ========== 退出登录 ==========
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    updateNavigation();
    showMessage('已退出登录', 'info');
    showHome();
}

// ========== 搜索 ==========
function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        showMessage('请输入搜索关键词', 'error');
        return;
    }
    
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles/search/${encodeURIComponent(query)}?page=1&limit=${articlesPerPage}`);
        const data = await response.json();
        
        if (response.ok) {
            if (data.articles.length === 0) {
                showMessage(`未找到与"${query}"相关的文章`, 'info');
                displayArticles([]);
                displaySearchPagination(data.pagination, query);
            } else {
                showMessage(`找到 ${data.pagination.total} 篇与"${query}"相关的文章`, 'success');
                displayArticles(data.articles);
                displaySearchPagination(data.pagination, query);
            }
        } else {
            showMessage(data.error || '搜索失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

async function searchArticles(query, page = 1) {
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/articles/search/${encodeURIComponent(query)}?page=${page}&limit=${articlesPerPage}`);
        const data = await response.json();
        
        if (response.ok) {
            displayArticles(data.articles);
            displaySearchPagination(data.pagination, query);
        } else {
            showMessage(data.error || '搜索失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请稍后重试', 'error');
    } finally {
        showLoading(false);
    }
}

function displaySearchPagination(pagination, query) {
    const paginationEl = document.getElementById('pagination');
    const { page, totalPages } = pagination;
    
    let paginationHTML = '';
    
    if (page > 1) {
        paginationHTML += `<button onclick="searchArticles('${query}', ${page - 1})">上一页</button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === page) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="searchArticles('${query}', ${i})">${i}</button>`;
        }
    }
    
    if (page < totalPages) {
        paginationHTML += `<button onclick="searchArticles('${query}', ${page + 1})">下一页</button>`;
    }
    
    if (query) {
        paginationHTML += `<button onclick="loadHomePage()" style="margin-left: 1rem; background: #6c757d; color: white;">返回首页</button>`;
    }
    
    paginationEl.innerHTML = paginationHTML;
}

// ========== Markdown 编辑器 ==========
function insertMarkdown(before, after) {
    const textarea = document.getElementById('articleContent');
    insertMarkdownToTextarea(textarea, before, after);
}

function insertEditMarkdown(before, after) {
    const textarea = document.getElementById('editContent');
    insertMarkdownToTextarea(textarea, before, after);
}

function insertMarkdownToTextarea(textarea, before, after) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = before + selectedText + after;
    
    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selectedText.length;
}

function togglePreview() {
    const previewPanel = document.getElementById('previewPanel');
    const previewContent = document.getElementById('previewContent');
    const textarea = document.getElementById('articleContent');
    
    if (previewPanel.style.display === 'none') {
        previewPanel.style.display = 'block';
        previewContent.innerHTML = convertMarkdownToHTML(textarea.value);
    } else {
        previewPanel.style.display = 'none';
    }
}

function toggleEditPreview() {
    const previewPanel = document.getElementById('editPreviewPanel');
    const previewContent = document.getElementById('editPreviewContent');
    const textarea = document.getElementById('editContent');
    
    if (previewPanel.style.display === 'none') {
        previewPanel.style.display = 'block';
        previewContent.innerHTML = convertMarkdownToHTML(textarea.value);
    } else {
        previewPanel.style.display = 'none';
    }
}

// ========== 图片上传 ==========
function initializeImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ff7e5f';
        uploadArea.style.backgroundColor = 'rgba(255, 126, 95, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#adb5bd';
        uploadArea.style.backgroundColor = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#adb5bd';
        uploadArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });
}

function handleImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showMessage('请选择JPG、PNG或GIF格式的图片', 'error');
        return;
    }
    
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessage('图片大小不能超过2MB', 'error');
        return;
    }
    
    showImagePreview(file);
}

function showImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const uploadArea = document.getElementById('uploadArea');
        const uploadPreview = document.getElementById('uploadPreview');
        const previewImage = document.getElementById('previewImage');
        const previewName = document.getElementById('previewName');
        const previewSize = document.getElementById('previewSize');
        
        uploadArea.style.display = 'none';
        uploadPreview.style.display = 'block';
        
        previewImage.src = e.target.result;
        previewName.textContent = `文件名: ${file.name}`;
        previewSize.textContent = `文件大小: ${formatFileSize(file.size)}`;
        
        window.currentImageFile = file;
        window.currentImageDataUrl = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function cancelUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    const fileInput = document.getElementById('imageUpload');
    
    uploadArea.style.display = 'flex';
    uploadPreview.style.display = 'none';
    fileInput.value = '';
    
    delete window.currentImageFile;
    delete window.currentImageDataUrl;
}

function useAsCover() {
    if (window.currentImageDataUrl) {
        const coverInput = document.getElementById('articleCover');
        if (coverInput) {
            coverInput.value = window.currentImageDataUrl;
            showMessage('已设为封面图', 'success');
            cancelUpload();
        }
    }
}

async function insertImageToContent() {
    const writePage = document.getElementById('writePage');
    if (!writePage || !writePage.classList.contains('active')) {
        showMessage('请在写文章页面使用此功能', 'error');
        return;
    }
    
    const contentTextarea = document.getElementById('articleContent');
    
    if (!contentTextarea) {
        showMessage('找不到文章内容文本框', 'error');
        return;
    }
    
    if (!window.currentImageFile) {
        showMessage('请先选择图片', 'error');
        return;
    }
    
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '上传中...';
    
    try {
        const formData = new FormData();
        formData.append('image', window.currentImageFile);
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('请先登录才能上传图片');
        }
        
        progressFill.style.width = '30%';
        progressText.textContent = '准备上传...';
        
        const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        progressFill.style.width = '70%';
        progressText.textContent = '上传中...';
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `上传失败 (${response.status})`);
        }
        
        progressFill.style.width = '100%';
        progressText.textContent = '处理中...';
        
        const imageMarkdown = `![${data.originalName}](${data.imageUrl})`;
        
        const startPos = contentTextarea.selectionStart;
        const endPos = contentTextarea.selectionEnd;
        const currentContent = contentTextarea.value;
        
        const newContent = currentContent.substring(0, startPos) + 
                          imageMarkdown + 
                          currentContent.substring(endPos);
        
        contentTextarea.value = newContent;
        
        const newCursorPos = startPos + imageMarkdown.length;
        contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
        contentTextarea.focus();
        
        showMessage('图片上传并插入成功', 'success');
        
        setTimeout(() => {
            uploadProgress.style.display = 'none';
            progressFill.style.width = '0%';
        }, 1000);
        
        cancelUpload();
        
    } catch (error) {
        showMessage(`图片上传失败: ${error.message}`, 'error');
        uploadProgress.style.display = 'none';
        progressFill.style.width = '0%';
    }
}

// ========== 工具函数 ==========
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function getExcerpt(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
