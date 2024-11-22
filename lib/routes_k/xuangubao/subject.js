const got = require('@/utils/got');


// 35 盘中异动 10 大新闻
module.exports = async (ctx) => {
    const subject_id = ctx.params.subject_id;

    const response = await got({
        method: 'get',
        url: `https://api.xuangubao.cn/api/pc/subj/${subject_id}?limit=20`,
        headers: {
            Referer: `https://xuangubao.cn/subject/${subject_id}`,
        },
    });

    const subject = response.data.Subject;
    const subject_title = subject.Title;
    const subject_desc = subject.Desc;

    const messages = response.data.Messages;

    let messagesList = [];
    for (let i = 0; i < messages.length; i++) {
        messagesList = messagesList.concat(messages[i]);
    }

    const out = messagesList.map((item) => {
        const date = new Date(item.CreatedAt * 1000).toUTCString() ;
        const link = item.ShareUrl2;
        const title = item.Title;
        let imagesTpl = '';
        if (item.Image != "" ) {
            imagesTpl = `<img src="${item.Image}">`; 
            /* */
        } 
        // "Stocks":[{"Name":"浙商证券","Symbol":"601878.SS","Market":""},{"Name":"第一创业","Symbol":"002797.SZ","Market":""}]
        if (item.Stocks != undefined ) {
            item.Stocks.forEach((item) => {
                imagesTpl += ` ${item.Name} ${item.Symbol} `;
            });
        }
        
        const description = `${ item.Summary ? `${item.Summary}` : `${item.Title}`} . ${
                                    imagesTpl ? `<br>${imagesTpl}` : ''}`;
                
 
        const single = {
            title,
            link,
            pubDate: date,
            description,
            author: item.Source,
            guid : link,
        };

        return single;
    });

    ctx.state.data = {
        title: `${subject_title} - 主题 - 选股宝`,
        link: `https://xuangubao.cn/subject/${subject_id}`,
        description: `${subject_desc}`,
        item: out,
    };
};
