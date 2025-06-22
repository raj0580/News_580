document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('login-overlay');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const adminPanel = document.getElementById('admin-panel');
    const correctPassword = "newsadmin580";

    const newsForm = document.getElementById('news-form');
    const formTitle = document.getElementById('form-title');
    const postIdInput = document.getElementById('post-id');
    const titleInput = document.getElementById('title');
    const thumbnailInput = document.getElementById('thumbnail');
    const tagsInput = document.getElementById('tags');
    const contentInput = document.getElementById('content');
    const submitButton = document.getElementById('submit-button');
    const clearFormButton = document.getElementById('clear-form-button');
    const postsList = document.getElementById('posts-list');
    const exportButton = document.getElementById('export-json-button');

    let newsData = [];
    
    // --- Login ---
    const checkLogin = () => {
        if (sessionStorage.getItem('isAdmin') === 'true') {
            loginOverlay.style.display = 'none';
            adminPanel.style.display = 'block';
            initializeAdminPanel();
        }
    };

    loginButton.addEventListener('click', () => {
        if (passwordInput.value === correctPassword) {
            sessionStorage.setItem('isAdmin', 'true');
            checkLogin();
        } else {
            alert('Incorrect password!');
        }
    });

    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loginButton.click(); });

    // --- Admin Panel Logic ---
    const initializeAdminPanel = () => {
        loadData();
        newsForm.addEventListener('submit', handleFormSubmit);
        clearFormButton.addEventListener('click', clearForm);
        exportButton.addEventListener('click', exportToJson);
    };

    const loadData = async () => {
        const storedData = localStorage.getItem('newsData');
        if (storedData) {
            newsData = JSON.parse(storedData);
        } else {
            try {
                // CORRECTED PATH: Relative to the root HTML file
                const response = await fetch(`data/newsData.json?v=${new Date().getTime()}`); 
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                newsData = await response.json();
            } catch (error) {
                console.error("Could not fetch initial news data for admin:", error);
                alert("Error: Could not load 'newsData.json'. Please ensure the file exists and you are running this on a local server.");
                newsData = [];
            }
        }
        renderPostsList();
    };

    const saveDataToLocalStorage = () => {
        localStorage.setItem('newsData', JSON.stringify(newsData));
    };

    const renderPostsList = () => {
        postsList.innerHTML = '';
        const sortedData = [...newsData].sort((a, b) => (b.id) - (a.id));
        sortedData.forEach(post => {
            const postItem = document.createElement('div');
            postItem.className = 'post-item';
            postItem.innerHTML = `
                <span>${post.title}</span>
                <div class="post-item-actions">
                    <button class="edit-btn" data-id="${post.id}">Edit</button>
                    <button class="delete-btn" data-id="${post.id}">Delete</button>
                </div>
            `;
            postsList.appendChild(postItem);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const postId = postIdInput.value;
        const post = {
            id: postId ? parseInt(postId) : Date.now(),
            title: titleInput.value,
            // IMPROVED: Strip HTML tags for a cleaner summary
            summary: contentInput.value.replace(/<[^>]+>/g, '').substring(0, 150) + '...',
            content: contentInput.value,
            thumbnail: thumbnailInput.value,
            tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
            date: new Date().toISOString().split('T')[0]
        };

        if (postId) {
            const index = newsData.findIndex(p => p.id == postId);
            newsData[index] = post;
        } else {
            newsData.push(post);
        }

        saveDataToLocalStorage();
        renderPostsList();
        clearForm();
    };

    const clearForm = () => {
        newsForm.reset();
        postIdInput.value = '';
        formTitle.textContent = 'Add New Post';
        submitButton.textContent = 'Add Post';
    };

    const handleEdit = (e) => {
        const postId = e.target.dataset.id;
        const postToEdit = newsData.find(p => p.id == postId);
        if (postToEdit) {
            postIdInput.value = postToEdit.id;
            titleInput.value = postToEdit.title;
            thumbnailInput.value = postToEdit.thumbnail;
            tagsInput.value = postToEdit.tags.join(', ');
            contentInput.value = postToEdit.content;
            formTitle.textContent = 'Edit Post';
            submitButton.textContent = 'Update Post';
            window.scrollTo(0, 0);
        }
    };
    
    const handleDelete = (e) => {
        if (confirm('Are you sure you want to delete this post?')) {
            const postId = e.target.dataset.id;
            newsData = newsData.filter(p => p.id != postId);
            saveDataToLocalStorage();
            renderPostsList();
        }
    };

    const exportToJson = () => {
        const dataStr = JSON.stringify(newsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'newsData.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('newsData.json has been generated! Replace the old file in the /data/ folder with this new one to make your changes live.');
    };
    
    // Initial check
    checkLogin();
});
