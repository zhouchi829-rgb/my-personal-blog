const db = require('./database');

// 更多摄影文章
const morePhotographyArticles = [
    {
        title: "手机摄影：随时随地记录生活",
        content: `随着手机摄像头的不断进步，手机摄影已经成为大众最常用的摄影方式。掌握手机摄影技巧，可以让你随时随地拍出好照片。

## 手机摄影的优势
- **便携性**：随时随地可以拍摄
- **快速分享**：拍完即可分享到社交媒体
- **丰富的APP**：强大的后期处理应用

## 手机摄影技巧
### 清洁镜头
手机镜头容易沾染指纹和灰尘，拍摄前先清洁镜头。

### 使用网格线
开启相机网格线，帮助构图，应用三分法则。

### 对焦与曝光
点击屏幕选择对焦点，上下滑动调整曝光。

### 使用HDR模式
在光线对比强烈的场景使用HDR，保留更多细节。

### 尝试不同角度
- 低角度：让主体显得高大
- 俯拍：适合食物、桌面物品
- 平视：最自然的视角

## 手机摄影配件
- **手机三脚架**：稳定拍摄，适合夜景和延时摄影
- **外接镜头**：广角、微距、鱼眼等特殊效果
- **补光灯**：改善光线条件

## 后期处理APP推荐
- **Snapseed**：功能全面，操作简单
- **VSCO**：丰富的滤镜和调色工具
- **Lightroom Mobile**：专业级调色工具
- **美图秀秀**：人像美化功能强大

手机摄影的关键是创意和观察力。多拍多练，你会发现手机也能拍出令人惊艳的作品。`,
        category: "手机摄影",
        tags: "手机,便携,技巧,APP"
    },
    {
        title: "建筑摄影：捕捉几何之美",
        content: `建筑摄影是摄影的一个重要分支，它要求摄影师能够捕捉建筑的形态、结构和光影。

## 建筑摄影的特点
- **强调线条和几何形状**
- **注重对称和平衡**
- **利用光影表现质感**

## 拍摄技巧
### 选择合适的时间
- **黄金时刻**：日出日落时的暖色调
- **蓝色时刻**：日落后天空呈深蓝色
- **正午**：强烈的光影对比（需谨慎使用）

### 使用广角镜头
广角镜头可以捕捉建筑的全貌，但要注意避免畸变。

### 寻找独特视角
- 仰拍：强调建筑的高度和气势
- 对称构图：适合古典建筑
- 细节特写：捕捉建筑的纹理和装饰

### 处理透视畸变
- 保持相机水平，避免垂直线条汇聚
- 后期使用透视校正工具

## 现代建筑 vs 古典建筑
### 现代建筑
- 简洁的线条和几何形状
- 玻璃和金属材质
- 适合极简风格

### 古典建筑
- 复杂的装饰和细节
- 石材和木材材质
- 适合对称构图

## 室内建筑摄影
- 使用三脚架，小光圈保证景深
- 混合光源时注意白平衡
- 使用HDR处理大光比场景

建筑摄影需要耐心和细致的观察。多尝试不同的角度和时间，找到最能表现建筑特点的拍摄方式。`,
        category: "建筑摄影",
        tags: "建筑,几何,线条,城市"
    },
    {
        title: "美食摄影：让食物看起来更美味",
        content: `美食摄影在社交媒体和商业广告中越来越重要。好的美食照片能让人垂涎欲滴。

## 美食摄影的基础
### 光线是关键
- **自然光**：窗户旁是最佳拍摄位置
- **柔光**：避免强烈的直射光
- **侧光**：突出食物的纹理和质感

### 构图技巧
- **三分法则**：将主体放在交叉点上
- **留白**：给画面呼吸的空间
- **对角线构图**：增加动感和活力

### 色彩搭配
- 互补色：增加视觉冲击力
- 类似色：营造和谐氛围
- 注意食物与背景的色彩关系

## 拍摄角度
### 俯拍（90度）
- 适合摆盘精致的食物
- 展示食物的整体布局
- 需要保持相机绝对水平

### 45度角
- 最常用的美食摄影角度
- 既能看到食物的顶部，也能看到侧面
- 自然的视角

### 平视（0度）
- 适合层次丰富的食物（如汉堡、蛋糕）
- 强调食物的高度和层次

## 道具和背景
- **餐具**：简洁的餐具不抢镜
- **餐巾**：增加生活气息
- **背景板**：木质、大理石、水泥等不同材质
- **配料**：散落的香料、食材增加真实感

## 后期处理
- 适当增加饱和度，但不要过度
- 调整色温，让食物看起来更诱人
- 锐化细节，突出食物的纹理

## 特殊技巧
- **喷洒水珠**：让蔬菜水果看起来更新鲜
- **使用甘油**：模拟油光效果
- **热气效果**：使用加湿器或后期添加

记住，美食摄影不仅要拍得美，还要拍得真实。让人看了就想吃，才是成功的美食照片。`,
        category: "美食摄影",
        tags: "美食,食物,静物,色彩"
    },
    {
        title: "运动摄影：捕捉动态瞬间",
        content: `运动摄影是摄影中最具挑战性的领域之一，要求摄影师能够快速反应，捕捉决定性瞬间。

## 运动摄影的挑战
- **快速移动的主体**
- **不可预测的动作**
- **复杂的光线条件**

## 设备要求
### 相机
- 高速连拍功能（至少5fps以上）
- 优秀的自动对焦系统
- 高ISO表现良好

### 镜头
- **长焦镜头**（70-200mm, 100-400mm）：拍摄远距离运动
- **大光圈**：提高快门速度，虚化背景
- **防抖功能**：手持拍摄时很重要

## 拍摄技巧
### 快门速度
- **高速快门**（1/1000秒以上）：冻结动作
- **慢速快门**（1/30-1/125秒）：表现动感，使用追焦技巧

### 对焦模式
- **连续自动对焦**（AI-Servo/AF-C）：跟踪移动主体
- **对焦点选择**：使用中心点或扩展对焦点

### 拍摄模式
- **快门优先**（S/Tv模式）：控制快门速度
- **连拍模式**：捕捉连续动作

## 追焦技巧
1. 预判主体的运动轨迹
2. 半按快门跟踪主体
3. 在关键时刻完全按下快门
4. 跟随主体移动相机（摇摄）

## 构图技巧
- **留出运动空间**：在主体前方留出更多空间
- **捕捉表情**：运动员的表情和情绪
- **环境元素**：包含场地、观众等环境元素

## 不同运动的拍摄要点
### 球类运动
- 预判球的轨迹
- 捕捉击球或射门的瞬间
- 注意运动员的表情和姿势

### 田径运动
- 起跑、冲刺、跳跃的瞬间
- 肌肉线条和力量感
- 竞争中的互动

### 水上运动
- 注意反光和倒影
- 捕捉水花四溅的瞬间
- 使用偏振镜减少反光

## 后期处理
- 适当提高对比度和清晰度
- 裁剪去除干扰元素
- 调整色彩突出主体

运动摄影需要大量的练习和耐心。了解运动规则，预判动作，才能在正确的时间按下快门。`,
        category: "运动摄影",
        tags: "运动,动态,瞬间,体育"
    },
    {
        title: "创意摄影：突破传统的视觉表达",
        content: `创意摄影是摄影的艺术表现形式，它突破传统的拍摄方式，表达摄影师的个人视角和情感。

## 什么是创意摄影
创意摄影不仅仅是记录现实，更是：
- **表达情感和思想**
- **探索视觉可能性**
- **挑战传统审美**

## 创意摄影技法
### 多重曝光
- 相机内多重曝光
- 后期合成
- 创造超现实效果

### 光绘摄影
- 在黑暗环境中使用光源"绘画"
- 需要长时间曝光和三脚架
- 创意无限的光影游戏

### 抽象摄影
- 关注形状、色彩、纹理
- 忽略物体的实际意义
- 从日常中发现抽象美

### 概念摄影
- 通过图像讲述故事或概念
- 精心策划和布置
- 往往需要后期处理

## 创意人像摄影
### 双重曝光人像
将人像与自然元素（树木、云朵、纹理）结合。

### 剪影摄影
在逆光下拍摄，强调形状而非细节。

### 反射摄影
利用镜子、水面、玻璃等反射面创造对称或扭曲效果。

## 创意风光摄影
### 极简主义
- 大量留白
- 简洁的构图
- 强调线条和形状

### 超现实主义
- 不真实的色彩
- 不可能的景象
- 梦幻般的氛围

## 创意静物摄影
### 悬浮摄影
通过细线或后期处理让物体"悬浮"。

### 高速摄影
捕捉肉眼无法看到的瞬间，如水滴皇冠、破碎的物体。

## 后期创意处理
- **色彩分级**：创造独特的色调
- **合成技术**：将多张照片合成为一张
- **纹理叠加**：添加质感层

## 创意灵感来源
- 绘画、电影、音乐等艺术形式
- 梦境和想象
- 日常生活中的不寻常视角

创意摄影没有规则，只有可能性。大胆尝试，勇于创新，找到属于你自己的视觉语言。`,
        category: "创意摄影",
        tags: "创意,艺术,实验,创新"
    }
];

