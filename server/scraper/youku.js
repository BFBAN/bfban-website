// 抓取 笨哥 频道 视频列表a

const request = require('request-promise');
const cheerio = require('cheerio');


const urlArr = {
  bengge: 'http://i.youku.com/i/UMjc1MjAyMTM2/videos?spm=a2hzp.8253869.0.0',
  laonanhai: 'http://i.youku.com/i/UMzkzOTQ4ODcy/videos?spm=a2hzp.8244740.0.0',
};

function getUrlParams(i) {
  return `&order=1&page=${i + 1}`;
}

let list = [];

const req = function (url) {
  return new Promise((resolve, reject) => {
    request(url)
      .then((html) => {
        const $ = cheerio.load(html);

        $('.v.va').each(function (i) {
          const obj = {};

          const title = $(this).find('.v-meta-title a').attr('title');
          const href = $(this).find('.v-meta-title a').attr('href');
          const publishTime = $(this).find('.v-publishtime').text();

          // 过滤比赛标题
          // if (title.toLowerCase().indexOf('olimo') == -1) {
          //     return;
          // }

          obj.title = title;
          obj.href = href;
          // obj.href  = href.match(/id_(.*)\.html/)[1]
          obj.publishTime = publishTime;

          list.push(obj);
        });

        resolve();
      });
  });
};

async function doRequests(name) {
  list = [];

  const page = 1; //  默认1页
  const baseUrl = urlArr[name];

  if (!baseUrl) return list;

  for (let i = 0; i < page; i++) {
    await req(baseUrl + getUrlParams(i));
  }


  // debug
  // console.log(list)

  return list;
}

// 请求1页
// doRequests(name)

const grabYouku = name => doRequests(name);

module.exports = grabYouku;
