const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'blog.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('成功连接到SQLite数据库');
        initializeDatabase();
    }
});

// 初始化数据库表
function initializeDatabase() {
    // 创建用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
        if (err) {
            console.error('创建用户表失败:', err);
            return;
        }
        
        // 创建文章表（包含 cover_image 和 likes 字段）
        db.run(`CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            category TEXT DEFAULT '未分类',
            tags TEXT,
            cover_image TEXT DEFAULT '',
            likes INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            views INTEGER DEFAULT 0,
            status TEXT DEFAULT 'published',
            FOREIGN KEY (author_id) REFERENCES users (id)
        )`, function(err) {
            if (err) {
                console.error('创建文章表失败:', err);
                return;
            }
            
            // 尝试添加新列（兼容旧数据库）
            db.run(`ALTER TABLE articles ADD COLUMN cover_image TEXT DEFAULT ''`, function(err) {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('添加 cover_image 列失败:', err);
                }
            });
            
            db.run(`ALTER TABLE articles ADD COLUMN likes INTEGER DEFAULT 0`, function(err) {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('添加 likes 列失败:', err);
                }
            });
            
            // 创建评论表
            db.run(`CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id INTEGER NOT NULL,
                user_name TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (article_id) REFERENCES articles (id)
            )`, function(err) {
                if (err) {
                    console.error('创建评论表失败:', err);
                    return;
                }
                
                // 创建画廊作品表
                db.run(`CREATE TABLE IF NOT EXISTS gallery_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    image_url TEXT NOT NULL,
                    category TEXT DEFAULT 'other',
                    tags TEXT,
                    author_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    views INTEGER DEFAULT 0,
                    FOREIGN KEY (author_id) REFERENCES users (id)
                )`, function(err) {
                    if (err) {
                        console.error('创建画廊作品表失败:', err);
                        return;
                    }
                    
                    // 插入默认管理员用户
                    const bcrypt = require('bcryptjs');
                    const defaultPassword = bcrypt.hashSync('admin123', 10);
                    
                    db.run(`INSERT OR IGNORE INTO users (username, password, email) 
                            VALUES (?, ?, ?)`, 
                            ['admin', defaultPassword, 'admin@blog.com'], 
                            function(err) {
                                if (err) {
                                    console.error('插入默认用户失败:', err);
                                } else {
                                    console.log('默认管理员用户已创建: admin / admin123');
                                }
                                console.log('数据库表初始化完成');
                            });
                });
            });
        });
    });
}

module.exports = db;
