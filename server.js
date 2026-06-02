// 加载环境变量
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 中间件
app.use(cors({
    origin: function(origin, callback) {
        // 允许所有来源（生产环境由 Render 提供 HTTPS）
        callback(null, true);
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 使用绝对路径
app.use(express.static(path.join(__dirname, 'public')));

// 根路由，重定向到首页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 创建上传目录
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置multer文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'photo-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB限制
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件（JPEG、JPG、PNG、GIF）'));
        }
    }
});

// JWT验证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// 用户注册
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [username, hashedPassword, email],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: '用户名或邮箱已存在' });
                    }
                    return res.status(500).json({ error: '注册失败' });
                }
                res.json({ message: '注册成功', userId: this.lastID });
            }
        );
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: '服务器错误' });
        }

        if (!user) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: '用户名或密码错误' });
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            res.json({
                message: '登录成功',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(500).json({ error: '服务器错误' });
        }
    });
});

// 获取所有文章列表
app.get('/api/articles', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT a.*, u.username as author_name,
               (SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id) as comment_count
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.status = 'published'
        ORDER BY a.created_at DESC 
        LIMIT ? OFFSET ?
    `;

    db.all(query, [limit, offset], (err, articles) => {
        if (err) {
            console.error('获取文章失败:', err);
            return res.status(500).json({ error: '获取文章失败' });
        }

        // 获取文章总数
        db.get('SELECT COUNT(*) as total FROM articles WHERE status = "published"', (err, countResult) => {
            if (err) {
                console.error('获取文章总数失败:', err);
                return res.status(500).json({ error: '获取文章总数失败' });
            }

            res.json({
                articles,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// 获取单篇文章
app.get('/api/articles/:id', (req, res) => {
    const articleId = req.params.id;

    // 增加阅读量
    db.run('UPDATE articles SET views = views + 1 WHERE id = ?', [articleId]);

    const query = `
        SELECT a.*, u.username as author_name 
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.id = ?
    `;

    db.get(query, [articleId], (err, article) => {
        if (err) {
            return res.status(500).json({ error: '获取文章失败' });
        }

        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 获取文章评论
        db.all('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC', [articleId], (err, comments) => {
            if (err) {
                return res.status(500).json({ error: '获取评论失败' });
            }

            res.json({
                ...article,
                comments
            });
        });
    });
});

// 创建新文章（需要认证）
app.post('/api/articles', authenticateToken, (req, res) => {
    const { title, content, category, tags, status = 'published', cover_image } = req.body;
    const authorId = req.user.userId;

    if (!title || !content) {
        return res.status(400).json({ error: '标题和内容不能为空' });
    }

    db.run(
        'INSERT INTO articles (title, content, author_id, category, tags, status, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, content, authorId, category || '未分类', tags || '', status, cover_image || ''],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '创建文章失败' });
            }
            res.json({ message: '文章创建成功', articleId: this.lastID });
        }
    );
});
// 更新文章（需要认证）
app.put('/api/articles/:id', authenticateToken, (req, res) => {
    const articleId = req.params.id;
    const { title, content, category, tags, status, cover_image } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
        return res.status(400).json({ error: '标题和内容不能为空' });
    }

    // 首先检查文章是否存在且用户是否有权限编辑
    db.get('SELECT * FROM articles WHERE id = ?', [articleId], (err, article) => {
        if (err) {
            return res.status(500).json({ error: '检查文章失败' });
        }

        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 检查权限：只有文章作者可以编辑自己的文章
        if (article.author_id !== userId) {
            return res.status(403).json({ error: '无权编辑此文章' });
        }

        // 更新文章
        db.run(
            'UPDATE articles SET title = ?, content = ?, category = ?, tags = ?, status = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, category || '未分类', tags || '', status || article.status, cover_image || article.cover_image || '', articleId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: '更新文章失败' });
                }
                res.json({ message: '文章更新成功', articleId });
            }
        );
    });
});
// 点赞文章
app.post('/api/articles/:id/like', (req, res) => {
    const articleId = req.params.id;

    db.run('UPDATE articles SET likes = COALESCE(likes, 0) + 1 WHERE id = ?', [articleId], function(err) {
        if (err) {
            return res.status(500).json({ error: '点赞失败' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: '文章不存在' });
        }
        res.json({ message: '点赞成功' });
    });
});


// 添加评论
app.post('/api/articles/:id/comments', (req, res) => {
    const articleId = req.params.id;
    const { user_name, content } = req.body;

    if (!user_name || !content) {
        return res.status(400).json({ error: '昵称和评论内容不能为空' });
    }

    db.run(
        'INSERT INTO comments (article_id, user_name, content) VALUES (?, ?, ?)',
        [articleId, user_name, content],
        function(err) {
            if (err) {
                return res.status(500).json({ error: '添加评论失败' });
            }
            res.json({ message: '评论添加成功', commentId: this.lastID });
        }
    );
});

// 获取文章分类
app.get('/api/categories', (req, res) => {
    db.all('SELECT DISTINCT category, COUNT(*) as count FROM articles WHERE status = "published" GROUP BY category', (err, categories) => {
        if (err) {
            return res.status(500).json({ error: '获取分类失败' });
        }
        res.json(categories);
    });
});

// 根据分类获取文章
app.get('/api/articles/category/:category', (req, res) => {
    const category = req.params.category;
    
    db.all(
        'SELECT a.*, u.username as author_name FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.category = ? AND a.status = "published" ORDER BY a.created_at DESC',
        [category],
        (err, articles) => {
            if (err) {
                return res.status(500).json({ error: '获取文章失败' });
            }
            res.json(articles);
        }
    );
});

// 搜索文章
app.get('/api/articles/search/:query', (req, res) => {
    const searchQuery = `%${req.params.query}%`;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT a.*, u.username as author_name,
               (SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id) as comment_count
        FROM articles a 
        LEFT JOIN users u ON a.author_id = u.id 
        WHERE a.status = 'published' 
        AND (a.title LIKE ? OR a.content LIKE ? OR a.tags LIKE ?)
        ORDER BY a.created_at DESC 
        LIMIT ? OFFSET ?
    `;

    db.all(query, [searchQuery, searchQuery, searchQuery, limit, offset], (err, articles) => {
        if (err) {
            console.error('搜索文章失败:', err);
            return res.status(500).json({ error: '搜索文章失败' });
        }

        // 获取搜索结果总数
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM articles a 
            WHERE a.status = 'published' 
            AND (a.title LIKE ? OR a.content LIKE ? OR a.tags LIKE ?)
        `;
        
        db.get(countQuery, [searchQuery, searchQuery, searchQuery], (err, countResult) => {
            if (err) {
                console.error('获取搜索结果总数失败:', err);
                return res.status(500).json({ error: '获取搜索结果总数失败' });
            }

            res.json({
                articles,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit),
                    searchQuery: req.params.query
                }
            });
        });
    });
});

// 删除文章（需要认证）
app.delete('/api/articles/:id', authenticateToken, (req, res) => {
    const articleId = req.params.id;
    const userId = req.user.userId;

    // 首先检查文章是否存在且用户是否有权限删除
    db.get('SELECT * FROM articles WHERE id = ?', [articleId], (err, article) => {
        if (err) {
            return res.status(500).json({ error: '检查文章失败' });
        }

        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 检查权限：只有文章作者可以删除自己的文章
        if (article.author_id !== userId) {
            return res.status(403).json({ error: '无权删除此文章' });
        }

        // 开始事务：先删除评论，再删除文章
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // 删除文章的所有评论
            db.run('DELETE FROM comments WHERE article_id = ?', [articleId], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: '删除评论失败' });
                }

                // 删除文章
                db.run('DELETE FROM articles WHERE id = ?', [articleId], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: '删除文章失败' });
                    }

                    db.run('COMMIT');
                    res.json({ 
                        message: '文章删除成功',
                        deletedArticleId: articleId,
                        deletedComments: this.changes
                    });
                });
            });
        });
    });
});

// 获取用户个人中心信息（需要认证）
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    // 获取用户基本信息
    db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: '获取用户信息失败' });
        }

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 获取用户文章统计
        db.all(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(views) as total_views,
                SUM((SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id)) as total_comments
            FROM articles a 
            WHERE author_id = ?
            GROUP BY status
        `, [userId], (err, stats) => {
            if (err) {
                return res.status(500).json({ error: '获取文章统计失败' });
            }

            // 计算总数
            const totalArticles = stats.reduce((sum, stat) => sum + stat.count, 0);
            const totalViews = stats.reduce((sum, stat) => sum + (stat.total_views || 0), 0);
            const totalComments = stats.reduce((sum, stat) => sum + (stat.total_comments || 0), 0);

            res.json({
                user,
                statistics: {
                    totalArticles,
                    totalViews,
                    totalComments,
                    byStatus: stats
                }
            });
        });
    });
});

