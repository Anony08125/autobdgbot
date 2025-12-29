const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios'); // Ye ab Render par kaam karega

// 1. APNA TOKEN YAHAN DALEIN
const token = 'YOUR_TELEGRAM_BOT_TOKEN'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. CHANNEL ID
const CHANNEL_IDS = [
    '-100xxxxxxxxx' // Apni Channel ID Dalein
];

// 3. WIN STICKER SETTINGS
const STICKER_CHANNEL_ID = '@DiuWingiftcode01';
const STICKER_MSG_ID = 633;

// 4. REAL BDG API URL
const BDG_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://bdggame7.com/",
    "Origin": "https://bdggame7.com"
};

// GLOBAL MEMORY
let lastProcessedPeriod = ''; 
let myLastPrediction = null; 

// HELPERS
function getSize(number) {
    return parseInt(number) >= 5 ? 'BIG' : 'SMALL';
}
function getEmoji(size) {
    return size === 'BIG' ? '🟢' : '🔴';
}

// ==========================================
// 📡 REAL CHECK & PREDICT FUNCTION
// ==========================================
async function checkGameStatus() {
    try {
        const timestamp = Date.now();
        
        // API Call
        const response = await axios.get(BDG_URL, {
            headers: HEADERS,
            params: {
                no: "1", size: "10", type: "1", id: "1",
                language: "en", random: "4f3d2a1b", ts: timestamp
            }
        });

        const data = response.data;
        if (!data || !data.data || !data.data.list) return;

        const history = data.data.list;
        const latestResult = history[0]; 
        const currentPeriod = String(parseInt(latestResult.issueNumber) + 1);

        // 1. CHECK WIN (Pichla Result Sahi Tha?)
        if (myLastPrediction && myLastPrediction.period === latestResult.issueNumber) {
            const actualResult = getSize(latestResult.number);
            
            console.log(`Checking: Bet ${myLastPrediction.bet} vs Real ${actualResult}`);

            if (myLastPrediction.bet === actualResult) {
                // JEET GAYE! Sticker bhejo
                CHANNEL_IDS.forEach((id) => {
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`✅ REAL WIN SENT to ${id}`))
                        .catch((e) => console.error(e.message));
                });
            }
            myLastPrediction = null; // Reset
        }

        // 2. NEW PREDICTION
        if (currentPeriod !== lastProcessedPeriod) {
            lastProcessedPeriod = currentPeriod;

            // Simple Logic based on History
            const last1 = getSize(history[0].number);
            const last2 = getSize(history[1].number);
            const last3 = getSize(history[2].number);

            let prediction = '';
            let logicText = '';

            // Dragon Logic
            if (last1 === last2 && last2 === last3) {
                prediction = last1;
                logicText = `Dragon Pattern 🐉 (${last1})`;
            }
            // ZigZag Logic
            else if (last1 !== last2 && last2 !== last3) {
                prediction = last2;
                logicText = 'Zig-Zag Pattern 🏓';
            }
            // Reverse Logic
            else {
                prediction = last1 === 'BIG' ? 'SMALL' : 'BIG';
                logicText = 'Trend Break 📉';
            }

            // Prediction Save karo taaki agle minute check karein
            myLastPrediction = {
                period: currentPeriod,
                bet: prediction
            };

            const message = `
🔥 *BDG API SERVER SIGNAL* 🔥

📅 *Period:* \`${currentPeriod}\`
📡 *Source:* Live API Data
--------------------------------
🎯 *SIGNAL:* ${prediction} ${getEmoji(prediction)}
--------------------------------
🧠 *Logic:* ${logicText}
💰 *Use 3-Stage Funds Plan*
`;

            CHANNEL_IDS.forEach((id) => {
                bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                    .catch((e) => console.error(e.message));
            });
        }

    } catch (error) {
        console.error("API Error:", error.message);
    }
}

// 5 Second Loop
setInterval(checkGameStatus, 5000);

// Server
app.get('/', (req, res) => res.send('Render API Bot Active 🚀'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Port ${PORT}`));