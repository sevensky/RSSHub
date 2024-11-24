const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const logger = require('@/utils/logger');

// https://docs.rsshub.app/zh/joinus/new-rss/start-code#将-ofetch-替换为-puppeteer
// require('@/v2/nytimes/index.js');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://www.taoguba.com.cn';
    const currentUrl = `${rootUrl}/blog/${id}`;

    // const cookie = await getCookie(currentUrl, ctx);

    ctx.set('json', {
        currentUrl,
    });
    logger.info('🧊 请求URL ' + currentUrl);

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            Host: 'www.taoguba.com.cn',
            // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            // 'Accept-Encoding': 'gzip, deflate, br',
            // 'Accept-Language': 'zh-CN,zh;q=0.9',
            // 'Cache-Control': 'no-cache',
            // 'Upgrade-Insecure-Requests':1,
            // 'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            cookie: 'gdp_user_id=gioenc-9ca7b976%2Cd54g%2C5284%2Cc7a8%2C3e6e8d3d76ae; Hm_lvt_cc6a63a887a7d811c92b7cc41c441837=1730707120; HMACCOUNT=FD830BD4EB3FC5FC; agree=enter; tgbuser=2469395; tgbpwd=0884EEAD20Cpb86cthxluinn2e; loginStatus=account; 893eedf422617c96_gdp_gio_id=gioenc-3578284; 893eedf422617c96_gdp_cs1=gioenc-3578284; pwdRemindFlag=1; Actionshow2=true; creatorStatus2469395=true; JSESSIONID=YWM1Zjg2N2QtNjY2NS00ZDU0LTk3NmYtZjhkNGQ4MTUzMDhi; 893eedf422617c96_gdp_sequence_ids=%7B%22globalKey%22%3A728%2C%22VISIT%22%3A29%2C%22PAGE%22%3A426%2C%22CUSTOM%22%3A275%7D; Hm_lpvt_cc6a63a887a7d811c92b7cc41c441837=1732361545; dvNgbOperaTime=1732361544922; tfstk=fVXSvKaOI405qZNz1DE2lv4iOIpCFwwZ9DtdjMHrvLp-J2I9uvrkUTkpOw8VUUSPve1Bk65y8wlPlIKMx0n-w3QjDH-Kw2HJyqLXqHTKwvHJkqpl3_kezzvCvNJQ7PyaQgjkEpUa7qYdicppvJ8dgQBLdpvL7rlqpQ26KNq8WhBdDote2XHdJ3KADExI9YQpyI3vfhvpppQpMjKBAHLppY3xDExppeQppU53lnVWygZ4w6Yk7-gdhEMKdcxWwFeMlvHdh3sXWgEtpvBXVQBQkBSPmQ5djCXPcJMDUG1vHH63XXTB16ByHTUYBIAdHZKAzklHc6sdILAoYvJ59aXBZ_i3jipRo1YMwS4DcTWwOFAjkzIVcUd1OazmpU51DZON3qkwB1bfdCpO46Hw5Z0KOmOidnTacoGntoFJVLltYgJHwnxVQoZjPXAJmnTacoGntQKD0Crbc4Gh.',
        },
    });

    const $ = cheerio.load(response.data);
    const author = $('meta[property="og:author"]').attr('content');

    let items = $('.tittle_data')
        .slice(0, ctx.query.limit ? Number.parseInt(ctx.query.limit) : 50)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').first();

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
                author,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                if (detailResponse.url.startsWith('https://www.taoguba.com.cn/topic/transfer')) {
                    item.description = '登录后查看完整文章';
                    return item;
                }

                const content = cheerio.load(detailResponse.data);

                content('#videoImg').remove();
                content('img').each((_, img) => {
                    if (img.attribs.src2) {
                        img.attribs.src = img.attribs.src2;
                        delete img.attribs.src2;
                        delete img.attribs['data-original'];
                    }
                });

                item.description = content('#first').html();
                // 日期
                item.pubDate = timezone(
                    parseDate(
                        content('.article-data span')
                            .eq(1)
                            .text()
                            .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
                    ),
                    +8
                );
                item.category = content('.article-topic-list span')
                    .toArray()
                    .map((item) => $(item).text().trim());

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `淘县 - ${author}`,
        description: $('meta[http-equiv="description"]').attr('content'),
        image: $('meta[property="og:image"]').attr('content'),
        link: currentUrl,
        item: items,
    };
};
