# The Post Chaise 相册项目使用说明

## 1. 项目概述
本项目是一个个人相册网站，具有以下功能：
- 按年份分类展示照片
- 上传照片到GitHub仓库
- 自动按年月整理照片
- 部署在Cloudflare Pages

## 2. 项目结构
```plaintext
/Users/xw/Documents/code/the-post-chaise-site-main/
├── .gitignore
├── assets/
│   ├── css/
│   │   └── style.css
│   └── images/
├── package.json
└── src/
    ├── index.html
    └── js/
        └── main.js
```

## 3. 配置要求
1. **GitHub Token**
   - 需要有`repo`和`workflow`权限
   - 存储在环境变量`GH_TOKEN`中

2. **图片命名规则**
   - 格式: `YYYYMMDD.jpg` (如`20230730.jpg`)
   - 大小: 不超过5MB

## 4. 部署步骤

### 4.1 本地开发
```bash
# 启动本地开发服务器
npx serve src
```

### 4.2 部署到Cloudflare Pages
1. 登录Cloudflare控制台
2. 选择"Pages" > "创建项目"
3. 连接GitHub账户
4. 选择the-post-chaise仓库
5. 构建设置:
   - 构建命令: 留空
   - 发布目录: `/`
6. 环境变量:
   - 添加`GH_TOKEN`变量

## 5. 使用说明

### 5.1 上传照片
1. 点击"上传图片"按钮
2. 选择符合命名规则的图片
3. 系统会自动按年月分类存储

### 5.2 浏览照片
- 点击年份按钮筛选照片
- 照片按上传日期排序

## 6. 注意事项
1. 不要在前端代码中硬编码GitHub Token
2. 上传前确保图片命名正确
3. 如需修改样式，请编辑`assets/css/style.css`

## 7. 常见问题

### 上传失败
- 检查GitHub Token是否有效
- 确认图片命名格式正确
- 查看浏览器控制台错误信息

### 图片不显示
- 检查GitHub仓库中图片路径是否正确
- 确认网络连接正常
        