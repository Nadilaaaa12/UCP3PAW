const express = require("express");
const db = require("../database/db");
const router = express.Router();

// Get semua produk
router.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).send("Gagal memuat data produk");
        res.json(results);
    });
});

// Get semua pesanan
router.get("/orders", (req, res) => {
    db.query("SELECT * FROM orders", (err, results) => {
        if (err) return res.status(500).send("Gagal memuat data pesanan");
        res.json(results);
    });
});

// Tambah pesanan
router.post("/orders", (req, res) => {
    const { namapaket, jumlah } = req.body;

    // Validasi input
    if (!namapaket || !jumlah) {
        return res.status(400).send("Nama paket dan jumlah harus diisi");
    }

    // Cek stok produk
    db.query("SELECT * FROM products WHERE namapaket = ?", [namapaket], (err, results) => {
        if (err) return res.status(500).send("Gagal memeriksa stok produk");
        if (results.length === 0) return res.status(404).send("Produk tidak ditemukan");

        const product = results[0];
        if (product.stok < jumlah) return res.status(400).send("Stok tidak mencukupi");

        const totalHarga = product.harga * jumlah;

        // Simpan pesanan
        db.query(
            "INSERT INTO orders (namapaket, jumlah, total_harga) VALUES (?, ?, ?)",
            [namapaket, jumlah, totalHarga],
            (err, result) => {
                if (err) return res.status(500).send("Gagal menambah pesanan");

                // Kurangi stok produk
                db.query(
                    "UPDATE products SET stok = stok - ? WHERE namapaket = ?",
                    [jumlah, namapaket],
                    (err) => {
                        if (err) return res.status(500).send("Gagal mengurangi stok produk");
                        res.status(201).send("Pesanan berhasil ditambahkan");
                    }
                );
            }
        );
    });
});

module.exports = router;
