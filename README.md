# BurnBook 🔥🔮
### AI roast cards + savage horoscopes — $2 for 5 credits

---

## Deploy in 5 minutes

1. **Push to GitHub** — create a free GitHub account, upload this folder as a new repo
2. **Connect to Railway** — go to railway.app, sign up with GitHub, click New Project → Deploy from GitHub → pick your repo
3. **Add your API key** — in Railway dashboard → Variables tab → add `ANTHROPIC_API_KEY` = your key from console.anthropic.com
4. **Done** — Railway gives you a live URL automatically

---

## Add Stripe payments ($2 for 5 credits)

1. Create a Stripe account at stripe.com (free)
2. In Stripe dashboard → Payment Links → Create Payment Link
   - Set price to $2
   - After payment, redirect to: `https://yourdomain.com/success?credits=5`
3. In `public/index.html`, find the `handlePayment()` function and replace the alert with:
   ```javascript
   window.location.href = 'YOUR_STRIPE_PAYMENT_LINK_URL';
   ```
4. In `server.js`, add a `/success` route that grants 5 credits to the user's session

---

## Reddit post templates (copy, post, profit)

### r/funny
> I paid $2 for AI to write a legal cease & desist about my brother's BBQ skills. He hasn't spoken to me in 3 days. [OC]
> *[post the card as an image, drop burnbook.com in the comments]*

### r/astrology
> This AI horoscope called out every single one of my Scorpio tendencies and I want to sue. (burnbook.com)

### r/birthdays  
> Instead of a card I sent my dad a corporate memo about his dad jokes. He framed it.

### r/mildlyinfuriating (horoscope angle)
> Asked an AI for my horoscope and it was uncomfortably specific about my commitment issues

---

## Run locally
```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm start
# Open http://localhost:3000
```

---

## What's built
- Full marketing landing page with hero, product cards, real examples, how it works, Reddit mockup showing viral potential
- Generator with mode switcher (roast / horoscope)
- 6 roast formats + 4 horoscope reading types + 12 zodiac signs
- Credit system (1 free, then $2 for 5)
- "Made with BurnBook.com" on every output — every share is an ad
- Twitter/X share button
- Upsell after free credit used
- Payment modal wired up (just needs your Stripe link)
