const puppeteer = require('puppeteer');

// eslint-disable-next-line no-console
console.log('asd');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.baidu.com');
    await page.screenshot({ path: 'baidu.png' });

    await browser.close();
})();
