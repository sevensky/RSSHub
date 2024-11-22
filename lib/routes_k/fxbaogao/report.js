const got = require('@/utils/got');
const dayjs = require('dayjs');
/**
 * @param {String} ctx.params.id
 */
module.exports = async (ctx) => {
    const id = ctx.params.id;
    const info_res = await got({
        method: 'post',
        url: 'https://api.mofoun.com/mofoun/search/report/search',
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'referer': 'https://www.fxbaogao.com/rp?dt=2&date=last1mon%3Blast1mon&order=2&nop=-1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.25',
            'user-id': '204219',
            'user-token': '5ozRq8ZNwsFkvHS78rY2XdY5kokrYYZu9SMkwS4uHehPkn4JftURZdBHbwNxI1rz',
        },
        data: JSON.stringify({
            docType: ["2"] ,
            endTime: "last1mon",
            order: "2",
            pageNum: 1,
            pageSize: 40,
            paragraphSize: 3,
            pdfPage: "-1",
            startTime: "last1mon",
        }),
    });
    const info = info_res.data.data;    
 
    const cardList = info_res.data.data.dataList;
    
    ctx.state.data = {
        title: `发现报告 -  `,
        // description: info.info.description,
        image: `https://oss.mofoun.com/pub/img/logo/fxbaogao/favicon.ico`,
        link: `https://www.fxbaogao.com/rp?dt=2&date=last1mon%3Blast1mon&order=2&nop=-1&id=${id}`,
        item: cardList.map(buildFeedItem),
    };
};
const buildFeedItem = (cardData) => {
    const date = new Date(cardData.pubTime * 1000);
    const description =`
        <p> ${cardData.title} 页数:${cardData.pageNum} </p>
        <p><a href="https://www.fxbaogao.com/pdf?id=${cardData.docId}&index=0">${cardData.docId}</a> score:${cardData.score}</p>
        <p>
        <img src="https://public.fxbaogao.com/report-image/${dayjs(date).format('YYYY/MM/DD')}/${cardData.docId}-1.png" />
        <img src="https://public.fxbaogao.com/report-image/${dayjs(date).format('YYYY/MM/DD')}/${cardData.docId}-2.png" /></p>
    `;

    return {
        title: cardData.title ? `${cardData.industryName} ${cardData.title}`  : cardData.title,
        description,
        author : cardData.orgName ,
        pubDate: new Date(cardData.pubTime * 1000),
        link: `https://www.fxbaogao.com/pdf?id=${cardData.docId}`,
    };
};