module.exports = function (router) {
    router.get('/index', require('./index'));
    router.get('/blog/:id', require('./blog'));
    router.get('/user/:id', require('./blog'));
    router.get('/dongtai/:id', require('./dongtai'));
    router.get('/:category?', require('./index'));
};
