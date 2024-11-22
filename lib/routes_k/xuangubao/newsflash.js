const got = require('@/utils/got');

//还没改与subject重复的 ， 35 盘中异动 10 大新闻
module.exports = async (ctx) => {
    const subject_id = ctx.params.subject_id;

    const response = await got({
        method: 'get',
        url: `https://baoer-api.xuangubao.cn/api/v6/message/newsflash?limit=20&subj_ids=${subject_id}&has_explain=false&platform=pcweb`,
        headers: {
            Referer: `https://xuangubao.cn/subject/${subject_id}`,
        },
    });

    const subject = response.data.Subject;
    const subject_title = subject.Title; //A股板块异动播报
    const subject_desc = subject.Desc;

    const messages = response.data.Messages;

    let messagesList = [];
    for (let i = 0; i < messages.length; i++) {
        messagesList = messagesList.concat(messages[i]);
    }

    const out = messagesList.map((item) => {
        const date = item.CreatedAt;
        const link = item.Url;
        const title = item.Title;
        const description = item.Summary;

        const single = {
            title,
            link,
            pubDate: date,
            description,
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
