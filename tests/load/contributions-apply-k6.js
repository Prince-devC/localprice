import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  iterations: 1000,
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% des requêtes < 800ms
    http_req_failed: ['rate<0.02'],   // <2% d’échecs
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

function rnd(n) { return Math.floor(Math.random() * n); }

export default function () {
  const idx = rnd(999999);
  const payload = {
    address: `Adresse test ${idx}`,
    commune: 'Commune Test',
    activity: 'Commerçant',
    cooperative_member: 0,
    cooperative_name: null,
    has_smartphone: 1,
    has_internet: 1,
    contact_phone: `01${String(10000000 + rnd(89999999))}`,
    has_whatsapp: 1,
    experience_level: ['debutant','intermediaire','expert'][rnd(3)],
    notes: 'Test de charge',
    submission_method: 'web',
  };

  const res = http.post(`${BASE_URL}/api/contributions/apply`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200/201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(0.1);
}