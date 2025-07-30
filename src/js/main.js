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
    username: process.env.GITHUB_USERNAME,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
    branch: 'main',
    folder: 'assets/images'
};

// 完整的图片上传函数
async function uploadToGitHub(file) {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = `${dateStr}.${ext}`;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    return new Promise((resolve, reject) => {
        reader.onload = async () => {
            const content = reader.result.split(',')[1];
            const apiUrl = `https://api.github.com/repos/${GITHUB.username}/${GITHUB.repo}/contents/${GITHUB.folder}/${fileName}`;
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Upload ${fileName}`,
                        content: content,
                        branch: GITHUB.branch
                    })
                });
                
                if (!response.ok) {
                    throw new Error('上传失败');
                }
                
                resolve();
            } catch (error) {
                reject(error);
            }
        };
    });
}

// 更新上传按钮事件处理
document.getElementById('upload-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('photo-upload');
    if (!fileInput.files.length) {
        alert('请选择要上传的图片');
        return;
    }
    
    try {
        await uploadToGitHub(fileInput.files[0]);
        alert('上传成功！');
        // 刷新图片列表
        init();
    } catch (error) {
        console.error('上传错误:', error);
        alert('上传失败: ' + error.message);
    }
});