// 添加新文章
function addMoreArticles() {
    console.log('开始添加更多摄影文章...');
    
    morePhotographyArticles.forEach((article, index) => {
        // 检查是否已存在相同标题的文章
        db.get('SELECT id FROM articles WHERE title = ?', [article.title], (err, row) => {
            if (err) {
                console.error(`检查文章"${article.title}"失败:`, err);
                return;
            }
            
            if (row) {
                console.log(`文章"${article.title}"已存在，跳过`);
                return;
            }
            
            // 插入新文章（使用管理员ID 1）
            db.run(
                'INSERT INTO articles (title, content, author_id, category, tags, status, created_at, updated_at, views) VALUES (?, ?, 1, ?, ?, "published", datetime("now", "localtime", ?), datetime("now", "localtime"), ?)',
                [article.title, article.content, article.category, article.tags, `-${index} days`, Math.floor(Math.random() * 50) + 20],
                function(err) {
                    if (err) {
                        console.error(`添加文章"${article.title}"失败:`, err);
                    } else {
                        console.log(`✓ 文章"${article.title}"添加成功，ID: ${this.lastID}`);
                        
                        // 为文章添加示例评论
                        addSampleComments(this.lastID, article.title);
                    }
                }
            );
        });
    });
}

// 添加示例评论
function addSampleComments(articleId, articleTitle) {
    const sampleComments = [
        { user_name: '摄影爱好者', content: '这篇文章很有启发性，学到了很多新技巧！' },
        { user_name: '新手摄影师', content: '讲解得很详细，适合我这样的初学者。' },
        { user_name: '专业摄影师', content: '很好的总结，有些技巧很实用。' },
        { user_name: '艺术爱好者', content: '创意摄影的部分特别有意思，想尝试一下。' }
    ];
    
    sampleComments.forEach((comment, index) => {
        db.run(
            'INSERT INTO comments (article_id, user_name, content, created_at) VALUES (?, ?, ?, datetime("now", "localtime", ?))',
            [articleId, comment.user_name, comment.content, `-${index} hours`],
            (err) => {
                if (err) {
                    console.error(`为文章"${articleTitle}"添加评论失败:`, err);
                }
            }
        );
    });
}

