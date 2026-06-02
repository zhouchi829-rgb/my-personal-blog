// 为文章添加示例图片
const db = require('./database');

// 文章ID和对应的图片URL
const articleImages = {
    6: { // 摄影入门：掌握基础构图技巧
        images: [
            '![黄金分割构图示例](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![对称构图示例](https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![引导线构图示例](https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)'
        ]
    },
    7: { // 风光摄影：捕捉大自然的壮丽
        images: [
            '![日出风光](https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![山脉风光](https://images.unsplash.com/photo-1464278533981-50106e6176b1?ixlib=rb-4.0.3&auto=format&fit=crop&w-1350&q=80)',
            '![湖泊倒影](https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)'
        ]
    },
    10: { // 人像摄影：捕捉人物的情感与个性
        images: [
            '![人像摄影示例](https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![环境人像](https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![黑白人像](https://images.unsplash.com/photo-1542131596-dea5384842c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)'
        ]
    },
    11: { // 街头摄影：记录城市的脉搏
        images: [
            '![街头摄影示例](https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![城市光影](https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![街头瞬间](https://images.unsplash.com/photo-1494522358652-c549345d2c9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)'
        ]
    },
    9: { // 后期处理：让照片更出彩
        images: [
            '![后期处理对比](https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![色彩调整示例](https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)'
        ]
    },
    8: { // 器材选择：找到适合你的相机
        images: [
            '![摄影器材](https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)',
            '![相机镜头](https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80)'
        ]
    }
};

// 更新文章内容，添加图片
function updateArticlesWithImages() {
    console.log('开始为文章添加示例图片...');
    
    Object.keys(articleImages).forEach(articleId => {
        const { images } = articleImages[articleId];
        
        // 获取当前文章内容
        db.get('SELECT content FROM articles WHERE id = ?', [articleId], (err, row) => {
            if (err) {
                console.error(`获取文章 ${articleId} 内容失败:`, err);
                return;
            }
            
            if (!row) {
                console.error(`文章 ${articleId} 不存在`);
                return;
            }
            
            let content = row.content;
            
            // 检查是否已经添加过图片
            if (content.includes('![')) {
                console.log(`文章 ${articleId} 已包含图片，跳过`);
                return;
            }
            
            // 在内容末尾添加图片
            const imagesText = '\n\n## 示例图片\n' + images.join('\n\n');
            const newContent = content + imagesText;
            
            // 更新文章内容
            db.run('UPDATE articles SET content = ? WHERE id = ?', [newContent, articleId], function(err) {
                if (err) {
                    console.error(`更新文章 ${articleId} 失败:`, err);
                } else {
                    console.log(`文章 ${articleId} 更新成功，添加了 ${images.length} 张图片`);
                }
            });
        });
    });
}

// 运行更新
updateArticlesWithImages();

// 10秒后关闭数据库连接
setTimeout(() => {
    console.log('图片添加完成');
    process.exit(0);
}, 10000);
