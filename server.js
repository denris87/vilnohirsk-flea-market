const express = require('express');
const cors = require('cors');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
app.use(cors());

app.get('/api/flea', (req, res) => {
  try {
    const fileContents = fs.readFileSync('./flea.yaml', 'utf8');
    const data = yaml.load(fileContents);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Flea Market API running on port ${PORT}`));
