const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../lib'));

const config = require('../lib/config');
config.set({
    NO_LOGFILES: true,
    DEBUG_INFO: true,
    PORT: 1201,
});

const app = require('../lib/app');

module.exports = (req, res) => {
    app.callback()(req, res);
};
