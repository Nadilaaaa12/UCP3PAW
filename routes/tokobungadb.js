const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database


// Fungsi untuk menambahkan stok produk baru
const addStok = (namapaket, stok, harga, callback) => {
    db.query(
        'INSERT INTO produk (namapaket, stok, harga) VALUES (?, ?, ?)',
        [namapaket, stok, harga],
        (err, results) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            callback(null, results.insertId);  // Mengembalikan ID dari stok yang baru ditambahkan
        }
    );
};

// Fungsi untuk melihat semua stok produk
const getStok = (callback) => {
    db.query('SELECT * FROM produk', (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

// Fungsi untuk memperbarui stok produk
const updateStok = (id, namapaket, stok, harga, callback) => {
    db.query(
        'UPDATE produk SET namapaket = ?, stok = ?, harga = ? WHERE id = ?',
        [namapaket, stok, harga, id],
        (err, results) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            if (results.affectedRows === 0) {
                return callback(new Error('Produk tidak ditemukan'), null);
            }
            callback(null, results);
        }
    );
};

// Fungsi untuk menghapus stok produk
const deleteStok = (id, callback) => {
    db.query('DELETE FROM produk WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        if (results.affectedRows === 0) {
            return callback(new Error('Produk tidak ditemukan'), null);
        }
        callback(null, results);
    });
};

// Fungsi untuk melihat semua pesanan
const getPesanan = (callback) => {
    db.query('SELECT * FROM order', (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

// Fungsi untuk menghapus pesanan berdasarkan ID
const deletePesanan = (id, callback) => {
    db.query('DELETE FROM order WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        if (results.affectedRows === 0) {
            return callback(new Error('Pesanan tidak ditemukan'), null);
        }
        callback(null, results);
    });
};

module.exports = {
    addStok,
    getStok,
    updateStok,
    deleteStok,
    getPesanan,
    deletePesanan
};
