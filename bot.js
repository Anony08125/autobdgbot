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
// 🧠 ULTRA ADVANCED: BDG HASH DECODER & MULTI-PATTERN
// ==========================================
function getPrediction(period) {
    // 1. Period ke last 3 digits nikalo (Micro Analysis ke liye)
    // Example: ...100010742 => "742"
    const last3 = parseInt(period.slice(-3));
    const lastDigit = parseInt(period.slice(-1));
    
    // 2. Complex Hash Calculation (BDG Server Logic Simulation)
    // Ye formula period number ko tod-mod kar result nikalta hai
    const hashValue = (last3 * 7 + lastDigit * 3) % 100;

    // ==========================================
    // 🚦 PATTERN SELECTION (Based on Hash)
    // ==========================================

    // Pattern 1: DRAGON STREAK (Jab Hash < 20 ho)
    // Ye lagatar ek hi color dega
    if (hashValue < 20) {
        const isDragonBig = (Math.floor(last3 / 10) % 2 === 0);
        return {
            name: isDragonBig ? 'BIG' : 'SMALL',
            emoji: isDragonBig ? '🟢' : '🔴',
            logic: 'Dragon Streak 🐉 (Strong)'
        };
    }

    // Pattern 2: PING-PONG / ZIG-ZAG ( HASH 20 - 40)
    // Big-Small-Big-Small
    else if (hashValue >= 20 && hashValue < 40) {
        if (lastDigit % 2 === 0) {
            return { name: 'SMALL', emoji: '🔴', logic: 'Ping-Pong 🏓 (B-S-B-S)' };
        } else {
            return { name: 'BIG', emoji: '🟢', logic: 'Ping-Pong 🏓 (B-S-B-S)' };
        }
    }

    // Pattern 3: AAB PATTERN (2-1 Pattern) (HASH 40 - 60)
    // Big-Big-Small pattern (Bohot common hai)
    else if (hashValue >= 40 && hashValue < 60) {
        const remainder = lastDigit % 3; 
        // 0,1 = Big, 2 = Small
        if (remainder === 2) {
            return { name: 'SMALL', emoji: '🔴', logic: '2-1 Pattern 📊 (AAB)' };
        } else {
            return { name: 'BIG', emoji: '🟢', logic: '2-1 Pattern 📊 (AAB)' };
        }
    }

    // Pattern 4: TWIN PATTERN (Double-Double) (HASH 60 - 80)
    // Big-Big-Small-Small
    else if (hashValue >= 60 && hashValue < 80) {
        const remainder = lastDigit % 4;
        if (remainder === 0 || remainder === 1) {
            return { name: 'SMALL', emoji: '🔴', logic: 'Twin Pattern 👯 (BBSS)' };
        } else {
            return { name: 'BIG', emoji: '🟢', logic: 'Twin Pattern 👯 (BBSS)' };
        }
    }

    // Pattern 5: 3-2-1 BREAKDOWN (HASH 80+)
    // Jab trend tootne wala ho
    else {
        // Complex modulo for randomizing 'Trend Break'
        if ((last3 + hashValue) % 2 === 0) {
             return { name: 'BIG', emoji: '🟢', logic: 'Trend Break 📉 (3-2-1)' };
        } else {
             return { name: 'SMALL', emoji: '🔴', logic: 'Trend Break 📉 (3-2-1)' };
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
💰 *Use 5-Stage Funds Plan*
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