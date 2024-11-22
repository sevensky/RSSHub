const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // https://mingjia.eastmoney.com/stock/1 股票名家
    const currentUrl = `https://mingjia.eastmoney.com/stock/${ctx.params.id}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('.typeuls li')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const h = item.find('a.qa');
            const pubDate = item.find('.qadiv').text();
            return {
                title: h.text(),
                link: url.resolve(``, h.attr('href')).replace(new RegExp('(.[^.]*).eastmoney.com(.*)$', 'g'), 'https://wap.eastmoney.com$2'),
                // b =  'https://wa2as1235p.eastmoney.com/a/202010101657753859.html';
                // a = b.replace(new RegExp('https://(.[^.]*).eastmoney.com(.*)', 'g'), 'https://wap.eastmoney.com$2')  ;
                pubDate: new Date( pubDate ).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.description = content('#articleContent').html();
                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `东财股票名家`,
        link: currentUrl,
        item: items,
        description: '没什么摘要',
    };
};