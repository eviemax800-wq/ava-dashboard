const https = require('https');

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlscml5dnp2d2FybnFyYm5yYW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzNDE0MCwiZXhwIjoyMDg2MDEwMTQwfQ.4EgNkrAXjl3cnIiQgk8VPdhEXhaKN1WerHwwBG7KxKc';

// Try Supabase SQL admin API
async function executeSQLViaAPI(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'ilriyvzvwarnqrbnranq.supabase.co',
      path: '/rest/v1/rpc/query', 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const sql = `CREATE TABLE revenue (id BIGSERIAL PRIMARY KEY, current_mrr INTEGER NOT NULL);`;

executeSQLViaAPI(sql).catch(console.error);
