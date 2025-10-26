const { authenticateSupabaseToken } = require('../routes/auth');
const db = require('../database/connection');

async function getUserRoles(userId) {
  const [rows] = await db.execute(
    `SELECT r.name AS name
     FROM user_roles ur
     JOIN roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [userId]
  );
  return (rows || []).map(r => r.name);
}

// Middleware pour vérifier les rôles utilisateur via la table pivot avec token Supabase
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    authenticateSupabaseToken(req, res, async () => {
      try {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
        if (!userId) {
          return res.status(401).json({ success: false, message: "Utilisateur non authentifié" });
        }
        const userRoles = await getUserRoles(userId);
        if (!userRoles || userRoles.length === 0) {
          return res.status(403).json({ success: false, message: 'Accès refusé. Aucun rôle.' });
        }
        const hasRole = userRoles.some(r => roles.includes(r));
        if (!hasRole) {
          return res.status(403).json({ success: false, message: 'Accès refusé. Rôle insuffisant.' });
        }
        // Compat: exposer req.user.id pour les routes existantes
        req.user = { ...(req.user || {}), id: userId };
        req.user.roles = userRoles;
        // Exposer aussi sur req.supabaseUser
        if (req.supabaseUser) {
          req.supabaseUser.roles = userRoles;
        }
        next();
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Erreur rôle: ' + e.message });
      }
    });
  };
};

// Middleware pour les routes admin (admin et super_admin)
const requireAdmin = requireRole(['admin', 'super_admin']);

// Middleware pour les contributeurs et admins
const requireContributor = requireRole(['contributor', 'admin', 'super_admin']);

// Middleware pour les routes publiques (pas d'auth requise)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    authenticateSupabaseToken(req, res, async () => {
      try {
        const userId = (req.supabaseUser && req.supabaseUser.id) || (req.user && req.user.id);
        if (userId) {
          const userRoles = await getUserRoles(userId);
          // Compat: exposer req.user.id
          req.user = { ...(req.user || {}), id: userId };
          req.user.roles = userRoles || [];
          if (req.supabaseUser) {
            req.supabaseUser.roles = userRoles || [];
          }
        }
      } catch (_) {}
      next();
    });
  } else {
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

