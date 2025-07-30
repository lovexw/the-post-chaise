// 照片数据
const photos = [
    { year: '2024', src: 'assets/images/photo1.jpg', alt: 'Photo 1' },
    { year: '2024', src: 'assets/images/photo2.jpg', alt: 'Photo 2' },
    { year: '2025', src: 'assets/images/photo3.jpg', alt: 'Photo 3' },
];

// 渲染照片到画廊
function renderGallery(filterYear = 'all') {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    const filteredPhotos = filterYear === 'all' 
        ? photos 
        : photos.filter(photo => photo.year === filterYear);

    filteredPhotos.forEach(photo => {
        const imgElement = document.createElement('img');
        imgElement.src = photo.src;
        imgElement.alt = photo.alt;
        gallery.appendChild(imgElement);
    });
}

// 从GitHub获取图片数据
async function fetchPhotos() {
    try {
        const response = await fetch('https://api.github.com/repos/[你的用户名]/[你的仓库名]/contents/assets/images');
        const files = await response.json();
        
        return files
            .filter(file => file.name.match(/^\d{8}\.(jpg|jpeg|png|gif)$/))
            .map(file => {
                const dateStr = file.name.split('.')[0];
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(4, 6);
                return {
                    year: year,
                    month: `${year}${month}`,
                    src: file.download_url,
                    alt: `Photo taken on ${year}-${month}-${dateStr.substring(6, 8)}`
                };
            });
    } catch (error) {
        console.error('Error fetching photos:', error);
        return [];
    }
}

// 更新初始化函数
async function init() {
    const photos = await fetchPhotos();
    // 设置年份过滤器点击事件
    document.querySelectorAll('.year-filter button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.year-filter button.active').classList.remove('active');
            button.classList.add('active');
            renderGallery(button.dataset.year);
        });
    });

    // 初始渲染
    renderGallery();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 添加上传功能
// 配置GitHub信息
const GITHUB = {
    username: 'lovexw',
    repo: 'the-post-chaise',
    token: process.env.GH_TOKEN || '', // 从环境变量获取
    branch: 'main',
    folder: 'assets/images'
};

// 完整的图片上传函数
// 上传功能实现
async function uploadToGitHub(file) {
    // 文件类型验证
    if (!file.type.match('image.*')) {
        alert('请上传图片文件');
        return;
    }

    // 文件大小限制(5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
    }

    // 使用文件名作为日期(格式:YYYYMMDD)
    const dateStr = file.name.split('.')[0];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    
    try {
        const content = await toBase64(file);
        const path = `${GITHUB.folder}/${year}/${month}/${file.name}`;
        
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB.username}/${GITHUB.repo}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload ${file.name}`,
                    content: content.split(',')[1],
                    branch: GITHUB.branch
                })
            }
        );

        if (!response.ok) {
            throw new Error('上传失败');
        }
        
        alert('上传成功');
        fetchPhotos(); // 刷新图片列表
    } catch (error) {
        console.error('上传错误:', error);
        alert(`上传失败: ${error.message}`);
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 初始化上传表单
function initUploadForm() {
    const form = document.getElementById('upload-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            await uploadToGitHub(fileInput.files[0]);
        }
    });
}

// 在init函数中调用
async function init() {
    // 获取照片数据并存储到变量中
    let photos = [];
    try {
        photos = await fetchPhotos();
    } catch (error) {
        console.error('获取照片失败:', error);
        // 添加用户友好的错误提示
        alert('无法加载照片，请检查网络连接或稍后再试');
        // 可以在这里添加重试逻辑
        return [];
    }
    // 设置年份过滤器点击事件
    document.querySelectorAll('.year-filter button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.year-filter button.active').classList.remove('active');
            button.classList.add('active');
            renderGallery(button.dataset.year);
        });
    });

    // 初始渲染
    renderGallery();
    initUploadForm();
}