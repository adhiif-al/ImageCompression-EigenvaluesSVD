<div align="center">
  <h1 align="center"> PressIMG: PCA & SVD Image Compression</h1>

  <p align="center">
    Web untuk kompresi citra digital berbasis <b>Principal Component Analysis (PCA)</b> dan <b>Singular Value Decomposition (SVD)</b>.
    <br />
    <a href="#-dokumentasi-dan-penggunaan"><strong>Pelajari lebih lanjut »</strong></a>
    <br />
    <br />
    <a href="#-tangkapan-layar">Lihat Demo</a>
    ·
    <a href="#-fitur-utama">Jelajahi Fitur</a>
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white" alt="NumPy" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</div>

---

<details open>
  <summary><b> Daftar Isi</b></summary>
  <ol>
    <li><a href="#-tentang-proyek">Tentang Proyek</a></li>
    <li><a href="#-landasan-teori">Landasan Teori (PCA & SVD)</a></li>
    <li><a href="#-fitur-utama">Fitur Utama</a></li>
    <li><a href="#-teknologi-yang-digunakan">Teknologi yang Digunakan</a></li>
    <li><a href="#-struktur-direktori">Struktur Direktori</a></li>
    <li><a href="#-prasyarat-dan-instalasi">Prasyarat dan Instalasi</a></li>
    <li><a href="#-cara-penggunaan">Cara Penggunaan</a></li>
    <li><a href="#-hasil-eksperimen-dan-analisis">Hasil Eksperimen & Analisis</a></li>
    <li><a href="#-tangkapan-layar">Tangkapan Layar (Screenshots)</a></li>
    <li><a href="#-referensi">Referensi</a></li>
    <li><a href="#-kontributor-tim">Kontributor Tim</a></li>
  </ol>
</details>

---

##  Tentang Proyek

Proyek ini dikembangkan untuk memenuhi **Tugas Project (Tugas ke-2) Mata Kuliah Aljabar Linear Kelas D** pada Program Studi Informatika, Fakultas Teknologi Informasi dan Sains Data, Universitas Sebelas Maret (UNS).

**PressIMG** adalah aplikasi web yang mendemonstrasikan bagaimana konsep aljabar linear, khususnya faktorisasi matriks melalui *Singular Value Decomposition* (SVD), dapat diaplikasikan pada dunia nyata untuk mereduksi ukuran (kompresi) sebuah citra digital tanpa kehilangan struktur visual utamanya.

##  Landasan Teori

Kompresi citra pada aplikasi ini menggunakan pendekatan **Principal Component Analysis (PCA)** yang diimplementasikan melalui **Singular Value Decomposition (SVD)**.

### 1. Representasi Citra sebagai Matriks
Sebuah citra digital beresolusi $M \times N$ piksel direpresentasikan sebagai matriks. Pada citra berwarna (RGB), terdapat 3 matriks dua dimensi terpisah untuk komponen *Red*, *Green*, dan *Blue*. 

### 2. Singular Value Decomposition (SVD)
SVD adalah teknik memfaktorkan matriks $A$ (berukuran $m \times n$) menjadi tiga buah matriks:
> **$A = U \cdot \Sigma \cdot V^T$**

Di mana:
* **$U$**: Matriks ortogonal berukuran $m \times m$ (vektor singular kiri).
* **$\Sigma$**: Matriks diagonal berukuran $m \times n$ yang berisi **nilai singular** (berasal dari akar nilai eigen matriks kovarians) yang diurutkan dari nilai terbesar ke terkecil.
* **$V^T$**: Transpos dari matriks ortogonal berukuran $n \times n$ (vektor singular kanan).

### 3. Truncated SVD (Kompresi)
Nilai singular pada matriks $\Sigma$ yang bernilai besar menyimpan informasi (variansi) paling penting dari citra tersebut. Untuk melakukan kompresi, kita hanya mempertahankan $k$ buah nilai singular terbesar (di mana $k < \min(m, n)$) dan membuang sisanya.
> **$A_k = U_k \cdot \Sigma_k \cdot {V_k}^T$**

Dengan membatasi $k$, ukuran penyimpanan data akan berkurang secara drastis (kompresi) sementara fitur utama gambar masih dapat dipertahankan. Aplikasi ini memampukan pengguna memodifikasi parameter $k$ ini berdasarkan persentase tingkat kompresi (1% - 99%).

---

##  Fitur Utama

-  **Slider Kompresi Dinamis**: Tentukan rasio nilai singular ($k$) yang ingin dipertahankan dengan *slider* (1% hingga 99%).
-  **Pemrosesan Multi-Channel**: Mendukung kompresi citra berwarna (RGB), Grayscale (L), serta menjaga transparansi (RGBA/Alpha Channel).
-  **Asynchronous Processing**: Pemrosesan citra dilakukan di *backend* (Python) tanpa membuat *browser* (UI) menjadi *freeze* atau *hang*.
-  **Statistik Real-time**: Menampilkan metrik seperti *runtime* komputasi (ms), jumlah nilai singular ($k$), dan rasio data yang dikompresi.
-  **Multi-Format Export**: Unduh hasil kompresi ke format PNG, JPEG, BMP, atau WEBP.
-  **Komparasi Side-by-Side**: Bandingkan langsung gambar *original* dan hasil *compressed* dalam satu layar.

---

##  Teknologi yang Digunakan

### Backend (Algoritma & Server)
* **[Python 3](https://www.python.org/)** - Bahasa pemrograman utama.
* **[Flask](https://flask.palletsprojects.com/)** - *Micro-framework* web untuk membuat REST API.
* **[NumPy](https://numpy.org/)** - Library komputasi saintifik untuk operasi matriks aljabar (SVD).
* **[Pillow (PIL)](https://python-pillow.org/)** - Pemrosesan file citra dan konversi ke matriks *array*.

### Frontend (User Interface)
* **HTML5 & CSS3** - Struktur dan gaya antarmuka (*responsive design*).
* **Vanilla JavaScript (ES6)** - Logika interaksi UI dan komunikasi data menggunakan *Fetch API* ke *backend*.

---

##  Struktur Direktori

Sesuai pedoman spesifikasi tugas, struktur repositori/folder diatur sebagai berikut:

```text
NIM_Terkecil/                     # Folder utama proyek (5 digit terakhir NIM)
├── doc/                          # Berisi dokumentasi
│   ├── Laporan_Tubes2_Alin.pdf   # File Laporan Tugas (Bab 1 - 5)
│   └── README.md                 # Dokumentasi ini
├── src/                          # Berisi Source Code Program
│   ├── app.py                    # Backend Flask & Fungsi SVD
│   ├── index.html                # UI Halaman Utama
│   └── script.js                 # Logika JavaScript Frontend
└── test/                         # Berisi Data Uji
    ├── image_bf7f46.png          # Contoh citra uji 1
    ├── foto_pemandangan.jpg      # Contoh citra uji 2
    └── sample_logo.bmp           # Contoh citra uji 3
```
---

<p align="center">
FAUSTINA HELENA AFNY		L0125040 </br>
TSANIYA NURFADHILAH		L0125117 </br>
ALYAA NADHIIFAH			L0125141 </br>
</p>

---

<p align="center">
  <i>Image Compression Website © 2025 — Powered by PCA & SVD</i> 
</p>