// 添加画廊作品
function addGalleryItems() {
    console.log('\n开始添加画廊作品...');
    
    // 检查uploads目录中的图片
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
        console.log('uploads目录不存在，跳过添加画廊作品');
        return;
    }
    
    // 获取uploads目录中的图片文件
    const imageFiles = fs.readdirSync(uploadsDir).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
    });
    
    if (imageFiles.length === 0) {
        console.log('uploads目录中没有图片文件，跳过添加画廊作品');
        return;
    }
    
    // 画廊作品数据
    const galleryItems = [
        {
            title: "城市日落",
            description: "在城市高楼间捕捉到的美丽日落景象，天空呈现橙紫色渐变。",
            image_url: `/uploads/${imageFiles[0]}`,
            category: "landscape",
            tags: "城市,日落,风光,黄昏"
        },
        {
            title: "街头瞬间",
            description: "街头摄影中捕捉到的有趣瞬间，老人与孩子的互动。",
            image_url: `/uploads/${imageFiles.length > 1 ? imageFiles[1] : imageFiles[0]}`,
            category: "street",
            tags: "街头,人文,瞬间,黑白"
        },
        {
            title: "微距世界",
            description: "微距镜头下的花朵细节，展现肉眼难以察觉的美丽。",
            image_url: `/uploads/${imageFiles.length > 2 ? imageFiles[2] : imageFiles[0]}`,
            category: "macro",
            tags: "微距,花朵,细节,自然"
        },
        {
            title: "人像情感",
            description: "捕捉人物自然状态下的情感表达，眼神中充满故事。",
            image_url: `/uploads/${imageFiles.length > 3 ? imageFiles[3] : imageFiles[0]}`,
            category: "portrait",
            tags: "人像,情感,肖像,自然光"
        },
        {
            title: "建筑线条",
            description: "现代建筑的几何线条与光影的完美结合。",
            image_url: `/uploads/${imageFiles.length > 4 ? imageFiles[4] : imageFiles[0]}`,
            category: "other",
            tags: "建筑,几何,线条,现代"
        }
    ];
    
    galleryItems.forEach((item, index) => {
        // 检查是否已存在相同标题的作品
        db.get('SELECT id FROM gallery_items WHERE title = ?', [item.title], (err, row) => {
            if (err) {
                console.error(`检查作品"${item.title}"失败:`, err);
                return;
            }
            
            if (row) {
                console.log(`作品"${item.title}"已存在，跳过`);
                return;
            }
            
            // 插入新作品（使用管理员ID 1）
            db.run(
                'INSERT INTO gallery_items (title, description, image_url, category, tags, author_id, created_at, views) VALUES (?, ?, ?, ?, ?, 1, datetime("now", "localtime", ?), ?)',
                [item.title, item.description, item.image_url, item.category, item.tags, `-${index} days`, Math.floor(Math.random() * 30) + 10],
                function(err) {
                    if (err) {
                        console.error(`添加作品"${item.title}"失败:`, err);
                    } else {
                        console.log(`✓ 作品"${item.title}"添加成功，ID: ${this.lastID}`);
                    }
                }
            );
        });
    });
}

// 运行添加函数
addMoreArticles();

// 延迟执行添加画廊作品，确保文章添加完成
setTimeout(() => {
    addGalleryItems();
    
    // 延迟关闭数据库连接
    setTimeout(() => {
        console.log('\n内容丰富完成！');
        console.log('添加了5篇新的摄影文章和5个画廊作品。');
        process.exit(0);
    }, 3000);
}, 2000);
