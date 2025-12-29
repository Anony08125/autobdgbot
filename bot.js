const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios'); // Ye ab chalega kyunki package.json update ho gaya hai

// 1. APNA TOKEN YAHAN DALEIN
const token = '7970364882:AAGhYmvIHU9SPqkYs3SeZlUpuL-I_ngXEkY'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. CHANNEL ID
const CHANNEL_IDS = [
    '@DiuWingiftcode01' // Apni Channel ID Dalein
];

// 3. WIN STICKER SETTINGS
const STICKER_CHANNEL_ID = '@DiuWingiftcode01';
const STICKER_MSG_ID = 633;

// 4. REAL API SETTINGS (Aapki Mehnat)
const BDG_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://bdggame7.com/",
    "Origin": "https://bdggame7.com"
};

// GLOBAL VARIABLES
let lastProcessedPeriod = ''; 
let myLastPrediction = null; 

// Helpers
function getSize(number) {
    return parseInt(number) >= 5 ? 'BIG' : 'SMALL';
}
function getEmoji(size) {
    return size === 'BIG' ? '🟢' : '🔴';
}

// ==========================================
// 🛡️ ANTI-CRASH SYSTEM (Bot kabhi nahi marega)
// ==========================================
process.on('uncaughtException', (err) => {
    console.log('⚠️ Error pakda gaya: ' + err);
});
process.on('unhandledRejection', (reason, p) => {
    console.log('⚠️ Error rejection:', reason);
});

// ==========================================
// 📡 REAL DATA CHECK FUNCTION
// ==========================================
async function checkGameStatus() {
    try {
        const timestamp = Date.now();
        
        // 1. API Call (Real Data Fetch)
        // console.log("Connecting to BDG Server..."); // Logs me dikhega
        
        const response = await axios.get(BDG_URL, {
            headers: HEADERS,
            params: {
                no: "1", size: "10", type: "1", id: "1",
                language: "en", random: "4f3d2a1b", ts: timestamp
            },
            timeout: 5000 // 5 second se zyada wait nahi karega
        });

        const data = response.data;
        
        // Data Verification
        if (!data || !data.data || !data.data.list) {
            console.log("❌ API se data nahi mila, Retrying...");
            return;
        }

        const history = data.data.list;
        const latestResult = history[0]; 
        const currentPeriod = String(parseInt(latestResult.issueNumber) + 1);

        // ==========================================
        // 🏆 STEP 1: WIN CHECK (Real verification)
        // ==========================================
        if (myLastPrediction && myLastPrediction.period === latestResult.issueNumber) {
            const actualResult = getSize(latestResult.number);
            
            console.log(`🔎 Checking: Humne Bola ${myLastPrediction.bet} | Aaya: ${actualResult}`);

            if (myLastPrediction.bet === actualResult) {
                // JEET GAYE! Sticker Forward
                CHANNEL_IDS.forEach((id) => {
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`✅ WIN Sticker Sent to ${id}`))
                        .catch((e) => console.error(e.message));
                });
            } else {
                console.log("❌ Loss hua. Sticker nahi bhejunga.");
            }
            myLastPrediction = null; // Reset
        }

        // ==========================================
        // 🔮 STEP 2: NEW PREDICTION
        // ==========================================
        if (currentPeriod !== lastProcessedPeriod) {
            lastProcessedPeriod = currentPeriod;

            // Python Logic Conversion
            const last1 = getSize(history[0].number);
            const last2 = getSize(history[1].number);
            const last3 = getSize(history[2].number);

            let prediction = '';
            let logicText = '';

            // Logic 1: Dragon (Agar teeno same hain)
            if (last1 === last2 && last2 === last3) {
                prediction = last1;
                logicText = `Dragon Pattern 🐉 (${last1} Trend)`;
            }
            // Logic 2: Zig-Zag (Agar teeno alag pattern hain)
            else if (last1 !== last2 && last2 !== last3) {
                prediction = last2; // Follow the flip
                logicText = 'Zig-Zag Pattern 🏓';
            }
            // Logic 3: Trend Break (Reverse)
            else {
                prediction = last1 === 'BIG' ? 'SMALL' : 'BIG';
                logicText = 'Trend Break / Reverse 📉';
            }

            // Save Prediction
            myLastPrediction = {
                period: currentPeriod,
                bet: prediction
            };

            const message = `
🔥 *BDG API LIVE PREDICTOR* 🔥

📅 *Period:* \`${currentPeriod}\`
📡 *Source:* Official API (Real-Time)
--------------------------------
🎯 *SIGNAL:* ${prediction} ${getEmoji(prediction)}
--------------------------------
🧠 *Logic:* ${logicText}
💰 *Use 3-Stage Funds Plan*
`;

            CHANNEL_IDS.forEach((id) => {
                bot.sendMessage(id, message, { parse_mode: 'Markdown' })
                    .then(() => console.log(`Signal sent for ${currentPeriod}`))
                    .catch((e) => console.error(e.message));
            });
        }

    } catch (error) {
        // Agar API block kare ya error aaye, to bot band nahi hoga
        console.error("⚠️ API Error (Retrying in 5s):", error.message);
    }
}

// Loop: Har 5 second check karega
setInterval(checkGameStatus, 5000);

// Server Keep-Alive
app.get('/', (req, res) => res.send('Real API Bot Running 🚀'));
const PORT = process.env.PORT || 10000;

// ==========================================
// 🔋 KEEP-ALIVE SYSTEM (No Sleep)
// ==========================================
// Har 10 minute mein khud ko Ping karega
setInterval(() => {
    // Note: 'http://localhost:10000' Render ke andar khud ka address hai
    axios.get('http://localhost:10000')
        .then(() => console.log('🔋 Ping: Keeping bot awake'))
        .catch((e) => console.error('Ping Error (Ignore):', e.message));
}, 600000); // 600000 ms = 10 Minutes

app.listen(PORT, () => console.log(`Server running on Port ${PORT}`));