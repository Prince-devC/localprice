const nodemailer = require('nodemailer');
const { contributionApproved, contributionRejected, priceApproved, priceRejected } = require('./emailTemplates');

// Build transporter from environment; fallback to console if not configured
function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const authMethod = process.env.SMTP_AUTH_METHOD; // 'PLAIN' | 'LOGIN' | 'CRAM-MD5'
  const requireTLS = String(process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true';

  if (!host || !port || !user || !pass) {
    return {
      sendMail: async (opts) => {
        console.log('[mailer] SMTP non configuré. Email simulé:', {
          to: opts.to,
          subject: opts.subject,
          text: opts.text,
        });
        return { accepted: [], rejected: [], messageId: 'simulated' };
      },
      __simulated: true,
    };
  }

  const transportOptions = {
    host,
    port,
    secure,
    auth: { user, pass },
    // Prefer a specific auth method if provided
    authMethod: authMethod || undefined,
    requireTLS: requireTLS || undefined,
    tls: { rejectUnauthorized: false }, // facilite le dev sur SMTP local/sandbox
  };
  return nodemailer.createTransport(transportOptions);
}

const transporter = buildTransporter();

function getFrom() {
  const name = process.env.MAIL_FROM_NAME || 'Lokali';
  const addr = process.env.MAIL_FROM_ADDRESS || 'no-reply@lokali.local';
  return `${name} <${addr}>`;
}

function renderContributionEmail(status, { name, reason } = {}) {
  const brandName = process.env.MAIL_BRAND_NAME || 'Lokali';
  const actionUrl = process.env.MAIL_ACTION_URL || 'http://localhost:3000/dashboard';
  const unsubscribeUrl = process.env.MAIL_UNSUBSCRIBE_URL || 'http://localhost:3000/profile#notifications';
  const logoUrl = process.env.MAIL_LOGO_URL || null;
  const logoAlt = process.env.MAIL_LOGO_ALT || 'Lokali';
  if (status === 'approved') {
    return contributionApproved({ userName: name, actionUrl, unsubscribeUrl, brandName, logoUrl, logoAlt });
  }
  if (status === 'rejected') {
    return contributionRejected({ userName: name, reason, unsubscribeUrl, brandName, logoUrl, logoAlt });
  }
  // fallback minimal
  const subject = `Lokali — Mise à jour de votre demande (${status})`;
  const title = 'Mise à jour';
  const messageLines = [`Bonjour ${name || 'Utilisateur'},`, `Statut: ${status}`];
  return {
    subject,
    text: messageLines.join('\n'),
    html: `<!doctype html><html><body><p>${messageLines.join('<br/>')}</p></body></html>`,
  };
}

function renderPriceEmail(status, {
  name,
  productName,
  localityName,
  unitName,
  unitSymbol,
  price,
  date,
  comment,
  reason,
} = {}) {
  const brandName = process.env.MAIL_BRAND_NAME || 'Lokali';
  const actionUrl = process.env.MAIL_ACTION_URL || 'http://localhost:3000/dashboard';
  const unsubscribeUrl = process.env.MAIL_UNSUBSCRIBE_URL || 'http://localhost:3000/profile#notifications';
  const logoUrl = process.env.MAIL_LOGO_URL || null;
  const logoAlt = process.env.MAIL_LOGO_ALT || 'Lokali';
  if (status === 'approved') {
    return priceApproved({
      userName: name,
      productName,
      localityName,
      unitName,
      unitSymbol,
      price,
      date,
      comment,
      actionUrl,
      unsubscribeUrl,
      brandName,
      logoUrl,
      logoAlt,
    });
  }
  if (status === 'rejected') {
    return priceRejected({
      userName: name,
      productName,
      localityName,
      unitName,
      unitSymbol,
      price,
      date,
      reason,
      unsubscribeUrl,
      brandName,
      logoUrl,
      logoAlt,
    });
  }
  const subject = `Lokali — Mise à jour de votre prix (${status})`;
  const title = 'Mise à jour de prix';
  const messageLines = [
    `Bonjour ${name || 'Utilisateur'},`,
    `Statut: ${status}`,
  ];
  return {
    subject,
    text: messageLines.join('\n'),
    html: `<!doctype html><html><body><p>${messageLines.join('<br/>')}</p></body></html>`,
  };
}