// 图片上传API（需要认证）
app.post('/api/upload/image', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '请选择要上传的图片' });
    }
    
    try {
        // 生成可访问的图片URL
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            message: '图片上传成功',
            imageUrl: imageUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({ error: '图片上传失败' });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '图片大小不能超过2MB' });
        }
        return res.status(400).json({ error: '文件上传错误: ' + err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// 获取用户文章列表（需要认证）
app.get('/api/user/articles', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all'; // all, published, draft

    let statusCondition = '';
    if (status === 'published') {
        statusCondition = "AND a.status = 'published'";
    } else if (status === 'draft') {
        statusCondition = "AND a.status = 'draft'";
    }

    const query = `
        SELECT a.*,
               (SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id) as comment_count
        FROM articles a 
        WHERE a.author_id = ? ${statusCondition}
        ORDER BY a.updated_at DESC 
        LIMIT ? OFFSET ?
    `;

    db.all(query, [userId, limit, offset], (err, articles) => {
        if (err) {
            console.error('获取用户文章失败:', err);
            return res.status(500).json({ error: '获取用户文章失败' });
        }

        // 获取文章总数
        let countQuery = `SELECT COUNT(*) as total FROM articles a WHERE a.author_id = ?`;
        if (status === 'published') {
            countQuery += " AND a.status = 'published'";
        } else if (status === 'draft') {
            countQuery += " AND a.status = 'draft'";
        }
        
        db.get(countQuery, [userId], (err, countResult) => {
            if (err) {
                console.error('获取用户文章总数失败:', err);
                return res.status(500).json({ error: '获取用户文章总数失败' });
            }

            res.json({
                articles,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit),
                    status
                }
            });
        });
    });
});

