const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, 'blog.db');
const db = new sqlite3.Database(dbPath);

// 摄影相关的示例文章
const photographyArticles = [
    {
        title: '摄影入门：掌握基础构图技巧',
        content: `摄影不仅仅是按下快门，更是一门艺术。构图是摄影的基础，掌握好构图技巧能让你的照片更具吸引力。

## 黄金分割法则
黄金分割是摄影中最常用的构图技巧之一。将画面分为九等分，将主体放在交叉点上，可以使照片更加平衡和吸引人。

## 对称构图
对称构图能创造出稳定、和谐的画面效果。适合拍摄建筑、倒影等场景。

## 引导线构图
利用线条引导观众的视线，将注意力引向主体。道路、河流、栏杆等都是很好的引导线。

## 框架构图
利用门窗、拱门等自然框架来突出主体，增加照片的层次感。

记住，规则是用来打破的。在掌握基础后，可以尝试创新，找到自己的风格。`,
        category: '摄影基础',
        tags: '构图,摄影技巧,入门'
    },
    {
        title: '风光摄影：捕捉大自然的壮丽',
        content: `风光摄影是摄影中最受欢迎的领域之一。要拍出令人惊叹的风光照片，需要掌握一些关键技巧。

## 黄金时刻
日出和日落前后的时间被称为"黄金时刻"，这时的光线柔和，色彩丰富，是拍摄风光的最佳时间。

## 使用三脚架
风光摄影通常需要小光圈和低ISO，这意味着快门速度较慢。使用三脚架可以避免相机抖动，保证画面清晰。

## 前景元素
在画面中加入前景元素（如岩石、花朵、树枝）可以增加照片的深度感和立体感。

## 滤镜的使用
偏振镜可以减少反光，增强色彩；中性密度滤镜可以在白天使用慢门拍摄流水、云彩等。

## 天气与季节
不同的天气和季节会带来完全不同的拍摄效果。不要只在晴天拍摄，雨、雾、雪都能创造出独特的氛围。

风光摄影需要耐心和坚持。早起、晚归，等待最佳的光线和时机，才能拍出令人难忘的作品。`,
        category: '风光摄影',
        tags: '风光,自然,户外,技巧'
    },
    {
        title: '人像摄影：捕捉人物的情感与个性',
        content: `人像摄影不仅仅是记录外貌，更是捕捉人物的情感、性格和故事。

## 眼神交流
眼睛是心灵的窗户。让人物看向镜头，或者看向某个方向，可以传达不同的情感。

## 自然光的使用
窗户光、阴影下的柔光都是拍摄人像的理想光源。避免正午的强烈直射光，它会产生难看的阴影。

## 背景选择
简洁的背景不会分散观众的注意力。虚化背景（使用大光圈）可以突出主体。

## 姿势与表情
自然的姿势和表情是最好的。与拍摄对象交流，让他们放松，捕捉真实的瞬间。

## 不同焦段的效果
- 85mm：经典的人像焦段，透视自然，背景虚化效果好
- 35mm：环境人像，可以展示人物与环境的互动
- 50mm：标准视角，接近人眼所见

记住，与被摄者建立良好的沟通和信任关系，是拍出好照片的关键。`,
        category: '人像摄影',
        tags: '人像,肖像,情感,技巧'
    },
    {
        title: '街头摄影：记录城市的脉搏',
        content: `街头摄影是记录日常生活、捕捉瞬间的艺术。它要求摄影师有敏锐的观察力和快速的反应能力。

## 隐身与观察
在街头拍摄时，尽量保持低调。穿着普通的衣服，使用小型相机，不要引起过多注意。

## 决定性瞬间
亨利·卡蒂埃-布列松提出的"决定性瞬间"理论强调在恰当的时机按下快门，捕捉最有意义的瞬间。

## 光影与对比
街头摄影中，光影的运用至关重要。寻找有趣的光影对比，可以增强照片的戏剧性。

## 故事性
好的街头照片应该讲述一个故事，引发观众的思考和共鸣。

## 伦理考虑
尊重被摄者的隐私和尊严。如果可能，尽量事后征得同意，或者在公共场合保持适当的距离。

街头摄影需要勇气和耐心。多走、多看、多拍，才能提高自己的观察力和拍摄技巧。`,
        category: '街头摄影',
        tags: '街头,纪实,城市,瞬间'
    },
    {
        title: '后期处理：让照片更出彩',
        content: `后期处理是摄影创作的重要环节。合理的后期可以提升照片的表现力，但过度处理则会适得其反。

## 基本调整
- 曝光：确保照片亮度合适
- 对比度：增强画面的层次感
- 白平衡：校正色彩，使照片看起来自然
- 饱和度：适当增强色彩，但避免过度

## 局部调整
使用渐变滤镜、径向滤镜等工具对局部进行调整，可以更好地控制画面的不同区域。

## 色彩分级
通过调整高光、中间调、阴影的色彩，可以创造出独特的色调和氛围。

## 锐化与降噪
适当的锐化可以增强细节，而降噪可以减少高ISO带来的噪点。

## 常用软件
- Adobe Lightroom：全面的照片管理和处理工具
- Adobe Photoshop：强大的图像编辑软件
- Capture One：专业的RAW文件处理软件
- Luminar AI：人工智能辅助的创意编辑工具

记住，后期处理的目的是增强照片，而不是改变事实。保持真实性，展现你的创意视角。`,
        category: '后期处理',
        tags: '后期,Lightroom,Photoshop,调色'
    },
    {
        title: '器材选择：找到适合你的相机',
        content: `面对市场上琳琅满目的摄影器材，如何选择适合自己的设备？以下是一些建议。

## 相机类型
### 单反相机
优点：光学取景器，电池续航长，镜头群丰富
缺点：体积较大，重量较重

### 微单相机
优点：体积小巧，电子取景器，视频功能强大
缺点：电池续航相对较短

### 卡片机
优点：便携，操作简单
缺点：画质和操控性有限

## 传感器尺寸
- 全画幅：画质最好，景深控制能力强，价格较高
- APS-C：性价比高，体积相对较小
- M4/3：体积小巧，适合旅行和视频拍摄

## 镜头选择
- 标准变焦镜头（24-70mm）：用途广泛，适合日常拍摄
- 长焦镜头（70-200mm）：适合体育、野生动物、人像
- 广角镜头（16-35mm）：适合风光、建筑、室内
- 定焦镜头（35mm、50mm、85mm）：画质优秀，大光圈

## 其他配件
- 三脚架：长时间曝光必备
- 滤镜：保护镜头，创造特殊效果
- 闪光灯：补充光线，创造光影效果

记住，最好的相机是你经常使用的那一台。不要过分追求器材，技术和创意才是关键。`,
        category: '器材评测',
        tags: '相机,镜头,器材,选购'
    }
];

