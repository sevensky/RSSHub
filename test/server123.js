const Koa = require('koa');
const Router = require('@koa/router');
// const axios = require('axios');
const cheerio = require('cheerio');
// const logger = require('../lib/utils/logger');
// const https = require('https'); // 引入 https 模块
const http = require('http'); // 引入 https 模块

const app = new Koa();
const router = new Router();

// Vercel serverless function URL (替换为你的实际 URL)
let SERVERLESS_FUNCTION_URL = 'https://rsshub-prod-git-preview-ppkpro.vercel.app/api/hello';
SERVERLESS_FUNCTION_URL = '/api/fetchSource';

router.get('/title', async (ctx) => {
    const { url } = ctx.query;

    if (!url) {
        ctx.status = 400;
        ctx.body = '请提供一个有效的URL作为/title查询参数';
        return;
    }

    try {
        // 请求 serverless
        // 使用 https 模块来请求 serverless
        const response = await new Promise((resolve, reject) => {
            http.get(`${SERVERLESS_FUNCTION_URL}?url=${encodeURIComponent(url)}`, (res) => {
                let data = '';

                // 接收数据
                res.on('data', (chunk) => {
                    data += chunk;
                });

                // 请求结束
                res.on('end', () => {
                    resolve(data);
                });
            }).on('error', (e) => {
                reject(e);
            });
        });

        // 使用 Cheerio 解析返回的源代码
        const $ = cheerio.load(JSON.parse(response).source); // 从 JSON 解析数据
        // const $ = cheerio.load(response.data.source);
        // ctx.body = $;

        const title = $('title').text();
        ctx.body = { title };
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = SERVERLESS_FUNCTION_URL + '无法获取该页面的标题' + error;
    }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 4005;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
