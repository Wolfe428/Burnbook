const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();

// Stripe webhook needs raw body
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store sessions in memory (resets on server restart)
// For production, use a database
const sessions = {};

function getSession(id) {
  if (!sessions[id]) sessions[id] = { credits: 0, usedFree: false };
  return sessions[id];
}

// Generate a simple session ID
app.get('/api/session', (req, res) => {
  const id = crypto.randomBytes(16).toString('hex');
  sessions[id] = { credits: 1, usedFree: false };
  res.json({ sessionId: id });
});

app.get('/api/credits', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.json({ credits: 0, usedFree: true });
  const session = getSession(sessionId);
  res.json({ credits: session.credits, usedFree: session.usedFree });
});

app.post('/api/use-credit', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'No session' });
  const session = getSession(sessionId);
  if (session.credits <= 0) return res.status(400).json({ error: 'No credits' });
  session.credits--;
  session.usedFree = true;
  res.json({ credits: session.credits });
});

// Stripe webhook
app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const clientRef = session.client_reference_id;
    if (clientRef && sessions[clientRef]) {
      sessions[clientRef].credits += 5;
      console.log(`Added 5 credits to session ${clientRef}`);
    }
  }

  res.json({ received: true });
});

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided.' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const result = data.content.map(b => b.text || '').join('').trim();
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BurnBook running on http://localhost:${PORT}`));