// 添加示例文章
function addSampleArticles() {
    console.log('开始添加摄影示例文章...');
    
    // 首先获取管理员用户ID
    db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, admin) => {
        if (err) {
            console.error('获取管理员用户失败:', err);
            db.close();
            return;
        }
        
        if (!admin) {
            console.error('未找到管理员用户');
            db.close();
            return;
        }
        
        const adminId = admin.id;
        let articlesAdded = 0;
        
        // 检查是否已有文章
        db.get('SELECT COUNT(*) as count FROM articles', (err, result) => {
            if (err) {
                console.error('检查文章数量失败:', err);
                db.close();
                return;
            }
            
            const existingCount = result.count;
            console.log(`当前已有 ${existingCount} 篇文章`);
            
            // 如果已有文章，询问是否继续
            if (existingCount > 0) {
                console.log('数据库中已有文章，将添加新的示例文章...');
            }
            
            // 添加每篇文章
            photographyArticles.forEach((article, index) => {
                const { title, content, category, tags } = article;
                
                db.run(
                    `INSERT INTO articles (title, content, author_id, category, tags, views, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${index} days'))`,
                    [title, content, adminId, category, tags, Math.floor(Math.random() * 100) + 50],
                    function(err) {
                        if (err) {
                            console.error(`添加文章"${title}"失败:`, err);
                        } else {
                            articlesAdded++;
                            console.log(`✓ 添加文章: ${title}`);
                            
                            // 为每篇文章添加一些示例评论
                            addSampleComments(this.lastID, title);
                        }
                        
                        // 如果是最后一篇文章，关闭数据库
                        if (index === photographyArticles.length - 1) {
                            setTimeout(() => {
                                console.log(`\n完成！成功添加 ${articlesAdded} 篇摄影相关文章`);
                                db.close();
                            }, 1000);
                        }
                    }
                );
            });
        });
    });
}

// 添加示例评论
function addSampleComments(articleId, articleTitle) {
    const sampleComments = [
        { user_name: '摄影爱好者', content: '这篇文章非常实用，对我帮助很大！' },
        { user_name: '新手小白', content: '讲解得很清楚，适合初学者学习。' },
        { user_name: '专业摄影师', content: '很好的总结，有些技巧我也经常使用。' },
        { user_name: '旅行达人', content: '风光摄影的部分特别有用，下次旅行试试看。' }
    ];
    
    sampleComments.forEach((comment, index) => {
        db.run(
            `INSERT INTO comments (article_id, user_name, content, created_at) 
             VALUES (?, ?, ?, datetime('now', '-${index} hours'))`,
            [articleId, comment.user_name, comment.content],
            (err) => {
                if (err) {
                    console.error(`为文章"${articleTitle}"添加评论失败:`, err);
                }
            }
        );
    });
}

// 运行脚本
addSampleArticles();
