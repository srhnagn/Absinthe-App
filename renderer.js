const urlInput = document.getElementById('url-input');
const convertBtn = document.getElementById('convert-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const statusMessage = document.getElementById('status-message');
const subtitle = document.getElementById('subtitle');
const formatRadios = document.querySelectorAll('input[name="format"]');

formatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'mp3') {
            subtitle.textContent = 'Sihirli bir şekilde videoyu sese dönüştür';
        } else {
            subtitle.textContent = 'Sihirli bir şekilde videoları en yüksek kalitede indir';
        }
    });
});

convertBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        statusMessage.textContent = 'Lütfen geçerli bir link girin.';
        statusMessage.style.color = '#ff4444';
        return;
    }

    const format = document.querySelector('input[name="format"]:checked').value;

    // Reset UI
    convertBtn.disabled = true;
    urlInput.disabled = true;
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    statusMessage.textContent = 'Sihir başlıyor... İndiriliyor.';
    statusMessage.style.color = 'var(--text-color)';

    const result = await window.electronAPI.downloadMedia({ url, format });

    if (result.success) {
        statusMessage.textContent = result.message;
        statusMessage.style.color = 'var(--absinthe-green)';
        progressFill.style.width = '100%';
        progressText.textContent = '100%';
    } else {
        statusMessage.textContent = result.message;
        statusMessage.style.color = '#ff4444';
        progressContainer.style.display = 'none';
    }

    convertBtn.disabled = false;
    urlInput.disabled = false;
    urlInput.value = '';
});

window.electronAPI.onProgress((percent) => {
    progressFill.style.width = percent;
    progressText.textContent = percent;
    statusMessage.textContent = 'Dönüştürülüyor...';
});
