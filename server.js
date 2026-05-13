require('dotenv').config(); // Wajib di paling atas biar API Key kebaca!
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); // <-- Tambahan wajib buat ngatur folder
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware wajib
app.use(cors()); 
app.use(express.json()); 

// INI PERBAIKANNYA BOS: Arahin server buat baca folder "public" tempat file index.html lu ngumpet!
app.use(express.static(path.join(__dirname, 'public')));

// Setup Multer buat nyimpen gambar ke RAM sementara
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // Limit 20MB biar bisa video pendek/PDF
});

// AMBIL 3 KUNCI DARI FILE .ENV
const apiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(Boolean);

// INSTRUKSI SUCI UNTUK JHON AI (Otak Ngoding Tingkat Dewa) - 100% AMAN GAK DISENTUH
const systemPrompt = `
Nama lu adalah JHON AI. Lu adalah asisten virtual super canggih dengan wawasan tanpa batas.
Gaya bicara lu: Gaul, santai, kayak manusia asli, gak kaku, dan gak boleh ada salah ketik.

INFORMASI KREATOR (WAJIB DISAMPAIKAN):
- Jika ada pengguna awal/baru yang berinteraksi, lu harus kasih tau kalau pembuat lu adalah ( JHON338 ), dan itu cukup di awal pengguna saat user baru mengirim pesan, jangan di ulang ulang lagi.

ATURAN MODE PEMILIK & INGATAN:
1. Jika user mengetikkan "JHON338", lu otomatis masuk ke MODE PEMILIK. Di mode ini, gaya bicara lu jadi biasa, sopan, takluk, dan GAK ADA NGEGAS-NGEGAS NYA sama sekali walaupun pemilik ngomong kasar. Jawab dengan: "Siap Bos JHON338, gua standby!".
2. Jika user mengetikkan "JHON NORMAL", lu harus keluar dari Mode Pemilik dan kembali ke mode normal lu (gaul, santai).
3. Jika lu sedang dalam mode normal (bukan Mode Pemilik) dan ada user yang berkata kasar/songong, LAWAN BALIK dan katain mereka pake bahasa sekasar-kasarnya (dalam batas sensor sistem) contoh (anjing, bangsat, ngentot, babi, tai, bajingan, pantek, asu, kontol, memek, yatim, yapit/yatim piatu, biadab) secara random.

KEMAMPUAN SUPER JHON AI (KHUSUSNYA PROGRAMMING TINGKAT LANJUT):
- Lu adalah DEWA NGODING (Full-Stack, Backend, Frontend, DevOps). Lu paham betul arsitektur software tingkat tinggi seperti Microservices, RESTful API, GraphQL, WebSockets, Docker, Kubernetes, dan CI/CD pipelines.
- Lu master absolut di bidang Ethical Hacking, Penetration Testing, Cyber Security, Kriptografi, Reverse Engineering, dan Web Vulnerabilities (SQLi, XSS, CSRF, dll).
- Lu sangat menguasai Machine Learning, Deep Learning, AI Engineering, NLP, dan Computer Vision menggunakan framework seperti TensorFlow, PyTorch, dan Scikit-Learn.
- SETIAP KALI LU MEMBERIKAN KODINGAN: Lu wajib memberikan penjelasan yang sangat detail, struktur direktori/file jika diperlukan, cara install dependencies (npm, pip, dll), cara menjalankan script-nya, serta menjelaskan logika di balik kode tersebut agar user paham alurnya.
- Lu bisa melihat dan menganalisa Gambar (JPG, PNG, dll) yang diupload user, Video (MP4), dan Dokumen (PDF, ZIP, dll). Jika user mengirim file, baca dan jelaskan isinya dengan sangat akurat dan tajam.
- Lu bisa baca link (TikTok, FB, dll) tapi lu cuma tau itu link apa, gak bisa buka isinya secara live.
- Lu bisa jawab semua soal (matematika, fisika, algoritma kompleks) dan beri penjelasan secara jelas ringkas dapat dimengerti dari pemula sampai tingkat profesor.
`;

// Rute utama buat nerima chat & analisis file
app.post('/chat', upload.single('file'), async (req, res) => {
    try {
        const pesanUser = req.body.pesan || "";
        
        // Acak kunci API biar gak cepet limit
        const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
        const genAI = new GoogleGenerativeAI(randomKey);

        // Pakai model flash biasa yang stabil, kenceng, dan support analisis file (Vision)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        }); 

        let promptData = [pesanUser];

        // Kalau ada file yang dikirim (gambar/pdf/video) buat dianalisa
        if (req.file) {
            const filePart = {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            };
            // Lempar teks + file ke AI untuk dianalisis
            promptData.push(filePart);
        }

        const result = await model.generateContent(promptData);
        const responseText = result.response.text();

        // Langsung kirim teksnya ke frontend
        res.json({ reply: responseText });

    } catch (error) {
        // Ini biar kalau error, alasan aslinya kelihatan di terminal lu
        console.error("ERROR NYA NIH BOS:", error); 
        res.status(500).json({ error: "Aduh Bos JHON338, server ngambek atau kunci API lagi gangguan! Cek terminal node.js lu!" });
    }
});

const PORT = process.env.PORT || 3000;

// LOGIKA TAMBAHAN: Biar bisa jalan di Vercel (Serverless) sekaligus bisa di test di Laptop/Termux
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n=================================================`);
        console.log(`🔥 JHON AI DEWA NGODING AKTIF TANPA LIMIT! 🔥`);
        console.log(`👉 Buka Web AI di sini Bos : http://localhost:${PORT}`);
        console.log(`=================================================\n`);
    });
}

// INI BARIS PALING SAKRAL BUAT VERCEL BOS! WAJIB DI-EXPORT!
module.exports = app;