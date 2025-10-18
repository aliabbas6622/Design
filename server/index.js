const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const fetch = require('node-fetch');

const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
app.use(bodyParser.json());

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ current: null, submissions: [], archive: [] }, null, 2));
}

const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = (d) => fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));

const randomUsername = () => {
  const adjectives = ["Curious", "Sleepy", "Quantum", "Chaotic", "Dreamy", "Vivid"];
  const nouns = ["Duck", "Neuron", "Pixel", "Orb", "Molecule", "Quasar"];
  return `${adjectives[Math.floor(Math.random()*adjectives.length)]}-${nouns[Math.floor(Math.random()*nouns.length)]}-${Math.floor(Math.random()*99)+1}`;
}

app.get('/api/current', (req, res) => {
  const data = readData();
  res.json(data.current);
});

app.get('/api/archive', (req, res) => {
  const data = readData();
  res.json(data.archive || []);
});

app.post('/api/submit', (req, res) => {
  const { text, username } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });

  const data = readData();
  const user = username && username.trim() ? username.trim() : randomUsername();
  const submission = { id: uuidv4(), text: text.trim(), username: user, likes: 0, date: new Date().toISOString() };
  data.submissions = data.submissions || [];
  data.submissions.push(submission);
  writeData(data);
  res.json(submission);
});

const generateImageWithClipDrop = async (apiKey, prompt) => {
  if (!apiKey) throw new Error('ClipDrop API key is missing.');
  
  const fullPrompt = `A dreamy, ethereal, abstract digital painting representing the concept of '${prompt}'. Soft pastel color palette, gentle gradients, sense of light and wonder, beautiful.`;
  
  const form = new FormData();
  form.append('prompt', fullPrompt);
  
  const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
    },
    body: form,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ClipDrop API error: ${response.status} - ${errorText}`);
  }
  
  const imageBuffer = await response.buffer();
  return imageBuffer.toString('base64');
};

app.post('/api/generate', async (req, res) => {
  try {
    const { clipdropKey } = req.body;
    const data = readData();
    const word = `Glimmer${Math.floor(Math.random()*1000)}`;
    
    let image = null;
    if (clipdropKey) {
      try {
        image = await generateImageWithClipDrop(clipdropKey, word);
      } catch (e) {
        console.error('ClipDrop image generation failed:', e.message);
      }
    }
    
    data.current = { word, image, date: new Date().toISOString().split('T')[0] };
    data.submissions = [];
    writeData(data);
    res.json(data.current);
  } catch (error) {
    console.error('Generate endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate word and image' });
  }
});

app.listen(4000, () => console.log('Backend server running on http://localhost:4000'));