// 获取所有画廊作品
app.get('/api/gallery/items', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category || 'all';

    let categoryCondition = '';
    if (category !== 'all') {
        categoryCondition = "WHERE g.category = ?";
    }

    const query = `
        SELECT g.*, u.username as author_name
        FROM gallery_items g
        LEFT JOIN users u ON g.author_id = u.id
        ${categoryCondition}
        ORDER BY g.created_at DESC
        LIMIT ? OFFSET ?
    `;

    const queryParams = category !== 'all' ? [category, limit, offset] : [limit, offset];

    db.all(query, queryParams, (err, items) => {
        if (err) {
            console.error('获取画廊作品失败:', err);
            return res.status(500).json({ error: '获取画廊作品失败' });
        }

        // 获取作品总数
        let countQuery = `SELECT COUNT(*) as total FROM gallery_items g`;
        if (category !== 'all') {
            countQuery += " WHERE g.category = ?";
        }
        
        const countParams = category !== 'all' ? [category] : [];
        
        db.get(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('获取画廊作品总数失败:', err);
                return res.status(500).json({ error: '获取画廊作品总数失败' });
            }

            res.json({
                items,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit),
                    category
                }
            });
        });
    });
});

// 获取单个画廊作品详情
app.get('/api/gallery/items/:id', (req, res) => {
    const itemId = req.params.id;

    // 增加浏览量
    db.run('UPDATE gallery_items SET views = views + 1 WHERE id = ?', [itemId]);

    const query = `
        SELECT g.*, u.username as author_name
        FROM gallery_items g
        LEFT JOIN users u ON g.author_id = u.id
        WHERE g.id = ?
    `;

    db.get(query, [itemId], (err, item) => {
        if (err) {
            console.error('获取画廊作品详情失败:', err);
            return res.status(500).json({ error: '获取画廊作品详情失败' });
        }

        if (!item) {
            return res.status(404).json({ error: '作品不存在' });
        }

        res.json(item);
    });
});

