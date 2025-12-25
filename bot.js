const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// =======================================================
// CONFIGURATION
// =======================================================
const token = '7970364882:AAGhYmvIHU9SPqkYs3SeZlUpuL-I_ngXEkY';
const CHANNEL_ID = '@DiuWingiftcode01'; 

const bot = new TelegramBot(token, { polling: true });
const app = express();

// ==========================================
// 🔴 NEW: BDG EXACT 17-DIGIT PERIOD LOGIC
// ==========================================
function getCurrentPeriod() {
    const now = new Date();
    
    // 1. Date Part (YYYYMMDD) - 8 Digits
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    
    // 2. Sequence Part (10001 se start hota hai)
    // UTC Hours * 60 + UTC Minutes = Aaj ke total minute
    const totalMinutes = (now.getUTCHours() * 60) + now.getUTCMinutes();
    
    // Example: Agar 00:00 baj raha hai to 10001
    // Agar 00:01 baj raha hai to 10002
    const sequence = 10001 + totalMinutes; 

    // 3. FINAL FORMAT (17 DIGITS)
    // Format: Date(8) + GameID(4) + Sequence(5)
    // Example: 20251225 + 1000 + 10001 = 20251225100010001
    return `${year}${month}${day}1000${sequence}`;
}

// ==========================================
// 🐉 DRAGON CATCHER LOGIC (Trends)
// ==========================================
let lastResult = 'BIG 🟢'; // Default start

function getPrediction(period) {
    // 70% chance ki jo pichle baar aaya, wahi dubara aayega (Dragon Logic)
    const random = Math.random();
    
    if (random > 0.3) {
        // 70% Same as last (Dragon banayega)
        return lastResult; 
    } else {
        // 30% Flip karega (Trend todega)
        lastResult = (lastResult === 'BIG 🟢') ? 'SMALL 🔴' : 'BIG 🟢';
        return lastResult;
    }
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