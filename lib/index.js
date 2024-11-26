const app = require('./app');
const config = require('./config').value;
const fs = require('fs');
const logger = require('./utils/logger');

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (config.enableCluster && cluster.isMaster && process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'dev') {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    let server;
    if (config.connect.socket) {
        if (fs.existsSync(config.connect.socket)) {
            fs.unlinkSync(config.connect.socket);
        }
        server = app.listen(config.connect.socket, Number.parseInt(config.listenInaddrAny) ? null : '127.0.0.1');
        logger.info('Listening Unix Socket ' + config.connect.socket);
        process.on('SIGINT', () => {
            fs.unlinkSync(config.connect.socket);
            process.exit();
        });
    }
    if (config.connect.port) {
        server = app.listen(config.connect.port, Number.parseInt(config.listenInaddrAny) ? null : '127.0.0.1');
        logger.info('Listening Port ' + config.connect.port);
    }

    logger.info('🎉 RSSHub start! Cheers!');
    logger.info('💖 debugInfo ： ' + config.debugInfo);
    logger.info('💖 cache type ： ' + config.cache.type);
    logger.info('💖 loggerLevel ' + config.loggerLevel);
    logger.info('💖 puppeteerWSEndpoint ' + config.puppeteerWSEndpoint);
    logger.info('💖 请求头： ' + config.ua);
    /** const info = utils.fetchAllCharacters(res.data, base);
        ctx.set('json', {
            info,
        });
     */
    module.exports = server;
}
