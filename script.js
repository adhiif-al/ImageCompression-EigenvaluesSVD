// ─── TAB SWITCHING ───────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ─── SLIDER ──────────────────────────────────────────────────────
const rateSlider = document.getElementById('comprRate');
const rateVal    = document.getElementById('rateVal');
rateSlider.addEventListener('input', () => {
  rateVal.textContent = rateSlider.value + '%';
  updateSliderFill();
});
function updateSliderFill() {
  const pct = (rateSlider.value - rateSlider.min) / (rateSlider.max - rateSlider.min) * 100;
  rateSlider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--border) ${pct}%)`;
}
updateSliderFill();

// ─── FILE INPUT ──────────────────────────────────────────────────
const fileInput  = document.getElementById('fileInput');
const dropzone   = document.getElementById('dropzone');
const compressBtn = document.getElementById('compressBtn');
let selectedFile = null;
let origDataURL  = null;

fileInput.addEventListener('change', e => { handleFile(e.target.files[0]); });

dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', ()=> dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault(); dropzone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) { showError('File bukan gambar yang valid.'); return; }
  hideError();
  selectedFile = file;
  compressBtn.disabled = false;

  const reader = new FileReader();
  reader.onload = ev => {
    origDataURL = ev.target.result;
    dropzone.querySelector('strong').textContent = `✅ ${file.name} (${formatBytes(file.size)})`;
    dropzone.querySelector('p').textContent = `${file.type} · siap dikompres`;
  };
  reader.readAsDataURL(file);
}

// ─── API CALL TO PYTHON BACKEND ─────────────────────────────────
compressBtn.addEventListener('click', startCompression);

async function startCompression() {
  if (!selectedFile) return;
  hideError();

  // UI state
  compressBtn.disabled = true;
  compressBtn.innerHTML = '<div class="spinner"></div><span>Memproses…</span>';
  document.getElementById('progressWrap').classList.add('show');
  document.getElementById('resultSection').classList.remove('show');

  const outFormat = document.getElementById('outFormat').value.toLowerCase();
  
  // Menyiapkan Payload ke Server
  const formData = new FormData();
  formData.append('image', selectedFile);
  formData.append('rate', rateSlider.value);
  formData.append('colorMode', document.getElementById('colorMode').value);
  formData.append('outFormat', outFormat);

  try {
    setProgress(30, 'Mengirim gambar ke server Python...');
    
    // FETCH REQUEST KE SERVER FLASK PYTHON
    const response = await fetch('http://127.0.0.1:5000/compress', {
      method: 'POST',
      body: formData
    });

    setProgress(75, 'Menerima dan merekonstruksi hasil kompresi...');
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Terjadi kesalahan pada server');
    }

    const data = await response.json();
    
    // Mengambil properties hasil response backend
    const k = data.k;
    const runtimeMs = data.runtime_ms;
    const outDataURL = data.image_base64;

    // Dapatkan rasio data dari ukuran original image
    const img = await loadImg(origDataURL);
    const W = img.width, H = img.height;
    const compressionPct = parseInt(rateSlider.value) / 100;
    
    // Perhitungan formula Rasio Data
    const dataRatio  = (k * (H + W + 1)) / (H * W) * 100;

    setProgress(100, 'Selesai!');
    await new Promise(r => setTimeout(r, 300));

    // UPDATE UI
    document.getElementById('origImg').src  = origDataURL;
    document.getElementById('compImg').src  = outDataURL;
    document.getElementById('origInfo').textContent = `${W}×${H} · ${formatBytes(selectedFile.size)}`;
    document.getElementById('compInfo').textContent = `${W}×${H} · k=${k} nilai singular`;

    document.getElementById('statRate').textContent    = compressionPct < 0.5 ? 'Tinggi' : compressionPct < 0.8 ? 'Sedang' : 'Rendah';
    document.getElementById('statRuntime').textContent = runtimeMs > 1000 ? (runtimeMs/1000).toFixed(2)+'s' : runtimeMs+'ms';
    document.getElementById('statData').textContent    = dataRatio.toFixed(1)+'%';
    document.getElementById('statK').textContent       = k;

    const dlBtn = document.getElementById('downloadBtn');
    dlBtn.href     = outDataURL;
    dlBtn.download = `compressed_${k}k.${outFormat}`;

    document.getElementById('progressWrap').classList.remove('show');
    document.getElementById('resultSection').classList.add('show');

    if (!document.getElementById('showCompare').checked) {
      document.getElementById('compareGrid').style.display = 'none';
    } else {
      document.getElementById('compareGrid').style.display = '';
    }

  } catch(e) {
    showError('Koneksi ke backend gagal: ' + e.message + ' (Pastikan app.py Flask berjalan)');
    document.getElementById('progressWrap').classList.remove('show');
  }

  compressBtn.disabled = false;
  compressBtn.innerHTML = '<span>🗜️ Kompres Gambar</span>';
}

// ─── RESET ───────────────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  selectedFile = null; origDataURL = null; fileInput.value = '';
  compressBtn.disabled = true;
  document.getElementById('resultSection').classList.remove('show');
  document.getElementById('progressWrap').classList.remove('show');
  dropzone.querySelector('strong').textContent = 'Pilih atau drag gambar di sini';
  dropzone.querySelector('p').textContent = 'Mendukung JPG, PNG, BMP, TIFF, GIF, WEBP (RGB, RGBA, L, CMYK, PA)';
  hideError();
});

// ─── HELPERS ─────────────────────────────────────────────────────
function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src;
  });
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024*1024) return (b/1024).toFixed(1) + ' KB';
  return (b/1024/1024).toFixed(2) + ' MB';
}

function setProgress(pct, msg) {
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('statusMsg').textContent = msg;
}

function showError(msg) {
  const el = document.getElementById('errorMsg'); el.textContent = msg; el.classList.add('show');
}
function hideError() { document.getElementById('errorMsg').classList.remove('show'); }