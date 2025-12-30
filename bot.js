const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');

// ==========================================
// ⚙️ SETTINGS (Yahan Apni Details Dalein)
// ==========================================
const token = '8526706143:AAFZN8-HWX-PNEjGaXikFYDtnT-I9UtD1IA'; // Apna Bot Token Dalein
const bot = new TelegramBot(token, { polling: true });

// Channel jahan Signal jayega
const CHANNEL_ID = '@DiuWingiftcode01'; // Apni Channel ID

// Win hone par jo Sticker jayega
const STICKER_ID = 'https://t.me/DiuWingiftcode01/11491'; // Sticker ka File ID yahan dalein (Forward mat karein, ID use karein)
// Note: Agar File ID nahi hai to user context wala forward logic niche hai

const app = express();
const port = process.env.PORT || 10000;

// API URL & HEADERS
const BDG_URL = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://bdggame7.com/",
    "Origin": "https://bdggame7.com"
};

// GLOBAL VARIABLES
let lastProcessedPeriod = null; 
let myLastPrediction = null; 

// ==========================================
// 🧠 LOGIC FUNCTIONS
// ==========================================

// Number se Big/Small nikalna
function getSize(number) {
    return parseInt(number) >= 5 ? 'BIG' : 'SMALL';
}

// Prediction Logic (Same as Python Script)
function calculatePrediction(history) {
    const last1 = getSize(history[0].number);
    const last2 = getSize(history[1].number);
    const last3 = getSize(history[2].number);

    let prediction = '';
    let logicText = '';

    // Logic 1: Dragon (Teen baar same aaya)
    if (last1 === last2 && last2 === last3) {
        prediction = last1;
        logicText = `Dragon Pattern 🐉 (${last1} Trend)`;
    }
    // Logic 2: Zig-Zag (Teen baar alag)
    else if (last1 !== last2 && last2 !== last3) {
        prediction = last2; // Pattern follow flip
        logicText = 'Zig-Zag Pattern 🏓';
    }
    // Logic 3: Reverse (Default)
    else {
        prediction = last1 === 'BIG' ? 'SMALL' : 'BIG';
        logicText = 'Reverse Trend 📉';
    }

    return { prediction, logicText };
}

// ==========================================
// 📡 MAIN LOOP FUNCTION
// ==========================================
async function checkGameStatus() {
    try {
        const timestamp = Date.now();
        
        // 1. Fetch Real Data
        const response = await axios.get(BDG_URL, {
            headers: HEADERS,
            params: {
                no: "1", size: "10", type: "1", id: "1",
                language: "en", random: "4f3d2a1b", ts: timestamp
            },
            timeout: 5000
        });

        const data = response.data;
        if (!data || !data.data || !data.data.list) return;

        const history = data.data.list;
        const latestResult = history[0]; 
        
        // Latest result ka period number
        const currentResultPeriod = latestResult.issueNumber;
        
        // Agla period jiska signal dena hai
        const nextPeriod = String(parseInt(currentResultPeriod) + 1);

        // ------------------------------------------
        // 1️⃣ WIN CHECK (Pichle Signal ka kya hua?)
        // ------------------------------------------
        if (myLastPrediction && myLastPrediction.period === currentResultPeriod) {
            const actualResult = getSize(latestResult.number);
            
            console.log(`🔎 Check: Humne bola ${myLastPrediction.bet} | Aaya ${actualResult}`);

            if (myLastPrediction.bet === actualResult) {
                // ✅ WIN: Sticker Bhejo
                console.log("✅ WIN! Sending Sticker...");
                
                // Sticker File ID method (Recommended)
                // bot.sendSticker(CHANNEL_ID, STICKER_ID);

                // YA Forward method (Jo aapne pehle use kiya tha)
                 bot.forwardMessage(CHANNEL_ID, '@DiuWingiftcode01', 633)
                    .catch(e => console.log("Sticker Error: " + e.message));

            } else {
                // ❌ LOSS: Kuch mat bhejo (Silent)
                console.log("❌ LOSS. Silent Mode.");
            }

            // Reset kar do taki baar baar check na ho
            myLastPrediction = null; 
        }

        // ------------------------------------------
        // 2️⃣ NEW PREDICTION (Agar naya period shuru hua hai)
        // ------------------------------------------
        if (lastProcessedPeriod !== nextPeriod) {
            lastProcessedPeriod = nextPeriod;

            // Logic Calculate karo
            const { prediction, logicText } = calculatePrediction(history);

            // Save karo future checking ke liye
            myLastPrediction = {
                period: nextPeriod,
                bet: prediction
            };

            const emoji = prediction === 'BIG' ? '🟢' : '🔴';

            const message = `
🔥 *BDG VIP PREDICTION* 🔥

📅 *Period:* \`${nextPeriod}\`
🎰 *Bet:* *${prediction}* ${emoji}
-----------------------------
🧠 *Logic:* ${logicText}
💰 *Maintain Level 3-5 Funds*
`;

            // Message Bhejo
            bot.sendMessage(CHANNEL_ID, message, { parse_mode: 'Markdown' })
                .then(() => console.log(`Signal Sent: ${nextPeriod}`))
                .catch((e) => console.error(e.message));
        }

    } catch (error) {
        console.error("API Error (Retrying...):", error.message);
    }
}

// Har 5 second mein check karo
setInterval(checkGameStatus, 5000);

// ==========================================
// 🛡️ SERVER & KEEP ALIVE (Render ke liye zaroori)
// ==========================================
app.get('/', (req, res) => {
    res.send('Bot is Running Smoothly 🚀');
});

// Self Ping Logic (Taki bot so na jaye)
setInterval(() => {
    axios.get(`http://localhost:${port}`)
        .then(() => console.log('🔋 Keep-Alive Ping'))
        .catch(() => {});
}, 600000); // 10 Minutes

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});