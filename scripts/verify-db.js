const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'lokali.db'));

function q(sql) {
  return new Promise((res, rej) => db.all(sql, [], (e, r) => e ? rej(e) : res(r)));
}

(async () => {
  try {
    const sup = await q(`
      SELECT s.id, s.name, s.type, s.locality_id,
             s.latitude AS supplier_latitude, s.longitude AS supplier_longitude,
             l.name AS locality_name, l.latitude AS locality_latitude, l.longitude AS locality_longitude
      FROM suppliers s
      LEFT JOIN localities l ON l.id = s.locality_id
      ORDER BY l.name, s.name;
    `);
    console.log('Suppliers:', sup.length);
    console.table(sup);

    const missingCoords = sup.filter(r => r.supplier_latitude == null || r.supplier_longitude == null);
    console.log('Suppliers without supplier coords:', missingCoords.length);
    if (missingCoords.length) console.table(missingCoords);

    const spc = await q(`SELECT COUNT(*) as c FROM supplier_prices;`);
    console.log('supplier_prices rows:', spc[0].c);

    const savc = await q(`SELECT COUNT(*) as c FROM supplier_product_availability;`);
    console.log('availability rows:', savc[0].c);

    const sample = await q(`
      SELECT s.name AS supplier, s.type, p.name AS product, l.name AS locality,
             pr.price, spa.available_quantity, spa.quantity_unit,
             spa.available_from, spa.available_until
      FROM supplier_prices spr
      JOIN prices pr ON pr.id = spr.price_id
      JOIN products p ON p.id = spr.product_id
      JOIN suppliers s ON s.id = spr.supplier_id
      JOIN localities l ON l.id = spr.locality_id
      LEFT JOIN supplier_product_availability spa ON spa.supplier_id = s.id AND spa.product_id = p.id
      ORDER BY s.name, p.name
      LIMIT 12;
    `);
    console.table(sample);
  } catch (e) {
    console.error(e);
  } finally {
    db.close();
  }
})();