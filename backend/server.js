const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'contacts.json');

// Utility: read contacts.json
function readContacts() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

// Utility: write contacts.json
function writeContacts(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all contacts
app.get('/contacts', (req, res) => {
  const contacts = readContacts();
  res.json(contacts);
});

// GET contact by ID
app.get('/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const contact = contacts.find(c => String(c.id) === req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

// POST new contact
app.post('/contacts', (req, res) => {
  const contacts = readContacts();
  const newContact = { ...req.body, id: Date.now() };
  contacts.push(newContact);
  writeContacts(contacts);
  res.status(201).json(newContact);
});

// PUT update contact
app.put('/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const index = contacts.findIndex(c => String(c.id) === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Contact not found' });
  contacts[index] = { ...contacts[index], ...req.body };
  writeContacts(contacts);
  res.json(contacts[index]);
});

// DELETE contact
app.delete('/contacts/:id', (req, res) => {
  let contacts = readContacts();
  contacts = contacts.filter(c => String(c.id) !== req.params.id);
  writeContacts(contacts);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
