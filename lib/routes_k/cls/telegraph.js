const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://www.cls.cn/nodeapi/updateTelegraphList?rn=20`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.data.roll_data.map((item) => {
        let newstitle = '';
        if (item.title) {
            newstitle = item.level +":"+ item.title ;
        } else {
            newstitle = item.level +":"+ item.content ;
        }
        return {
            title: newstitle,
            link:  item.shareurl,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
            description: item.reading_num + ':'+ item.content , // + `<audio src="${item.audio_url}" controls="controls"></audio>`,
        };
    });

    ctx.state.data = {
        title: `财联社 - 电报`,
        link: 'https://www.cls.cn/telegraph',
        item: list,
    };
};
