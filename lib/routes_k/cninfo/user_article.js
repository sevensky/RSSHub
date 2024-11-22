const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

// http://mp.cnfol.com/user/26828.html   
// // ppk/cnfol/user_article/26828
module.exports = async (ctx) => {
    const code = ctx.params.code;  //用户id
    const currentUrl = `http://mp.cnfol.com/user/${code}.html`;
    
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    
    const $ = cheerio.load(response.data);
    const list = $('.newsdata_list > .news_article').slice(0, 20)
        
        .map((_, item) => {
            item = $(item);
            const h = item.find('.na_detail > .news_title > h3 > a');
            const pubDate = item.find('.na_detail > .times').text();
            
            return {
                title: h.text(),
                link: h.attr('href'), // url.resolve(``, h.attr('href')).replace(new RegExp('(.[^.]*).eastmoney.com(.*)$', 'g'), 'https://wap.eastmoney.com$2'),
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
                    item.description = content('.mainInfo').html();
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
