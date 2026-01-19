const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dns = require('dns');
require('dotenv').config();

// Force la résolution IPv4 par défaut (Node 17+)
// Cela aide souvent sur Render/Vercel pour se connecter aux bases de données
if (dns.setDefaultResultOrder) {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    console.warn('Impossible de définir l\'ordre de résolution DNS:', e);
  }
}

const app = express();
// Trust first proxy to correctly interpret X-Forwarded-For for rate limiting
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());

// Rate limiting - plus permissif pour le développement
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // limite de 200 requêtes par IP par minute
  message: {
    error: 'Trop de requêtes, veuillez patienter un moment',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3003',
    'https://lokali-xi.vercel.app',
    'https://lokali.bj',
    'https://www.lokali.bj'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/stores', require('./routes/stores'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/comparisons', require('./routes/comparisons'));
app.use('/api/languages', require('./routes/languages'));
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/categories', require('./routes/categories'));
app.use('/api/prices', require('./routes/prices'));
// Webhook Kobo pour synchro automatique
app.use('/api/kobo', require('./routes/kobo'));

// Routes agricoles
app.use('/api/agricultural-prices', require('./routes/agricultural-prices'));
app.use('/api/product-categories', require('./routes/product-categories'));
app.use('/api/localities', require('./routes/localities'));
app.use('/api/units', require('./routes/units'));
app.use('/api/costs', require('./routes/costs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/filter-options', require('./routes/filter-options'));
app.use('/api/contributions', require('./routes/contributions'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/seo', require('./routes/seo'));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Lokali fonctionne!' });
});

// Route de vérification base de données (Diagnostic)
app.get('/api/health-db', async (req, res) => {
  try {
    // Import dynamique pour éviter les soucis d'ordre de chargement si nécessaire, 
    // ou on peut l'importer en haut. Ici on l'utilise juste pour ce test.
    const db = require('./database/postgres');
    const result = await db.get('SELECT NOW() as time');
    res.json({ 
      status: 'success', 
      message: 'Connexion base de données OK', 
      time: result.time,
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('DB Health Check Failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Échec connexion base de données', 
      error_details: error.message,
      error_code: error.code
    });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
