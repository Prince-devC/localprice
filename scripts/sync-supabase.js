require('dotenv').config({ path: './.env' });
const axios = require('axios');
const db = require('../database/connection');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function syncPrices() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase URL or anon key is not defined.');
    return;
  }

  try {
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/prices?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const prices = response.data;

    await db.execute('DELETE FROM prices');

    for (const price of prices) {
      await db.execute(
        'INSERT INTO prices (id, product_id, locality_id, unit_id, price, date, status, submitted_by, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [price.id, price.product_id, price.locality_id, price.unit_id, price.price, price.date, price.status, price.submitted_by, price.comment, price.created_at, price.updated_at]
      );
    }

    console.log(`Successfully synchronized ${prices.length} prices.`);
  } catch (error) {
    console.error('Error syncing prices:', error.message);
  }
}

syncPrices();