// 假设是一个Express.js项目内部调用
const express = require('express');
const app = express();
const axios = require('axios');
const port = 3000;

// 内部调用函数，模拟Vercel Function的调用
const callVercelFunctionInternally = async (url) => {
    try {
        // 这里假设Vercel Function在本地开发环境下对应的路径是/api/getPageSource
        const response = await axios.get(`http://localhost:3000/api/getPageSource?url=${url}`);
        return response.data;
    } catch (error) {
        console.error('Error calling Vercel function internally:', error);
        throw error;
    }
};

app.get('/test', async (req, res) => {
    const urlToVisit = 'https://example.com';
    try {
        const pageSource = await callVercelFunctionInternally(urlToVisit);
        console.log('Page Source:', pageSource);
        res.send(pageSource);
    } catch {
        res.status(500).send({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`chrometest Server running on port ${port}`);
});
