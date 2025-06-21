document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const imageUrl = document.getElementById('imageUrl');
    const copyBtn = document.getElementById('copyBtn');
    const uploadAgainBtn = document.getElementById('uploadAgain');
    const MAX_SIZE = 4.5 * 1024 * 1024;
    
    resultDiv.style.display = 'none';
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });
    
    copyBtn.addEventListener('click', copyToClipboard);
    
    uploadAgainBtn.addEventListener('click', resetUploader);
    
    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showError('Hanya file gambar yang diizinkan');
            return;
        }
        
        if (file.size > MAX_SIZE) {
            showError('Ukuran file melebihi 4.5 MB');
            return;
        }
        
        const originalContent = uploadArea.innerHTML;
        uploadArea.innerHTML = '<div class="uploading">Mengunggah...</div>';
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            const fullUrl = `${window.location.origin}/${data.id}`;
            imageUrl.value = fullUrl;
            resultDiv.style.display = 'block';
            
        } catch (error) {
            showError(`Gagal mengunggah: ${error.message}`);
        }
    }
    
    function copyToClipboard() {
        imageUrl.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Disalin';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }
    
    function resetUploader() {
        fileInput.value = '';
        resultDiv.style.display = 'none';
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        uploadArea.innerHTML = '';
        uploadArea.appendChild(errorDiv);
        
        setTimeout(() => {
            uploadArea.innerHTML = `
                <input type="file" id="fileInput" accept="image/*">
                <label for="fileInput" class="upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Pilih gambar atau seret ke sini</span>
                    <small>Maksimal 4.5 MB</small>
                </label>
            `;
            
            fileInput.addEventListener('change', handleFileSelect);
        }, 3000);
    }
});
