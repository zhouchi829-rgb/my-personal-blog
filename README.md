# 个人博客网站 - 毕业设计项目

一个功能完整的个人博客网站，包含前后端和数据库。

## 项目特点

- 🎨 现代化响应式设计
- 🔐 用户认证系统（注册/登录）
- 📝 文章发布和管理
- 💬 评论系统
- 📂 文章分类管理
- 📱 移动端适配
- 🗄️ SQLite数据库

## 技术栈

### 后端
- Node.js + Express.js
- SQLite3 数据库
- JWT 身份认证
- bcryptjs 密码加密
- CORS 跨域支持

### 前端
- 原生 HTML5 + CSS3 + JavaScript
- 响应式设计
- 现代CSS Grid和Flexbox布局
- 异步数据加载

## 项目结构

```
my-personal-blog/
├── package.json          # 项目依赖配置
├── server.js             # 后端服务器
├── database.js           # 数据库配置和初始化
├── README.md             # 项目说明文档
└── public/               # 前端静态文件
    ├── index.html        # 主页面
    ├── styles.css        # 样式文件
    └── script.js         # 前端逻辑
```

## 安装和运行

### 1. 安装依赖
打开命令提示符或PowerShell，进入项目目录：
```
cd my-personal-blog
npm install
```

### 2. 启动服务器
```
npm start
```

或者使用开发模式（自动重启）：
```
npm run dev
```

### 3. 访问网站
打开浏览器访问：http://localhost:3000

### Windows用户快速启动
双击运行 `start.bat` 文件即可启动服务器。

## 默认账户

系统会自动创建默认管理员账户：
- 用户名：`admin`
- 密码：`admin123`

## API接口

### 用户认证
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录

### 文章管理
- `GET /api/articles` - 获取文章列表（分页）
- `GET /api/articles/:id` - 获取单篇文章
- `POST /api/articles` - 创建新文章（需要认证）
- `GET /api/categories` - 获取文章分类
- `GET /api/articles/category/:category` - 根据分类获取文章

### 评论系统
- `POST /api/articles/:id/comments` - 添加评论

## 数据库结构

### users 表
- id (主键)
- username (用户名)
- password (加密密码)
- email (邮箱)
- created_at (创建时间)

### articles 表
- id (主键)
- title (标题)
- content (内容)
- author_id (作者ID)
- category (分类)
- tags (标签)
- created_at (创建时间)
- updated_at (更新时间)
- views (阅读量)
- status (状态)

### comments 表
- id (主键)
- article_id (文章ID)
- user_name (评论者昵称)
- content (评论内容)
- created_at (创建时间)

## 功能说明

### 用户功能
- 用户注册和登录
- 登录状态保持
- 安全退出

### 文章功能
- 浏览文章列表（分页显示）
- 查看文章详情
- 发布新文章（登录用户）
- 文章分类浏览
- 阅读量统计

### 评论功能
- 匿名评论（无需登录）
- 评论列表显示
- 实时评论更新

### 分类功能
- 文章分类管理
- 按分类筛选文章
- 分类文章数量统计

## 开发说明

### 自定义配置
- 修改 `server.js` 中的 `PORT` 和 `JWT_SECRET`
- 数据库文件自动创建在项目根目录下的 `blog.db`

### 扩展建议
- 添加文章编辑和删除功能
- 实现用户个人资料管理
- 添加文章搜索功能
- 实现图片上传功能
- 添加文章点赞功能
- 实现后台管理界面

## 许可证

MIT License
