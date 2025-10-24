const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const db = require('../database/connection');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/register - Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'contributor' } = req.body;

    await ensureUsersColumns();

    // Vérifier que tous les champs sont fournis
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      });
    }

    // Vérifier le rôle
    if (!['contributor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rôle invalide' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà' 
      });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Déterminer l'identifiant (id TEXT) — utiliser l'email
    const userId = String(email).trim();

    // Créer l'utilisateur
    await db.execute(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, role]
    );

    // Générer un token de vérification email
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await db.execute(
      'UPDATE users SET email_verification_token = ?, email_verification_expires = ?, email_verified = 0 WHERE id = ?',
      [verificationToken, expiresAt, userId]
    );

    // Envoyer l'email de vérification (via Ethereal/nodemailer)
    let previewUrl = null;
    try {
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
      const apiBase = process.env.API_URL || 'http://localhost:5001';
      const verifyUrl = `${apiBase}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;

      // charge nodemailer si installé
      const nodemailer = require('nodemailer');
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      const info = await transporter.sendMail({
        from: 'Lokali <no-reply@lokali.dev>',
        to: email,
        subject: 'Vérifiez votre email',
        text: `Bienvenue sur Lokali! Cliquez pour vérifier votre email: ${verifyUrl}`,
        html: `<p>Bienvenue sur Lokali!</p><p><a href="${verifyUrl}">Vérifier mon email</a></p>`
      });
      previewUrl = nodemailer.getTestMessageUrl(info);
    } catch (e) {
      previewUrl = null;
    }

    res.status(201).json({
      success: true,
      message: 'Compte créé. Un email de vérification a été envoyé.',
      data: {
        user: { id: userId, username, email, role, email_verified: 0 },
        previewUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login - Connexion email uniquement
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    // Trouver l'utilisateur par email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (!users || users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = users[0];

    // Vérifier la vérification d'email
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Veuillez vérifier votre email avant de vous connecter.'
      });
    }

    // Vérifier la présence d'un mot de passe
    if (!user.password_hash) {
      return res.status(401).json({ 
        success: false, 
        message: 'Aucun mot de passe défini pour ce compte. Veuillez définir ou réinitialiser votre mot de passe.' 
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiant ou mot de passe incorrect' 
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username || null, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: { 
          id: user.id, 
          username: user.username || null, 
          email: user.email,
          role: user.role 
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/profile - Profil utilisateur
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/profile - Mettre à jour le profil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const [existingUser] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
    }

    // Mettre à jour le profil
    const [result] = await db.execute(
      'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email) WHERE id = ?',
      [username, email, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/change-password - Changer le mot de passe
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    await ensureUsersColumns();
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mot de passe actuel et nouveau mot de passe requis' 
      });
    }

    // Récupérer le mot de passe actuel
    const [users] = await db.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mot de passe actuel incorrect' 
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await db.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ajouts pour OTP (SMS/Email)
const axios = require('axios');
let nodemailer; // chargé à la volée si disponible

const ensureOtpSchema = async () => {
  // Crée les tables OTP si elles n'existent pas
  const createSql = `
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      email TEXT,
      otp_hash TEXT NOT NULL,
      delivery TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
    CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
  `;
  await db.exec(createSql);
};

const isValidPhone = (phone) => /^01\d{8}$/.test(String(phone || '').trim());

// S'assure que les colonnes username et password_hash existent dans users
const ensureUsersColumns = async () => {
  const [cols] = await db.execute("PRAGMA table_info(users)");
  const names = cols.map(c => c.name);
  const statements = [];
  if (!names.includes('username')) statements.push("ALTER TABLE users ADD COLUMN username TEXT");
  if (!names.includes('password_hash')) statements.push("ALTER TABLE users ADD COLUMN password_hash TEXT");
  if (!names.includes('email_verified')) statements.push("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0");
  if (!names.includes('email_verification_token')) statements.push("ALTER TABLE users ADD COLUMN email_verification_token TEXT");
  if (!names.includes('email_verification_expires')) statements.push("ALTER TABLE users ADD COLUMN email_verification_expires INTEGER");
  for (const stmt of statements) {
    await db.exec(stmt + ';');
  }
};

// Demande d'OTP
router.post('/request-otp', async (req, res) => {
  try {
    await ensureOtpSchema();
    const { phone, email, delivery = 'sms' } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Numéro invalide. Format: 01xxxxxxxx' });
    }
    if (delivery !== 'sms' && delivery !== 'email') {
      return res.status(400).json({ success: false, message: 'Méthode de livraison invalide (sms|email)' });
    }

    // Génération OTP: 6 chiffres
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(code, 10);

    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const createdAt = Date.now();

    await db.execute(
      'INSERT INTO otp_codes (phone, email, otp_hash, delivery, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [phone.trim(), (email || null), otpHash, delivery, expiresAt, createdAt]
    );

    // Envoi OTP
    let sent = false;
    let transportInfo = null;

    if (delivery === 'sms') {
      try {
        const key = process.env.TEXTBELT_KEY || 'textbelt'; // gratuit: limité
        const message = `Votre code OTP Lokali: ${code}`;
        const response = await axios.post('https://textbelt.com/text', { phone, message, key });
        sent = !!response.data?.success;
      } catch (e) {
        sent = false;
      }
    } else if (delivery === 'email' && email) {
      try {
        // charge nodemailer si installé
        nodemailer = nodemailer || require('nodemailer');
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        const info = await transporter.sendMail({
          from: 'Lokali <no-reply@lokali.dev>',
          to: email,
          subject: 'Votre code OTP',
          text: `Votre code OTP Lokali: ${code}`,
        });
        transportInfo = nodemailer.getTestMessageUrl(info);
        sent = true;
      } catch (e) {
        sent = false;
      }
    }

    // Toujours loguer pour dév
    console.log('[OTP] phone=', phone, 'code=', code, 'delivery=', delivery, 'email=', email, 'previewUrl=', transportInfo);

    return res.json({
      success: true,
      message: sent ? `OTP envoyé par ${delivery}` : `OTP généré (envoi ${delivery} non disponible)`,
      data: { delivery, phone, email, previewUrl: transportInfo || null }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vérification OTP et création/connexion de l'utilisateur
router.post('/verify-otp', async (req, res) => {
  try {
    await ensureOtpSchema();
    await ensureUsersColumns();
    const { phone, code, email, firstName, lastName, password, role = 'contributor' } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Numéro invalide. Format: 01xxxxxxxx' });
    }
    if (!code || String(code).length !== 6) {
      return res.status(400).json({ success: false, message: 'Code OTP invalide' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Mot de passe requis (≥ 6 caractères)' });
    }
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Prénom et nom requis' });
    }
    if (!['contributor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    const [rows] = await db.execute(
      'SELECT * FROM otp_codes WHERE phone = ? ORDER BY created_at DESC LIMIT 1',
      [phone.trim()]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun OTP trouvé pour ce numéro' });
    }

    const otp = rows[0];
    if (Date.now() > otp.expires_at) {
      return res.status(400).json({ success: false, message: 'OTP expiré' });
    }

    const isMatch = await bcrypt.compare(String(code), otp.otp_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'OTP incorrect' });
    }

    // Créer/Mettre à jour l'utilisateur dans la table users
    const userId = phone.trim(); // Utiliser le téléphone comme identifiant TEXT
    const normalizedEmail = (email && String(email).trim()) || `${userId}@otp.lokali`;
    const username = [String(firstName || '').trim(), String(lastName || '').trim()].filter(Boolean).join(' ') || null;

    // Hash du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(String(password), saltRounds);

    await db.execute(
      'INSERT OR IGNORE INTO users (id, email, role) VALUES (?, ?, ?)',
      [userId, normalizedEmail, role]
    );
    await db.execute(
      'UPDATE users SET username = ?, password_hash = ?, email = ? WHERE id = ?',
      [username, hashedPassword, normalizedEmail, userId]
    );

    // Générer le token JWT
    const token = jwt.sign(
      { id: userId, username, email: normalizedEmail, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'OTP validé, utilisateur connecté',
      data: {
        user: { id: userId, username, email: normalizedEmail, role },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ... existing code ...
// GET /api/auth/verify-email - Vérifie l’email via lien
router.get('/verify-email', async (req, res) => {
  try {
    await ensureUsersColumns();

    const { email, token } = req.query;
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Email et token requis' });
    }

    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }
    const user = rows[0];

    if (!user.email_verification_token || user.email_verification_token !== token) {
      return res.status(401).json({ success: false, message: 'Token invalide' });
    }
    if (!user.email_verification_expires || Date.now() > Number(user.email_verification_expires)) {
      return res.status(410).json({ success: false, message: 'Token expiré' });
    }

    await db.execute(
      'UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
      [user.id]
    );

    return res.status(200).json({ success: true, message: 'Email vérifié. Vous pouvez vous connecter.' });
  } catch (error) {
    console.error('Erreur verify-email:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = { router, authenticateToken };
