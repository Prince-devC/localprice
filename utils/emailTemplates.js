function baseStyles() {
  return `
    body { margin:0; padding:0; background:#f4f5f7; }
    .container { width:100%; background:#f4f5f7; padding:20px 0; }
    .wrapper { max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; }
    .header { padding:20px; background:#0ea5e9; color:#ffffff; font-family:Arial, sans-serif; }
    .brand { display:flex; align-items:center; gap:12px; }
    .brand img { max-height:36px; width:auto; display:block; }
    .brand .name { font-weight:bold; font-size:18px; }
    .content { padding:24px; color:#111827; font-family:Arial, sans-serif; line-height:1.5; }
    .cta { display:inline-block; padding:12px 16px; background:#0ea5e9; color:#ffffff !important; text-decoration:none; border-radius:6px; font-weight:bold; }
    .footer { padding:18px 24px; color:#6b7280; font-family:Arial, sans-serif; font-size:12px; }
    @media only screen and (max-width:480px) {
      .content { padding:18px; }
      .header { padding:16px; font-size:18px; }
    }
  `;
}

function renderBase({ brandName = 'Lokali' }) {
  return {
    brandName,
    styles: baseStyles(),
  };
}

function htmlTemplate({ subject, title, messageLines = [], cta = null, footerLines = [], brandName = 'Lokali', logoUrl = null, logoAlt = 'Logo' }) {
  const { styles } = renderBase({ brandName });
  const msg = messageLines.map(line => `<p>${line}</p>`).join('');
  const footer = footerLines.map(line => `<p style="margin:0;">${line}</p>`).join('');
  return `
  <!doctype html>
  <html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
    <style>${styles}</style>
  </head>
  <body>
    <div class="container">
      <div class="wrapper">
        <div class="header">
          <div class="brand">
            ${logoUrl ? `<img src="${logoUrl}" alt="${logoAlt}" />` : ''}
            <div class="name">${brandName}</div>
          </div>
        </div>
        <div class="content">
          <h2 style="margin-top:0;">${title}</h2>
          ${msg}
          ${cta ? `<div style="margin-top:16px;">${cta}</div>` : ''}
        </div>
        <div class="footer">
          ${footer}
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

function textTemplate({ title, messageLines = [], footerLines = [], brandName = 'Lokali' }) {
  const lines = [brandName, '', title, '', ...messageLines, '', ...footerLines];
  return lines.join('\n');
}

function contributionApproved({ userName, actionUrl, unsubscribeUrl, brandName = 'Lokali', logoUrl = null, logoAlt = 'Logo' }) {
  const subject = 'Lokali — Votre demande de contribution est approuvée';
  const title = 'Demande approuvée';
  const messageLines = [
    `Bonjour ${userName || 'Utilisateur'},`,
    `Bonne nouvelle, votre demande pour devenir contributeur a été approuvée. Vous pouvez désormais soumettre des prix.`,
    `Merci pour votre participation !`,
  ];
  const footerLines = [
    unsubscribeUrl ? `Se désabonner: ${unsubscribeUrl}` : ``,
  ].filter(Boolean);
  const cta = actionUrl ? `<a href="${actionUrl}" class="cta">Accéder à votre espace</a>` : null;
  return {
    subject,
    html: htmlTemplate({ subject, title, messageLines, cta, footerLines, brandName, logoUrl, logoAlt }),
    text: textTemplate({ title, messageLines, footerLines, brandName }),
  };
}

function contributionRejected({ userName, reason, unsubscribeUrl, brandName = 'Lokali', logoUrl = null, logoAlt = 'Logo' }) {
  const subject = 'Lokali — Votre demande de contribution est refusée';
  const title = 'Demande refusée';
  const messageLines = [
    `Bonjour ${userName || 'Utilisateur'},`,
    `Votre demande pour devenir contributeur n’a pas été acceptée.`,
    reason ? `Raison: ${reason}.` : ``,
    `Vous pouvez reformuler votre demande ou nous contacter si besoin.`,
  ];
  const footerLines = [
    unsubscribeUrl ? `Se désabonner: ${unsubscribeUrl}` : ``,
  ].filter(Boolean);
  return {
    subject,
    html: htmlTemplate({ subject, title, messageLines, footerLines, brandName, logoUrl, logoAlt }),
    text: textTemplate({ title, messageLines, footerLines, brandName }),
  };
}

// Prix validé (avec détails)
function priceApproved({ userName, productName, localityName, unitName, unitSymbol, price, date, comment, actionUrl, unsubscribeUrl, brandName = 'Lokali', logoUrl = null, logoAlt = 'Logo' }) {
  const subject = 'Lokali — Votre prix a été validé';
  const title = 'Prix validé';
  const messageLines = [
    `Bonjour ${userName || 'Utilisateur'},`,
    `Votre prix soumis a été validé. Voici les détails:`,
    productName ? `• Produit: ${productName}` : '',
    localityName ? `• Localité: ${localityName}` : '',
    (price !== undefined && price !== null) ? `• Prix: ${price}${unitSymbol ? ` ${unitSymbol}` : ''}${unitName ? ` (${unitName})` : ''}` : '',
    date ? `• Date: ${date}` : '',
    comment ? `• Commentaire: ${comment}` : '',
  ].filter(Boolean);
  const footerLines = [
    unsubscribeUrl ? `Se désabonner: ${unsubscribeUrl}` : ``,
  ].filter(Boolean);
  const cta = actionUrl ? `<a href="${actionUrl}" class="cta">Voir vos prix</a>` : null;
  return {
    subject,
    html: htmlTemplate({ subject, title, messageLines, cta, footerLines, brandName, logoUrl, logoAlt }),
    text: textTemplate({ title, messageLines, footerLines, brandName }),
  };
}

// Prix rejeté (avec raison et détails)
function priceRejected({ userName, productName, localityName, unitName, unitSymbol, price, date, reason, unsubscribeUrl, brandName = 'Lokali', logoUrl = null, logoAlt = 'Logo' }) {
  const subject = 'Lokali — Votre prix a été rejeté';
  const title = 'Prix rejeté';
  const messageLines = [
    `Bonjour ${userName || 'Utilisateur'},`,
    `Votre prix soumis n’a pas été accepté.`,
    productName ? `• Produit: ${productName}` : '',
    localityName ? `• Localité: ${localityName}` : '',
    (price !== undefined && price !== null) ? `• Prix: ${price}${unitSymbol ? ` ${unitSymbol}` : ''}${unitName ? ` (${unitName})` : ''}` : '',
    date ? `• Date: ${date}` : '',
    reason ? `• Raison du rejet: ${reason}` : '',
    `Vous pouvez ajuster votre prix et le soumettre à nouveau si nécessaire.`,
  ].filter(Boolean);
  const footerLines = [
    unsubscribeUrl ? `Se désabonner: ${unsubscribeUrl}` : ``,
  ].filter(Boolean);
  return {
    subject,
    html: htmlTemplate({ subject, title, messageLines, footerLines, brandName, logoUrl, logoAlt }),
    text: textTemplate({ title, messageLines, footerLines, brandName }),
  };
}

module.exports = {
  contributionApproved,
  contributionRejected,
  priceApproved,
  priceRejected,
};
