const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// 1. Apna Token Yahan Dalein
const token = '7970364882:AAGhYmvIHU9SPqkYs3SeZlUpuL-I_ngXEkY'; // Apna Token Replace Karein
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. Apne Channel ki IDs Yahan Dalein
const CHANNEL_IDS = [
    '@DiuWingiftcode01' // Apni Channel ID yahan daalein
];

let lastProcessedPeriod = '';

// ==========================================
// 🕒 1. PERIOD GENERATOR (17-DIGIT BDG STYLE)
// ==========================================
function getCurrentPeriod() {
    const now = new Date();
    
    // BDG uses UTC Time
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    
    // Total Minutes from 00:00 UTC
    const totalMinutes = (now.getUTCHours() * 60) + now.getUTCMinutes();
    
    // Sequence Logic: 10001 + Minutes
    const sequence = 10001 + totalMinutes; 

    // Final Format: 20251225 + 1000 + 10001
    return `${year}${month}${day}1000${sequence}`;
}

// ==========================================
// 🧠 MASTER BRAIN LOGIC (All Patterns Included)
// ==========================================
function getPrediction(period) {
    // Period ka aakhri hissa nikalo (Analysis ke liye)
    const periodNum = parseInt(period);
    
    // Pattern Selector: Period ke hisaab se logic badlega
    // Hum har 10 period baad pattern change karenge taaki bot 'Real' lage
    const patternSelector = Math.floor(periodNum / 10) % 4;
    
    // Pattern 1: DRAGON PATTERN (Streak) 🐉
    // Ye tab chalega jab selector 0 hoga. (Lagatar 10 baar same aayega)
    if (patternSelector === 0) {
        // Agar periodNum even hai toh Small, warna Small (Fixed Streak)
        // Dragon todna nahi hai, isliye Fixed Color denge
        const isDragonBig = (Math.floor(periodNum / 10) % 2 === 0);
        
        return {
            name: isDragonBig ? 'BIG' : 'SMALL',
            emoji: isDragonBig ? '🟢' : '🔴',
            logic: 'Dragon Pattern 🐉 (Strong)'
        };
    }
    
    // Pattern 2: ZIG-ZAG PATTERN (Flip) 📉
    // Ye tab chalega jab selector 1 hoga. (B-S-B-S chalega)
    else if (patternSelector === 1) {
        if (periodNum % 2 === 0) {
            return { name: 'SMALL', emoji: '🔴', logic: 'Zig-Zag Pattern 📉' };
        } else {
            return { name: 'BIG', emoji: '🟢', logic: 'Zig-Zag Pattern 📉' };
        }
    }
    
    // Pattern 3: TWIN PATTERN (Double-Double) 👯
    // Ye tab chalega jab selector 2 hoga. (BB-SS-BB-SS)
    else if (patternSelector === 2) {
        const remainder = periodNum % 4;
        // 0,1 par SMALL | 2,3 par BIG
        if (remainder === 0 || remainder === 1) {
            return { name: 'SMALL', emoji: '🔴', logic: 'Twin Pattern 👯' };
        } else {
            return { name: 'BIG', emoji: '🟢', logic: 'Twin Pattern 👯' };
        }
    }
    
    // Pattern 4: TREND ANALYSIS (Random Mix) 📊
    // Jab koi pattern clear na ho
    else {
        const lastDigit = parseInt(period.slice(-1));
        const sum = lastDigit + 7; // Secret Formula
        
        if (sum % 2 === 0) {
            return { name: 'BIG', emoji: '🟢', logic: 'Trend Analysis 📊' };
        } else {
            return { name: 'SMALL', emoji: '🔴', logic: 'Trend Analysis 📊' };
        }
    }
}

// ==========================================
// 🚀 3. MAIN LOOP (Interval)
// ==========================================
setInterval(() => {
    const currentPeriod = getCurrentPeriod();

    if (currentPeriod !== lastProcessedPeriod) {
        // Naya Period Aaya Hai!
        const result = getPrediction(currentPeriod);
        lastProcessedPeriod = currentPeriod;

        // Message Format (Ab Undefined Nahi Aayega)
        const message = `
🤖 *WINGO PREMIUM SIGNAL* 🤖

⏱ *Time:* 00:00 (Instant)
📅 *Period:* ${currentPeriod}
--------------------------------
🎯 *BET:* ${result.name} ${result.emoji}
--------------------------------
💡 *Logic:* ${result.logic}
💰 *Use 3-Stage Funds Plan*
        `;

        // Saare Channels Mein Bhejo
        CHANNEL_IDS.forEach((id) => {
            bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                .then(() => console.log(`Sent to ${id}`))
                .catch((e) => console.error(`Failed to send to ${id}:`, e.message));
        });
    }
}, 1000); // Har 1 second check karega

// ==========================================
// 🌐 4. SERVER SETUP (Render Ke Liye)
// ==========================================
app.get('/', (req, res) => res.send('Ultra-Fast Bot Active 🚀'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));