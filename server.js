require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function getAccessToken() {
    try {
        const response = await axios.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${process.env.API_KEY}&client_secret=${process.env.SECRET_KEY}`);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

app.post('/tts', async (req, res) => {
    try {
        const { text } = req.body;
        const accessToken = await getAccessToken();
        const response = await axios({
            method: 'post',
            url: `https://tsn.baidu.com/text2audio`,
            params: {
                tex: text,
                tok: accessToken,
                cuid: process.env.APP_KEY,
                ctp: 1,
                lan: 'zh',
                spd: 5,
                pit: 5,
                vol: 5,
                per: 4
            },
            responseType: 'arraybuffer'
        });
        
        res.set('Content-Type', 'audio/mp3');
        res.send(response.data);
    } catch (error) {
        console.error('Error in TTS:', error);
        res.status(500).send('Error generating audio: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});