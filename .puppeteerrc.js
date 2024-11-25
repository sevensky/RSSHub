const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the cache location for Puppeteer.
    cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),

    // "chrome-headless-shell"
    // executablePath
    // Download Chrome (default `skipDownload: false`).
    // chrome: {
    //     skipDownload: false,
    // },
    // // Download Firefox (default `skipDownload: true`).
    // firefox: {
    //     skipDownload: true,
    // },
};
