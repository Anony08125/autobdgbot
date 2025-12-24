const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// =======================================================
// CONFIGURATION
// =======================================================
const token = 'YAHAN_APNA_BOT_TOKEN_PASTE_KAREIN';
const CHANNEL_ID = '@YourChannelUsername'; 

const bot = new TelegramBot(token, { polling: true });
const app = express();

// =======================================================
// 1. HYBRID LOGIC ENGINE (Fast Calculation)
// =======================================================
function getCurrentPeriod() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const totalMinutes = (now.getUTCHours() * 60) + now.getUTCMinutes();
    
    // BDG Logic
    const sequence = 10001 + totalMinutes;
    return `${year}${month}${day}${sequence}`;
}

function getPrediction(periodNumber) {
    const currentPeriod = parseInt(periodNumber);
    
    // Logic wahi rahega (Strong Hybrid Logic)
    const blockID = Math.floor(currentPeriod / 20) % 4;
    let activePattern = [];
    let emoji = "";

    switch(blockID) {
        case 0:
            activePattern = [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0];
            emoji = "🐉 Dragon Trend";
            break;
        case 1:
            activePattern = [1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1];
            emoji = "⚡ ZigZag Mode";
            break;
        case 2:
            activePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            emoji = "📉 Small Hold";
            break;
        case 3:
            activePattern = [1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1];
            emoji = "🎲 Mixed Trend";
            break;
    }

    const index = currentPeriod % 20;
    let rawResult = activePattern[index];

    // Salt / Flip Logic
    let pStr = String(periodNumber);
    let digitSum = 0;
    for(let i=0; i<pStr.length; i++) digitSum += parseInt(pStr[i]);

    if (digitSum % 7 === 0) {
        rawResult = rawResult === 1 ? 0 : 1;
        emoji = "⚠️ Market Change";
    }

    return {
        result: rawResult === 1 ? 'BIG' : 'SMALL',
        color: rawResult === 1 ? '🟢' : '🔴',
        trendEmoji: emoji
    };
}

// =======================================================
// 2. ULTRA-LOW LATENCY TIMER loop
// =======================================================

// Ye variable yaad rakhega ki humne kis period ka msg bhej diya hai
let lastProcessedPeriod = null; 

// Hum Interval ko 1000ms ki jagah 100ms kar rahe hain (Super Fast)
setInterval(() => {
    const now = new Date();
    const seconds = now.getUTCSeconds();

    // Trigger Point:
    // Hum chahte hain ki 0 ya 1 second par hi msg chala jaye.
    // Lekin 100ms ki speed par ye loop '0' second mein 10 baar chalega.
    // Isliye hum check karenge ki kya 'New Period' aaya hai?

    if (seconds === 0 || seconds === 1) {
        
        const currentPeriod = getCurrentPeriod();

        // CHECK: Kya humne is period ka message pehle hi bhej diya?
        if (currentPeriod !== lastProcessedPeriod) {
            
            // Naya Period pakda gya! Turant Logic run karo
            const data = getPrediction(currentPeriod);
            
            // LOCK: Ise update kar do taaki dubara msg na jaye
            lastProcessedPeriod = currentPeriod;

            // --- SEND MESSAGE (FAST) ---
            const message = `
🔥 **BDG PREMIUM SIGNAL** 🔥

⏱ **Time:** 00:${String(seconds).padStart(2, '0')} (Instant)
📅 **Period:** \`${currentPeriod}\`
--------------------------------
👉 **BET:** ${data.color} **${data.result}**
--------------------------------
📊 **Logic:** ${data.trendEmoji}
💰 *Use 3-Stage Funds Plan*
            `;

            bot.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown' })
                .then(() => console.log(`[${new Date().toISOString()}] Sent Alert for ${currentPeriod}`))
                .catch((e) => console.log("Telegram Error:", e.message));
        }
    }

}, 100); // <-- 100ms Speed (Bahut tez check karega)

// =======================================================
// 3. SERVER KEEP-ALIVE
// =======================================================
app.get('/', (req, res) => res.send('Ultra-Fast Bot Active'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`High Speed Server running on port ${PORT}`));