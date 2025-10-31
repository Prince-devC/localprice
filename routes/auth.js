const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
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

// Middleware pour vérifier un token Supabase et récupérer l'utilisateur
const authenticateSupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token d\'accès requis' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !anonKey) {
      return res.status(500).json({ success: false, message: 'Configuration Supabase manquante' });
    }

    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`;
    const resp = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
      timeout: 10000,
    });

    const supaUser = resp?.data || null;
    if (!supaUser || !supaUser.id) {
      return res.status(403).json({ success: false, message: 'Token Supabase invalide' });
    }

    // Expose richer supabase user info to downstream routes (id, email, metadata)
    req.supabaseUser = {
      id: supaUser.id,
      email: supaUser.email,
      user_metadata: supaUser.user_metadata || {},
      app_metadata: supaUser.app_metadata || {},
    };
    next();
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      return res.status(status).json({ success: false, message: 'Token Supabase invalide ou expiré' });
    }
    return res.status(500).json({ success: false, message: 'Erreur de vérification du token Supabase' });
  }
};

// Middleware hybride: tente Supabase, sinon JWT local
const authenticateAnyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token d\'accès requis' });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && anonKey) {
    try {
      const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`;
      const resp = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
        timeout: 10000,
      });
      const supaUser = resp?.data || null;
      if (supaUser && supaUser.id) {
        req.supabaseUser = {
          id: supaUser.id,
          email: supaUser.email,
          user_metadata: supaUser.user_metadata || {},
          app_metadata: supaUser.app_metadata || {},
        };
        return next();
      }
    } catch (_) {
      // ignore and try JWT fallback
    }
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    // exposer un objet supabaseUser-like pour compat
    req.supabaseUser = req.supabaseUser || {
      id: user.id,
      email: user.email,
      user_metadata: {},
      app_metadata: {},
    };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// POST /api/auth/register - Inscription (username auto-généré unique si absent)
router.post('/register', async (req, res) => {
  try {
    const { username: providedUsername, email, password, role = 'user' } = req.body || {};

    await ensureUsersColumns();

    // Vérifier que les champs requis sont fournis
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    // Vérifier le rôle
    if (!['user', 'contributor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    // Vérifier unicité de l'email
    const [emailExists] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (emailExists && emailExists.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Générer un username unique si non fourni
    const baseRaw = (providedUsername && String(providedUsername)) || String(email).split('@')[0] || 'lokali';
    const base = (baseRaw || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'lokali';
    let username = base;
    // Vérifier unicité du username et ajouter suffixe aléatoire si nécessaire
    const [u0] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (u0 && u0.length > 0) {
      for (let i = 0; i < 5; i++) {
        const suffix = Math.random().toString(36).slice(2, 8);
        username = `${base}-${suffix}`;
        const [uCheck] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (!uCheck || uCheck.length === 0) break;
      }
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
      { id: user.id, username: user.username || null, email: user.email, role: user.role },
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
router.get('/profile', authenticateAnyToken, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.role, u.created_at,
              CASE WHEN bu.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_banned,
              CASE WHEN du.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_deleted
       FROM users u
       LEFT JOIN banned_users bu ON bu.user_id = u.id
       LEFT JOIN deleted_users du ON du.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const payload = users[0];
    res.json({
      success: true,
      data: payload
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/auth/profile - Mettre à jour le profil
router.put('/profile', authenticateAnyToken, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    const { username, email } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const [existingUser] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
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
      [username, email, userId]
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
router.post('/change-password', authenticateAnyToken, async (req, res) => {
  try {
    await ensureUsersColumns();
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
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
      [userId]
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
      [hashedPassword, userId]
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
// axios déjà importé en haut du fichier
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

// Ensure roles and user_roles tables exist (for Supabase users defaulting to 'user')
const ensureRolesSchema = async () => {
  const ddl = `
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE CHECK (name IN ('user','contributor','admin','super_admin'))
    );
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
  `;
  await db.exec(ddl);
};

const getRoleId = async (name) => {
  const [rows] = await db.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [name]);
  if (!rows || rows.length === 0) {
    await db.execute('INSERT OR IGNORE INTO roles (name) VALUES (?)', [name]);
    const [rows2] = await db.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [name]);
    return rows2 && rows2[0] ? rows2[0].id : null;
  }
  return rows[0].id;
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
    const { phone, code, email, firstName, lastName, password, role = 'user' } = req.body;

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
    if (!['user', 'contributor', 'admin'].includes(role)) {
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

    // Générer un username auto-généré unique basé sur prénom/nom ou email/phone
    const nameBase = [String(firstName || '').trim(), String(lastName || '').trim()].filter(Boolean).join(' ');
    const baseRaw = nameBase || String(normalizedEmail).split('@')[0] || userId;
    const base = (baseRaw || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'lokali';
    let username = base;
    const [u0] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (u0 && u0.length > 0) {
      for (let i = 0; i < 5; i++) {
        const suffix = Math.random().toString(36).slice(2, 8);
        username = `${base}-${suffix}`;
        const [uCheck] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (!uCheck || uCheck.length === 0) break;
      }
    }

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

// GET /api/auth/roles - Récupère les rôles locaux (SQLite) pour l'utilisateur Supabase
router.get('/roles', authenticateAnyToken, async (req, res) => {
  try {
    const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Utilisateur introuvable' });
    }

    // (logs retirés en production) évitez de journaliser des PII

    const [rows] = await db.execute(
      'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ?',
      [userId]
    );
    const roleList = Array.isArray(rows) ? rows.map(r => r.name) : [];

    // Fallback: inclure le rôle stocké dans users.role via l’email si présent
    let userRoleRow = null;
    const emailCandidate = (req.supabaseUser && req.supabaseUser.email) || (req.user && req.user.email) || null;
    if (emailCandidate) {
      const [userRows] = await db.execute('SELECT role FROM users WHERE email = ? LIMIT 1', [emailCandidate]);
      userRoleRow = (Array.isArray(userRows) && userRows.length) ? userRows[0] : null;
    }

    const rolesSet = new Set(roleList);
    const candidate = userRoleRow?.role;
    if (candidate && ['user','contributor','admin','super_admin'].includes(candidate)) {
      rolesSet.add(candidate);
    }

    // If no roles found, assign default 'user' to Supabase user
    if (rolesSet.size === 0) {
      await ensureUsersColumns();
      await ensureRolesSchema();
      const email = emailCandidate || null;
      // Ensure local users row exists for Supabase user id
      await db.execute(
        'INSERT OR IGNORE INTO users (id, email, role) VALUES (?, ?, ?)',
        [userId, email, 'user']
      );
      const userRoleId = await getRoleId('user');
      if (userRoleId) {
        await db.execute(
          'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, userRoleId]
        );
        rolesSet.add('user');
      }
    }

    let roles = Array.from(rolesSet);
    // Si super_admin présent, lui attribuer admin, contributor et user
    if (roles.includes('super_admin')) {
      roles = Array.from(new Set([...roles, 'admin', 'contributor', 'user']));
    }
    return res.json({ success: true, data: { roles } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { router, authenticateToken, authenticateSupabaseToken, authenticateAnyToken };
