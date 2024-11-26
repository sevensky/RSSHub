const config = require('@/config').value;
const { proxyUri, proxyUrlHandler } = require('./unify-proxy');
let puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium-min');
const proxyChain = require('proxy-chain');
const logger = require('./logger');
const remoteExePath = 'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar';
//   const CHROMIUM_PATH = "https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar";

const options = {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-spki-list', `--user-agent=${config.ua}`],
    headless: 'new',
    ignoreHTTPSErrors: true,
};

/**
 * @param {Object} extraOptions
 * @param {boolean} extraOptions.stealth - Use puppeteer-extra-plugin-stealth
 * @returns Puppeteer browser
 */
module.exports = async (extraOptions = {}) => {
    if (extraOptions.stealth) {
        const { addExtra } = require('puppeteer-extra');
        puppeteer = addExtra(puppeteer);

        // workaround for vercel/nft #54, #283, #304
        require('puppeteer-extra-plugin-stealth/evasions/chrome.app');
        require('puppeteer-extra-plugin-stealth/evasions/chrome.csi');
        require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes');
        require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
        require('puppeteer-extra-plugin-stealth/evasions/defaultArgs');
        require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
        require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor');
        require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
        require('puppeteer-extra-plugin-stealth/evasions/sourceurl');
        require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
        require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
        require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');
        require('puppeteer-extra-plugin-user-preferences');
        require('puppeteer-extra-plugin-user-data-dir');

        puppeteer.use(require('puppeteer-extra-plugin-stealth')());
    }

    if (proxyUri) {
        if (proxyUrlHandler.username || proxyUrlHandler.password) {
            // only proxies with authentication need to be anonymized
            if (proxyUrlHandler.protocol === 'http:') {
                options.args.push(`--proxy-server=${await proxyChain.anonymizeProxy(proxyUri)}`);
            } else {
                logger.warn('SOCKS/HTTPS proxy with authentication is not supported by puppeteer, continue without proxy');
            }
        } else {
            // Chromium cannot recognize socks5h and socks4a, so we need to trim their postfixes
            options.args.push(`--proxy-server=${proxyUri.replace('socks5h://', 'socks5://').replace('socks4a://', 'socks4://')}`);
        }
    }
    logger.info('🎉 调用 puppeteer.js ');
    const browser = await (config.puppeteerWSEndpoint
        ? puppeteer.connect({
              browserWSEndpoint: config.puppeteerWSEndpoint,
          })
        : puppeteer.launch({
              args: [...chromium.args, '--no-sandbox', `--user-agent=${config.ua}`], // Add --no-sandbox flag
              defaultViewport: { width: 800, height: 600 },
              executablePath: process.env.CHROME_PATH || (await chromium.executablePath(remoteExePath)),
              headless: chromium.headless,
              ignoreHTTPSErrors: true,
              ignoreDefaultArgs: ['--disable-extensions'],
          }));
    /*
        puppeteer.launch(
          config.chromiumExecutablePath
              ? {
                    executablePath: config.chromiumExecutablePath,
                    ...options,
                }
              : options
        )
        */

    setTimeout(() => {
        browser.close();
    }, 30000);

    return browser;
};
