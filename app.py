from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import base64
import time

app = Flask(__name__)
# Mengizinkan akses dari frontend lokal
CORS(app) 

def compress_channel(channel_data, k):
    """Fungsi dekomposisi SVD untuk satu channel warna matriks 2D."""
    # Menghitung SVD menggunakan algoritma bawaan numpy
    U, S, Vt = np.linalg.svd(channel_data, full_matrices=False)
    
    # Truncated SVD: Mengambil k nilai singular teratas
    U_k = U[:, :k]
    S_k = np.diag(S[:k])
    Vt_k = Vt[:k, :]
    
    # Rekonstruksi matriks A_k = U_k * S_k * V_k^T
    return np.dot(U_k, np.dot(S_k, Vt_k))

@app.route('/compress', methods=['POST'])
def compress():
    start_time = time.time()
    
    if 'image' not in request.files:
        return jsonify({'error': 'File gambar tidak ditemukan'}), 400

    file = request.files['image']
    # Mengambil persentase kompresi dari frontend (1 - 99%)
    rate_pct = float(request.form.get('rate', 50)) / 100.0
    out_format = request.form.get('outFormat', 'PNG').upper()
    
    try:
        # Buka gambar menggunakan Pillow
        img = Image.open(file)
        
        # Ekstrak mode warna dan konversi jika perlu
        has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
        if has_alpha:
            img_array = np.array(img.convert('RGBA'))
        else:
            img_array = np.array(img.convert('RGB'))

        h, w = img_array.shape[0], img_array.shape[1]
        
        # Menentukan nilai K berdasarkan persentase dari min(tinggi, lebar) [cite: 466, 469]
        k = max(1, int(rate_pct * min(h, w)))

        # Lakukan kompresi SVD pada masing-masing channel RGB
        r_comp = compress_channel(img_array[:, :, 0], k)
        g_comp = compress_channel(img_array[:, :, 1], k)
        b_comp = compress_channel(img_array[:, :, 2], k)

        # Gabungkan kembali channel
        if has_alpha:
            # Pertahankan channel alpha asli tanpa dikompresi agar transparansi tidak rusak
            a_orig = img_array[:, :, 3]
            compressed_array = np.stack((r_comp, g_comp, b_comp, a_orig), axis=2)
        else:
            compressed_array = np.stack((r_comp, g_comp, b_comp), axis=2)

        # Batasi nilai pixel di range 0 - 255
        compressed_array = np.clip(compressed_array, 0, 255).astype(np.uint8)
        compressed_img = Image.fromarray(compressed_array)

        # Menyimpan gambar sementara di memory (BytesIO) untuk dikirim ke Frontend
        img_io = io.BytesIO()
        
        # Format penanganan khusus
        save_fmt = out_format if out_format in ['PNG', 'JPEG', 'BMP', 'WEBP'] else 'PNG'
        if save_fmt == 'JPEG' and compressed_img.mode == 'RGBA':
            compressed_img = compressed_img.convert('RGB')
            
        compressed_img.save(img_io, format=save_fmt)
        img_io.seek(0)
        
        # Hitung runtime algoritma
        runtime_ms = (time.time() - start_time) * 1000
        
        # Encode gambar ke Base64 untuk dikirim via JSON
        img_b64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
        mime_type = f"image/{save_fmt.lower()}"

        return jsonify({
            'k': k,
            'runtime_ms': round(runtime_ms, 1),
            'image_base64': f"data:{mime_type};base64,{img_b64}"
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Berjalan di port 5000 secara default
    app.run(debug=True, port=5000)