const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios'); 

// ==========================================
// 1. APNA TOKEN YAHAN DALEIN
// ==========================================
const token = '8526706143:AAFZN8-HWX-PNEjGaXikFYDtnT-I9UtD1IA'; 
const bot = new TelegramBot(token, { polling: true });
const app = express();

// 2. APNI CHANNEL ID
const CHANNEL_IDS = [
    '@DiuWingiftcode01' // Apni Channel ID Sahi Dalein
];

// 3. NEW STICKER SETTINGS (Updated)
// Link: https://t.me/DiuWingiftcode01/11499
const STICKER_CHANNEL_ID = '@DiuWingiftcode01'; 
const STICKER_MSG_ID = 11499;

// 4. REAL API SETTINGS
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
        console.log("⚠️ ERROR: Computer wala bot abhi bhi chal raha hai! Use band karo.");
    } else {
        console.log(`Polling Error: ${error.message}`);
    }
});

// ==========================================
// 📡 FAST CHECK FUNCTION
// ==========================================
async function checkGameStatus() {
    try {
        const timestamp = Date.now();
        
        // Fast API Call (3s Timeout)
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

        // ==========================================
        // 🏆 WIN CHECK (STICKER IS BACK)
        // ==========================================
        if (myLastPrediction && myLastPrediction.period === latestResult.issueNumber) {
            const actualResult = getSize(latestResult.number);
            
            console.log(`🔎 Result: Predicted=${myLastPrediction.bet} | Actual=${actualResult}`);

            if (myLastPrediction.bet === actualResult) {
                // Jeetne par Sticker Bhejo
                CHANNEL_IDS.forEach((id) => {
                    bot.forwardMessage(id, STICKER_CHANNEL_ID, STICKER_MSG_ID)
                        .then(() => console.log(`✅ Sticker Sent to ${id}`))
                        .catch((e) => {
                            console.error(`❌ Sticker Failed: ${e.message}`);
                            // Agar Sticker fail ho, to Text bhej do (Backup)
                            bot.sendMessage(id, "✅ *WIN WIN WIN!* 🏆", { parse_mode: 'Markdown' });
                        });
                });
            }
            myLastPrediction = null;
        }

        // ==========================================
        // 🔮 NEW PREDICTION (NO LOGIC TEXT)
        // ==========================================
        if (currentPeriod !== lastProcessedPeriod) {
            console.log(`🔥 Sending Prediction for: ${currentPeriod}`);
            lastProcessedPeriod = currentPeriod;

            const last1 = getSize(history[0].number);
            const last2 = getSize(history[1].number);
            const last3 = getSize(history[2].number);

            let prediction = '';

            // Simple Pattern Logic (Internal Only)
            if (last1 === last2 && last2 === last3) {
                prediction = last1; 
            } else if (last1 !== last2 && last2 !== last3) {
                prediction = last2;
            } else {
                prediction = last1 === 'BIG' ? 'SMALL' : 'BIG';
            }

            myLastPrediction = {
                period: currentPeriod,
                bet: prediction
            };

            // CLEAN MESSAGE (Logic Hata Diya)
            const message = `
🔥 *BDG API LIVE* 🔥

📅 *Period:* \`${currentPeriod}\`
📡 *Source:* Real-Time Data
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

// Loop Fast (2 Seconds)
setInterval(checkGameStatus, 2000);

// Keep Alive
setInterval(() => {
    axios.get('http://localhost:10000').catch(() => {});
}, 600000);

// SERVER
app.get('/', (req, res) => res.send('Clean Bot Running 🚀'));
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Running on Port ${PORT}`));