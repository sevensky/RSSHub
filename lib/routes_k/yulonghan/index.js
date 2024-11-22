const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://www.yulonghan.com/lib/ajax/24/list.aspx`;
    const response = await got({
        method: 'POST',
        url: link,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Referer': 'https://www.yulonghan.com/news/main.html',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.25 Safari/537.36 Core/1.70.3775.400 QQBrowser/10.6.4209.400',
            'X-Requested-With': 'XMLHttpRequest',
        }, 
        form: {
            id: `1,2,3`,
            page: 1,
        },
    });
    
    const newsflashes = response.data.data;

    let newsflashesList = [];
    for (let i = 0; i < newsflashes.length; i++) {
        if (newsflashes[i].Class != 'e资讯') {
            newsflashesList = newsflashesList.concat(newsflashes[i]);
        }
    }
    
    const list = newsflashesList.map((item) => ({
        // const author = post.senderData.id ? post.senderData.username : 'Anonymous';
        // const title = `@${author}: ${post.comment}`;
        author: item.Class,
        title: item.Title || item.Abstract,
        description: item.Abstract ,
        pubDate: item.ReleaseDate,  //new Date(item.ctime * 1000).toUTCString(),
        link: `http://yun.xiximiao.com/api/Crawler/fetch?site=ylh&type=cont&url=${item.Id}`,
        guid: item.Id  ,
    }));

    ctx.state.data = {
        title: `跳大神快讯 7*24`,
        link: 'http://yun.xiximiao.com',
        // link: 'https://www.yulonghan.com/news/main.html',
        item: list,
    };
};
