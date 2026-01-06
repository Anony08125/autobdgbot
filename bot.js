const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios'); 

// ==========================================
// 1. APNA TOKEN YAHAN DALEIN
// ==========================================
const token = 'YOUR_NEW_TOKEN_HERE'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. CHANNEL ID
const CHANNEL_IDS = [
    '-100xxxxxxxxx' // Apni Channel ID
];

// 3. STICKER SETTINGS
const STICKER_CHANNEL_ID = '@DiuWingiftcode01'; 
const STICKER_MSG_ID = 11499;

// 4. API SETTINGS
const BDG_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Referer": "https://bdggame7.com/",
    "Origin": "https://bdggame7.com"
};

// GLOBAL MEMORY
let lastProcessedPeriod = ''; 
let myLastPrediction = null; 

// Helpers
function getSize(number) {
    return parseInt(number) >= 5 ? 'BIG' : 'SMALL';
}
function getEmoji(size) {
    return size === 'BIG' ? '🟢' : '🔴';
}

// Error Handler
bot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
        console.log("⚠️ ERROR: Conflict! Do bot chal rahe hain.");
    } else {
        console.log(`Polling Error: ${error.message}`);
    }
});

// ==========================================
// ⏰ TIME SCHEDULE LOGIC (IST INDIA TIME)
// ==========================================
function isBettingTime() {
    // Current Time in IST (India)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60 * 1000; // +5:30 Hours
    const indiaTime = new Date(utcTime + istOffset);

    const hours = indiaTime.getHours(); // 0 to 23

    // SCHEDULE CHECK
    // Morning: 11:00 AM to 02:00 PM (Hours: 11, 12, 13)
    const isMorning = (hours >= 11 && hours < 14);

    // Night: 08:00 PM to 10:00 PM (Hours: 20, 21)
    const isNight = (hours >= 20 && hours < 22);

    return isMorning || isNight;
}

// ==========================================
// 🧠 GENIUS LOGIC ENGINE
// ==========================================
function analyzeHistory(history) {
    const recent = history.slice(0, 10); 
    const lastResult = getSize(recent[0].number);
    const secondLast = getSize(recent[1].number);
    const thirdLast = getSize(recent[2].number);

    // 1. Streak Count
    let streak = 1;
    for (let i = 1; i < recent.length; i++) {
        if (getSize(recent[i].number) === lastResult) streak++;
        else break;
    }

    // 2. Pressure Analysis
    let bigCount = 0;
    let smallCount = 0;
    recent.forEach(item => {
        if (getSize(item.number) === 'BIG') bigCount++;
        else smallCount++;
    });

    // Strategy
    if (streak >= 3) return lastResult; // Dragon Ride
    if (lastResult !== secondLast && secondLast !== thirdLast) return lastResult === 'BIG' ? 'SMALL' : 'BIG'; // ZigZag
    if (lastResult === secondLast && secondLast !== thirdLast && thirdLast === getSize(recent[3].number)) return lastResult === 'BIG' ? 'SMALL' : 'BIG'; // Twin
    if (bigCount >= 7) return 'SMALL'; // Correction
    if (smallCount >= 7) return 'BIG'; // Correction

    return lastResult; // Default
}

// ==========================================
// 📡 REAL DATA CHECK
// ==========================================
async function checkGameStatus() {
    try {
        // 🛑 STEP 1: CHECK TIME
        if (!isBettingTime()) {
            // Agar time nahi hai, to console me batao aur return ho jao
            // console.log("😴 Bot Sleeping (Outside Schedule)"); 
            return; 
        }

        const timestamp = Date.now();
        
        const response = await axios.get(BDG_URL, {
            headers: HEADERS,
            params: {
                no: "1", size: "10", type: "1", id: "1",
                language: "en", random: "4f3d2a1b", ts: timestamp
            },
            timeout: 3000
        });

        const data = response.data;
        if (!data || !data.data) return;
        const history = data.data.list || data.data.gameslist;
        if (!history || history.length === 0) return;

        const latestResult = history[0]; 
        const currentPeriod = (BigInt(latestResult.issueNumber) + 1n).toString();

        // 🏆 WIN CHECK
        if (myLastPrediction && myLastPrediction.period === latestResult.issueNumber) {
            const actualResult = getSize(latestResult.number);
            
            console.log(`🔎 Result: Humara=${myLastPrediction.bet} | Asli=${actualResult}`);

            if (myLastPrediction.bet === actualResult) {
                CHANNEL_IDS.forEach((id) => {
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`✅ Sticker Sent to ${id}`))
                        .catch(() => {
                            bot.sendMessage(id, "✅ *WIN WIN WIN!* 🏆", { parse_mode: 'Markdown' });
                        });
                });
            }
            myLastPrediction = null;
        }

        // 🔮 NEW SMART PREDICTION
        if (currentPeriod !== lastProcessedPeriod) {
            console.log(`🔥 Active Time! Sending Prediction for: ${currentPeriod}`);
            lastProcessedPeriod = currentPeriod;

            const prediction = analyzeHistory(history);

            myLastPrediction = {
                period: currentPeriod,
                bet: prediction
            };

            const message = `
🔥 *BDG API LIVE* 🔥

📅 *Period:* \`${currentPeriod}\`
📡 *Source:* Real-Time Analysis
--------------------------------
🎯 *SIGNAL:* ${prediction} ${getEmoji(prediction)}
--------------------------------
💰 *Use 3-Stage Funds Plan*
`;

            CHANNEL_IDS.forEach((id) => {
                bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                    .catch((e) => console.error(e.message));
            });
        }

    } catch (error) {
        // Retry silently
    }
}

// Fast Loop (2 Seconds)
setInterval(checkGameStatus, 2000);

// Keep Alive
setInterval(() => {
    axios.get('http://localhost:10000').catch(() => {});
}, 600000);

// SERVER
app.get('/', (req, res) => {
    // Browser me dikhayega ki abhi Active hai ya So raha hai
    if (isBettingTime()) {
        res.send('✅ Bot is ACTIVE (Betting Time) 🚀');
    } else {
        res.send('😴 Bot is SLEEPING (Outside Schedule) 🌙');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Running on Port ${PORT}`));
