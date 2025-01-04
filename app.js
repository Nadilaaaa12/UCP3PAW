const express = require('express');
const path = require('path'); // Tambahkan require('path')
const app = express();
const db = require('./database/db'); // Koneksi ke database
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session'); 
require('dotenv').config();

app.use(expressLayouts);
app.set('layout', 'layouts/main-layout'); // Mengatur layout default
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); 

// Simulasi database pengguna
const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'user', password: 'user123', role: 'pelanggan' }
];

// Middleware untuk sesi
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware autentikasi
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

const isRole = (role) => (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
        return next();
    }
    res.redirect('/login');
};

// Rute Login
app.get('/', (req, res) => {
    res.render('login', {
        layout: 'layouts/main-layout'
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username dan password tidak boleh kosong');
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user;

        // Arahkan berdasarkan role
        if (user.role === 'admin') {
            return res.redirect('/halamanadmin');
        } else if (user.role === 'pelanggan') {
            return res.redirect('/index');
        }
    } else {
        res.status(401).send('Username atau password salah! <a href="/login">Coba lagi</a>');
    }
});

// Rute untuk logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Terjadi kesalahan saat logout');
        }
        res.redirect('/login');
    });
});

// Rute untuk pelanggan
app.get('/index', isRole('pelanggan'), (req, res) => {
    res.render('index');
});

app.get('/produkpelanggan', isRole('pelanggan'), (req, res) => {
    db.query('SELECT * FROM `produk`', (err, produk) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).send('Terjadi kesalahan pada server');
        }
        res.render('produkpelanggan', {
            layout: 'layouts/main-layout',
            produk: produk
        });
    });
});

// Rute untuk melihat daftar order (pelanggan)
app.get('/order', isRole('pelanggan'), (req, res) => {
    const user = req.session.user; // Mendapatkan info user yang sedang login
    const query = 'SELECT * FROM `order` WHERE `username` = ?'; // Menambahkan backtick pada kolom dan tabel
    
    db.query(query, [user.username], (err, order) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).send('Terjadi kesalahan pada server');
        }
        res.render('order', {
            layout: 'layouts/main-layout',
            order: order
        });
    });
});

// Rute untuk menambah order (pelanggan)
app.post('/order', isRole('pelanggan'), (req, res) => {
    const user = req.session.user; // Mendapatkan info user yang sedang login
    const { namapaket, noTelp } = req.body;

    if (!namapaket || !noTelp) {
        return res.status(400).send('Nama paket dan nomor telepon tidak boleh kosong');
    }

    const query = 'INSERT INTO `order` (`username`, `namapaket`, `noTelp`, `tanggal_pesan`) VALUES (?, ?, ?, NOW())'; // Menambahkan backtick pada kolom dan tabel
    db.query(query, [user.username, namapaket, noTelp], (err, result) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).send('Terjadi kesalahan saat menambah order');
        }
        res.redirect('/order'); // Arahkan kembali ke halaman daftar order
    });
});


// Rute untuk admin
app.get('/halamanadmin', isRole('admin'), (req, res) => {
    res.render('halamanadmin');
});

app.get('/produk', isRole('admin'), (req, res) => {
    db.query('SELECT * FROM `produk`', (err, produk) => {
        if (err) {
            console.error('Database query error:', err.message);
            return res.status(500).send('Terjadi kesalahan pada server');
        }
        res.render('produk', {
            layout: 'layouts/admin-layout',
            produk: produk
        });
    });
});

app.post('/produk', isRole('admin'), (req, res) => {
    const { namapaket, stok, harga } = req.body;

    if (!namapaket || !stok || !harga) {
        return res.status(400).send('Nama paket, stok, dan harga tidak boleh kosong');
    }

    const query = 'INSERT INTO `produk` (`namapaket`, `stok`, `harga`) VALUES (?, ?, ?)'; // Menambahkan backtick pada kolom dan tabel
    db.query(query, [namapaket, stok, harga], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding product');
        }
        res.status(201).json({ id: result.insertId, namapaket, stok, harga });
    });
});

// Menjalankan server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
