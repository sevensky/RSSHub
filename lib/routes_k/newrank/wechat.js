const got = require('@/utils/got');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.wxid;
    const nonce = utils.random_nonce(9);
    const response = await got({
        method: 'post',
        url: 'https://gw.newrank.cn/api/wechat/xdnphb/detail/v1/rank/article/lists',
        // url: 'https://www.newrank.cn/xdnphb/detail/v1/rank/article/lists',
        headers: {
            Connection: 'keep-alive',
            Cookie: String(config.newrank.cookie),
            "N-Token": "c85200091a0047c0aa6e786d4bd17299" , 
        },
        form: {
            account: uid,
            // nonce: `256fab93c`,
            // xyz: `21a4130eaf0490e2060bef6361e06674`
            nonce: nonce,
            xyz: utils.decrypt_wechat_detail_xyz(uid, nonce),
        },
    });
    const name = response.data.value.user.name;
    const realTimeArticles = utils.flatten(response.data.value.realTimeArticles);
    const articles = utils.flatten(response.data.value.articles);
    const newArticles = realTimeArticles.concat(articles);

    const items = await Promise.all(
        newArticles.map(async (item) => ({
            title: item.title,
            description: '',
            link: item.url,
            author: ''+name,
            pubDate: item.publicTime,
        }))
    );

    ctx.state.data = {
        title: name + ' - 微信公众号',
        //https://www.newrank.cn/new/readDetial?account=gh_d25a09856e39
        link: 'https://www.newrank.cn/new/readDetial?account=' + uid,
        item: items,
    };
};
