const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `https://www.yulonghan.com/lib/ajax/journal/history.aspx`;
    const response = await got({
        method: 'POST',
        url: link,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': 'https://www.yulonghan.com/journal/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.25 Safari/537.36 Core/1.70.3775.400 QQBrowser/10.6.4209.400',
            'X-Requested-With': 'XMLHttpRequest',
        }, 
        form: {
            'page': 1,
            'class': 'all',
        },
    });
    const responsedata = response.data.data;
    /*Class: "zzkb"belong: "中国证券报" classname: "中证快报" click: "990"
    code: "91" id: "231976" rdate: "2020-09-30" updatime: "2020-09-29 21:30:10" xinqi: "（星期三）"*/
    const resultItem = await Promise.all(
        responsedata.map(async ({ id, Class, belong, classname, code, rdate , updatime , xinqi }) => {
            
            const date = new Date(updatime);  //new Date(ctime * 1000).toUTCString(),
            const link= `/journal/${id}/${code}.html` ;
            let description = '';
            const title= rdate + xinqi + classname ;
            
            const key = `yulonghanjournal:${id}`;
            const value = await ctx.cache.get(key);
            
            if (value) {
                description = value;
            }else{
                const response = await got({
                    method: 'get',
                    url: `https://www.yulonghan.com${link}`,
                    headers: {
                        Referer: `https://www.yulonghan.com${link}`,
                        // Cookie: `PHPSESSID=${Math.floor(Math.random() * 100)};`,
                    },
                });
                const $ = cheerio.load(response.data);
                description = $('.article').html();
                ctx.cache.set(key, description, 1 * 60 * 60 , false);
            }
            
            return {
                title ,
                description,
                pubDate: date.toUTCString(),
                link : `http://yun.xiximiao.com/api/Crawler/fetch?site=ylh&url=${link}`,
                author : belong ,
                guid:  id ,
            };
            
        })
    );

    ctx.state.data = {
        title: `跳大神早报`,
        // link: 'https://www.yulonghan.com/news/main.html',
        link: 'http://yun.xiximiao.com',
        item: resultItem,
    };
};
