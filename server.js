const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = 'data.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to read data from JSON file
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper function to write data to JSON file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all records
app.get('/api/records', (req, res) => {
  const records = readData();
  res.json(records);
});

// POST new record
app.post('/api/records', (req, res) => {
  const records = readData();
  const newRecord = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  records.push(newRecord);
  writeData(records);
  res.json(newRecord);
});

// PUT update record
app.put('/api/records/:id', (req, res) => {
  const records = readData();
  const index = records.findIndex(r => r.id == req.params.id);
  if (index !== -1) {
    records[index] = { ...records[index], ...req.body };
    writeData(records);
    res.json(records[index]);
  } else {
    res.status(404).json({ error: 'Record not found' });
  }
});

// DELETE record
app.delete('/api/records/:id', (req, res) => {
  let records = readData();
  records = records.filter(r => r.id != req.params.id);
  writeData(records);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});