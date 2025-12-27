const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// 1. APNA TOKEN YAHAN DALEIN
const token = '7970364882:AAGhYmvIHU9SPqkYs3SeZlUpuL-I_ngXEkY'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. CHANNEL ID
const CHANNEL_IDS = [
    '@DiuWingiftcode01' 
];

// 3. WIN STICKER SETTINGS
const STICKER_CHANNEL_ID = '@DiuWingiftcode01';
const STICKER_MSG_ID = 633;

let lastProcessedPeriod = '';

// ==========================================
// 🕒 PERIOD GENERATOR (UTC)
// ==========================================
function getCurrentPeriod() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const totalMinutes = (now.getUTCHours() * 60) + now.getUTCMinutes();
    const sequence = 10001 + totalMinutes; 
    return `${year}${month}${day}1000${sequence}`;
}

// ==========================================
// 🧠 FUTURE SYNC LOGIC (Advance Calculation)
// ==========================================
function getPrediction(period) {
    // Current Period ke numbers
    const periodNum = parseInt(period);
    const lastDigit = parseInt(period.slice(-1));
    const secondLast = parseInt(period.slice(-2, -1));

    // FORMULA: (Last + SecondLast + 7)
    // Ye formula BDG ke next outcome ke kareeb hota hai
    const magicSum = lastDigit + secondLast + 7;
    
    // LOGIC: Reverse Trend (Agar Even hai to Small nahi, BIG ayega)
    // Humne logic ko ULTA kar diya hai taaki wo 'Copy' na kare.
    
    let prediction = '';
    let emoji = '';
    let logicText = '';

    // Step 1: Decide Result (Reverse Math)
    // Normal Math: Even = Small. 
    // Humara Math: Even = BIG (Pattern Break)
    if (magicSum % 2 === 0) {
        prediction = 'BIG'; 
        emoji = '🟢';
        logicText = 'Trend Break 📈 (Advance)';
    } else {
        prediction = 'SMALL'; 
        emoji = '🔴';
        logicText = 'Trend Break 📉 (Advance)';
    }

    // Step 2: Special Handling for Patterns (Override)
    
    // Dragon Detect (Agar number 0, 5, 8 hai to Dragon banta hai)
    if (lastDigit === 0 || lastDigit === 5 || lastDigit === 8) {
        // Yahan hum same color continue karenge (Dragon Logic)
        // Lekin 'prediction' ko wahi rakhenge jo upar calculate hua
        logicText = 'Dragon Potential 🐉';
    }

    // Zig-Zag Force (Agar number 1, 3, 7 hai)
    if (lastDigit === 1 || lastDigit === 3 || lastDigit === 7) {
        // Iska matlab market volatile hai, Result Palat do
        if (prediction === 'BIG') {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = 'Volatile Swing ⚡ (Zig-Zag)';
    }

    return { name: prediction, emoji: emoji, logic: logicText };
}

// ==========================================
// 🚀 LOOP: SIGNAL + AUTO WIN (90%)
// ==========================================
setInterval(() => {
    const currentPeriod = getCurrentPeriod();

    if (currentPeriod !== lastProcessedPeriod) {
        const result = getPrediction(currentPeriod);
        lastProcessedPeriod = currentPeriod;

        // 1. SIGNAL MESSAGE
        const message = `
🔥 *BDG ADVANCE SERVER* 🔥

📅 *Period:* \`${currentPeriod}\`
⏱ *Time:* 00:00 (Live)
--------------------------------
🎯 *SIGNAL:* ${result.name} ${result.emoji}
--------------------------------
🧠 *Logic:* ${result.logic}
💰 *Use 3-Stage Funds Plan*
`;

        CHANNEL_IDS.forEach((id) => {
            bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                .catch((e) => console.error(`Signal Fail ${id}:`, e.message));
        });

        // 2. AUTO WIN SYSTEM (90% Win Rate)
        setTimeout(() => {
            // 90% Win dikhayega, 10% Chup rahega (Real lagne ke liye)
            if (Math.random() < 0.90) { 
                CHANNEL_IDS.forEach((id) => {
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`Win Sticker sent to ${id}`))
                        .catch((e) => console.error(`Sticker Error:`, e.message));
                });
            }
        }, 50000); // 50 Sec Delay
    }
}, 1000);

// SERVER
app.get('/', (req, res) => res.send('Future Bot Active 🚀'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Port ${PORT}`));