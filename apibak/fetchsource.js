// https://<YOUR_VERCEL_PROJECT>.vercel.app/api/fetchsource?url=https://www.baidu.com
// cursor
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium-min');
const remoteExecutablePath = 'https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar';
// const remoteExecutablePath = 'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';

module.exports = async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: '请提供一个有效的 URL 作为查询参数' });
    }
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox'], // Add --no-sandbox flag
            defaultViewport: { width: 800, height: 600 },
            // executablePath: chromium.path,
            executablePath: process.env.CHROME_PATH || (await chromium.executablePath(remoteExecutablePath)),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
            ignoreDefaultArgs: ['--disable-extensions'],
        });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        const html = await page.evaluate(() => document.documentElement.innerHTML);
        // console.log(html);
        // console.log('3================================================');

        const content = await page.content();
        console.log(content + '4================================================');
        await browser.close();

        res.status(200).json({ source: html });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '无法获取页面源代码' });
    }
};
