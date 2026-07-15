require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { init } = require('./src/db/excelStore');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'sahod-backend' }));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/departments', require('./src/routes/departments'));
app.use('/api/payroll', require('./src/routes/payroll'));
app.use('/api/reports', require('./src/routes/reports'));

app.use((req, res) => res.status(404).json({ error: 'That endpoint does not exist.' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;

init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Sahod API running on http://localhost:${PORT}`);
      console.log('Demo accounts — admin@sahod.ph / admin123, employer@sahod.ph / employer123');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize the Excel database:', err);
    process.exit(1);
  });
