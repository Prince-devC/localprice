const { authenticateToken } = require('../routes/auth');

// Middleware pour vérifier les rôles utilisateur
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Vérifier d'abord l'authentification
    authenticateToken(req, res, (err) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token d\'accès requis' 
        });
      }

      // Vérifier le rôle
      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès refusé. Rôle insuffisant.' 
        });
      }

      next();
    });
  };
};

// Middleware pour les routes admin
const requireAdmin = requireRole(['admin']);

// Middleware pour les contributeurs et admins
const requireContributor = requireRole(['contributor', 'admin']);

// Middleware pour les routes publiques (pas d'auth requise)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // Si un token est fourni, vérifier l'authentification
    authenticateToken(req, res, (err) => {
      if (err) {
        // Token invalide, continuer sans authentification
        req.user = null;
      }
      next();
    });
  } else {
    // Pas de token, continuer sans authentification
    req.user = null;
    next();
  }
};

module.exports = {
  requireRole,
  requireAdmin,
  requireContributor,
  optionalAuth
};

