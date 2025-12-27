const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// 1. APNA TOKEN YAHAN DALEIN
const token = 'YOUR_TELEGRAM_BOT_TOKEN'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. CHANNEL ID
const CHANNEL_IDS = [
    '-100xxxxxxxxx' // Apni Main Channel ID dalein
];

// 3. WIN STICKER SETTINGS
// Source: https://t.me/DiuWingiftcode01/633
const STICKER_CHANNEL_ID = '@DiuWingiftcode01';
const STICKER_MSG_ID = 633;

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
// 🧠 BALANCED PATTERN LOGIC (Sabhi Pattern Aayenge)
// ==========================================
function getPrediction(period) {
    const periodNum = parseInt(period);
    const lastDigit = parseInt(period.slice(-1));
    const last3 = parseInt(period.slice(-3));

    // Hum 0 se 100 ke beech ek number nikalenge
    // Isse hum patterns ko barabar baat denge
    const hash = (last3 * 13 + lastDigit * 7) % 100;

    let prediction = '';
    let emoji = '';
    let logicText = '';

    // ==========================================
    // 🚦 EQUAL DISTRIBUTION LOGIC (8 Patterns)
    // ==========================================

    // 1. DRAGON STREAK 🐉 (0 - 15)
    if (hash >= 0 && hash < 15) {
        // Simple Dragon Logic
        const isBig = (Math.floor(periodNum / 10) % 2 === 0);
        prediction = isBig ? 'BIG' : 'SMALL';
        emoji = isBig ? '🟢' : '🔴';
        logicText = 'Dragon Streak 🐉';
    }

    // 2. TWIN PATTERN 👯 (15 - 30)
    // BB SS BB SS
    else if (hash >= 15 && hash < 30) {
        const rem = periodNum % 4;
        if (rem === 0 || rem === 1) {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = 'Twin Pattern 👯 (BBSS)';
    }

    // 3. PING PONG / ZIG-ZAG 🏓 (30 - 45)
    // B S B S B S
    else if (hash >= 30 && hash < 45) {
        if (periodNum % 2 === 0) {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = 'Ping Pong 🏓 (Zig-Zag)';
    }

    // 4. 2-1 PATTERN (AAB) 📊 (45 - 55)
    // Big-Big-Small
    else if (hash >= 45 && hash < 55) {
        const rem = periodNum % 3;
        if (rem === 2) {
            prediction = 'SMALL'; emoji = '🔴'; 
        } else {
            prediction = 'BIG'; emoji = '🟢';   
        }
        logicText = '2-1 Pattern 📊 (AAB)';
    }

    // 5. 1-2 PATTERN (ABB) 📉 (55 - 65)
    // Small-Big-Big
    else if (hash >= 55 && hash < 65) {
        const rem = periodNum % 3;
        if (rem === 0) {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = '1-2 Pattern 📉 (ABB)';
    }

    // 6. 3-1 PATTERN (AAAB) 🧱 (65 - 75)
    else if (hash >= 65 && hash < 75) {
        const rem = periodNum % 4;
        if (rem === 3) {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = '3-1 Pattern 🧱 (AAAB)';
    }

    // 7. MIRROR / COPY 🔄 (75 - 85)
    else if (hash >= 75 && hash < 85) {
        const prevDigit = parseInt(period.slice(-2, -1));
        if (prevDigit % 2 === 0) {
            prediction = 'SMALL'; emoji = '🔴';
        } else {
            prediction = 'BIG'; emoji = '🟢';
        }
        logicText = 'Mirror Trend 🔄 (Copy)';
    }

    // 8. TREND BREAK ⚡ (85 - 100)
    else {
        if (periodNum % 2 === 0) {
            prediction = 'BIG'; emoji = '🟢';
        } else {
            prediction = 'SMALL'; emoji = '🔴';
        }
        logicText = 'Trend Break ⚡ (Analysis)';
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

        // 1. SIGNAL MESSAGE SEND KARO
        const message = `
🔥 *BDG UNIVERSAL PREDICTOR* 🔥

📅 *Period:* \`${currentPeriod}\`
⏱ *Time:* 00:00 (Live Sync)
--------------------------------
🎯 *SIGNAL:* ${result.name} ${result.emoji}
--------------------------------
🧠 *Logic:* ${result.logic}
💰 *Use 3-Stage Investment Plan*
`;

        CHANNEL_IDS.forEach((id) => {
            bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                .catch((e) => console.error(`Signal Fail ${id}:`, e.message));
        });

        // 2. AUTO WIN SYSTEM (50 Seconds Delay) 🏆
        // Ab ye 90% baar Sticker bhejega. Sirf 10% baar chup rahega.
        setTimeout(() => {
            if (Math.random() < 0.90) { // <--- 0.90 Matlab 90% WIN RATE
                CHANNEL_IDS.forEach((id) => {
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`Win Sticker sent to ${id}`))
                        .catch((e) => console.error(`Sticker Error:`, e.message));
                });
            } else {
                console.log("Natural Skip (10% Loss Simulation)");
            }
        }, 50000); // 50 Sec baad
    }
}, 1000);

// SERVER
app.get('/', (req, res) => res.send('Balanced Bot Active 🚀'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Port ${PORT}`));