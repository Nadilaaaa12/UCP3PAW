const express = require ('express');
const router = express.Router();
const mysql = require('mysql2');

// **Melihat stok produk**
router.get('/produk', authenticateAdmin, (req, res) => {
    db.query('SELECT * FROM produk', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// **Menambahkan stok baru**
router.post('/produk', authenticateAdmin, (req, res) => {
    const { namapaket, stok, harga } = req.body;
    db.query(
        'INSERT INTO produk (namapaket, stok, harga) VALUES (?, ?, ?)',
        [namapaket, stok, harga],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Stok baru berhasil ditambahkan', id: results.insertId });
        }
    );
});

// **Memperbarui stok produk**
router.put('/produk/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { namapaket, stok, harga } = req.body;

    db.query(
        'UPDATE produk SET namapaket = ?, stok = ?, harga = ? WHERE id = ?',
        [namapaket, stok, harga, id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }
            res.status(200).json({ message: 'Stok berhasil diperbarui' });
        }
    );
});

// **Menghapus stok produk**
router.delete('/produk/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM produk WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    });
});

// **Melihat semua pesanan**
router.get('/order', authenticateAdmin, (req, res) => {
    db.query('SELECT * FROM order', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// **Menghapus pesanan**
router.delete('/order/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM order WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }
        res.status(200).json({ message: 'Pesanan berhasil dihapus' });
    });
});



module.exports = router;
