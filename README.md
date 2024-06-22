# Khodam Web Application

Khodam Web Application adalah sebuah aplikasi web yang memungkinkan pengguna untuk mengunggah foto mereka dan mendapatkan hasil Khodam yang unik dan personal. Pengguna juga dapat membagikan hasilnya di media sosial.

## Fitur

- Unggah foto dan dapatkan hasil Khodam
- Bagikan hasil Khodam di Facebook, Instagram, dan WhatsApp
- Lihat total tampilan halaman
- Halaman 404 yang menarik

## Teknologi yang Digunakan

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Lainnya: Multer untuk upload file, dotenv untuk manajemen konfigurasi, dan CDN untuk penyimpanan foto

## Instalasi

1. Clone repository ini:
    ```bash
    git clone https://github.com/SazumiVicky/cek-khodam.git
    cd cek-khodam
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Buat file `.env` di root directory dan tambahkan konfigurasi berikut:
    ```env
    MONGODB_URI=your_mongodb_uri
    PORT=3000
    ```

4. Jalankan aplikasi:
    ```bash
    npm start
    ```

5. Buka browser dan akses `http://localhost:3000`

## Struktur Proyek

```
khodam-web-app/
├── public/
│   ├── index.html
│   ├── 404.html
│   ├── share.html
│   ├── styles.css
│   ├── script.js
├── khodam/
│   ├── list.txt
├── .gitignore
├── Dockerfile
├── package.json
├── server.js
└── README.md
```

## API Endpoints

- `POST /submit`: Mengunggah foto dan mendapatkan hasil Khodam
- `GET /share/:id`: Mendapatkan halaman share berdasarkan ID
- `GET /share-data/:id`: Mendapatkan data share berdasarkan ID
- `GET /total-views`: Mendapatkan total tampilan halaman

## Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan fork repository ini dan buat pull request dengan perubahan Anda.

## Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Lihat file [LICENSE](LICENSE) untuk informasi lebih lanjut.

## Kontak

Jika Anda memiliki pertanyaan atau saran, silakan hubungi saya di [root@sazumi.moe](mailto:root@sazumi.moe).