async function sendContributionStatusEmail(to, status, { name, reason } = {}) {
  try {
    if (!to) {
      console.warn('[mailer] Pas de destinataire, envoi ignoré');
      return { skipped: true };
    }
    const { subject, text, html } = renderContributionEmail(status, { name, reason });
    const unsubUrl = process.env.MAIL_UNSUBSCRIBE_URL;
    const unsubEmail = process.env.MAIL_UNSUBSCRIBE_EMAIL;
    const oneClick = String(process.env.MAIL_UNSUBSCRIBE_ONECLICK || '').toLowerCase() === 'true';
    const headers = {};
    const listUnsub = [
      unsubUrl ? `<${unsubUrl}>` : null,
      unsubEmail ? `<mailto:${unsubEmail}>` : null,
    ].filter(Boolean);
    if (listUnsub.length > 0) {
      headers['List-Unsubscribe'] = listUnsub.join(', ');
      if (oneClick) headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }
    const info = await transporter.sendMail({
      from: getFrom(),
      to,
      subject,
      text,
      html,
      replyTo: process.env.MAIL_REPLY_TO || undefined,
      headers,
    });
    console.log('[mailer] Email envoyé:', info.messageId, '->', to);
    return info;
  } catch (err) {
    console.error('[mailer] Échec envoi email:', err?.message || err);
    return { error: err?.message || String(err) };
  }
}

async function sendPriceStatusEmail(to, status, details = {}) {
  try {
    if (!to) {
      console.warn('[mailer] Pas de destinataire, envoi ignoré');
      return { skipped: true };
    }
    const { subject, text, html } = renderPriceEmail(status, details);
    const unsubUrl = process.env.MAIL_UNSUBSCRIBE_URL;
    const unsubEmail = process.env.MAIL_UNSUBSCRIBE_EMAIL;
    const oneClick = String(process.env.MAIL_UNSUBSCRIBE_ONECLICK || '').toLowerCase() === 'true';
    const headers = {};
    const listUnsub = [
      unsubUrl ? `<${unsubUrl}>` : null,
      unsubEmail ? `<mailto:${unsubEmail}>` : null,
    ].filter(Boolean);
    if (listUnsub.length > 0) {
      headers['List-Unsubscribe'] = listUnsub.join(', ');
      if (oneClick) headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
    }
    const info = await transporter.sendMail({
      from: getFrom(),
      to,
      subject,
      text,
      html,
      replyTo: process.env.MAIL_REPLY_TO || undefined,
      headers,
    });
    console.log('[mailer] Email envoyé (prix):', info.messageId, '->', to);
    return info;
  } catch (err) {
    console.error('[mailer] Échec envoi email (prix):', err?.message || err);
    return { error: err?.message || String(err) };
  }
}

async function sendGenericEmail(to, subject, text, html) {
  try {
    if (!to) {
      console.warn('[mailer] Pas de destinataire, envoi ignoré');
      return { skipped: true };
    }
    const info = await transporter.sendMail({
      from: getFrom(),
      to,
      subject,
      text,
      html,
      replyTo: process.env.MAIL_REPLY_TO || undefined,
    });
    console.log('[mailer] Email générique envoyé:', info.messageId, '->', to);
    return info;
  } catch (err) {
    console.error('[mailer] Échec envoi email générique:', err?.message || err);
    throw err; // Re-throw to let caller handle or ignore
  }
}

module.exports = {
  transporter,
  sendContributionStatusEmail,
  sendPriceStatusEmail,
  sendGenericEmail,
};