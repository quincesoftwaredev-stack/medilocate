const { QSTASH_URL, QSTASH_TOKEN, CRON_SECRET } = process.env;

if (!QSTASH_URL || !QSTASH_TOKEN || !CRON_SECRET) {
  console.error('Set QSTASH_URL, QSTASH_TOKEN, and CRON_SECRET before creating the reminder schedule.');
  process.exit(1);
}

const destination = 'https://medilocate.health/api/booking/reminders/check';
const scheduleUrl = `${QSTASH_URL.replace(/\/$/, '')}/v2/schedules/${encodeURIComponent(destination)}`;
const response = await fetch(scheduleUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${QSTASH_TOKEN}`,
    'Upstash-Cron': '* * * * *',
    'Upstash-Schedule-Id': 'medilocate-consultation-reminders',
    'Upstash-Method': 'GET',
    'Upstash-Forward-Authorization': `Bearer ${CRON_SECRET}`,
    'Upstash-Redact-Fields': 'header[Authorization]',
    'Upstash-Retries': '1',
  },
});

if (!response.ok) {
  console.error(`QStash schedule creation failed (HTTP ${response.status}).`);
  process.exit(1);
}

const { scheduleId } = await response.json();
console.log(`QStash reminder schedule ready: ${scheduleId}`);
