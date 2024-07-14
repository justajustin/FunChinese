// 后端 server.js
const express = require('express');
const axios = require('axios');
const app = express();

const API_KEY = 'NY17VOYMBjmGCTmzlJIlvLrV';
const SECRET_KEY = 'fGSgxsORTXMtN600fD40n8A6SkIfHX2w';

app.use(express.json());

async function getAccessToken() {
    const response = await axios.get(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`);
    return response.data.access_token;
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
                cuid: '94542112',
                ctp: 1,
                lan: 'zh',
                spd: 5,
                pit: 5,
                vol: 5,
                per: 4  // 度丫丫音色
            },
            responseType: 'arraybuffer'
        });
        
        res.set('Content-Type', 'audio/mp3');
        res.send(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error generating audio');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));