// 上传画廊作品（需要认证）
app.post('/api/gallery/items', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '请选择要上传的图片' });
    }

    const { title, description, category, tags } = req.body;
    const authorId = req.user.userId;

    if (!title) {
        return res.status(400).json({ error: '作品标题不能为空' });
    }

    // 生成可访问的图片URL
    const imageUrl = `/uploads/${req.file.filename}`;

    // 将标签字符串转换为数组再转回字符串（确保格式一致）
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    const tagsString = tagsArray.join(',');

    db.run(
        'INSERT INTO gallery_items (title, description, image_url, category, tags, author_id) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description || '', imageUrl, category || 'other', tagsString, authorId],
        function(err) {
            if (err) {
                console.error('保存画廊作品失败:', err);
                return res.status(500).json({ error: '保存画廊作品失败' });
            }

            res.json({
                message: '作品上传成功',
                itemId: this.lastID,
                imageUrl: imageUrl,
                title: title
            });
        }
    );
});

// 获取用户自己的画廊作品（需要认证）
app.get('/api/user/gallery-items', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT g.*
        FROM gallery_items g
        WHERE g.author_id = ?
        ORDER BY g.created_at DESC
        LIMIT ? OFFSET ?
    `;

    db.all(query, [userId, limit, offset], (err, items) => {
        if (err) {
            console.error('获取用户画廊作品失败:', err);
            return res.status(500).json({ error: '获取用户画廊作品失败' });
        }

        // 获取作品总数
        db.get('SELECT COUNT(*) as total FROM gallery_items WHERE author_id = ?', [userId], (err, countResult) => {
            if (err) {
                console.error('获取用户画廊作品总数失败:', err);
                return res.status(500).json({ error: '获取用户画廊作品总数失败' });
            }

            res.json({
                items,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    totalPages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// 删除画廊作品（需要认证）
app.delete('/api/gallery/items/:id', authenticateToken, (req, res) => {
    const itemId = req.params.id;
    const userId = req.user.userId;

    // 首先检查作品是否存在且用户是否有权限删除
    db.get('SELECT * FROM gallery_items WHERE id = ?', [itemId], (err, item) => {
        if (err) {
            return res.status(500).json({ error: '检查作品失败' });
        }

        if (!item) {
            return res.status(404).json({ error: '作品不存在' });
        }

        // 检查权限：只有作品作者可以删除自己的作品
        if (item.author_id !== userId) {
            return res.status(403).json({ error: '无权删除此作品' });
        }

        // 删除作品
        db.run('DELETE FROM gallery_items WHERE id = ?', [itemId], function(err) {
            if (err) {
                return res.status(500).json({ error: '删除作品失败' });
            }

            // 尝试删除对应的图片文件
            const imagePath = path.join(__dirname, 'public', item.image_url);
            fs.unlink(imagePath, (err) => {
                // 如果文件删除失败，只记录错误但不影响API响应
                if (err) {
                    console.error('删除图片文件失败:', err);
                }
            });

            res.json({ 
                message: '作品删除成功',
                deletedItemId: itemId
            });
        });
    });
});

// 启动服务器 - 绑定所有网络接口 (Render 需要 0.0.0.0)
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`个人博客服务器运行在 http://${HOST}:${PORT}`);
});

module.exports = app;
