const express = require('express')
const app = express()
const port = 3000

// 1. Import library pg (ambil Pool nya)
const { Pool } = require('pg')

// 2. Setup koneksi (Pool)
// Note: User default postgres biasanya 'postgres' bukan 'root', dan butuh password.
const pool = new Pool({
    user: 'postgres',           // User database (dari screenshot)
    host: 'localhost',          // Host (dari screenshot)
    database: 'temuevent-master', // Database yang ingin digunakan
    password: 'postgres',  // Password yang tersimpan di DBeaver
    port: 5444,                 // Port dari screenshot (bukan 5432!)
})

// 3. Cek Koneksi
// Pool menggunakan method connect(callback) atau query
pool.connect((err, client, release) => {
    if (err) {
        // Jika error
        console.log("Database gagal terhubung bang", err)
        return
    }

    // Jika sukses
    console.log("Connected to PostgreSQL!")

    // Selalu lepas koneksi (release) kalau pakai method connect
    release()
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})