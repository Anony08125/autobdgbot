const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// 1. APNA TOKEN YAHAN DALEIN
const token = '7970364882:AAGhYmvIHU9SPqkYs3SeZlUpuL-I_ngXEkY'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. CHANNEL ID (Jahan Signal Bhejna Hai)
const CHANNEL_IDS = [
    '@DiuWingiftcode01' // Apni Main Channel ID yahan daalein
];

// 3. 🏆 NEW WIN STICKER SETTINGS (Updated)
// Source: https://t.me/DiuWingiftcode01/633
const STICKER_CHANNEL_ID = '@DiuWingiftcode01'; // Channel ka Username
const STICKER_MSG_ID = 633; // Message Number

let lastProcessedPeriod = '';

// ==========================================
// 🕒 PERIOD GENERATOR
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
// 🧠 UNIVERSAL PATTERN LOGIC
// ==========================================
function getPrediction(period) {
    const periodNum = parseInt(period);
    const wave = Math.sin(periodNum * 0.2);
    const hash = parseInt(period.slice(-3)) % 100;

    let prediction, emoji, logicText;

    // Pattern Selection (Dragon vs ZigZag)
    if (Math.abs(wave) > 0.7) {
        const isBig = wave > 0;
        prediction = isBig ? 'BIG' : 'SMALL';
        emoji = isBig ? '🟢' : '🔴';
        logicText = 'Dragon Streak 🐉';
    } else {
        // Ping Pong / Zig Zag
        if (periodNum % 2 === 0) {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = 'Ping Pong 🏓';
    }

    return { name: prediction, emoji: emoji, logic: logicText };
}

// ==========================================
// 🚀 LOOP: SIGNAL + AUTO WIN
// ==========================================
setInterval(() => {
    const currentPeriod = getCurrentPeriod();

    if (currentPeriod !== lastProcessedPeriod) {
        const result = getPrediction(currentPeriod);
        lastProcessedPeriod = currentPeriod;

        // 1. SIGNAL MESSAGE
        const message = `
🔥 *DiuWin VIP SERVER LEAK* 🔥

📅 *Period:* \`${currentPeriod}\`
⏱ *Time:* 00:00 (Live Sync)
--------------------------------
🎯 *SIGNAL:* ${result.name} ${result.emoji}
--------------------------------
🧠 *Logic:* ${result.logic}
💰 *Use 5-Stage Investment Plan*
`;

        CHANNEL_IDS.forEach((id) => {
            bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                .catch((e) => console.error(`Signal Fail ${id}:`, e.message));
        });

        // 2. AUTO WIN (50 Seconds Delay) 🏆
        setTimeout(() => {
            // 80% Chance to show WIN
            if (Math.random() < 0.80) {
                CHANNEL_IDS.forEach((id) => {
                    // Naya Sticker Forward karega
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`Win (633) sent to ${id}`))
                        .catch((e) => console.error(`Win Error:`, e.message));
                });
            }
        }, 50000); // 50 Sec baad bheje
    }
}, 1000);

// SERVER
app.get('/', (req, res) => res.send('Bot Active 🚀'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Port ${PORT}`));